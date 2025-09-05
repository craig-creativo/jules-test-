interface AuditData {
  summary: {
    title: string;
    description: string;
  };
  headings: {
    errors: string[];
    structure: { level: number; text: string }[];
  };
  schema: {
    found: boolean;
  };
  links: {
    imagesWithoutAlt: number;
  };
  entities: {
    topics: { text: string; count: number }[];
  };
}

export function generateRecommendations(data: AuditData): string[] {
  const recommendations: string[] = [];

  // Title Recommendations
  if (!data.summary.title) {
    recommendations.push('Add a descriptive title tag to the page.');
  } else if (data.summary.title.length < 30) {
    recommendations.push('The title tag is too short. Aim for 30-65 characters.');
  } else if (data.summary.title.length > 65) {
    recommendations.push('The title tag is too long. Aim for 30-65 characters.');
  }

  // Description Recommendations
  if (!data.summary.description) {
    recommendations.push('Add a meta description to improve click-through rates from search results.');
  } else if (data.summary.description.length < 70) {
    recommendations.push('The meta description is too short. Aim for 70-155 characters.');
  } else if (data.summary.description.length > 155) {
    recommendations.push('The meta description is too long. Aim for 70-155 characters.');
  }

  // Headings Recommendations
  if (data.headings.errors.includes('No H1 tag found.')) {
    recommendations.push('The page is missing an H1 tag. Add a single, descriptive H1 to represent the main topic.');
  }
  if (data.headings.errors.includes('Multiple H1 tags found.')) {
    recommendations.push('The page has multiple H1 tags. Consolidate them into a single H1.');
  }
  if (data.headings.errors.some(e => e.startsWith('Skipped heading level'))) {
    recommendations.push('The heading structure is not sequential (e.g., H1 followed by H3). Fix the heading hierarchy.');
  }

  // Schema Recommendations
  if (!data.schema.found) {
    recommendations.push('Add structured data (Schema.org markup) to help search engines understand the page content.');
  }

  // Image Alt Text Recommendations
  if (data.links.imagesWithoutAlt > 0) {
    recommendations.push(`Add descriptive alt text to the ${data.links.imagesWithoutAlt} image(s) missing it.`);
  }

  // Content Focus Recommendations
  const h1Text = (data.headings.structure.find(h => h.level === 1)?.text || '').toLowerCase();
  const mainTopic = data.entities.topics[0]?.text;
  if (mainTopic && h1Text && !h1Text.includes(mainTopic)) {
    recommendations.push(`Consider including the main topic "${mainTopic}" in the H1 tag for better content focus.`);
  }

  return recommendations;
}
