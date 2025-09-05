import * as readability from 'text-readability';

export function analyzeContent(doc: any, text: string) {
  const wordCount = doc.wordCount();

  let readabilityScore = 0;
  try {
    // The library can sometimes throw errors on very short or unusual text.
    // Correctly call the function from the imported namespace.
    readabilityScore = readability.fleschKincaid(text);
  } catch (e) {
    console.warn("Could not calculate readability score.", e);
  }

  return {
    wordCount,
    // Round the score to two decimal places
    readabilityScore: Math.round(readabilityScore * 100) / 100,
  };
}
