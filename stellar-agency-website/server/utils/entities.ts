// @ts-ignore
import nlp from 'compromise';

// Helper function to count frequency of items in an array
function getFrequency(arr: string[]) {
  const map = new Map<string, number>();
  arr.forEach(item => {
    map.set(item, (map.get(item) || 0) + 1);
  });
  // Sort by frequency and return as an array of objects
  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([text, count]) => ({ text, count }));
}

export function analyzeEntities(doc: any) {
  // Normalize text to lowercase for consistent counting
  const people = doc.people().out('array').map((p:string) => p.toLowerCase());
  const places = doc.places().out('array').map((p:string) => p.toLowerCase());
  const organizations = doc.organizations().out('array').map((o:string) => o.toLowerCase());
  const topics = doc.nouns().out('array').map((n:string) => n.toLowerCase().trim().replace(/'s$/, ''));

  return {
    people: getFrequency(people),
    places: getFrequency(places),
    organizations: getFrequency(organizations),
    // Also return top 10 topics for general analysis
    topics: getFrequency(topics).slice(0, 10),
  };
}
