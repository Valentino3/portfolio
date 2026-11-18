/**
 * Who the owner is, in the words the site uses: the hero lede, where they are and how they can
 * work, and the languages they speak. The home, the header, the contact line and the CV read it.
 */

/** The job title, as the CV's headline. The home's headline (HEADLINE in lib/site) opens with it. */
export const ROLE_TITLE = 'Design engineer';

export const LEDE =
  'Five years building production web apps. Now Lead UI Developer at Reset Digital. I also built Stock Tienda, a point-of-sale system three stores pay for, and have merged pull requests in Prebid.js and Prebid Server.';

export const LOCATION = 'Mar del Plata, Argentina';
/**
 * What roles and where, in one line: the header's status line (the first thing read), and the
 * CV's line under the name, after LOCATION. The footer says where the owner lives now, and the
 * home's contact line spells out the move ("relocating from Mar del Plata"). It carries four
 * facts: the roles, remote with the time zone, on-site in Buenos Aires, and the move. It has no
 * "Open to": with it the line no longer fits beside the name and the nav at 1100px, and the
 * status dot before it already says "available".
 */
export const AVAILABILITY =
  'Design engineering and full-stack roles · remote (UTC−3) or on-site in Buenos Aires (relocating)';

export type Language = { language: string; level: string };

export const LANGUAGES: Language[] = [
  { language: 'Spanish', level: 'native' },
  { language: 'English', level: 'professional, spoken and written' },
];

/** "Spanish (native), English (professional, spoken and written)" */
export const languagesLine = (): string => LANGUAGES.map(({ language, level }) => `${language} (${level})`).join(', ');

/** The owner's secondary school: a technical school, and the technician degree it awarded. */
export const SECONDARY_SCHOOL = {
  school: 'Technical school',
  degree: 'Personal and Professional Computer Technician',
} as const;
