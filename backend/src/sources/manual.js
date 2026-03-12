import crypto from 'crypto';
import { insertContentItem, existsByTextHash } from '../db.js';
import { classifyText } from '../classifier.js';

function hashText(text) {
  return crypto.createHash('sha256').update(text).digest('hex').slice(0, 16);
}

/**
 * Process manual text submission: classify and save to DB.
 * source_type: 'manual', no source_id.
 * Deduplication by text hash.
 */
export async function processManualSubmission(text) {
  const trimmed = text.trim();
  const hash = hashText(trimmed);

  if (existsByTextHash(hash)) {
    return { duplicate: true, hash };
  }

  const result = await classifyText(trimmed);

  const insertResult = insertContentItem({
    source_id: null,
    source_name: 'Manual',
    source_type: 'manual',
    text: trimmed,
    url: `hash:${hash}`,
    published_at: new Date().toISOString(),
    hate_score: result.hate_score,
    category: result.category,
    targets: result.targets,
    confidence: result.confidence,
    reasoning: result.reasoning,
    classified_at: new Date().toISOString(),
  });

  return {
    id: insertResult.lastInsertRowid,
    hate_score: result.hate_score,
    category: result.category,
    targets: result.targets,
    confidence: result.confidence,
    reasoning: result.reasoning,
  };
}
