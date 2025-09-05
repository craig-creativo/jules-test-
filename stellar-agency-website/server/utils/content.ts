import { fleschKincaid } from 'text-readability';

export function analyzeContent(doc: any, text: string) {
  const wordCount = doc.wordCount();

  let readabilityScore = 0;
  try {
    // The library can sometimes throw errors on very short or unusual text.
    readabilityScore = fleschKincaid(text);
  } catch (e) {
    console.warn("Could not calculate readability score.", e);
  }

  return {
    wordCount,
    // Round the score to two decimal places
    readabilityScore: Math.round(readabilityScore * 100) / 100,
  };
}
