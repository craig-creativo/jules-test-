import { CheerioAPI } from 'cheerio';
import { URL } from 'url';

interface LinkInfo {
  href: string;
  text: string;
  type: 'internal' | 'external' | 'anchor' | 'other';
}

interface ImageInfo {
  src: string;
  alt: string;
  hasAlt: boolean;
}

export function analyzeLinks($: CheerioAPI, baseUrl: string) {
  const baseHostname = new URL(baseUrl).hostname;
  const links: LinkInfo[] = [];
  const images: ImageInfo[] = [];
  let internalCount = 0;
  let externalCount = 0;
  let emptyAltCount = 0;

  $('a').each((i, el) => {
    const href = $(el).attr('href');
    if (href) {
      let type: LinkInfo['type'] = 'other';
      try {
        if (href.startsWith('#')) {
          type = 'anchor';
        } else {
          const linkUrl = new URL(href, baseUrl);
          if (linkUrl.hostname === baseHostname) {
            type = 'internal';
            internalCount++;
          } else {
            type = 'external';
            externalCount++;
          }
        }
        links.push({ href, text: $(el).text().trim(), type });
      } catch (e) {
        // Ignore invalid URLs
      }
    }
  });

  $('img').each((i, el) => {
    const src = $(el).attr('src') || '';
    const alt = $(el).attr('alt') || '';
    const hasAlt = alt.trim().length > 0;
    if (!hasAlt) {
      emptyAltCount++;
    }
    images.push({ src, alt, hasAlt });
  });

  return {
    internalCount,
    externalCount,
    imageCount: images.length,
    imagesWithoutAlt: emptyAltCount,
    links, // We might truncate this on the frontend
    images, // We might truncate this on the frontend
  };
}
