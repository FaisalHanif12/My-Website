import { siteMeta } from '@/content/site';

/** The public origin without a trailing slash (NEXT_PUBLIC_SITE_URL, else the live site). */
export const siteUrl: string = (process.env.NEXT_PUBLIC_SITE_URL ?? siteMeta.baseUrl).replace(
  /\/+$/,
  '',
);
