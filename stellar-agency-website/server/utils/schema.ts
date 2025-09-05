import { CheerioAPI } from 'cheerio';

export function analyzeSchema($: CheerioAPI) {
  const schemas: any[] = [];

  $('script[type="application/ld+json"]').each((i, el) => {
    try {
      const scriptContent = $(el).html();
      if (scriptContent) {
        const parsedJson = JSON.parse(scriptContent);
        schemas.push(parsedJson);
      }
    } catch (e) {
      console.warn('Failed to parse LD+JSON script content.', e);
    }
  });

  const found = schemas.length > 0;
  const types = schemas.map(s => s['@type'] || 'Unknown').flat();

  return {
    found,
    types,
    count: schemas.length,
    details: schemas,
  };
}
