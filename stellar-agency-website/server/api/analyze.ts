import { ofetch } from 'ofetch';
import * as cheerio from 'cheerio';
import nlp from 'compromise';

import { analyzeContent } from '../utils/content';
import { analyzeHeadings } from '../utils/headings';
import { analyzeEntities } from '../utils/entities';
import { analyzeSchema } from '../utils/schema';
import { analyzeLinks } from '../utils/links';
import { generateRecommendations } from '../utils/recommendations';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const url = query.url as string;

  if (!url) {
    throw createError({
      statusCode: 400,
      statusMessage: 'URL is required',
    });
  }

  try {
    const html = await ofetch(url);
    const $ = cheerio.load(html);
    const bodyText = $('body').text().replace(/\s\s+/g, ' ');
    const doc = nlp(bodyText);

    // --- Coordinate Analysis Modules ---
    const contentData = analyzeContent(doc, bodyText);
    const headingsData = analyzeHeadings($);
    const entitiesData = analyzeEntities(doc);
    const schemaData = analyzeSchema($);
    const linksData = analyzeLinks($, url);

    // --- Combine results into a final report object ---
    const report = {
      url,
      summary: {
        title: $('title').text() || 'No title found',
        description: $('meta[name="description"]').attr('content') || 'No meta description found',
        ...contentData,
      },
      schema: schemaData,
      headings: headingsData,
      entities: entitiesData,
      links: linksData,
    };

    const recommendations = generateRecommendations(report);

    return { ...report, recommendations };

  } catch (error: any) {
    console.error('Error analyzing URL:', error);
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to analyze URL. ${error.message}`,
    });
  }
});
