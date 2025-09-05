import { ofetch } from 'ofetch';
import * as cheerio from 'cheerio';
import nlp from 'compromise';

// Extend compromise with a plugin for topics/keywords
// @ts-ignore
import topics from 'compromise/types/plugins/topics';
nlp.plugin(topics);

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

    // 3. Process the text with compromise
    const doc = nlp(fullText);
    const topics = doc.topics().json();

    const nodesMap = new Map<string, { id: string; group: string; val: number }>();
    const linksSet = new Set<string>();

    // Add the main page as the central node
    const pageHost = new URL(url).hostname;
    nodesMap.set(pageHost, { id: pageHost, group: 'page', val: 50 });

    // 4. Build nodes from topics
    topics.forEach((topic: any) => {
      const text = topic.text.toLowerCase().trim();
      if (text && text.length > 2 && text !== pageHost) {
        const existingNode = nodesMap.get(text);
        if (existingNode) {
          existingNode.val += 2; // Increase value for frequency
        } else {
          nodesMap.set(text, { id: text, group: 'topic', val: 10 });
        }

        // Link topic to the main page
        const linkKey = `${pageHost}>${text}`;
        linksSet.add(linkKey);
      }
    });

    // 5. Build links (simple co-occurrence in sentences for now)
    doc.sentences().forEach(sentence => {
      const sentenceTopics = sentence.topics().out('array').map((t:string) => t.toLowerCase().trim());
      if (sentenceTopics.length > 1) {
        for (let i = 0; i < sentenceTopics.length; i++) {
          for (let j = i + 1; j < sentenceTopics.length; j++) {
            const source = sentenceTopics[i];
            const target = sentenceTopics[j];
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
