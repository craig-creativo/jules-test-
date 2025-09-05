import { performAnalysis } from '../utils/analyzer';

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
    const report = await performAnalysis(url);
    return report;
  } catch (error: any) {
    console.error('Error in single page analysis:', error);
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to analyze URL. ${error.message}`,
    });
  }
});
