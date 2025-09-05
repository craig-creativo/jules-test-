import { CheerioAPI } from 'cheerio';

interface Heading {
  level: number;
  text: string;
}

export function analyzeHeadings($: CheerioAPI) {
  const structure: Heading[] = [];
  const errors: string[] = [];
  let lastLevel = 0;

  $('h1, h2, h3, h4, h5, h6').each((i, el) => {
    const level = parseInt(el.tagName.substring(1));
    const text = $(el).text().trim();

    if (text) {
      structure.push({ level, text });

      // Check for multiple H1 tags
      if (level === 1 && lastLevel === 1) {
        if (!errors.includes('Multiple H1 tags found.')) {
          errors.push('Multiple H1 tags found.');
        }
      }

      // Check for skipped heading levels (e.g., H1 -> H3)
      if (lastLevel !== 0 && level > lastLevel + 1) {
        errors.push(`Skipped heading level: H${lastLevel} to H${level}.`);
      }

      lastLevel = level;
    }
  });

  // Check if there is no H1 tag at all
  if (!structure.some(h => h.level === 1)) {
    errors.push('No H1 tag found.');
  }

  return {
    structure,
    errors,
    count: structure.length,
  };
}
