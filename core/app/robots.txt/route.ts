/* eslint-disable check-file/folder-naming-convention */
/*
 * Robots.txt route
 *
 * This route pulls robots.txt content from the channel settings.
 *
 * If you would like to configure this in code instead, delete this file and follow this guide:
 *
 * https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
 *
 */

import { client } from '~/client';
import { graphql } from '~/client/graphql';

const ROBOTS_TXT_QUERY = graphql(`
  query RobotsTxt {
    site {
      settings {
        robotsTxt
      }
    }
  }
`);

function parseUrl(url?: string): URL {
  let incomingUrl = '';
  const defaultUrl = new URL('http://localhost:3000/');

  if (url && !url.startsWith('http')) {
    incomingUrl = `https://${url}`;
  }

  return new URL(incomingUrl || defaultUrl);
}

const baseUrl = parseUrl(
  process.env.NEXTAUTH_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL || '',
);

export const GET = async () => {
  const { data } = await client.fetch({
    document: ROBOTS_TXT_QUERY,
  });

  let robotsTxtText = data.site.settings?.robotsTxt;

  // add sitemap to robots.txt
  robotsTxtText += `\nSitemap: ${baseUrl.origin}/sitemap.xml\n`;

  return new Response(robotsTxtText, {
    headers: {
      'Content-Type': 'text/plain; charset=UTF-8',
    },
  });
};

export const dynamic = 'force-static';
