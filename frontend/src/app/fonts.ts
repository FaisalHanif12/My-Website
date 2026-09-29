import { Instrument_Serif, JetBrains_Mono, Plus_Jakarta_Sans } from 'next/font/google';

/**
 * The three families of the reference Google Fonts link (L9-11), self hosted by next/font.
 *
 * - Plus Jakarta Sans: the static faces 400 to 800 only (never the variable range). The CSS also
 *   asks for 650 and 750, which the browser draws with the 700 and 800 faces, like the reference.
 * - Instrument Serif: italic 400 only. The reference also loads the normal face, but every serif
 *   rule is italic, so it is never shown (orchestrator decision: dropped).
 * - JetBrains Mono: 400 and 500.
 *
 * The variables are named --ff-* (not --font-*) so they do not fight the tokens on :root;
 * tokens.css builds --font-sans, --font-serif and --font-mono from them. fontVariables goes on
 * <html> (not <body>) so :root can resolve them.
 */
const jakarta = Plus_Jakarta_Sans({
  weight: ['400', '500', '600', '700', '800'],
  style: 'normal',
  subsets: ['latin'],
  display: 'swap',
  variable: '--ff-jakarta',
});

const instrument = Instrument_Serif({
  weight: '400',
  style: ['italic'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--ff-instrument',
});

const jetbrains = JetBrains_Mono({
  weight: ['400', '500'],
  style: 'normal',
  subsets: ['latin'],
  display: 'swap',
  variable: '--ff-jetbrains',
});

/** The static next/font variable classes for <html className>. Never add state driven classes. */
export const fontVariables = `${jakarta.variable} ${instrument.variable} ${jetbrains.variable}`;
