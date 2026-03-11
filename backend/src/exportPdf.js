import PDFDocument from 'pdfkit';
import { DEMO_TEXTS, PRESETS, PRESET_NAMES } from './presets.js';
import { getDemoCached } from './db.js';

export function generateManipulationPdf(res) {
  const doc = new PDFDocument({ size: 'A4', margin: 40 });

  doc.pipe(res);

  // Header
  doc.fontSize(22).font('Helvetica-Bold')
    .text('HODIO — Evidencia de Manipulación Algorítmica', { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(11).font('Helvetica')
    .text('Cómo el mismo contenido obtiene clasificaciones opuestas según quién define las reglas', { align: 'center' });
  doc.moveDown(0.3);
  doc.fontSize(9).fillColor('#666')
    .text(`Generado: ${new Date().toLocaleString('es-ES')}`, { align: 'center' });
  doc.moveDown(1);

  // Disclaimer
  doc.fillColor('#cc0000').fontSize(9)
    .text('⚠️ Este documento demuestra cómo cualquier herramienta de clasificación de odio puede ser configurada para producir los resultados que su creador desee.', { align: 'center' });
  doc.moveDown(1);

  doc.fillColor('#000000');

  // For each demo text
  for (const demoText of DEMO_TEXTS) {
    doc.fontSize(13).font('Helvetica-Bold')
      .text(`Texto ${demoText.id}:`, { continued: true })
      .font('Helvetica').text(` "${demoText.text}"`);
    doc.moveDown(0.5);

    // Table header
    const startX = 50;
    let y = doc.y;
    const colWidths = [130, 60, 100, 200];

    doc.fontSize(9).font('Helvetica-Bold');
    doc.text('Preset', startX, y);
    doc.text('Score', startX + colWidths[0], y);
    doc.text('Categoría', startX + colWidths[0] + colWidths[1], y);
    y += 15;

    doc.font('Helvetica').fontSize(9);

    for (const presetName of PRESET_NAMES) {
      const preset = PRESETS[presetName];
      const cached = getDemoCached(demoText.id, presetName);
      const expected = demoText.expectedScores[presetName];
      const score = cached?.score ?? expected?.score ?? '—';
      const category = cached?.category ?? expected?.category ?? '—';

      // Color code the score
      const numScore = Number(score);
      if (numScore > 60) doc.fillColor('#cc0000');
      else if (numScore > 30) doc.fillColor('#cc8800');
      else doc.fillColor('#008800');

      doc.text(`${preset.emoji} ${preset.name}`, startX, y);
      doc.text(String(score), startX + colWidths[0], y);
      doc.fillColor('#000000');
      doc.text(category, startX + colWidths[0] + colWidths[1], y);
      y += 14;
    }

    doc.y = y + 10;
    doc.moveDown(0.5);

    // Page break if needed
    if (doc.y > 700) doc.addPage();
  }

  // Summary
  doc.addPage();
  doc.fontSize(16).font('Helvetica-Bold')
    .text('Conclusión', { align: 'center' });
  doc.moveDown(1);
  doc.fontSize(11).font('Helvetica')
    .text('Los datos anteriores demuestran que:', { indent: 20 });
  doc.moveDown(0.5);
  doc.fontSize(10)
    .text('1. La misma frase puede puntuar 12 o 95 dependiendo de quién configure el clasificador.', { indent: 30 })
    .moveDown(0.3)
    .text('2. Ningún clasificador de "odio" es objetivo — todos reflejan los valores de quien los programa.', { indent: 30 })
    .moveDown(0.3)
    .text('3. Quien financia el clasificador tiene el poder de decidir qué se considera odio.', { indent: 30 })
    .moveDown(0.3)
    .text('4. La transparencia total sobre las reglas de clasificación es la única salvaguarda posible.', { indent: 30 });

  doc.moveDown(2);
  doc.fontSize(9).fillColor('#666')
    .text('HODIO — Herramienta de investigación sobre sesgos en la clasificación de discurso de odio', { align: 'center' })
    .text('hodio.es', { align: 'center' });

  doc.end();
}

export default { generateManipulationPdf };
