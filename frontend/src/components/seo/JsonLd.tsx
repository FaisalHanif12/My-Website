import { contactFacts, site, siteMeta } from '@/content/site';
import { socials } from '@/content/socials';
import { siteUrl } from '@/lib/siteUrl';

/** schema.org Person for the site owner (search engines and link previews). */
export function personJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: site.name,
    jobTitle: site.role,
    description: siteMeta.description,
    url: siteUrl,
    address: {
      '@type': 'PostalAddress',
      addressLocality: contactFacts.city,
      addressCountry: 'PK',
    },
    sameAs: socials.filter((s) => s.href.startsWith('http')).map((s) => s.href),
    knowsAbout: ['React', 'Next.js', 'Node.js', 'TypeScript', 'React Native', 'LLM integration'],
  };
}

/** The Person data as a JSON-LD script. `<` is escaped so the JSON can never close the tag. */
export function JsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(personJsonLd()).replace(/</g, '\\u003c'),
      }}
    />
  );
}
