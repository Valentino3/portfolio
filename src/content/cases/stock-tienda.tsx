import { Decision, Decisions, Result } from '@/components/case/decision-card';
import { Diagram } from '@/components/case/diagram';
import { Figure } from '@/components/case/figure';
import { GALLERY_SIZES } from '@/components/case/gallery';
import { ExternalLink } from '@/components/site/external-link';
import type { CaseStudy } from '../case-types';
import { projectSummary } from '../projects';
import type { Media } from '../types';

const table: Media = {
  src: '/img/stock-table.webp',
  width: 1240,
  height: 640,
  alt: 'Product table: stock, prices and costs in a monospaced font, right-aligned, with low stock marked in red',
};
const kpis: Media = {
  src: '/img/stock-kpis.webp',
  width: 1140,
  height: 122,
  alt: 'Three figures: total for the period, 7 products with low stock in red, and 0 cash closings with a difference',
};

export const stockTienda: CaseStudy = {
  slug: 'stock-tienda',
  dek: 'Software for small stores to sell at the counter, keep their stock and close the cash register. I built it alone, end to end. Three stores pay for it and have used it for about three months.',
  meta: [
    'Solo: product, design, code and operations. Three paying stores, in production for about three months.',
    <>
      Next.js, TypeScript, Tailwind CSS 4, shadcn/Radix, PostgreSQL (Neon), Drizzle, Vitest, Playwright, fast-check.{' '}
      <ExternalLink href="https://github.com/Valentino3/stock-tienda">Repository (public)</ExternalLink>. Screens come
      from a test store with demo data.
    </>,
  ],
  hero: {
    image: projectSummary('stock-tienda').image,
    caption: 'Reports: period total, low stock and cash closings',
    note: 'test store, demo data',
  },
  outcomes: [
    {
      title: 'Three stores pay for it',
      body: 'In daily use for about three months, on counter computers and phones.',
    },
    {
      title: 'It keeps selling offline',
      body: 'A local catalogue and a queue of sales on the counter. When the connection returns, sales replay without being counted twice.',
    },
    {
      title: 'Electronic invoicing with ARCA',
      body: 'ARCA is Argentina’s tax agency: every invoice has to be authorized online. Invoices A and B and credit notes, plus a test store in production where real invoicing is blocked.',
    },
  ],
  sections: [
    {
      id: 'context',
      title: 'Context',
      body: (
        <>
          <p>
            The scene is a store counter during opening hours, in daylight, sometimes in a hurry with a customer
            waiting. The app runs in the browser of the counter computer and on phones. The owner sees everything;
            employees sell, check products and run the cash register. The type of business is part of the model: a
            restaurant gets tables and kitchen tickets, a card shop gets variants by set, condition and language.
          </p>
          <p>
            The core rule: stock is deducted in one transaction when a sale goes through, and you can’t sell without
            an open cash session. Online, a sale without enough stock is rejected. Offline is the deliberate
            exception, explained below.
          </p>
        </>
      ),
    },
    {
      id: 'role',
      title: 'My role',
      body: (
        <p>
          All of it: scope, design, code, tests and production. Each store’s data is isolated from the others, with
          owner and employee roles. Stores load their catalogue from a spreadsheet, or from a photo or PDF of a
          supplier invoice read with AI.
        </p>
      ),
    },
    {
      id: 'design',
      title: 'Design decisions',
      body: (
        <>
          <p>
            The design brief, in one line: the numbers are the interface. Money, stock, SKUs and dates read like a
            ledger you can trust at a glance. The tokens and rules are written down in the repository, so every new
            screen follows them.
          </p>
          <Decisions>
            <Decision
              title="Every figure in tabular mono"
              figure={
                <Figure
                  image={table}
                  caption="Product table: figures aligned in columns"
                  sizes={GALLERY_SIZES.wide}
                  zoom
                />
              }
            >
              <p>
                Columns of money only read when digits line up. Fonts load with <code>display: optional</code>; with
                the default <code>swap</code>, every figure changes width when the font arrives and the whole table
                jumps.
              </p>
            </Decision>
            <Decision
              title="Color only when there’s something to look at"
              figure={<Figure image={kpis} caption="Report figures" sizes={GALLERY_SIZES.wide} zoom />}
            >
              <p>
                A green zero makes you look up to read that nothing happened. Here the only color is the red 7 for
                low stock; the zero closings with a difference stay black. Negative amounts go in parentheses, like a
                bank statement.
              </p>
            </Decision>
            <Decision title="Borders, not shadows">
              <p>
                Two grey borders give the density: one separates, one structures. Shadows are reserved for the paper
                documents on screen, like the delivery note, which is what makes them look like paper.
              </p>
            </Decision>
            <Decision title="Two kinds of empty">
              <p>
                “No customers yet” (dotted border) is not the same as “no results for this filter” (solid border,
                with a way to clear it). Saying “nothing here” when 400 products are hidden by a filter is the worst
                case.
              </p>
            </Decision>
          </Decisions>
        </>
      ),
    },
    {
      id: 'engineering',
      title: 'Engineering decisions',
      body: (
        <>
          <Decisions>
            <Decision title="Offline sales: record first, flag later">
              <Result>
                Instead of rejecting an offline sale when stock ran out, the sale is recorded, stock may go negative
                and an alert is raised. It lands in the cash session that was open when it happened, even if that
                session is closed now. Device clocks are bounded: a date more than 30 days old or 5 minutes ahead is
                replaced with the sync time.
              </Result>
              <p>
                By the time the sale syncs, the goods have left the store and the money is in the drawer. Rejecting it
                doesn’t bring the units back; it only loses the record.
              </p>
            </Decision>
            <Decision title="Permissions checked on the server, always">
              <p>Hiding a button is not a permission.</p>
              <Result>
                Every action is authorized server-side, per store and per role. I found and closed a
                privilege-escalation bug in the replay endpoint, and added CI in the same change.
              </Result>
            </Decision>
            <Decision title="Property-based tests for the money math">
              <Result>
                Instead of only example tests, plus a manual test sale after each deploy: property tests for totals,
                prices, cash counts, accounts and tax amounts, alongside example and end-to-end tests, and a
                production check that replaced the manual sale.
              </Result>
              <p>
                Totals, prices, cash counts and tax amounts have rules that must hold for any input, and a handful of
                examples misses edge cases.
              </p>
            </Decision>
            <Decision title="A test store in production">
              <p>
                <Result inline>A store in production where real invoicing is blocked,</Result> to exercise the real
                production setup without issuing real invoices.
              </p>
            </Decision>
          </Decisions>
          <Diagram
            label="Diagram: the counter app keeps a local catalogue and queues sales while offline; when the connection returns it replays them, each with a key; the server checks permissions and records stock in one transaction in PostgreSQL, and invoices go through ARCA."
            rows={[
              [
                { l1: 'Counter app', l2: 'local catalogue' },
                { l1: 'Offline queue', l2: 'sales + keys', edge: 'replay' },
                { l1: 'Server', l2: 'permissions, one tx', dark: true },
                { l1: 'PostgreSQL', l2: 'Neon' },
              ],
              [{ l1: 'Server' }, { l1: 'ARCA', l2: 'invoice authorized' }],
            ]}
            note="A replayed sale with the same key is never counted twice."
          />
        </>
      ),
    },
  ],
  seo: {
    description: 'Stock, point of sale and cash control for small stores. Built and run by me; three stores pay for it.',
  },
};
