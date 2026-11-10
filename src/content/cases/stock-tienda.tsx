import { Diagram } from '@/components/case/diagram';
import { ExternalLink } from '@/components/site/external-link';
import type { CaseStudy } from '../case-types';
import { projectSummary } from '../projects';

export const stockTienda: CaseStudy = {
  slug: 'stock-tienda',
  dek: 'Software for small stores to sell at the counter, keep their stock and close the cash register. I built it alone, end to end. Three stores pay for it and have used it for about three months.',
  facts: [
    { label: 'Role', value: 'Solo: product, design, code and operations' },
    { label: 'Users', value: 'Three paying stores, in production for about three months' },
    {
      label: 'Stack',
      value:
        'Next.js, TypeScript, Tailwind CSS 4, shadcn/Radix, PostgreSQL (Neon), Drizzle, Vitest, Playwright, fast-check',
    },
    {
      label: 'Links',
      value: (
        <>
          <ExternalLink href="https://github.com/Valentino3/stock-tienda">Repository (public)</ExternalLink>. Screens
          come from a test store with demo data.
        </>
      ),
    },
  ],
  hero: {
    image: projectSummary('stock-tienda').image,
    caption: 'Reports: period total, low stock and cash closings',
    note: 'test store · demo data',
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
      id: 'engineering',
      title: 'Engineering decisions',
      body: (
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
      ),
    },
  ],
  seo: {
    description: 'Stock, point of sale and cash control for small stores. Built and run by me; three stores pay for it.',
  },
};
