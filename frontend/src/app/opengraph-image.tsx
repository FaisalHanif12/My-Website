import { ImageResponse } from 'next/og';

import { siteMeta } from '@/content/site';

export const alt = siteMeta.defaultTitle;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/** The link preview card: the brand gradient, the monogram, the name and what he builds. */
export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 72,
        color: '#fff',
        background: 'linear-gradient(135deg, #0e6655 0%, #08302a 100%)',
      }}
    >
      <div
        style={{
          width: 96,
          height: 96,
          borderRadius: 26,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(255,255,255,0.14)',
          fontSize: 46,
          fontWeight: 800,
          letterSpacing: -2,
        }}
      >
        FH
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 96, fontWeight: 800, letterSpacing: -3, lineHeight: 1.05 }}>
          Faisal Hanif
        </div>
        <div style={{ fontSize: 40, marginTop: 20, color: '#8fe3c2' }}>Software Engineer</div>
        <div
          style={{ fontSize: 30, marginTop: 28, maxWidth: 900, opacity: 0.85, lineHeight: 1.35 }}
        >
          AI-powered web and mobile products with React, Next.js, Node.js and LLMs.
        </div>
      </div>
      <div style={{ fontSize: 28, opacity: 0.7 }}>faisalhanif.work</div>
    </div>,
    size,
  );
}
