import { useEffect, useMemo, useRef, useState } from "react";
import mappings from "./data/mappings.json";
import type {
  BuyerRole,
  MappingCategory,
  MappingMatch,
  MappingRow,
  SourcePlatform,
} from "./types/mapping";

type PlatformOption = {
  id: SourcePlatform;
  label: string;
  descriptor: string;
  eyebrow: string;
  mark: string;
  tint: string;
};

type BuyerPreset = {
  id: string;
  label: string;
  platform: SourcePlatform;
  terms: string[];
};

type DemoStep = {
  id: string;
  title: string;
  description: string;
  start: number;
  end: number;
};

const platforms: PlatformOption[] = [
  {
    id: "snowflake",
    label: "Snowflake",
    descriptor: "Cloud data warehouse",
    eyebrow: "THE CLOUD WAREHOUSE",
    mark: "S",
    tint: "from-[#e8f7f8] to-[#f3fbfb]",
  },
  {
    id: "databricks",
    label: "Databricks",
    descriptor: "Lakehouse platform",
    eyebrow: "THE LAKEHOUSE PLATFORM",
    mark: "D",
    tint: "from-[#fff0e9] to-[#fff8f4]",
  },
  {
    id: "cloudera_hive",
    label: "Cloudera / Hive",
    descriptor: "Hadoop & Hive estate",
    eyebrow: "THE HADOOP ECOSYSTEM",
    mark: "C",
    tint: "from-[#f1edfc] to-[#faf8ff]",
  },
];

const categoryLabels: Record<MappingCategory, string> = {
  compute: "Compute",
  storage_format: "Storage & format",
  catalog: "Catalog",
  security: "Security",
  ingestion: "Ingestion",
  orchestration: "Orchestration",
  bi_access: "BI & access",
};

const categoryOrder = Object.keys(categoryLabels) as MappingCategory[];
const matchLabels: Record<MappingMatch, string> = {
  direct: "Direct",
  partial: "Partial",
  different: "Different",
  unknown: "Unknown",
};
const matchOrder: MappingMatch[] = ["direct", "partial", "different", "unknown"];
const mappingRows = mappings as MappingRow[];
const buyerPresets: BuyerPreset[] = [
  {
    id: "regional-bank",
    label: "Regional bank on Cloudera + Hive + Ranger",
    platform: "cloudera_hive",
    terms: [
      "HiveServer2",
      "Hive Metastore",
      "Apache Ranger",
      "Apache Sentry",
      "Kerberos",
      "Oozie",
      "Impala",
      "Iceberg REST Catalog",
    ],
  },
  {
    id: "snowflake-startup",
    label: "Startup on Snowflake + dbt + Tableau",
    platform: "snowflake",
    terms: [
      "Virtual Warehouse",
      "Worksheets",
      "Tasks",
      "Snowpipe",
      "Dynamic Tables",
      "Time Travel",
      "Git Integration",
      "Secure Data Sharing",
    ],
  },
  {
    id: "databricks-analytics",
    label: "Analytics team on Databricks + Delta tables",
    platform: "databricks",
    terms: [
      "All-purpose Compute",
      "Jobs Compute",
      "Notebooks",
      "Delta Lake",
      "Unity Catalog",
      "Workflows",
      "Structured Streaming",
      "SQL Warehouse",
    ],
  },
];
const demoSteps: DemoStep[] = [
  {
    id: "checklist",
    title: "Choose the tools in your stack",
    description: "Preset terms are selected; you can see how the checklist is grouped.",
    start: 0,
    end: 10,
  },
  {
    id: "bridge",
    title: "See the stack bridge",
    description: "Each connector shows how a selected tool relates to IOMETE.",
    start: 10,
    end: 20,
  },
  {
    id: "results",
    title: "Review matches and questions",
    description: "The result rows separate documented matches from judgment and unknowns.",
    start: 20,
    end: 30,
  },
  {
    id: "export",
    title: "Prepare a shareable briefing",
    description: "Switch between the buyer one-pager and rep call prep.",
    start: 30,
    end: 42,
  },
  {
    id: "coverage",
    title: "Check dataset coverage",
    description: "Coverage reports show match types, evidence basis and unknown rates.",
    start: 42,
    end: 60,
  },
];
const buyerRoles: { id: BuyerRole; label: string }[] = [
  { id: "engineer", label: "Engineer" },
  { id: "cfo", label: "CFO" },
  { id: "security", label: "Security Lead" },
];

