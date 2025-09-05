import { performAnalysis } from '../utils/analyzer';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const myUrl = query.myUrl as string;
  const competitorUrl = query.competitorUrl as string;

  if (!myUrl || !competitorUrl) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Both your URL and a competitor URL are required.',
    });
  }

  try {
    // Perform analysis on both URLs in parallel
    const [myReport, competitorReport] = await Promise.all([
      performAnalysis(myUrl),
      performAnalysis(competitorUrl)
    ]);

    // Extract keyphrase text into sets for easy comparison
    const myKeyphrases = new Set(myReport.entities.keyphrases.map(k => k.text));
    const competitorKeyphrases = new Set(competitorReport.entities.keyphrases.map(k => k.text));

    // Find keyphrases in competitor's set that are not in my set
    const gapKeyphrases = [...competitorKeyphrases].filter(k => !myKeyphrases.has(k));

    return {
      myUrl,
      competitorUrl,
      gapKeyphrases,
      myKeyphraseCount: myKeyphrases.size,
      competitorKeyphraseCount: competitorKeyphrases.size,
    };

  } catch (error: any) {
    console.error('Error in content gap analysis:', error);
    throw createError({
      statusCode: 500,
      statusMessage: `Content gap analysis failed. ${error.message}`,
    });
  }
});
