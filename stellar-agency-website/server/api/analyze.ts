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
    const html = await ofetch(url);
    const $ = cheerio.load(html);
    const title = $('title').text();
    const description = $('meta[name="description"]').attr('content') || '';
    const bodyText = $('body').text().replace(/\s\s+/g, ' '); // Compact whitespace
    const fullText = `${title}. ${description}. ${bodyText}`;

    const doc = nlp(fullText);

    const nodesMap = new Map<string, { id: string; group: string; val: number }>();
    const linksMap = new Map<string, number>(); // Changed from Set to Map
    const contextMap = new Map<string, Set<string>>();

    const pageHost = new URL(url).hostname;
    nodesMap.set(pageHost, { id: pageHost, group: 'page', val: 50 });

    doc.sentences().forEach(sentence => {
      const sentenceText = sentence.text();
      const sentenceNouns = sentence.nouns().out('array').map((n: string) => n.toLowerCase().trim().replace(/'s$/, ''));

      sentenceNouns.forEach(noun => {
        if (noun && noun.length > 2) {
          if (!contextMap.has(noun)) {
            contextMap.set(noun, new Set());
          }
          contextMap.get(noun)!.add(sentenceText);
        }
      });

      if (sentenceNouns.length > 1) {
        for (let i = 0; i < sentenceNouns.length; i++) {
          for (let j = i + 1; j < sentenceNouns.length; j++) {
            const source = sentenceNouns[i];
            const target = sentenceNouns[j];
            if (source && target && source !== target) {
              const linkKey = [source, target].sort().join('>');
              // Increment the link strength
              linksMap.set(linkKey, (linksMap.get(linkKey) || 0) + 1);
            }
          }
        }
      }
    });

    const allNouns = Array.from(contextMap.keys());
    allNouns.forEach((noun: string) => {
      if (noun && noun.length > 2 && noun !== pageHost) {
        const occurrences = contextMap.get(noun)?.size || 1;
        nodesMap.set(noun, { id: noun, group: 'topic', val: occurrences * 5 });
        const linkKey = [pageHost, noun].sort().join('>');
        linksMap.set(linkKey, (linksMap.get(linkKey) || 0) + 1);
      }
    });

    const nodes = Array.from(nodesMap.values());
    const links = Array.from(linksMap.entries()).map(([key, strength]) => {
        const [source, target] = key.split('>');
        return { source, target, value: strength };
    });

    const context = Object.fromEntries(
        Array.from(contextMap.entries()).map(([key, valueSet]) => [key, Array.from(valueSet)])
    );

    return {
      graph: { nodes, links },
      context,
    };

  } catch (error: any) {
    console.error('Error analyzing URL:', error);
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to analyze URL. ${error.message}`,
    });
  }
});
