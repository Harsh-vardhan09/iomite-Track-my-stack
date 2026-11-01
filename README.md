# Translate My Stack

**Translate My Stack** is a frontend-only buyer guide for IOMETE. It helps
people evaluating IOMETE relate tools they already use to IOMETE concepts,
compare likely matches, spot areas that need a technical conversation, and
prepare questions for an IOMETE discussion.

The comparison covers **Snowflake**, **Databricks**, and **Cloudera / Hive**.
It is a mock-up: mappings are static, curated data—not live product
integration, migration automation, or a guarantee of feature parity.

## What the project does

- Presents platform choices and one-click example buyer profiles.
- Groups each platform's source terms by category in an interactive checklist.
- Updates the mapping results as a buyer selects tools, with match filters,
  counts, a visual stack bridge, and a match-breakdown chart.
- Provides role-aware wording for Engineers, CFOs, and Security Leads.
- Opens details for a mapping, including its match definition, documentation
  status, explanation, and a suggested question to ask IOMETE.
- Creates a buyer one-pager or sales-rep call-prep brief, which can be printed
  or saved as a PDF through the browser, or copied as Markdown.
- Includes a coverage report, unknown-rate comparison, and a guided demo.

## How it enhances the IOMETE evaluation

IOMETE is a sovereign data lakehouse built on Apache Spark, Apache Iceberg, and
Kubernetes. Buyers may know the tools in their existing stack better than
IOMETE's concepts. This guide makes those concepts easier to discuss in terms
of familiar tools, gives technical and business stakeholders a shared starting
point, and surfaces questions where an equivalent is not established.

The guide deliberately distinguishes **Documented** mappings from **Our
judgment** and shows unknowns rather than guessing. It does not claim
compatibility, feature parity, pricing equivalence, or performance equivalence.

## Run locally

Install a current Node.js LTS release with npm, then from the project directory
run:

```sh
npm install
npm run dev
```

Vite prints the local development URL in the terminal (usually
`http://localhost:5173`). Open it in a browser.

To type-check and create an optimized production build:

```sh
npm run build
```

To serve that build locally:

```sh
npm run preview
```

There is no backend, database, or environment file to configure.

## Project structure

```text
.
├── index.html                 # HTML entry point and page metadata
├── package.json               # Dependencies and npm scripts
├── vite.config.ts             # Vite and React plugin configuration
├── tailwind.config.js         # Tailwind content paths and theme
├── postcss.config.js          # Tailwind and Autoprefixer
├── tsconfig*.json             # TypeScript project configuration
└── src/
    ├── main.tsx               # React application entry point
    ├── App.tsx                # Buyer flow, results, bridge, reports, exports
    ├── index.css              # Tailwind directives, global and print styles
    ├── data/
    │   └── mappings.json     # Static mapping rows used by the app
    └── types/
        └── mapping.ts        # TypeScript types for mappings and roles
```

## Mapping data

Mapping data is stored in [`src/data/mappings.json`](./src/data/mappings.json).
The `MappingRow` TypeScript interface and its allowed value types are in
[`src/types/mapping.ts`](./src/types/mapping.ts).

Each row has these fields:

| Field | Description |
| --- | --- |
| `id` | Stable, unique row identifier |
| `source_platform` | `snowflake`, `databricks`, or `cloudera_hive` |
| `source_term` | Tool or feature from the source platform |
| `iomete_term` | IOMETE concept, or `No documented equivalent` |
| `match` | `direct`, `partial`, `different`, or `unknown` |
| `basis` | `documented` or `judgment` |
| `note` | Default explanation shown to the user |
| `note_cfo` | Optional, pre-written CFO-specific explanation |
| `note_security` | Optional, pre-written Security Lead explanation |
| `ask_iomete` | Suggested question for an IOMETE conversation |
| `iomete_doc_url` | IOMETE documentation URL or `TODO_VERIFY` |
| `source_doc_url` | Source-platform documentation URL or `TODO_VERIFY` |
| `url_verified` | Whether the documentation links have been verified |
| `category` | `compute`, `storage_format`, `catalog`, `security`, `ingestion`, `orchestration`, or `bi_access` |

### Add or update a mapping

1. Add a row to `src/data/mappings.json` with a unique `id` and all required
   fields from `MappingRow`.
2. Use only supported platform, match, basis, and category values. Keep
   IOMETE concepts consistent with the concepts already presented in the app.
3. Write the default note and `ask_iomete` as reviewed, factual text. Optional
   `note_cfo` and `note_security` fields provide role-specific wording; when
   absent, the app falls back to `note`.
4. Until a URL has been checked, use `TODO_VERIFY` and set `url_verified` to
   `false`. Only use verified URLs and set the flag to `true` after checking
   both links.
5. Run `npm run build` to validate TypeScript and the production bundle.

## Known limitations

- The app uses a static JSON dataset and has no backend or live product
  documentation integration.
- Documentation links are placeholders until verified; the coverage report
  reflects the dataset as it currently exists.
- Match labels and notes are conversation aids, not compatibility, migration,
  feature, security, cost, or performance guarantees.
- Role-specific text and preset buyer profiles are pre-written examples, not
  generated advice or inferred facts about a real organization.
- Coverage and unknown-rate charts describe only the included mapping rows;
  they do not measure total IOMETE product coverage.
- PDF creation opens the browser's print dialog. Markdown copying depends on
  clipboard permissions in the browser.
