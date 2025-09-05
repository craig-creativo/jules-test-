import { ofetch } from 'ofetch';
import * as cheerio from 'cheerio';
// @ts-ignore
import nlp from 'compromise';

import { analyzeContent } from './content';
import { analyzeHeadings } from './headings';
import { analyzeEntities } from './entities';
import { analyzeSchema } from './schema';
import { analyzeLinks } from './links';
import { generateRecommendations } from './recommendations';

export async function performAnalysis(url: string) {
  if (!url) {
    throw new Error("URL is required for analysis.");
  }

  const html = await ofetch(url);
  const $ = cheerio.load(html);
  const bodyText = $('body').text().replace(/\s\s+/g, ' ');
  const doc = nlp(bodyText);

  const contentData = analyzeContent(doc, bodyText);
  const headingsData = analyzeHeadings($);
  const entitiesData = analyzeEntities(doc);
  const schemaData = analyzeSchema($);
  const linksData = analyzeLinks($, url);

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
    keyphraseProminence: {},
  };

  const topKeyphrases = report.entities.keyphrases.slice(0, 5).map(p => p.text);
  const titleText = report.summary.title.toLowerCase();
  const descriptionText = report.summary.description.toLowerCase();
  const h1Text = (report.headings.structure.find(h => h.level === 1)?.text || '').toLowerCase();

  report.keyphraseProminence = topKeyphrases.map(phrase => ({
    phrase,
    inTitle: titleText.includes(phrase),
    inDescription: descriptionText.includes(phrase),
    inH1: h1Text.includes(phrase),
  }));

  const recommendations = generateRecommendations(report);

  return { ...report, recommendations };
}
