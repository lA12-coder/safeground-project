const CHUNK_SIZE = 800;
const CHUNK_OVERLAP = 150;

export function chunkText(text: string): string[] {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (!cleaned) return [];

  if (cleaned.length <= CHUNK_SIZE) {
    return [cleaned];
  }

  const chunks: string[] = [];
  let start = 0;

  while (start < cleaned.length) {
    let end = start + CHUNK_SIZE;

    if (end >= cleaned.length) {
      chunks.push(cleaned.slice(start));
      break;
    }

    const nextPeriod = cleaned.lastIndexOf('.', end);
    const nextNewline = cleaned.lastIndexOf('\n', end);
    const breakPoint = Math.max(nextPeriod, nextNewline);

    if (breakPoint > start + CHUNK_SIZE / 2) {
      end = breakPoint + 1;
    }

    chunks.push(cleaned.slice(start, end));
    start = end - CHUNK_OVERLAP;
  }

  return chunks;
}
