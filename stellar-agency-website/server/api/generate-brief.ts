import { performAnalysis } from '../utils/analyzer';

// --- Mock SERP Function ---
// In a real application, this would call an external SERP API (e.g., SerpApi, Scale SERP)
// and would require an API key stored in environment variables.
async function getTop10Urls(keyword: string): Promise<string[]> {
  console.log(`Mock SERP lookup for keyword: "${keyword}"`);
  // Returning a static list of URLs for demonstration purposes.
  // These are real pages related to Nuxt.js for realistic analysis.
  return [
    'https://nuxt.com/docs/getting-started/introduction',
    'https://v2.nuxt.com/guide/concepts/views',
    'https://www.youtube.com/watch?v=dCxS3tws-P8', // Will likely fail, which is a good test case
    'https://en.wikipedia.org/wiki/Nuxt.js',
    'https://github.com/nuxt/nuxt',
    'https://www.smashingmagazine.com/2020/05/getting-started-nuxtjs/',
    'https://developer.mozilla.org/en-US/docs/Learn/Tools_and_testing/Client-side_JavaScript_frameworks/Vue_getting_started',
    'https://css-tricks.com/a-new-users-guide-to-nuxt-js/',
    'https://www.freecodecamp.org/news/what-is-nuxt-js/',
    'https://www.creative-tim.com/blog/web-design/what-is-nuxt-js/'
  ];
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const keyword = query.keyword as string;

  if (!keyword) {
    throw createError({
      statusCode: 400,
      statusMessage: 'A target keyword is required.',
    });
  }

  try {
    const urls = await getTop10Urls(keyword);

    // Analyze all URLs in parallel, filtering out any that fail
    const analysisPromises = urls.map(url => performAnalysis(url).catch(e => null));
    const reports = (await Promise.all(analysisPromises)).filter(r => r !== null) as any[];

    if (reports.length === 0) {
      throw new Error("Could not analyze any of the top search results.");
    }

    // --- Aggregate Data for the Brief ---
    let totalWordCount = 0;
    const allKeyphrases = new Map<string, number>();
    const allHeadings = new Map<string, number>();

    reports.forEach(report => {
      totalWordCount += report.summary.wordCount;

      report.entities.keyphrases.forEach((kp: { text: string, count: number }) => {
        allKeyphrases.set(kp.text, (allKeyphrases.get(kp.text) || 0) + 1);
      });

      report.headings.structure.forEach((h: { level: number, text: string }) => {
        if (h.level > 1 && h.text.length > 5) { // Only consider H2+
            allHeadings.set(h.text, (allHeadings.get(h.text) || 0) + 1);
        }
      });
    });

    const averageWordCount = Math.round(totalWordCount / reports.length);
    const commonKeyphrases = Array.from(allKeyphrases.entries())
      .filter(([text, count]) => count > 1) // Must appear in at least 2 documents
      .sort((a, b) => b[1] - a[1])
      .map(([text]) => text)
      .slice(0, 15); // Top 15

    const commonHeadings = Array.from(allHeadings.entries())
        .filter(([text, count]) => count > 1)
        .sort((a, b) => b[1] - a[1])
        .map(([text]) => text)
        .slice(0, 10); // Top 10

    return {
      keyword,
      analyzedUrlCount: reports.length,
      averageWordCount,
      commonKeyphrases,
      commonHeadings,
    };

  } catch (error: any) {
    console.error('Error in content brief generation:', error);
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to generate content brief. ${error.message}`,
    });
  }
});
