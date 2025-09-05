import { ofetch } from 'ofetch';
import * as cheerio from 'cheerio';
import nlp from 'compromise';

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
    // 1. Fetch the HTML of the page
    const html = await ofetch(url);

    // 2. Load HTML into cheerio and extract text
    const $ = cheerio.load(html);
    const title = $('title').text();
    const description = $('meta[name="description"]').attr('content') || '';
    const bodyText = $('body').text();
    const fullText = `${title}. ${description}. ${bodyText}`;

    // 3. Process the text with compromise to get nouns
    const doc = nlp(fullText);
    const nouns = doc.nouns().out('array').map((n: string) => n.toLowerCase().trim().replace(/'s$/, ''));

    const nodesMap = new Map<string, { id: string; group: string; val: number }>();
    const linksSet = new Set<string>();

    // Add the main page as the central node
    const pageHost = new URL(url).hostname;
    nodesMap.set(pageHost, { id: pageHost, group: 'page', val: 50 });

    // 4. Build nodes from nouns
    nouns.forEach((noun: string) => {
      if (noun && noun.length > 2 && noun !== pageHost) {
        const existingNode = nodesMap.get(noun);
        if (existingNode) {
          existingNode.val += 2; // Increase value for frequency
        } else {
          nodesMap.set(noun, { id: noun, group: 'topic', val: 10 });
        }

        // Link topic to the main page
        const linkKey = `${pageHost}>${noun}`;
        linksSet.add(linkKey);
      }
    });

    // 5. Build links (co-occurrence in sentences)
    doc.sentences().forEach(sentence => {
      const sentenceNouns = sentence.nouns().out('array').map((n:string) => n.toLowerCase().trim().replace(/'s$/, ''));
      if (sentenceNouns.length > 1) {
        for (let i = 0; i < sentenceNouns.length; i++) {
          for (let j = i + 1; j < sentenceNouns.length; j++) {
            const source = sentenceNouns[i];
            const target = sentenceNouns[j];
            if (source && target && source !== target) {
              // Ensure link is always in the same order to avoid duplicates
              const linkKey = [source, target].sort().join('>');
              linksSet.add(linkKey);
            }
          }
        }
      }
    });


    // 6. Format for the graph
    const nodes = Array.from(nodesMap.values());
    const links = Array.from(linksSet).map(key => {
      const [source, target] = key.split('>');
      return { source, target, value: 1 };
    });

    return {
      nodes,
      links,
    };

  } catch (error: any) {
    console.error('Error analyzing URL:', error);
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to analyze URL. ${error.message}`,
    });
  }
});