function App() {
  const [platform, setPlatform] = useState<SourcePlatform | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState<MappingMatch | "all">("all");
  const [showOnePager, setShowOnePager] = useState(false);
  const [buyerRole, setBuyerRole] = useState<BuyerRole>("engineer");
  const [detailRow, setDetailRow] = useState<MappingRow | null>(null);
  const [showCoverage, setShowCoverage] = useState(false);
  const [demoElapsed, setDemoElapsed] = useState<number | null>(null);

  const platformRows = useMemo(
    () => mappingRows.filter((row) => row.source_platform === platform),
    [platform],
  );
  const groupedRows = useMemo(
    () =>
      categoryOrder
        .map((category) => ({
          category,
          rows: platformRows.filter((row) => row.category === category),
        }))
        .filter((group) => group.rows.length > 0),
    [platformRows],
  );
  const selectedRows = useMemo(
    () => platformRows.filter((row) => selectedIds.includes(row.id)),
    [platformRows, selectedIds],
  );
  const resultRows =
    activeFilter === "all"
      ? selectedRows
      : selectedRows.filter((row) => row.match === activeFilter);
  const exportRows = activeFilter === "all" ? selectedRows : resultRows;
  const counts = useMemo(
    () =>
      selectedRows.reduce(
        (total, row) => {
          total[row.match] += 1;
          return total;
        },
        { direct: 0, partial: 0, different: 0, unknown: 0 },
      ),
    [selectedRows],
  );
  const exportCounts = useMemo(
    () =>
      exportRows.reduce(
        (total, row) => {
          total[row.match] += 1;
          return total;
        },
        { direct: 0, partial: 0, different: 0, unknown: 0 },
      ),
    [exportRows],
  );
  const currentPlatform = platforms.find((item) => item.id === platform);
  const activeDemoStep =
    demoElapsed === null
      ? undefined
      : demoSteps.find(
          (step) => demoElapsed >= step.start && demoElapsed < step.end,
        );

  useEffect(() => {
    if (demoElapsed === null) return;
    const timer = window.setInterval(() => {
      setDemoElapsed((elapsed) => {
        if (elapsed === null || elapsed >= 59) return null;
        return elapsed + 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [demoElapsed !== null]);

  useEffect(() => {
    if (demoElapsed === null) return;
    if (demoElapsed >= 42) {
      setShowCoverage(true);
      setShowOnePager(false);
      setDetailRow(null);
    } else if (demoElapsed >= 30) {
      setShowCoverage(false);
      setShowOnePager(true);
      setDetailRow(null);
    } else {
      setShowCoverage(false);
      setShowOnePager(false);
      setActiveFilter("all");
      if (demoElapsed >= 20) {
        setActiveFilter("partial");
      }
    }
  }, [demoElapsed]);

  function loadPreset(preset: BuyerPreset) {
    setPlatform(preset.platform);
    setSelectedIds(
      mappingRows
        .filter(
          (row) =>
            row.source_platform === preset.platform &&
            preset.terms.includes(row.source_term),
        )
        .map((row) => row.id),
    );
    setActiveFilter("all");
    setShowOnePager(false);
    setShowCoverage(false);
    setDetailRow(null);
    setDemoElapsed(null);
  }

  function startDemo() {
    const preset = buyerPresets[0];
    loadPreset(preset);
    setDemoElapsed(0);
  }

  function stopDemo() {
    setDemoElapsed(null);
  }

  function choosePlatform(nextPlatform: SourcePlatform) {
    setPlatform(nextPlatform);
    setSelectedIds([]);
    setActiveFilter("all");
    setShowOnePager(false);
    setShowCoverage(false);
    setDetailRow(null);
    setDemoElapsed(null);
  }

  function toggleRow(id: string) {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((selectedId) => selectedId !== id)
        : [...current, id],
    );
    setShowOnePager(false);
  }

  return (
    <div className="min-h-screen bg-[#f5f8f8] text-[#122a3a]">
      <header className="border-b border-[#e7edef] bg-white">
        <div className="mx-auto flex min-h-[68px] max-w-[1240px] flex-wrap items-center justify-between gap-3 px-5 py-2 sm:px-8">
          <button
            aria-label="Return to platform selection"
            className="flex items-center gap-3 text-left"
            onClick={() => {
              setPlatform(null);
              setShowOnePager(false);
              setShowCoverage(false);
            }}
            type="button"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0f3546] text-sm font-bold tracking-tight text-white">
              i.
            </span>
            <span className="text-[15px] font-semibold tracking-[-0.03em] text-[#143448]">
              IOMETE
              <span className="ml-2 font-normal text-[#9baab0]">/</span>
              <span className="ml-2 font-medium text-[#657984]">
                Translate My Stack
              </span>
            </span>
          </button>
          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-2 text-xs font-medium text-[#71858e] lg:flex">
              <span className="h-2 w-2 rounded-full bg-[#1a9d92]" />
              Buyer’s guide
            </span>
            <div
              aria-label="Choose your role"
              className="flex items-center gap-1 rounded-xl border border-[#e1eaeb] bg-[#f7fafa] p-1"
              role="group"
            >
              {buyerRoles.map((role) => (
                <button
                  aria-pressed={buyerRole === role.id}
                  className={`rounded-lg px-2.5 py-1.5 text-[10px] font-semibold transition sm:px-3 sm:text-[11px] ${
                    buyerRole === role.id
                      ? "bg-[#123b4e] text-white shadow-sm"
                      : "text-[#72868e] hover:bg-white hover:text-[#294b5a]"
                  }`}
                  key={role.id}
                  onClick={() => setBuyerRole(role.id)}
                  type="button"
                >
                  {role.label}
                </button>
              ))}
            </div>
            <button
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-[10px] font-semibold transition sm:text-[11px] ${
                demoElapsed === null
                  ? "border border-[#b9dbd8] bg-[#eff8f7] text-[#137d78] hover:bg-[#e2f3f1]"
                  : "bg-[#fceeee] text-[#a94848] hover:bg-[#f9e1e1]"
              }`}
              onClick={demoElapsed === null ? startDemo : stopDemo}
              type="button"
            >
              {demoElapsed === null ? "Demo mode" : "Stop demo"}
            </button>
            <button
              aria-current={showCoverage ? "page" : undefined}
              className={`rounded-xl px-3 py-2 text-[10px] font-semibold transition sm:text-[11px] ${
                showCoverage
                  ? "bg-[#123b4e] text-white"
                  : "text-[#647d87] hover:bg-[#f1f7f7] hover:text-[#28777a]"
              }`}
              onClick={() => {
                stopDemo();
                setShowCoverage(true);
                setShowOnePager(false);
                setDetailRow(null);
              }}
              type="button"
            >
              Coverage
            </button>
          </div>
        </div>
      </header>

      <div className="border-b border-[#cfdfdf] bg-[#edf6f5] px-4 py-2 text-center text-[11px] font-medium leading-4 text-[#496b70]">
        Mock-up data. Every row is labeled Documented or Our judgment; unknowns
        are shown, not guessed.
      </div>
      {demoElapsed !== null && activeDemoStep && (
        <div
          aria-live="polite"
          className="no-print sticky top-0 z-30 flex flex-wrap items-center justify-between gap-2 border-b border-[#d6e5e6] bg-white/95 px-5 py-2.5 shadow-sm backdrop-blur sm:px-8"
        >
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#e6f4f2] text-[#148780]">
              <SparkIcon />
            </span>
            <span className="text-[11px] font-semibold text-[#29495a]">
              Demo · {demoSteps.findIndex((step) => step.id === activeDemoStep.id) + 1}
              /{demoSteps.length}: {activeDemoStep.title}
            </span>
            <span className="hidden text-[11px] text-[#788d95] sm:inline">
              {activeDemoStep.description}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] tabular-nums text-[#82949b]">
              {Math.max(0, 60 - demoElapsed)}s
            </span>
            <button
              className="rounded-lg px-2.5 py-1 text-[10px] font-semibold text-[#9a4c4c] hover:bg-[#fff1f1]"
              onClick={stopDemo}
              type="button"
            >
              End demo
            </button>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-[1240px] px-5 pb-20 pt-9 sm:px-8 sm:pt-12">
        <section className="relative overflow-hidden rounded-[26px] bg-[#102d42] px-6 py-8 text-white sm:px-10 sm:py-10">
          <div className="pointer-events-none absolute -right-20 -top-32 h-[430px] w-[430px] rounded-full border border-white/[0.07]" />
          <div className="pointer-events-none absolute -right-[-95px] -top-10 h-[280px] w-[280px] rounded-full border border-white/[0.07]" />
          <div className="relative max-w-[660px]">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-3 py-1.5 text-[10px] font-semibold tracking-[0.14em] text-[#c5d9de]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#43c3b4]" />
              YOUR STACK, DECODED
            </div>
            <h1 className="max-w-[620px] text-[36px] font-semibold leading-[1.08] tracking-[-0.045em] sm:text-[48px]">
              Translate your stack.
              <br />
              <span className="text-[#58d0c0]">Move forward with clarity.</span>
            </h1>
            <p className="mt-5 max-w-[540px] text-sm leading-6 text-[#c2d0d5] sm:text-[15px]">
              Find the IOMETE concepts behind the tools you already know. Build
              a practical, honest snapshot of your stack—unknowns included.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[#b4c6cc]">
              <span className="inline-flex items-center gap-2">
                <span className="text-[#58d0c0]">✓</span> 36 concepts mapped
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="text-[#58d0c0]">✓</span> Unknowns called out
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="text-[#58d0c0]">✓</span> No feature assumptions
              </span>
            </div>
          </div>
          <div className="absolute bottom-8 right-10 hidden rotate-[-7deg] rounded-2xl border border-white/10 bg-white/[0.06] p-4 shadow-xl lg:block">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.09] text-xs font-semibold">
                SF
              </span>
              <span className="text-[#58c6b8]">→</span>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#58c6b8] text-xs font-bold text-[#102d42]">
                I.
              </span>
            </div>
            <div className="mt-3 text-[10px] font-medium tracking-wide text-[#c2d0d5]">
              YOUR TOOLS. NEW PERSPECTIVE.
            </div>
          </div>
        </section>

        {showCoverage ? (
          <CoverageReport
            demoHighlight={activeDemoStep?.id === "coverage"}
            onBack={() => setShowCoverage(false)}
          />
        ) : showOnePager && currentPlatform ? (
          <ExportScreen
            counts={exportCounts}
            demoHighlight={activeDemoStep?.id === "export"}
            onClose={() => setShowOnePager(false)}
            platform={currentPlatform}
            role={buyerRole}
            rows={exportRows}
          />
        ) : platform === null ? (
          <section className="mt-9" data-demo="preset-picker">
            <div className="mb-5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#77909b]">
                Step 1 · Choose your starting point
              </div>
              <h2 className="mt-1 text-[22px] font-semibold tracking-[-0.035em] text-[#123348]">
                What does your stack look like today?
              </h2>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {platforms.map((item) => (
                <button
                  className="group relative min-h-[205px] overflow-hidden rounded-[22px] border border-[#dfe8eb] bg-white p-6 text-left shadow-[0_4px_18px_rgba(20,54,70,0.03)] transition-all hover:-translate-y-1 hover:border-[#1b9f98] hover:shadow-[0_12px_30px_rgba(16,87,97,0.11)]"
                  key={item.id}
                  onClick={() => choosePlatform(item.id)}
                  type="button"
                >
                  <span
                    className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${item.tint}`}
                  />
                  <span
                    className={`flex h-[54px] w-[54px] items-center justify-center rounded-2xl bg-gradient-to-br ${item.tint} text-xl font-bold text-[#17495b]`}
                  >
                    {item.mark}
                  </span>
                  <span className="mt-7 block text-[11px] font-semibold tracking-[0.13em] text-[#83959c]">
                    {item.eyebrow}
                  </span>
                  <span className="mt-1 block text-[21px] font-semibold tracking-[-0.035em] text-[#14364a]">
                    {item.label}
                  </span>
                  <span className="mt-1 block text-sm text-[#7b8d95]">
                    {item.descriptor}
                  </span>
                  <span className="absolute bottom-6 right-6 flex h-9 w-9 items-center justify-center rounded-full bg-[#f0f7f7] text-[#188f8a] transition group-hover:bg-[#128f89] group-hover:text-white">
                    <ArrowIcon />
                  </span>
                </button>
              ))}
            </div>
            <div
              className={`mt-4 rounded-2xl border border-dashed border-[#cbdadd] bg-[#f9fbfb] p-4 sm:px-5 ${
                activeDemoStep?.id === "preset-picker" ? "demo-highlight" : ""
              }`}
              data-demo="preset-picker"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e8f5f3] text-[#158e87]">
                  <SparkIcon />
                </span>
                <div>
                  <div className="text-sm font-semibold text-[#29485a]">
                    Want a quick tour?
                  </div>
                  <div className="mt-0.5 text-xs text-[#81929a]">
                    Choose a realistic starting stack; every preset is editable.
                  </div>
                </div>
              </div>
              <div className="mt-4 grid gap-2">
                {buyerPresets.map((preset) => (
                  <button
                    className="flex min-h-11 items-center justify-between gap-3 rounded-xl border border-[#e0e9e9] bg-white px-3.5 py-2.5 text-left text-xs font-semibold text-[#3d606d] transition hover:border-[#9acbc7] hover:bg-[#f4fbfa]"
                    key={preset.id}
                    onClick={() => loadPreset(preset)}
                    type="button"
                  >
                    {preset.label}
                    <ArrowIcon />
                  </button>
                ))}
              </div>
            </div>
          </section>
        ) : (
          <section className="mt-8">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#dfe8eb] bg-white text-[#53717d] transition hover:border-[#9ecdc8] hover:text-[#138d86]"
                  onClick={() => {
                    setPlatform(null);
                    setSelectedIds([]);
                    setActiveFilter("all");
                    setShowOnePager(false);
                    setShowCoverage(false);
                  }}
                  type="button"
                >
                  <BackIcon />
                  <span className="sr-only">Choose a different platform</span>
                </button>
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#77909b]">
                    Step 2 · Select the tools you use
                  </div>
                  <h2 className="mt-0.5 text-[21px] font-semibold tracking-[-0.035em] text-[#123348]">
                    {currentPlatform?.label} to IOMETE
                  </h2>
                </div>
              </div>
              <button
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#cbdcde] bg-white px-4 text-xs font-semibold text-[#446575] transition hover:border-[#80c2bc] hover:text-[#147f7a]"
                onClick={() => {
                  setSelectedIds([]);
                  setActiveFilter("all");
                }}
                type="button"
              >
                Clear selection
              </button>
            </div>

            <div
              className={`grid items-start gap-5 lg:grid-cols-[minmax(300px,0.8fr)_minmax(0,1.45fr)] ${
                activeDemoStep?.id === "checklist" ? "demo-highlight" : ""
              }`}
              data-demo="checklist-layout"
            >
              <aside className="rounded-2xl border border-[#e0e9eb] bg-white p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3 border-b border-[#edf1f2] pb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-[#183a4e]">
                      Your current tools
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-[#84949b]">
                      Select the terms that are part of your stack.
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-[#eef6f5] px-2.5 py-1 text-[10px] font-semibold text-[#16827d]">
                    {selectedIds.length} selected
                  </span>
                </div>
                <div className="mt-3 space-y-4">
                  {groupedRows.map(({ category, rows }) => (
                    <fieldset key={category}>
                      <legend className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.13em] text-[#8798a0]">
                        {categoryLabels[category]}
                      </legend>
                      <div className="space-y-0.5">
                        {rows.map((row) => {
                          const checked = selectedIds.includes(row.id);
                          return (
                            <label
                              className={`flex cursor-pointer items-start gap-3 rounded-lg px-2.5 py-2 transition ${
                                checked
                                  ? "bg-[#f0f8f7]"
                                  : "hover:bg-[#f7f9f9]"
                              }`}
                              key={row.id}
                            >
                              <input
                                checked={checked}
                                className="mt-0.5 h-4 w-4 shrink-0 accent-[#168f88]"
                                onChange={() => toggleRow(row.id)}
                                type="checkbox"
                              />
                              <span className="text-[13px] leading-5 text-[#405a67]">
                                {row.source_term}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </fieldset>
                  ))}
                </div>
              </aside>

              <div className="min-w-0">
                <div
                  className={`mb-3 rounded-2xl border border-[#dce8e9] bg-white p-4 sm:p-5 ${
                    activeDemoStep?.id === "results" ? "demo-highlight" : ""
                  }`}
                  data-demo="results-summary"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[#82949b]">
                        Your selected stack
                      </div>
                      <div className="mt-1 text-lg font-semibold tracking-[-0.03em] text-[#16394d]">
                        {selectedRows.length === 0
                          ? "Your comparison, at a glance"
                          : `${selectedRows.length} ${
                              selectedRows.length === 1 ? "tool" : "tools"
                            } mapped`}
                      </div>
                    </div>
                    {selectedRows.length > 0 && (
                      <span className="text-xs text-[#89999f]">
                        {resultRows.length} result
                        {resultRows.length === 1 ? "" : "s"}
                      </span>
                    )}
                  </div>
                  <div
                    aria-label={matchOrder
                      .map((item) => `${counts[item]} ${item}`)
                      .join(", ")}
                    className="mt-4 flex h-2.5 overflow-hidden rounded-full bg-[#edf1f2]"
                    aria-live="polite"
                  >
                    {matchOrder.map((item) =>
                      counts[item] > 0 ? (
                        <div
                          className={`h-full transition-all duration-300 ${barStyles[item]}`}
                          key={item}
                          style={{
                            width: `${(counts[item] / selectedRows.length) * 100}%`,
                          }}
                        />
                      ) : null,
                    )}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5">
                    {matchOrder.map((item) => (
                      <span
                        className="inline-flex items-center gap-1.5 text-[11px] text-[#6e828c]"
                        key={item}
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${dotStyles[item]}`}
                        />
                        <span className="font-semibold text-[#334f5e]">
                          {counts[item]}
                        </span>{" "}
                        {matchLabels[item].toLowerCase()}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 border-t border-[#edf1f2] pt-3">
                    <FilterChip
                      active={activeFilter === "all"}
                      label="All"
                      onClick={() => setActiveFilter("all")}
                    />
                    {matchOrder.map((item) => (
                      <FilterChip
                        active={activeFilter === item}
                        key={item}
                        label={matchLabels[item]}
                        onClick={() =>
                          setActiveFilter((current) =>
                            current === item ? "all" : item,
                          )
                        }
                        type={item}
                      />
                    ))}
                  </div>
                </div>

                {selectedRows.length > 0 && (
                  <div
                    className={
                      activeDemoStep?.id === "bridge" ? "demo-highlight" : ""
                    }
                    data-demo="stack-bridge"
                  >
                    <StackBridge
                      counts={counts}
                      onSelect={setDetailRow}
                      rows={selectedRows}
                    />
                  </div>
                )}

                <div
                  aria-label="Your IOMETE mapping results"
                  className={`overflow-hidden rounded-2xl border border-[#e0e9eb] bg-white ${
                    activeDemoStep?.id === "results" ? "demo-highlight" : ""
                  }`}
                  role="table"
                  data-demo="results-table"
                >
                  <div
                    className="sr-only grid-cols-[1fr_1.2fr_100px_105px_1.5fr] gap-3 border-b border-[#eaf0f1] bg-[#f8fafa] px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#80939b] xl:not-sr-only xl:grid"
                    role="row"
                  >
                    <span role="columnheader">Your term</span>
                    <span role="columnheader">IOMETE equivalent</span>
                    <span role="columnheader">Match</span>
                    <span role="columnheader">Basis</span>
                    <span role="columnheader">Ask IOMETE</span>
                  </div>
                  {selectedRows.length === 0 ? (
                    <div className="px-6 py-12 text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef7f6] text-[#168e87]">
                        <CheckListIcon />
                      </div>
                      <h3 className="mt-3 text-sm font-semibold text-[#244457]">
                        Your comparison starts here
                      </h3>
                      <p className="mx-auto mt-1 max-w-[290px] text-xs leading-5 text-[#83949c]">
                        Choose a few tools from the checklist to see how they
                        map to IOMETE.
                      </p>
                    </div>
                  ) : resultRows.length > 0 ? (
                    <div className="divide-y divide-[#edf1f2]" role="rowgroup">
                      {resultRows.map((row) => (
                        <ResultRow
                          key={row.id}
                          onSelect={() => setDetailRow(row)}
                          row={row}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="px-6 py-10 text-center text-xs text-[#81929a]">
                      No selected terms match this filter.{" "}
                      <button
                        className="font-semibold text-[#128a84] hover:underline"
                        onClick={() => setActiveFilter("all")}
                        type="button"
                      >
                        Show all
                      </button>
                    </div>
                  )}
                </div>
                <div className="mt-4 flex flex-col gap-3 rounded-xl border border-[#e1eaeb] bg-[#f9fbfb] px-4 py-3 text-[11px] leading-5 text-[#71858e] sm:flex-row sm:items-center sm:justify-between">
                  <span>
                    <span className="font-semibold text-[#506c79]">
                      Keep the conversation going.
                    </span>{" "}
                    Match labels are a guide, not a feature guarantee.
                  </span>
                  <span className="shrink-0 text-[#82949b]">
                    Compute endpoints: HS2 10000 · Spark Connect 15002 · Arrow
                    Flight 33333
                  </span>
                </div>
              </div>
            </div>
            <div className="sticky bottom-4 z-10 mt-6 flex justify-end">
              <button
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-[#087e80] px-6 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(8,126,128,0.24)] transition hover:bg-[#076d70] disabled:cursor-not-allowed disabled:bg-[#aabbbd] disabled:shadow-none"
                disabled={selectedRows.length === 0}
                onClick={() => setShowOnePager(true)}
                type="button"
              >
                Build my one-pager <ArrowIcon />
              </button>
            </div>
          </section>
        )}

        <footer className="mt-10 flex flex-col justify-between gap-2 border-t border-[#e1e9eb] pt-5 text-[11px] text-[#81939a] sm:flex-row">
          <span>
            IOMETE · Sovereign data lakehouse on Apache Spark, Apache Iceberg
            &amp; Kubernetes
          </span>
          <span>Concepts are starting points for a deeper discussion.</span>
        </footer>
      </main>
      {detailRow && (
        <MappingDrawer
          onClose={() => setDetailRow(null)}
          role={buyerRole}
          row={detailRow}
        />
      )}
    </div>
  );
}

const barStyles: Record<MappingMatch, string> = {
  direct: "bg-[#169b76]",
  partial: "bg-[#dfa53c]",
  different: "bg-[#528bb8]",
  unknown: "bg-[#94a3aa]",
};

const dotStyles: Record<MappingMatch, string> = {
  direct: "bg-[#169b76]",
  partial: "bg-[#dfa53c]",
  different: "bg-[#528bb8]",
  unknown: "bg-[#94a3aa]",
};

function FilterChip({
  active,
  label,
  onClick,
  type,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  type?: MappingMatch;
}) {
  const styles: Record<MappingMatch, string> = {
    direct: "border-[#b4dfd1] bg-[#eef9f4] text-[#16825f]",
    partial: "border-[#f0d7a7] bg-[#fff8e9] text-[#a87212]",
    different: "border-[#c3d9eb] bg-[#f0f6fb] text-[#3d769e]",
    unknown: "border-dashed border-[#c7d0d4] bg-[#f7f9fa] text-[#687a82]",
  };
  return (
    <button
      aria-pressed={active}
      className={`rounded-full border px-3 py-1.5 text-[10px] font-semibold transition ${
        active
          ? type
            ? styles[type]
            : "border-[#143e50] bg-[#143e50] text-white"
          : "border-[#e1e8e9] bg-white text-[#72858d] hover:border-[#b6c8cc]"
      }`}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

const bridgeLineStyles: Record<MappingMatch, string> = {
  direct: "stroke-[#169b76]",
  partial: "stroke-[#dfa53c]",
  different: "stroke-[#528bb8]",
  unknown: "stroke-[#d84b4b]",
};

const bridgeDashStyles: Partial<Record<MappingMatch, string>> = {
  partial: "0.035 0.02",
  different: "0.008 0.018",
};

function StackBridge({
  counts,
  onSelect,
  rows,
}: {
  counts: Record<MappingMatch, number>;
  onSelect: (row: MappingRow) => void;
  rows: MappingRow[];
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const matchedRows = rows.filter((row) => row.match !== "unknown");
  const iometeNodes = matchedRows.reduce<MappingRow[]>((nodes, row) => {
    if (!nodes.some((node) => node.iomete_term === row.iomete_term)) {
      nodes.push(row);
    }
    return nodes;
  }, []);
  const height = Math.max(rows.length, 1) * 68 + 24;
  const hoveredRow = rows.find((row) => row.id === hoveredId);
  const documentedCount = rows.filter(
    (row) => row.basis === "documented",
  ).length;

  return (
    <section
      aria-label="Visual stack bridge and match breakdown"
      className="mb-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_250px]"
    >
      <div className="min-w-0 overflow-hidden rounded-2xl border border-[#dce8e9] bg-white p-4 sm:p-5">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[#82949b]">
              Stack bridge
            </div>
            <h3 className="mt-1 text-[16px] font-semibold tracking-[-0.025em] text-[#16394d]">
              From your tools to IOMETE
            </h3>
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] font-medium text-[#748890]">
            <BridgeLegend match="direct" />
            <BridgeLegend match="partial" />
            <BridgeLegend match="different" />
            <span className="inline-flex items-center gap-1">
              <span className="font-bold text-[#d84b4b]">?</span> Unknown
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 px-1 pb-2 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#80939b] sm:text-[10px]">
          <span>Your selected terms</span>
          <span className="text-right">IOMETE concepts</span>
        </div>
        <div
          className="relative"
          style={{ height }}
          onMouseLeave={() => setHoveredId(null)}
        >
          <svg
            aria-label="Connections between selected source terms and IOMETE concepts"
            className="absolute inset-0 h-full w-full overflow-visible"
            preserveAspectRatio="none"
            role="img"
            viewBox={`0 0 1000 ${height}`}
          >
            {rows.map((row, index) => {
              const fromY = 46 + index * 68;
              if (row.match === "unknown") {
                return (
                  <g
                    aria-label={`${row.source_term}: no documented equivalent. ${row.note}`}
                    className="cursor-pointer"
                    key={row.id}
                    onBlur={() => setHoveredId(null)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onSelect(row);
                      }
                    }}
                    onFocus={() => setHoveredId(row.id)}
                    onMouseEnter={() => setHoveredId(row.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() => onSelect(row)}
                    role="button"
                    tabIndex={0}
                  >
                    <circle
                      cx="500"
                      cy={fromY}
                      fill="white"
                      r="13"
                      stroke="#d84b4b"
                      strokeWidth="2"
                    />
                    <text
                      dominantBaseline="central"
                      fill="#d84b4b"
                      fontSize="16"
                      fontWeight="700"
                      textAnchor="middle"
                      x="500"
                      y={fromY}
                    >
                      ?
                    </text>
                  </g>
                );
              }
              const targetIndex = iometeNodes.findIndex(
                (node) => node.iomete_term === row.iomete_term,
              );
              const toY = 46 + targetIndex * 68;
              const path = `M 400 ${fromY} C 470 ${fromY}, 530 ${toY}, 600 ${toY}`;
              const isActive = hoveredId === row.id;
              return (
                <g
                  aria-label={`${row.source_term} to ${row.iomete_term}: ${matchLabels[row.match]}. ${row.note}`}
                  className={`bridge-interaction cursor-pointer ${
                    hoveredId && !isActive
                      ? "opacity-[0.16]"
                      : isActive
                        ? "opacity-100"
                        : "opacity-70"
                  }`}
                  key={row.id}
                  role="button"
                  tabIndex={0}
                  onBlur={() => setHoveredId(null)}
                  onFocus={() => setHoveredId(row.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onSelect(row);
                    }
                  }}
                  onMouseEnter={() => setHoveredId(row.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => onSelect(row)}
                >
                  <path
                    className={`bridge-line-draw ${bridgeLineStyles[row.match]}`}
                    d={path}
                    pathLength="1"
                    strokeDasharray="1"
                    strokeDashoffset="1"
                    strokeLinecap="round"
                    strokeWidth={isActive ? 4 : 2.5}
                    style={{ animationDelay: `${index * 75}ms` }}
                  />
                  <path
                    className={`bridge-line-final ${bridgeLineStyles[row.match]}`}
                    d={path}
                    pathLength="1"
                    strokeDasharray={bridgeDashStyles[row.match]}
                    strokeLinecap={row.match === "different" ? "round" : "butt"}
                    strokeWidth={isActive ? 4 : 2.5}
                    style={{ animationDelay: `${index * 75 + 600}ms` }}
                  />
                </g>
              );
            })}
          </svg>

          <div className="pointer-events-none absolute inset-x-0 top-0">
            {rows.map((row, index) => {
              const isActive = hoveredId === row.id;
              return (
                <div
                  className={`absolute left-0 flex h-[48px] w-[39%] items-center rounded-xl border px-2.5 transition-all sm:px-3 ${
                    isActive
                      ? "z-10 scale-[1.015] border-[#168f88] bg-[#eff9f7] shadow-md"
                      : "border-[#e1eaeb] bg-white"
                  }`}
                  key={row.id}
                  style={{ top: 22 + index * 68 }}
                >
                  <span className="truncate text-[11px] font-semibold leading-4 text-[#29495a] sm:text-[13px]">
                    {row.source_term}
                  </span>
                </div>
              );
            })}
            {iometeNodes.map((row, index) => {
              const isActive = hoveredRow?.iomete_term === row.iomete_term;
              return (
                <div
                  className={`absolute right-0 flex h-[48px] w-[39%] items-center justify-end rounded-xl border px-2.5 text-right transition-all sm:px-3 ${
                    isActive
                      ? "z-10 scale-[1.015] border-[#168f88] bg-[#eff9f7] shadow-md"
                      : "border-[#e1eaeb] bg-white"
                  }`}
                  key={`${row.id}-${index}`}
                  style={{ top: 22 + index * 68 }}
                >
                  <span className="line-clamp-2 text-[10px] font-semibold leading-4 text-[#29495a] sm:text-[12px]">
                    {row.iomete_term}
                  </span>
                </div>
              );
            })}
          </div>

          {hoveredRow && (
            <div
              className="pointer-events-none absolute left-1/2 z-20 w-[min(88%,380px)] -translate-x-1/2 rounded-xl border border-[#cbdde0] bg-[#102d42] px-3.5 py-3 text-white shadow-xl"
              role="status"
              style={{
                top: Math.min(
                  Math.max(
                    4,
                    22 + rows.findIndex((row) => row.id === hoveredId) * 68,
                  ),
                  Math.max(4, height - 90),
                ),
              }}
            >
              <div className="text-[11px] font-semibold">
                {hoveredRow.source_term}
                {hoveredRow.match !== "unknown" &&
                  ` → ${hoveredRow.iomete_term}`}
              </div>
              <p className="mt-1 text-[10px] leading-4 text-[#d4e0e4] sm:text-[11px]">
                {hoveredRow.note}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col items-center justify-center rounded-2xl border border-[#dce8e9] bg-white p-4 sm:p-5">
        <div className="self-start">
          <div className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[#82949b]">
            Match breakdown
          </div>
          <h3 className="mt-1 text-[16px] font-semibold tracking-[-0.025em] text-[#16394d]">
            Confidence at a glance
          </h3>
        </div>
        <MatchDonut counts={counts} total={rows.length} />
        <p className="mt-1 text-center text-[12px] font-semibold text-[#29495a]">
          {documentedCount} of {rows.length} rows backed by IOMETE docs
        </p>
        <p className="mt-1 text-center text-[10px] leading-4 text-[#82949b]">
          Documented matches are separated from our judgment.
        </p>
      </div>
    </section>
  );
}

function BridgeLegend({ match }: { match: Exclude<MappingMatch, "unknown"> }) {
  const dashArray =
    match === "partial" ? "5 3" : match === "different" ? "1.5 3" : undefined;
  return (
    <span className="inline-flex items-center gap-1">
      <svg aria-hidden="true" height="8" viewBox="0 0 24 8" width="24">
        <path
          d="M1 4h22"
          fill="none"
          stroke={
            match === "direct"
              ? "#169b76"
              : match === "partial"
                ? "#dfa53c"
                : "#528bb8"
          }
          strokeDasharray={dashArray}
          strokeLinecap={match === "different" ? "round" : "butt"}
          strokeWidth="2"
        />
      </svg>
      {matchLabels[match]}
    </span>
  );
}

function MatchDonut({
  counts,
  total,
}: {
  counts: Record<MappingMatch, number>;
  total: number;
}) {
  const radius = 43;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  return (
    <div className="relative mt-3 h-[170px] w-[170px]">
      <svg
        aria-label={`Match breakdown: ${matchOrder
          .map((match) => `${counts[match]} ${matchLabels[match].toLowerCase()}`)
          .join(", ")}`}
        className="h-full w-full -rotate-90"
        role="img"
        viewBox="0 0 100 100"
      >
        <circle
          cx="50"
          cy="50"
          fill="none"
          r={radius}
          stroke="#edf1f2"
          strokeWidth="12"
        />
        {total > 0 &&
          matchOrder.map((match) => {
            const length = (counts[match] / total) * circumference;
            const dashOffset = offset;
            offset += length;
            return counts[match] > 0 ? (
              <circle
                cx="50"
                cy="50"
                fill="none"
                key={match}
                r={radius}
                stroke={matchColor[match]}
                strokeDasharray={`${length} ${circumference - length}`}
                strokeDashoffset={-dashOffset}
                strokeWidth="12"
              />
            ) : null;
          })}
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[30px] font-semibold leading-none tracking-[-0.06em] text-[#16394d]">
          {total}
        </span>
        <span className="mt-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#82949b]">
          selected
        </span>
      </div>
    </div>
  );
}

const matchColor: Record<MappingMatch, string> = {
  direct: "#169b76",
  partial: "#dfa53c",
  different: "#528bb8",
  unknown: "#94a3aa",
};

const badgeStyles: Record<MappingMatch, string> = {
  direct: "border-[#b8e3d3] bg-[#effaf5] text-[#15815e]",
  partial: "border-[#f0d8a8] bg-[#fff8ea] text-[#a57416]",
  different: "border-[#c4daec] bg-[#f1f7fc] text-[#3d779f]",
  unknown: "border-dashed border-[#c5ced2] bg-[#f7f9fa] text-[#687981]",
};

function ResultRow({
  onSelect,
  row,
}: {
  onSelect: () => void;
  row: MappingRow;
}) {
  return (
    <div
      className="grid cursor-pointer gap-3 px-4 py-4 transition-colors hover:bg-[#f2f9f8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#168f88] xl:grid-cols-[1fr_1.2fr_100px_105px_1.5fr] xl:items-start xl:gap-3"
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
      role="row"
      tabIndex={0}
    >
      <div role="cell">
        <div className="mb-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-[#94a3a9] xl:hidden">
          Your term
        </div>
        <div className="text-[13px] font-semibold leading-5 text-[#274555]">
          {row.source_term}
        </div>
      </div>
      <div role="cell">
        <div className="mb-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-[#94a3a9] xl:hidden">
          IOMETE equivalent
        </div>
        <div className="text-[13px] leading-5 text-[#526c78]">
          {row.iomete_term}
        </div>
      </div>
      <div role="cell">
        <div className="mb-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-[#94a3a9] xl:hidden">
          Match
        </div>
        <span
          className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold ${badgeStyles[row.match]}`}
        >
          {matchLabels[row.match]}
        </span>
      </div>
      <div role="cell">
        <div className="mb-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-[#94a3a9] xl:hidden">
          Basis
        </div>
        <span
          className={`inline-flex rounded-md px-2 py-1 text-[10px] font-medium ${
            row.basis === "documented"
              ? "bg-[#edf7f6] text-[#287d77]"
              : "bg-[#f2f4f6] text-[#71818a]"
          }`}
        >
          {row.basis === "documented" ? "Documented" : "Our judgment"}
        </span>
      </div>
      <div role="cell">
        <div className="mb-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-[#94a3a9] xl:hidden">
          Ask IOMETE
        </div>
        <div className="text-[12px] leading-[1.55] text-[#657b84]">
          {row.ask_iomete}
        </div>
      </div>
    </div>
  );
}

const matchDefinitions: Record<MappingMatch, string> = {
  direct:
    "IOMETE publicly documents this concept as a close match. Confirm the exact setup and scope for your deployment.",
  partial:
    "The concepts overlap, but behavior or operating details differ. Plan to validate requirements and migration work.",
  different:
    "These are not equivalent features. The IOMETE concept may address a related need, but should not be treated as a replacement.",
  unknown:
    "No equivalent is established from the available public documentation. Treat this as an open question, not a feature claim.",
};

function MappingDrawer({
  onClose,
  role,
  row,
}: {
  onClose: () => void;
  role: BuyerRole;
  row: MappingRow;
}) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [copyStatus, setCopyStatus] = useState("");
  const platformLabel =
    platforms.find((platform) => platform.id === row.source_platform)?.label ??
    "Source platform";
  const roleLabels: Record<BuyerRole, string> = {
    engineer: "Engineer",
    cfo: "CFO",
    security: "Security Lead",
  };
  const roleNote =
    role === "cfo"
      ? row.note_cfo
      : role === "security"
        ? row.note_security
        : undefined;
  const displayedNote = roleNote || row.note;

  useEffect(() => {
    closeButtonRef.current?.focus();
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  async function copyQuestion() {
    try {
      await navigator.clipboard.writeText(row.ask_iomete);
      setCopyStatus("Question copied");
    } catch {
      setCopyStatus("Clipboard unavailable. Select and copy the question manually.");
    }
  }

  return (
    <div className="fixed inset-0 z-50">
      <button
        aria-label="Close mapping details"
        className="absolute inset-0 h-full w-full cursor-default bg-[#092131]/45 backdrop-blur-[1px]"
        onClick={onClose}
        type="button"
      />
      <aside
        aria-labelledby="mapping-drawer-title"
        aria-modal="true"
        className="absolute inset-y-0 right-0 flex w-full max-w-[500px] flex-col border-l border-[#dce7e9] bg-[#f7fafa] shadow-2xl"
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#e1eaeb] bg-white px-5 py-5 sm:px-7">
          <div className="min-w-0">
            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#148881]">
              Mapping details · {roleLabels[role]}
            </div>
            <h2
              className="mt-1 text-[21px] font-semibold leading-7 tracking-[-0.035em] text-[#14364a]"
              id="mapping-drawer-title"
            >
              {row.source_term}
            </h2>
            {row.match !== "unknown" && (
              <p className="mt-1 text-sm text-[#70858d]">
                Maps to {row.iomete_term}
              </p>
            )}
          </div>
          <button
            aria-label="Close mapping details"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#dfe8e9] bg-white text-[#637982] hover:bg-[#f1f7f7]"
            onClick={onClose}
            ref={closeButtonRef}
            type="button"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-7">
          <div className="rounded-2xl border border-[#dfe9ea] bg-white p-4">
            <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#83949b]">
              Match level
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span
                className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${badgeStyles[row.match]}`}
              >
                {matchLabels[row.match]}
              </span>
              <span className="rounded-md bg-[#f2f5f6] px-2 py-1 text-[10px] text-[#71828a]">
                {row.basis === "documented" ? "Documented" : "Our judgment"}
              </span>
            </div>
            <p className="mt-3 text-[13px] leading-5 text-[#526c78]">
              {matchDefinitions[row.match]}
            </p>
            {row.match === "unknown" && (
              <p className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-[12px] font-medium leading-5 text-rose-800">
                We could not find this in public docs. This is a question for the
                call.
              </p>
            )}
          </div>

          <section className="mt-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-[13px] font-semibold text-[#29495a]">
                {role === "engineer" ? "Mapping note" : `${roleLabels[role]} perspective`}
              </h3>
              {role !== "engineer" && (
                <span className="rounded-full bg-[#eaf4f3] px-2.5 py-1 text-[9px] font-medium text-[#54827f]">
                  Pre-written, reviewed wording
                </span>
              )}
            </div>
            <p className="mt-2 rounded-xl border border-[#e1eaeb] bg-white p-4 text-[13px] leading-[1.65] text-[#526c78]">
              {displayedNote}
            </p>
          </section>

          <section className="mt-5">
            <h3 className="text-[13px] font-semibold text-[#29495a]">
              Documentation
            </h3>
            <div className="mt-2 space-y-2">
              <DocumentationLink
                label="IOMETE documentation"
                url={row.iomete_doc_url}
                verified={row.url_verified}
              />
              <DocumentationLink
                label={`${platformLabel} documentation`}
                url={row.source_doc_url}
                verified={row.url_verified}
              />
            </div>
          </section>

          <section className="mt-5 rounded-2xl border border-[#cfe4e2] bg-[#eff8f7] p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-[13px] font-semibold text-[#244b58]">
                Ask IOMETE
              </h3>
              <button
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#c9dfdd] bg-white px-2.5 py-1.5 text-[10px] font-semibold text-[#287a75] hover:bg-[#f8fcfb]"
                onClick={() => void copyQuestion()}
                type="button"
              >
                <CopyIcon />
                Copy
              </button>
            </div>
            <p className="mt-2 text-[13px] leading-5 text-[#435f6a]">
              {row.ask_iomete}
            </p>
            {copyStatus && (
              <p aria-live="polite" className="mt-2 text-[10px] text-[#4c7777]">
                {copyStatus}
              </p>
            )}
          </section>
        </div>
      </aside>
    </div>
  );
}

function DocumentationLink({
  label,
  url,
  verified,
}: {
  label: string;
  url: string;
  verified: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-[#e1eaeb] bg-white px-3.5 py-3">
      <span className="text-[12px] font-medium text-[#49636f]">{label}</span>
      {verified && url !== "TODO_VERIFY" ? (
        <a
          className="text-[11px] font-semibold text-[#148780] hover:underline"
          href={url}
          rel="noreferrer"
          target="_blank"
        >
          Open link
        </a>
      ) : (
        <span className="shrink-0 text-[10px] font-medium text-[#9a6c45]">
          Link not yet verified
        </span>
      )}
    </div>
  );
}

type ExportTab = "buyer" | "rep";

function CoverageReport({
  demoHighlight = false,
  onBack,
}: {
  demoHighlight?: boolean;
  onBack: () => void;
}) {
  const total = mappingRows.length;
  const matchCounts = mappingRows.reduce(
    (counts, row) => {
      counts[row.match] += 1;
      return counts;
    },
    { direct: 0, partial: 0, different: 0, unknown: 0 },
  );
  const basisCounts = mappingRows.reduce(
    (counts, row) => {
      counts[row.basis] += 1;
      return counts;
    },
    { documented: 0, judgment: 0 },
  );
  const verifiedCount = mappingRows.filter((row) => row.url_verified).length;

  return (
    <section
      aria-labelledby="coverage-title"
      className={`mt-8 rounded-2xl border border-[#dce8e9] bg-white p-5 shadow-sm sm:p-8 ${
        demoHighlight ? "demo-highlight" : ""
      }`}
      data-demo="coverage-report"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            aria-label="Back to stack builder"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#dfe8eb] bg-white text-[#53717d] transition hover:border-[#9ecdc8] hover:text-[#138d86]"
            onClick={onBack}
            type="button"
          >
            <BackIcon />
          </button>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[#168780]">
              Dataset transparency
            </div>
            <h2
              className="mt-0.5 text-[22px] font-semibold tracking-[-0.035em] text-[#14364a]"
              id="coverage-title"
            >
              Coverage report
            </h2>
          </div>
        </div>
        <span className="rounded-full bg-[#eef6f5] px-3 py-1.5 text-[11px] font-semibold text-[#347a77]">
          Mock-up data · {platforms.length} platforms
        </span>
      </div>
      <p className="mt-4 max-w-[700px] text-[13px] leading-5 text-[#6b8088]">
        A transparent view of the current comparison set. Unknown means we
        deliberately leave an equivalence unclaimed when public documentation
        does not establish one.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <CoverageStat label="Total mapping rows" value={total} />
        <CoverageStat
          label="Documented rows"
          value={basisCounts.documented}
          detail={`of ${total} rows`}
        />
        <CoverageStat
          label="Our judgment"
          value={basisCounts.judgment}
          detail={`of ${total} rows`}
        />
        <CoverageStat
          label="Rows with verified links"
          value={verifiedCount}
          detail={`of ${total} rows`}
        />
      </div>

      <section className="mt-7">
        <h3 className="text-sm font-semibold text-[#29495a]">
          Match types across all platforms
        </h3>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {matchOrder.map((match) => (
            <div
              className="flex items-center justify-between rounded-xl border border-[#e4ebec] bg-[#fbfcfc] px-3.5 py-3"
              key={match}
            >
              <span className="flex items-center gap-2 text-xs text-[#647b84]">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${dotStyles[match]}`}
                />
                {matchLabels[match]}
              </span>
              <span className="text-sm font-semibold tabular-nums text-[#29495a]">
                {matchCounts[match]}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-7">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-[#29495a]">
              Unknown rate by platform
            </h3>
            <p className="mt-1 text-[11px] text-[#82949b]">
              Unknown rows ÷ all mapped rows for that platform
            </p>
          </div>
          <span className="text-[10px] text-[#82949b]">
            {matchCounts.unknown} unknown of {total} total
          </span>
        </div>
        <div className="mt-4 space-y-4">
          {platforms.map((platform) => {
            const rows = mappingRows.filter(
              (row) => row.source_platform === platform.id,
            );
            const unknownCount = rows.filter(
              (row) => row.match === "unknown",
            ).length;
            const rate = rows.length > 0 ? (unknownCount / rows.length) * 100 : 0;
            return (
              <div
                className="grid grid-cols-[112px_minmax(0,1fr)_70px] items-center gap-3 sm:grid-cols-[170px_minmax(0,1fr)_90px]"
                key={platform.id}
              >
                <span className="truncate text-[11px] font-medium text-[#526c78] sm:text-xs">
                  {platform.label}
                </span>
                <div
                  aria-label={`${platform.label}: ${unknownCount} unknown of ${rows.length} rows, ${rate.toFixed(1)} percent`}
                  className="h-3 overflow-hidden rounded-full bg-[#edf1f2]"
                  role="img"
                >
                  <div
                    className="h-full rounded-full bg-[#98a7ad] transition-[width]"
                    style={{ width: `${rate}%` }}
                  />
                </div>
                <span className="text-right text-[11px] font-semibold tabular-nums text-[#526c78]">
                  {rate.toFixed(0)}%{" "}
                  <span className="font-normal text-[#8b9aa0]">
                    ({unknownCount}/{rows.length})
                  </span>
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <div className="mt-7 rounded-xl border border-[#cfe0e3] bg-[#f3f8f9] p-4 text-[11px] leading-5 text-[#607680]">
        <span className="font-semibold text-[#3d606d]">Data note:</span> all
        source and IOMETE URLs currently use placeholders and are unverified.
        No live product documentation, prices or performance claims are
        included in these counts.
      </div>
    </section>
  );
}

function CoverageStat({
  detail,
  label,
  value,
}: {
  detail?: string;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-[#e3ebec] bg-[#fbfcfc] px-4 py-3">
      <div className="text-[10px] font-medium leading-4 text-[#82949b]">
        {label}
      </div>
      <div className="mt-1 text-[24px] font-semibold leading-7 tracking-[-0.05em] text-[#173c50]">
        {value}
      </div>
      {detail && (
        <div className="mt-0.5 text-[10px] text-[#94a1a6]">{detail}</div>
      )}
    </div>
  );
}

function ExportScreen({
  counts,
  demoHighlight = false,
  onClose,
  platform,
  role,
  rows,
}: {
  counts: Record<MappingMatch, number>;
  demoHighlight?: boolean;
  onClose: () => void;
  platform: PlatformOption;
  role: BuyerRole;
  rows: MappingRow[];
}) {
  const [activeTab, setActiveTab] = useState<ExportTab>("buyer");
  const [copyStatus, setCopyStatus] = useState("");
  const questions = rows.map((row) => row.ask_iomete);
  const highlightedRows = rows.slice(0, 5);
  const roleNote = (row: MappingRow) =>
    role === "cfo"
      ? row.note_cfo || row.note
      : role === "security"
        ? row.note_security || row.note
        : row.note;
  const summary =
    `${rows.length} selected ${rows.length === 1 ? "mapping" : "mappings"}: ` +
    `${counts.direct} direct, ${counts.partial} partial, ` +
    `${counts.different} different, and ${counts.unknown} unknown.`;
  const objections = rows.filter(
    (row) => row.match === "partial" || row.match === "different",
  );
  const gaps = rows.filter((row) => row.match === "unknown");
  const documentedCount = rows.filter(
    (row) => row.basis === "documented",
  ).length;

  async function copyMarkdown() {
    try {
      await navigator.clipboard.writeText(
        createExportMarkdown({
          activeTab,
          counts,
          documentedCount,
          gaps,
          objections,
          platform,
          questions,
          role,
          roleNote,
          rows,
          summary,
        }),
      );
      setCopyStatus("Markdown copied to clipboard.");
    } catch {
      setCopyStatus(
        "Clipboard unavailable. Use Download as PDF or copy the text manually.",
      );
    }
  }

  return (
    <section
      aria-labelledby="export-screen-title"
      className={`mt-8 ${demoHighlight ? "demo-highlight" : ""}`}
      data-demo="export-screen"
    >
      <div className="no-print mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            aria-label="Back to selected stack"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#dfe8eb] bg-white text-[#53717d] transition hover:border-[#9ecdc8] hover:text-[#138d86]"
            onClick={onClose}
            type="button"
          >
            <BackIcon />
          </button>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[#168780]">
              Export your stack
            </div>
            <h2
              className="mt-0.5 text-[21px] font-semibold text-[#14364a]"
              id="export-screen-title"
            >
              Your IOMETE briefing
            </h2>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            className="inline-flex items-center gap-2 rounded-lg border border-[#dbe5e7] bg-white px-3 py-2 text-xs font-semibold text-[#526d79] hover:bg-[#f7fafa]"
            onClick={() => window.print()}
            type="button"
          >
            <PrintIcon />
            Download as PDF
          </button>
          <button
            className="inline-flex items-center gap-2 rounded-lg bg-[#087e80] px-3 py-2 text-xs font-semibold text-white hover:bg-[#076d70]"
            onClick={() => void copyMarkdown()}
            type="button"
          >
            <CopyIcon />
            Copy as Markdown
          </button>
        </div>
      </div>

      <div
        aria-label="Export formats"
        className="no-print mb-4 flex gap-1 border-b border-[#dfe9ea]"
        role="tablist"
      >
        <button
          aria-controls="buyer-export-panel"
          aria-selected={activeTab === "buyer"}
          className={`border-b-2 px-4 py-3 text-xs font-semibold transition ${
            activeTab === "buyer"
              ? "border-[#0d8784] text-[#137c7b]"
              : "border-transparent text-[#809198] hover:text-[#3e606d]"
          }`}
          id="buyer-export-tab"
          onClick={() => {
            setActiveTab("buyer");
            setCopyStatus("");
          }}
          role="tab"
          type="button"
        >
          Buyer one-pager
        </button>
        <button
          aria-controls="rep-export-panel"
          aria-selected={activeTab === "rep"}
          className={`border-b-2 px-4 py-3 text-xs font-semibold transition ${
            activeTab === "rep"
              ? "border-[#0d8784] text-[#137c7b]"
              : "border-transparent text-[#809198] hover:text-[#3e606d]"
          }`}
          id="rep-export-tab"
          onClick={() => {
            setActiveTab("rep");
            setCopyStatus("");
          }}
          role="tab"
          type="button"
        >
          Rep call prep
        </button>
      </div>

      {copyStatus && (
        <p
          aria-live="polite"
          className="no-print mb-3 rounded-lg bg-[#eaf6f3] px-3 py-2 text-xs text-[#28736b]"
        >
          {copyStatus}
        </p>
      )}

      <div
        aria-labelledby={
          activeTab === "buyer" ? "buyer-export-tab" : "rep-export-tab"
        }
        className="print-sheet rounded-2xl border border-[#dce8e9] bg-white p-5 shadow-sm sm:p-8"
        id={activeTab === "buyer" ? "buyer-export-panel" : "rep-export-panel"}
        role="tabpanel"
      >
        <div className="print-content">
          <div className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[#168780]">
            IOMETE · Translate My Stack
          </div>
          <h2 className="mt-1 text-2xl font-semibold text-[#14364a]">
            {activeTab === "buyer"
              ? `${platform.label} buyer one-pager`
              : `${platform.label} rep call prep`}
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#526c78]">{summary}</p>
          <div className="my-4 flex flex-wrap gap-2">
            {matchOrder.map((match) => (
              <span
                className="rounded-lg bg-[#f2f6f7] px-3 py-2 text-xs font-medium text-[#48616c]"
                key={match}
              >
                <strong>{counts[match]}</strong> {matchLabels[match].toLowerCase()}
              </span>
            ))}
          </div>

          {activeTab === "buyer" ? (
            <BuyerExport
              highlightedRows={highlightedRows}
              questions={questions}
              roleNote={roleNote}
              rows={rows}
            />
          ) : (
            <RepExport
              gaps={gaps}
              objections={objections}
              questions={questions}
              roleNote={roleNote}
              rows={rows}
            />
          )}

          <SourcesAndHonesty
            documentedCount={documentedCount}
            platform={platform}
            rows={rows}
          />
        </div>
      </div>
    </section>
  );
}

function BuyerExport({
  highlightedRows,
  questions,
  roleNote,
  rows,
}: {
  highlightedRows: MappingRow[];
  questions: string[];
  roleNote: (row: MappingRow) => string;
  rows: MappingRow[];
}) {
  return (
    <>
      <section className="export-section">
        <h3 className="export-heading">What this means for you</h3>
        <ol className="mt-2 list-decimal space-y-2 pl-5 text-[13px] leading-5 text-[#526c78]">
          {highlightedRows.map((row) => (
            <li key={row.id}>
              <span className="font-semibold text-[#29495a]">
                {row.source_term}:
              </span>{" "}
              {roleNote(row)}
            </li>
          ))}
        </ol>
      </section>
      <section className="export-section">
        <h3 className="export-heading">Your mappings</h3>
        <ExportMappingTable rows={rows} />
      </section>
      <section className="export-section">
        <h3 className="export-heading">Questions to take to IOMETE</h3>
        <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-[13px] leading-5 text-[#526c78]">
          {questions.map((question, index) => (
            <li key={`${index}-${question}`}>{question}</li>
          ))}
        </ol>
      </section>
    </>
  );
}

function RepExport({
  gaps,
  objections,
  questions,
  roleNote,
  rows,
}: {
  gaps: MappingRow[];
  objections: MappingRow[];
  questions: string[];
  roleNote: (row: MappingRow) => string;
  rows: MappingRow[];
}) {
  const talkTrack = [
    `Start with the buyer’s ${rows.length} selected tools and confirm which are most important to their workloads.`,
    "Separate documented concepts from judgment-based comparisons; avoid implying feature or performance parity.",
    "Use the open questions to agree on a focused technical validation and follow-up.",
  ];

  return (
    <>
      <section className="export-section">
        <h3 className="export-heading">Likely objections</h3>
        {objections.length > 0 ? (
          <ul className="mt-2 space-y-2">
            {objections.map((row) => (
              <li
                className="rounded-xl border border-[#e6ecec] bg-[#fbfcfc] p-3"
                key={row.id}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[13px] font-semibold text-[#29495a]">
                    {row.source_term}
                  </span>
                  <span className={`rounded-full border px-2 py-0.5 text-[9px] font-semibold ${badgeStyles[row.match]}`}>
                    {matchLabels[row.match]}
                  </span>
                </div>
                <p className="mt-1 text-[12px] leading-5 text-[#627780]">
                  {roleNote(row)}
                </p>
                <p className="mt-1 text-[11px] leading-5 text-[#426b78]">
                  Ask: {row.ask_iomete}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-[13px] leading-5 text-[#647b84]">
            No partial or different mappings are selected.
          </p>
        )}
      </section>
      <section className="export-section">
        <h3 className="export-heading">Gaps to prepare for</h3>
        {gaps.length > 0 ? (
          <ul className="mt-2 space-y-2">
            {gaps.map((row) => (
              <li
                className="rounded-xl border border-dashed border-[#d9c8c0] bg-[#fffaf7] p-3"
                key={row.id}
              >
                <div className="text-[13px] font-semibold text-[#29495a]">
                  {row.source_term} · No documented equivalent
                </div>
                <p className="mt-1 text-[12px] leading-5 text-[#627780]">
                  {roleNote(row)}
                </p>
                <p className="mt-1 text-[11px] leading-5 text-[#426b78]">
                  Question for the call: {row.ask_iomete}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-[13px] leading-5 text-[#647b84]">
            No unknown mappings are selected.
          </p>
        )}
      </section>
      <section className="export-section">
        <h3 className="export-heading">Talk track</h3>
        <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-[13px] leading-5 text-[#526c78]">
          {talkTrack.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ol>
      </section>
      <section className="export-section">
        <h3 className="export-heading">Questions to take to IOMETE</h3>
        <ul className="mt-2 list-disc space-y-1.5 pl-5 text-[13px] leading-5 text-[#526c78]">
          {questions.map((question, index) => (
            <li key={`${index}-${question}`}>{question}</li>
          ))}
        </ul>
      </section>
      <section className="export-section">
        <h3 className="export-heading">Mapping reference</h3>
        <ExportMappingTable rows={rows} />
      </section>
    </>
  );
}

function ExportMappingTable({ rows }: { rows: MappingRow[] }) {
  return (
    <div className="mt-2 overflow-hidden rounded-xl border border-[#e4ebec]">
      <table className="w-full border-collapse text-left text-[11px]">
        <thead className="bg-[#f5f8f8] text-[9px] uppercase tracking-[0.08em] text-[#738890]">
          <tr>
            <th className="px-2.5 py-2 font-semibold sm:px-3">Your term</th>
            <th className="px-2.5 py-2 font-semibold sm:px-3">
              IOMETE equivalent
            </th>
            <th className="px-2.5 py-2 font-semibold sm:px-3">Match / basis</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#edf1f2]">
          {rows.map((row) => (
            <tr className="align-top" key={row.id}>
              <td className="px-2.5 py-2.5 font-semibold text-[#29495a] sm:px-3">
                {row.source_term}
              </td>
              <td className="px-2.5 py-2.5 text-[#526c78] sm:px-3">
                {row.iomete_term}
              </td>
              <td className="px-2.5 py-2.5 text-[#647b84] sm:px-3">
                {matchLabels[row.match]} ·{" "}
                {row.basis === "documented" ? "Documented" : "Our judgment"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SourcesAndHonesty({
  documentedCount,
  platform,
  rows,
}: {
  documentedCount: number;
  platform: PlatformOption;
  rows: MappingRow[];
}) {
  return (
    <section className="export-section rounded-xl border border-[#cfe0e3] bg-[#f3f8f9] p-4">
      <h3 className="text-[12px] font-semibold text-[#29495a]">
        Sources and honesty
      </h3>
      <p className="mt-1.5 text-[11px] leading-5 text-[#607680]">
        {documentedCount} of {rows.length} rows are marked documented. Source
        and IOMETE documentation links for {platform.label} have not yet been
        verified in this guide. Mappings marked ‘Our judgment’ are our
        interpretation. Prices and performance were not compared.
      </p>
      {rows.some((row) => row.match === "unknown") && (
        <p className="mt-1 text-[11px] leading-5 text-[#607680]">
          Unknown means an equivalent was not established from the available
          public documentation; confirm open items directly with IOMETE.
        </p>
      )}
    </section>
  );
}

function createExportMarkdown({
  activeTab,
  counts,
  documentedCount,
  gaps,
  objections,
  platform,
  questions,
  role,
  roleNote,
  rows,
  summary,
}: {
  activeTab: ExportTab;
  counts: Record<MappingMatch, number>;
  documentedCount: number;
  gaps: MappingRow[];
  objections: MappingRow[];
  platform: PlatformOption;
  questions: string[];
  role: BuyerRole;
  roleNote: (row: MappingRow) => string;
  rows: MappingRow[];
  summary: string;
}) {
  const heading =
    activeTab === "buyer"
      ? `${platform.label} buyer one-pager`
      : `${platform.label} rep call prep`;
  const lines = [
    `# ${heading}`,
    "",
    summary,
    "",
    `Direct: ${counts.direct} · Partial: ${counts.partial} · Different: ${counts.different} · Unknown: ${counts.unknown}`,
  ];

  if (activeTab === "buyer") {
    lines.push("", "## What this means for you");
    rows.slice(0, 5).forEach((row) =>
      lines.push(`- **${row.source_term}:** ${roleNote(row)}`),
    );
    lines.push("", "## Mappings");
  } else {
    lines.push("", "## Likely objections");
    if (objections.length === 0) lines.push("- No partial or different mappings are selected.");
    objections.forEach((row) =>
      lines.push(
        `- **${row.source_term} — ${matchLabels[row.match]}:** ${roleNote(row)}`,
        `  - Ask: ${row.ask_iomete}`,
      ),
    );
    lines.push("", "## Gaps to prepare for");
    if (gaps.length === 0) lines.push("- No unknown mappings are selected.");
    gaps.forEach((row) =>
      lines.push(
        `- **${row.source_term}:** ${roleNote(row)}`,
        `  - Question for the call: ${row.ask_iomete}`,
      ),
    );
    lines.push(
      "",
      "## Talk track",
      `- Start with the buyer’s ${rows.length} selected tools and confirm which are most important to their workloads.`,
      "- Separate documented concepts from judgment-based comparisons; avoid implying feature or performance parity.",
      "- Use the open questions to agree on a focused technical validation and follow-up.",
      "",
      "## Mappings",
    );
  }

  lines.push(
    "| Your term | IOMETE equivalent | Match | Basis |",
    "| --- | --- | --- | --- |",
  );
  rows.forEach((row) =>
    lines.push(
      `| ${row.source_term} | ${row.iomete_term} | ${matchLabels[row.match]} | ${row.basis === "documented" ? "Documented" : "Our judgment"} |`,
    ),
  );
  lines.push("", "## Questions to take to IOMETE");
  questions.forEach((question) => lines.push(`- ${question}`));
  lines.push(
    "",
    "## Sources and honesty",
    `${documentedCount} of ${rows.length} rows are marked documented. Source and IOMETE documentation links for ${platform.label} have not yet been verified in this guide.`,
    "Mappings marked 'Our judgment' are our interpretation. Prices and performance were not compared.",
    "Unknown means an equivalent was not established from the available public documentation; confirm open items directly with IOMETE.",
    `Perspective: ${role === "security" ? "Security Lead" : role === "cfo" ? "CFO" : "Engineer"}.`,
  );
  return lines.join("\n");
}

function ArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="16"
      viewBox="0 0 16 16"
      width="16"
    >
      <path
        d="M3 8h9m-3.5-3.5L12 8l-3.5 3.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.4"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="17"
      viewBox="0 0 16 16"
      width="17"
    >
      <path
        d="m4 4 8 8m0-8-8 8"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="14"
      viewBox="0 0 16 16"
      width="14"
    >
      <rect
        height="9.5"
        rx="1.5"
        stroke="currentColor"
        width="7.5"
        x="5.5"
        y="5"
      />
      <path
        d="M10.5 3.5v-.25A1.25 1.25 0 0 0 9.25 2h-5A1.25 1.25 0 0 0 3 3.25v6A1.25 1.25 0 0 0 4.25 10.5h.25"
        stroke="currentColor"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PrintIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="14"
      viewBox="0 0 16 16"
      width="14"
    >
      <path
        d="M4.5 5V2.5h7V5m-7 6.5h-2A1.5 1.5 0 0 1 1 10V7a1.5 1.5 0 0 1 1.5-1.5h11A1.5 1.5 0 0 1 15 7v3a1.5 1.5 0 0 1-1.5 1.5h-2m-7-2h7v4h-7v-4Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.25"
      />
      <path
        d="M12.25 7.75h.01"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="17"
      viewBox="0 0 16 16"
      width="17"
    >
      <path
        d="M13 8H4m3.5-3.5L4 8l3.5 3.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.4"
      />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="18"
      viewBox="0 0 18 18"
      width="18"
    >
      <path
        d="m9 1.8 1.75 4.45L15.2 8l-4.45 1.75L9 14.2l-1.75-4.45L2.8 8l4.45-1.75L9 1.8Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.4"
      />
      <path
        d="m14.1 12.6.7 1.75 1.7.65-1.7.7-.7 1.7-.65-1.7-1.75-.7 1.75-.65.65-1.75Z"
        fill="currentColor"
      />
    </svg>
  );
}

function CheckListIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="21"
      viewBox="0 0 21 21"
      width="21"
    >
      <path
        d="m3.5 5.5 1.4 1.4 2.4-2.4m-3.8 7 1.4 1.4 2.4-2.4m-3.8 7 1.4 1.4 2.4-2.4M10 5.5h7m-7 6h7m-7 6h7"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export default App;
