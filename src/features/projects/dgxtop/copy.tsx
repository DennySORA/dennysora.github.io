import type { ReactNode } from 'react';
import type { ProjectEdition } from '../../../lib/project-pages.ts';

// Every claim here comes from the dgxtop repository: spec/dgxtop-v2, the
// README, docs/process/v2-rewrite and docs/validation (checked 2026-10-11).

export const sectionIds = [
  'why',
  'screens',
  'architecture',
  'isolation',
  'arbitration',
  'history',
  'actions',
  'budget',
  'boundaries',
  'tradeoffs',
  'links',
] as const;
export type SectionId = (typeof sectionIds)[number];

export const shotFiles = [
  'dgx-spark-overview.webp',
  'workstation-overview.webp',
  'dgx-spark-gpu.webp',
  'workstation-gpu.webp',
  'dgx-spark-history.webp',
  'workstation-history.webp',
  'dgx-spark-settings.webp',
] as const;
export type ShotFile = (typeof shotFiles)[number];

type Table = { caption?: string; head: string[]; rows: string[][] };
type Diagram = { title: string; text: string };

export type DgxtopCopy = {
  eyebrow: string;
  lead: string;
  facts: { stack: string; platforms: string; status: string };
  sectionsLabel: string;
  openImage: string;
  sections: Record<SectionId, string>;
  shots: Record<ShotFile, { alt: string; caption: string }>;
  why: { intro: string; table: Table; outro: string };
  screens: { intro: string };
  architecture: {
    intro: ReactNode;
    diagram: Diagram & {
      data: string;
      control: string;
      dataNodes: [string, string][];
      controlNodes: [string, string][];
      adapters: string;
    };
    table: Table;
    outro: string;
  };
  isolation: {
    paragraphs: ReactNode[];
    diagram: Diagram & {
      parent: string;
      threads: string[];
      hosts: string;
      fresh: string;
      late: string;
      pipe: string;
      lifecycle: string;
      states: string[];
      quarantine: string;
    };
  };
  arbitration: {
    intro: ReactNode;
    diagram: Diagram & {
      inputs: [string, string][];
      steps: string[];
      outcomes: string;
      selected: string;
      conflict: string;
      missing: string[];
      average: string;
      axes: string;
      axisNames: string[];
    };
    table: Table;
    outro: string;
  };
  history: {
    paragraphs: ReactNode[];
    diagram: Diagram & {
      buckets: string[];
      delta: string;
      bridge: string;
      gap: string;
      legend: string;
    };
  };
  actions: {
    paragraphs: ReactNode[];
    diagram: Diagram & {
      steps: [string, string][];
      outcomes: string[];
      notes: string[];
    };
  };
  budget: {
    intro: string;
    table: Table;
    overload: ReactNode;
    diagram: Diagram & { states: [string, string][] };
  };
  boundaries: {
    paragraphs: ReactNode[];
    diagram: Diagram & {
      root: [string, string];
      crates: [string, string][];
      depends: string;
      core: [string, string];
      check: string;
    };
  };
  tradeoffs: ReactNode[];
  links: { label: string; href: string }[];
};

const repository = 'https://github.com/DennySORA/dgxtop';
const blob = `${repository}/blob/main`;

const code = (text: string) => <code>{text}</code>;

const en: DgxtopCopy = {
  eyebrow: 'Tools · Rust · Ratatui · updated 2026-10-11',
  lead: 'dgxtop watches the CPU, GPUs, memory, disks, network and GPU processes of an NVIDIA DGX Spark, or any Linux host with NVIDIA GPUs, from a terminal. Version 2 is a complete rewrite around one rule: a value it cannot read is never shown as 0. This page explains the architecture behind that rule, and what each choice costs.',
  facts: {
    stack: 'Rust 1.92 · Ratatui · crossterm · NVML · SQLite',
    platforms:
      'Linux x86_64 / aarch64 (glibc) · tested on a DGX Spark (GB10) and on an RTX 5080 + RTX 3060 workstation',
    status: 'v2 on main · first v2 release not tagged yet',
  },
  sectionsLabel: 'Sections',
  openImage: 'Open the full-size image',
  sections: {
    why: 'Why a rewrite',
    screens: 'What it shows',
    architecture: 'Six components, two paths',
    isolation: 'A hung driver stalls one host, not the screen',
    arbitration: 'Explainable sources, never an average',
    history: 'Exact history',
    actions: 'Protected process termination',
    budget: 'Budgets and overload',
    boundaries: 'Boundaries and verification',
    tradeoffs: 'Trade-offs',
    links: 'Read more',
  },
  shots: {
    'dgx-spark-overview.webp': {
      alt: 'dgxtop overview on a DGX Spark: CPU and memory, the GB10 GPU at 92 % utilization with its RAM bar, the disk and network tables, and one Python process holding 69.8 GiB of GPU memory',
      caption:
        'Overview on a DGX Spark. A Python job keeps the GB10 at 92 %; it shares memory with the CPU, so the RAM held by GPU processes is drawn in its own colour inside system memory.',
    },
    'workstation-overview.webp': {
      alt: 'Overview on a workstation with two GPUs, an RTX 5080 and an RTX 3060, listing the processes that hold GPU memory',
      caption:
        'Two GPUs on a workstation. The process table lists only processes that use a GPU, marked C or G as nvidia-smi prints them.',
    },
    'dgx-spark-gpu.webp': {
      alt: 'GPU view of the GB10: state, clocks, unified memory, PCIe, NVLink-C2C, thermal thresholds, power, CUDA, driver, device and topology',
      caption:
        'The GPU view of the GB10, read from NVML and the CUDA toolkit files without running a command. A value the GPU does not report gets no row.',
    },
    'workstation-gpu.webp': {
      alt: 'GPU view of an RTX 5080: clocks, VRAM and BAR1, PCIe Gen5, fans and thresholds, power limits, CUDA, driver, firmware and the P2P path to the second GPU',
      caption:
        'The same view on an RTX 5080: VRAM, PCIe Gen5 x16, fans, power limits and the path to the second GPU. Serial number and UUID are masked.',
    },
    'dgx-spark-history.webp': {
      alt: 'History view of the DGX Spark over one hour: CPU, memory, GPU utilization and memory, temperature, power with energy, disk and network',
      caption:
        'One hour of a GPU job on the DGX Spark: panels in pairs on one time axis, each column a mean coloured by level, with now, average and maximum.',
    },
    'workstation-history.webp': {
      alt: 'History view of the two-GPU workstation with the mean and peak of each GPU over the last 1, 6, 12 and 24 hours',
      caption:
        'Below the axis, each GPU’s last 1, 6, 12 and 24 hours: mean and peak utilization, memory, temperature and power, and the energy drawn.',
    },
    'dgx-spark-settings.webp': {
      alt: 'Settings view listing the saved value, effective value, origin and restart requirement of each setting, beside the display-module toggles',
      caption:
        'Settings shows each value as saved and as in effect, where it came from, and whether it applies live or after a restart.',
    },
  },
  why: {
    intro:
      'Version 1 sampled hardware inside the UI loop, so a slow driver call froze the screen. It kept data, history and UI state in one shared struct, chose the CPU temperature by the names and scan order of thermal zones, and showed values it could not read as 0. The v2 specification lists ten findings like these and gives each a design answer:',
    table: {
      head: ['Finding in v1', 'Answer in v2'],
      rows: [
        [
          'Processes identified by PID alone',
          'A ProcessKey (host, boot, PID namespace, PID, start time), a held pidfd and a two-step confirmation',
        ],
        [
          'Missing values became 0',
          'Read status, sample kind, quality and freshness on separate axes; a missing value is null with a reason',
        ],
        [
          'Unified-memory semantics mixed up',
          'System RAM, GPU framebuffer and per-process allocations kept apart',
        ],
        [
          'Bandwidth estimated from utilization',
          'Measured, derived and estimated values kept apart; no throughput without a byte counter',
        ],
        [
          'Interval and totals assumed, not measured',
          'The effective interval confirmed by the scheduler; real elapsed time and counter deltas',
        ],
        [
          'History windows misaligned',
          'Time buckets that carry the boot, the coverage and the gaps',
        ],
        [
          'One PID on several GPUs counted twice',
          'Host CPU and memory sampled once per ProcessKey, then joined to each GPU',
        ],
        [
          'Installer did not verify downloads',
          'Checksum and archive checks, with the previous binary kept for rollback',
        ],
        [
          'Sampling blocked the UI',
          'Control, sampling and rendering separated; drivers isolated in their own processes',
        ],
        [
          'Builds not reproducible',
          'A committed Cargo.lock, a pinned toolchain and release gates',
        ],
      ],
    },
    outro:
      'The rewrite was specified before it was written: 40 requirements, 15 work packages and 40 acceptance cases. It was then built as an eight-crate Rust workspace against a fixed core contract, roughly 157,000 lines of Rust with 1,373 tests.',
  },
  screens: {
    intro:
      'Four tabs: Overview, GPU, History and Settings. These screenshots come from the two machines it was tested on.',
  },
  architecture: {
    intro: (
      <>
        Every value travels the data path, and every user intent travels the
        control path. The Manager is the only writer: it alone holds the store
        writer and the process-action port, so neither the Viewer nor the
        Controller can change data or send a signal.
      </>
    ),
    diagram: {
      title: 'Architecture: six components, two paths',
      text: 'Solid accents mark the data path, dashed ones the control path. The Viewer never reads the store; it draws the view model the Manager publishes.',
      data: 'data path',
      control: 'control path',
      adapters: 'one process each',
      dataNodes: [
        ['Linux + NVIDIA driver', '/proc · sysfs · NVML'],
        ['Adapter hosts', ''],
        ['Collector', 'normalize · de-duplicate · arbitrate · rates'],
        ['Manager', 'the only writer'],
        ['Store', 'snapshots · history · config · audit'],
        ['Manager', 'projection'],
        ['Viewer', 'immutable view model · Ratatui'],
      ],
      controlNodes: [
        ['Controller', 'keys · mouse · CLI → typed command'],
        ['Manager', 'validate · authorize'],
        ['config · scheduler · action adapter', 'pidfd for signals'],
        ['audit + result', 'durable before any signal'],
        ['Store → Viewer', 'the outcome is shown'],
      ],
    },
    table: {
      head: ['Component', 'Its one job', 'Must not'],
      rows: [
        [
          'Adapter',
          'Talk to one driver or kernel interface; return native values with their source, timing and errors',
          'Pick an authoritative value, average sources, write the store, render',
        ],
        [
          'Collector',
          'Normalize units, de-duplicate proven aliases, arbitrate, derive rates',
          'Call driver internals, run SQL, change settings, send signals',
        ],
        [
          'Manager',
          'Schedule sampling, own policy and configuration, authorize commands, commit data, project view models',
          'Lay out the screen, or wait on a blocking driver call',
        ],
        [
          'Store',
          'Keep snapshots, history, configuration and the audit log',
          'Choose sensors, run commands',
        ],
        [
          'Viewer',
          'Lay out display modules and draw immutable view models',
          'Sample, read or write the store, compute rates, authorize anything',
        ],
        [
          'Controller',
          'Turn keys, clicks and flags into typed commands with stable IDs',
          'Decide sources, send signals, draw',
        ],
      ],
    },
    outro:
      'Ten display modules register at compile time and receive only their view model and their area of the screen. A module that panics is isolated as a module error instead of taking sampling down with it.',
  },
  isolation: {
    paragraphs: [
      <>
        A timeout says a result is late. It does not cancel the call: a thread
        stuck inside a vendor library cannot be stopped safely. So every live
        adapter runs in its own resident child process, the same binary started
        as an adapter host, and talks to the parent over anonymous pipes in
        length-prefixed JSON frames of at most 1 MiB.
      </>,
      <>
        A host that misses its deadline turns degraded. After three failures a
        circuit breaker opens and retries back off 1, 2, 4 … 60 seconds. A host
        is replaced only after it has been reaped; one that cannot be reaped is
        quarantined, and there are never more than eight.
      </>,
      <>
        The parent runs a fixed set of threads and no async runtime: nothing
        here does network I/O, and {code('spawn_blocking')} would only hide the
        same uncancellable call behind a future. One 256 MiB budget covers all
        managed data, and every queue has a byte limit as well as an item limit,
        because a bounded channel counts messages, not bytes.
      </>,
    ],
    diagram: {
      title: 'Runtime: one parent, resident hosts',
      text: 'Here the NVML host has timed out. CPU, memory and the screen keep updating from the other hosts.',
      parent: 'dgxtop parent process',
      threads: [
        'terminal · input and render, at most 4 fps',
        'Manager · 2 ms control slices',
        'supervisor · pipes and reaping',
        'collector workers × 2',
        'hot store · single writer',
        'history queries × 2',
        'config · audit · archive · log',
        'process action worker',
      ],
      hosts: 'adapter hosts · one process each',
      fresh: 'fresh',
      late: 'timeout',
      pipe: 'anonymous pipes · length-prefixed JSON · ≤ 1 MiB per frame',
      lifecycle: 'a host that keeps failing',
      states: [
        'degraded',
        'circuit open',
        'backoff 1 s · 2 s · 4 s … 60 s',
        'probe',
        'warmup',
      ],
      quarantine: 'not reaped → quarantined · at most 8 hosts',
    },
  },
  arbitration: {
    intro: (
      <>
        Linux can expose one sensor through several interfaces, and a label does
        not prove what it measures: {code('temp1')} is not necessarily the CPU.
        dgxtop first decides what a reading means, as a metric key of host,
        boot, entity, metric and scope, and only then compares readings of the
        same key.
      </>
    ),
    diagram: {
      title: 'Arbitration: nine steps per metric key',
      text: 'Every candidate, the reason it was kept or dropped, its age and its origin travel with the committed value.',
      inputs: [
        ['A · hwmon · package 0', '68 °C'],
        ['B · thermal zone', '42 °C'],
      ],
      steps: [
        'map meaning',
        'normalize units',
        'validate',
        'check freshness',
        'de-duplicate origins',
        'rank candidates',
        'detect conflict',
        'hysteresis · 3 wins · 5 s',
        'commit + explanation',
      ],
      outcomes: 'possible results',
      selected: 'selected · 68 °C · hwmon',
      conflict: 'source conflict · A 68 °C / B 42 °C',
      missing: ['unsupported', 'read failed', 'stale'],
      average: 'never an average',
      axes: 'four separate axes, never one trust score',
      axisNames: ['read status', 'sample kind', 'quality', 'freshness'],
    },
    table: {
      caption:
        'Synthetic example. A: hwmon package 0 reads 68 °C. B: a thermal zone reads 42 °C.',
      head: ['Situation', 'What dgxtop does', 'What you see'],
      rows: [
        [
          'B is the SoC zone',
          'Different metrics; nothing to compare',
          'CPU package 68 °C, SoC 42 °C',
        ],
        [
          'B is a proven alias of A',
          'One sensor reached two ways, counted once',
          'One value, with a note on the mismatch',
        ],
        [
          'A and B are independent, equal and aligned',
          '26 °C apart, beyond tolerance: a conflict, value null',
          'Source conflict with both readings, never 55 °C',
        ],
        [
          'B reports a fault',
          'B excluded, A selected',
          '68 °C from A, with B marked faulty',
        ],
      ],
    },
    outro:
      'A switch to another source needs three consecutive wins and at least five seconds, so a value does not flap between sensors. Read status, sample kind, quality and freshness stay four separate axes instead of one trust score.',
  },
  history: {
    paragraphs: [
      <>
        A rate is the difference of two {code('u64')} counters divided by the
        real elapsed time on {code('CLOCK_BOOTTIME')}, which keeps counting
        through suspend. A counter reset, a new boot or a source change starts a
        new segment instead of producing a negative or invented rate.
      </>,
      <>
        A one-minute rollup cannot know when inside an interval the bytes moved.
        Totals therefore count only intervals that lie fully inside a window,
        and an interval that crosses a minute boundary is kept as an exact
        bridge and counted once, never split in proportion.
      </>,
      <>
        Gauges are time-weighted, a value counts only until its source’s stale
        deadline, and gaps stay gaps. History lives in {code('history.sqlite3')}{' '}
        for seven days, at most 1 GiB, so earlier runs are charted too. The
        archive writes with {code('synchronous=NORMAL')}, the action audit with{' '}
        {code('FULL')}: losing the last second of a chart is acceptable, losing
        the record of a signal is not.
      </>,
    ],
    diagram: {
      title: 'History: counters, bridges and gaps',
      text: 'The bridge crosses a minute boundary and is counted once, in any window that holds all of it; the gap is drawn as a gap, not as zero.',
      buckets: ['12:00–12:01', '12:01–12:02', '12:02–12:03'],
      delta: 'Δ counter ÷ Δt',
      bridge: 'bridge',
      gap: 'gap',
      legend: 'dots are samples; each line is one exact interval',
    },
  },
  actions: {
    paragraphs: [
      <>
        Terminating the wrong process is the worst thing a monitor can do, so
        termination is a two-step, audited action on a {code('ProcessKey')}{' '}
        (host, boot, PID namespace, PID and start time), never on a row index or
        a bare PID.
      </>,
      <>
        Prepare checks the user, refuses root sessions, PID 1, dgxtop and its
        own hosts, opens a {code('pidfd')} and re-checks the identity in{' '}
        {code('/proc')}. The confirmation is a single-use token valid for 10
        seconds. The intent is written with {code('synchronous=FULL')} before
        the signal, and the signal goes through the pidfd held since
        preparation, so a reused PID cannot be hit.
      </>,
      <>
        The result says <em>signal sent</em> apart from <em>exit observed</em>.
        A crash between the durable intent and the outcome is recorded as
        unknown and never resent: a database commit and a system call share no
        transaction, so the honest guarantee is at most once. {code('SIGKILL')}{' '}
        stays off unless {code('actions.allow_force')} is set, and{' '}
        {code('--read-only')} turns every action off.
      </>,
    ],
    diagram: {
      title: 'Process termination: at most one SIGTERM',
      text: 'Every refusal sends nothing, and the action can be cancelled until the signal is being sent.',
      steps: [
        ['K', 'select a GPU process'],
        ['prepare', 'same user · no root · not PID 1, dgxtop or its hosts'],
        ['pidfd_open', 'verify the /proc identity'],
        ['confirm', '10 s single-use token · y'],
        ['audit intent', 'SQLite synchronous=FULL'],
        ['pidfd_send_signal', 'SIGTERM'],
      ],
      outcomes: ['signal sent', 'exit observed', 'still running'],
      notes: [
        'crash after the intent → unknown, never resent',
        'SIGKILL off unless allow_force',
      ],
    },
  },
  budget: {
    intro:
      'Every allocation dgxtop manages draws on one 256 MiB ledger, split by purpose. These are admission limits, not measured memory: allocator overhead, thread stacks and the NVIDIA library come on top, which is why the specification sets a separate 384 MiB target for the whole process tree.',
    table: {
      caption: 'The 256 MiB data budget (defaults)',
      head: ['Partition', 'MiB', 'Holds'],
      rows: [
        ['Catalog and metadata', '24', 'Names, tombstones, arbitration state'],
        ['Raw candidates', '32', '60 s of evidence for source diagnostics'],
        ['Hot state', '16', '512 series, 256 processes, 1,024 GPU links'],
        ['Full-resolution history', '32', 'The last 300 s'],
        ['Minute aggregates', '96', '24 h of rollups, source changes and gaps'],
        ['Ingress', '8', 'Every live IPC and decoding buffer'],
        ['Presentation', '12', 'View models and the formatting cache'],
        ['History queries', '16', 'Snapshots pinned by running queries'],
        [
          'Control and reserve',
          '20',
          'Commands, archive journal, log, safety reserve',
        ],
      ],
    },
    overload: (
      <>
        Under load dgxtop degrades visibly instead of silently. Pressure stops
        optional work and draws at most 2 fps; throttling limits queries and
        stretches the sampling period, which a banner shows as effective against
        configured. Recovery takes one step per 30 healthy seconds, and missing
        samples are never back-filled.
      </>
    ),
    diagram: {
      title: 'Overload states',
      text: 'Entered by queue bytes at 75 % or slow collection (pressured) and memory at 90 % (throttled).',
      states: [
        ['normal', 'full rate'],
        ['pressured', 'optional work stops · 2 fps'],
        ['throttled', 'queries limited · period stretched'],
        ['recovering', 'one step per 30 s'],
      ],
    },
  },
  boundaries: {
    paragraphs: [
      <>
        The workspace has eight crates. Each implementation crate depends only
        on {code('dgxtop-core')}, and only the composition root sees them all; a
        CI script reads {code('cargo metadata')} and fails the build if a crate
        reaches another. The core never depends on NVML, libc, SQLite or the UI.
      </>,
      <>
        Format, lint, 1,373 tests (1,372 on aarch64), the dependency boundaries
        and the real-hardware suites pass on a Debian 13 workstation with an RTX
        5080 and an RTX 3060, and on a DGX Spark. The acceptance report tracks
        40 cases: 12 pass, 24 are not run yet (mostly opt-in end-to-end suites),
        and 4 are blocked on a tagged release, three 30-minute benchmark runs
        and a 72-hour soak. Until those exist, no platform is called validated,
        and the performance numbers stay targets.
      </>,
    ],
    diagram: {
      title: 'Workspace: one contract crate at the centre',
      text: 'Concrete implementations meet only in the composition root.',
      root: ['dgxtop', 'composition root + CLI'],
      crates: [
        ['dgxtop-runtime', 'hosts · IPC · workers'],
        ['dgxtop-adapters', 'procfs · NVML · pidfd'],
        ['dgxtop-collectors', 'arbitration · rates'],
        ['dgxtop-store', 'history · SQLite'],
        ['dgxtop-manager', 'use cases · sessions'],
        ['dgxtop-ui', 'Ratatui · keymap'],
      ],
      depends: '→ dgxtop-core only',
      core: ['dgxtop-core', 'types · units · ports · commands · byte budget'],
      check: 'enforced in CI · check_boundaries.py',
    },
  },
  tradeoffs: [
    <>
      <strong>A process per adapter, not a thread.</strong> More resident memory
      and IPC, in exchange for a hung driver that cannot freeze anything else.
    </>,
    <>
      <strong>
        Fixed threads and crossbeam channels, not an async runtime.
      </strong>{' '}
      There is no network I/O to justify one.
    </>,
    <>
      <strong>A compile-time registry, not plugins.</strong> No unstable Rust
      ABI and no new attack surface for adapters and display modules.
    </>,
    <>
      <strong>Conflicts shown, not averaged.</strong> Less tidy, but never a
      number that no sensor reported.
    </>,
    <>
      <strong>At most one signal, not retries.</strong> An unknown outcome is
      shown as unknown.
    </>,
    <>
      <strong>Redraw on change, at most 4 fps.</strong> A monitor does not need
      60 fps, and a slow terminal must never block input.
    </>,
  ],
  links: [
    {
      label: 'Source code and README (English · 繁體中文 · 日本語)',
      href: repository,
    },
    {
      label: 'Specification (Traditional Chinese)',
      href: `${repository}/tree/main/spec/dgxtop-v2`,
    },
    {
      label: 'Implementation decisions D-01 to D-57',
      href: `${blob}/docs/process/v2-rewrite/DECISIONS.md`,
    },
    {
      label: 'Validation report and evidence',
      href: `${blob}/docs/validation/VALIDATION.md`,
    },
  ],
};

const zh: DgxtopCopy = {
  eyebrow: '工具 · Rust · Ratatui · 2026-10-11 更新',
  lead: 'dgxtop 在終端裡監看 NVIDIA DGX Spark，或任何裝了 NVIDIA GPU 的 Linux 主機：CPU、GPU、記憶體、磁碟、網路與 GPU 程序。第二版是一次完整重寫，圍繞一條規則：讀不到的值，絕不顯示成 0。這一頁說明撐起這條規則的架構，以及每個選擇的代價。',
  facts: {
    stack: 'Rust 1.92 · Ratatui · crossterm · NVML · SQLite',
    platforms:
      'Linux x86_64／aarch64（glibc）· 已在 DGX Spark（GB10）與 RTX 5080 + RTX 3060 工作站上測試',
    status: 'v2 已在 main · 第一個 v2 release 尚未發佈',
  },
  sectionsLabel: '章節',
  openImage: '開啟原尺寸圖片',
  sections: {
    why: '為什麼重寫',
    screens: '畫面',
    architecture: '六個元件、兩條路徑',
    isolation: '驅動卡住，只拖住一個 host',
    arbitration: '可解釋的來源，不取平均',
    history: '精確的歷史',
    actions: '受保護的程序終止',
    budget: '資源預算與過載',
    boundaries: '邊界與驗證',
    tradeoffs: '取捨',
    links: '延伸閱讀',
  },
  shots: {
    'dgx-spark-overview.webp': {
      alt: 'DGX Spark 上的 dgxtop 總覽：CPU 與記憶體、使用率 92% 的 GB10 GPU 與其 RAM 長條、磁碟與網路表格，以及一個佔用 69.8 GiB GPU 記憶體的 Python 程序',
      caption:
        'DGX Spark 上的總覽。一個 Python 工作讓 GB10 維持在 92%；它與 CPU 共用記憶體，所以 GPU 程序佔用的 RAM 以另一種顏色畫在系統記憶體裡。',
    },
    'workstation-overview.webp': {
      alt: '雙 GPU 工作站（RTX 5080 與 RTX 3060）上的總覽，列出佔用 GPU 記憶體的程序',
      caption:
        '工作站上的兩張 GPU。程序表只列出有使用 GPU 的程序，並照 nvidia-smi 的寫法標出 C 或 G。',
    },
    'dgx-spark-gpu.webp': {
      alt: 'GB10 的 GPU 頁面：狀態、時脈、統一記憶體、PCIe、NVLink-C2C、溫度門檻、功耗、CUDA、驅動、裝置與拓樸',
      caption:
        'GB10 的 GPU 頁面，從 NVML 與 CUDA toolkit 的檔案讀取，不執行任何指令。GPU 沒有回報的值就不列出。',
    },
    'workstation-gpu.webp': {
      alt: 'RTX 5080 的 GPU 頁面：時脈、VRAM 與 BAR1、PCIe Gen5、風扇與溫度門檻、功耗上限、CUDA、驅動、韌體，以及到第二張 GPU 的 P2P 路徑',
      caption:
        '同一個頁面在 RTX 5080 上：VRAM、PCIe Gen5 x16、風扇、功耗上限，以及到第二張 GPU 的路徑。序號與 UUID 已打碼。',
    },
    'dgx-spark-history.webp': {
      alt: 'DGX Spark 一小時的歷史：CPU、記憶體、GPU 使用率與記憶體、溫度、功耗與能耗、磁碟與網路',
      caption:
        'DGX Spark 上一小時的 GPU 工作：成對的面板共用同一條時間軸，每一欄是依數值上色的平均，並列出目前、平均與最大值。',
    },
    'workstation-history.webp': {
      alt: '雙 GPU 工作站的歷史，附每張 GPU 最近 1、6、12、24 小時的平均與峰值',
      caption:
        '時間軸下方是每張 GPU 最近 1、6、12、24 小時的平均與峰值：使用率、記憶體、溫度、功耗，以及耗電量。',
    },
    'dgx-spark-settings.webp': {
      alt: '設定頁列出每個設定的已保存值、生效值、來源與是否需要重啟，旁邊是顯示模組的開關',
      caption:
        '設定頁同時列出每個值的已保存值與生效值、它從哪裡來，以及是即時生效還是需要重新啟動。',
    },
  },
  why: {
    intro:
      '第一版在 UI 迴圈裡採樣硬體，驅動呼叫一慢，整個畫面就凍住。它把資料、歷史與 UI 狀態放在同一個共用結構裡，依 thermal zone 的名稱與掃描順序挑 CPU 溫度，讀不到的值直接顯示成 0。v2 規格列出十個這類問題，並為每一個給出設計上的答案：',
    table: {
      head: ['v1 的問題', 'v2 的答案'],
      rows: [
        [
          '只用 PID 辨識程序',
          'ProcessKey（主機、開機、PID namespace、PID、啟動時間）、預先持有的 pidfd 與兩階段確認',
        ],
        [
          '缺值變成 0',
          '讀取狀態、資料種類、品質與新鮮度分成不同的軸；缺值是附原因的 null',
        ],
        [
          '統一記憶體的語意混在一起',
          '系統 RAM、GPU framebuffer 與各程序的配置分開',
        ],
        [
          '從使用率推估頻寬',
          '量測、衍生、估算分開；沒有位元組計數器就不給吞吐量',
        ],
        [
          '更新間隔與累計量是假設而非量測',
          '由排程器確認的有效間隔；真實經過時間與 counter 差值',
        ],
        ['歷史時窗錯位', '帶有開機、覆蓋率與空窗資訊的時間桶'],
        [
          '同一個 PID 在多張 GPU 上被重算',
          '每個 ProcessKey 只採樣一次主機 CPU 與記憶體，再關聯到各張 GPU',
        ],
        [
          '安裝程式不驗證下載內容',
          '驗證 checksum 與壓縮檔結構，保留舊執行檔以便回滾',
        ],
        ['採樣卡住 UI', '控制、採樣與繪製分離；驅動隔離在各自的程序'],
        ['建置不可重現', '提交 Cargo.lock、固定工具鏈與 release gate'],
      ],
    },
    outro:
      '這次重寫先寫規格再寫程式：40 項需求、15 個工作包、40 個驗收案例。之後依固定的 core 契約建成八個 crate 的 Rust workspace，約 157,000 行 Rust，附 1,373 項測試。',
  },
  screens: {
    intro: '四個分頁：總覽、GPU、歷史與設定。以下截圖來自實際測試的兩台機器。',
  },
  architecture: {
    intro: (
      <>
        每個數值走資料路徑，每個使用者意圖走控制路徑。Manager
        是唯一的寫入者：只有它持有 Store 的寫入權與程序操作的 port，所以 Viewer
        與 Controller 既不能改資料，也不能送訊號。
      </>
    ),
    diagram: {
      title: '架構：六個元件、兩條路徑',
      text: '實線左緣是資料路徑，虛線左緣是控制路徑。Viewer 從不讀 Store，它只畫 Manager 發布的 view model。',
      data: '資料路徑',
      control: '控制路徑',
      adapters: '各自一個程序',
      dataNodes: [
        ['Linux + NVIDIA 驅動', '/proc · sysfs · NVML'],
        ['Adapter host', ''],
        ['Collector', '正規化 · 去重 · 仲裁 · 速率'],
        ['Manager', '唯一的寫入者'],
        ['Store', '快照 · 歷史 · 設定 · 稽核'],
        ['Manager', '投影'],
        ['Viewer', '不可變 view model · Ratatui'],
      ],
      controlNodes: [
        ['Controller', '按鍵 · 滑鼠 · CLI → 型別化命令'],
        ['Manager', '驗證 · 授權'],
        ['設定 · 排程 · 操作 adapter', '訊號透過 pidfd'],
        ['稽核 + 結果', '送訊號之前先落盤'],
        ['Store → Viewer', '顯示結果'],
      ],
    },
    table: {
      head: ['元件', '唯一的職責', '明確禁止'],
      rows: [
        [
          'Adapter',
          '對接一種驅動或核心介面；回傳原生數值，附來源、時間與錯誤',
          '自選權威數值、跨來源平均、直接寫 Store、繪製',
        ],
        [
          'Collector',
          '正規化單位、去除已證明的別名、仲裁、計算速率',
          '呼叫驅動內部、執行 SQL、修改設定、送訊號',
        ],
        [
          'Manager',
          '排程採樣、管理政策與設定、授權命令、提交資料、產生 view model',
          '排版畫面，或在事件迴圈裡等待會阻塞的驅動呼叫',
        ],
        ['Store', '保存快照、歷史、設定與稽核紀錄', '自行挑選感測器、執行命令'],
        [
          'Viewer',
          '排版顯示模組，繪製不可變的 view model',
          '自行採樣、讀寫 Store、計算速率、授權任何操作',
        ],
        [
          'Controller',
          '把按鍵、點擊與參數轉成帶穩定 ID 的型別化命令',
          '判定來源、送訊號、繪製',
        ],
      ],
    },
    outro:
      '十個顯示模組在編譯期註冊，只拿到自己的 view model 與畫面區域。某個模組 panic 時，它被隔離成模組錯誤，不會連帶拖垮採樣。',
  },
  isolation: {
    paragraphs: [
      <>
        逾時只代表結果晚到，並沒有取消那次呼叫：卡在廠商函式庫裡的執行緒無法安全地停下來。所以每個
        live adapter 都在自己的常駐子程序裡執行（同一個執行檔以 adapter host
        模式啟動），透過匿名管線與父程序交換附長度前綴、每個最多 1 MiB 的 JSON
        frame。
      </>,
      <>
        錯過期限的 host 會轉為降級；連續失敗 3 次後 circuit breaker 打開，重試依
        1、2、4……60 秒退避。只有確實回收（reap）後才會換上新的 host；回收不了的
        host 會被隔離，而且同時最多只有 8 個。
      </>,
      <>
        父程序只有固定數量的執行緒，不用 async runtime：這裡沒有網路 I/O，而{' '}
        {code('spawn_blocking')} 只會把同一個無法取消的呼叫藏到 future
        後面。所有受管資料共用一份 256 MiB
        預算，每條佇列除了筆數上限還有位元組上限，因為有界 channel
        只數訊息，不數位元組。
      </>,
    ],
    diagram: {
      title: '執行模型：一個父程序，常駐的 host',
      text: '這裡 NVML host 已經逾時，CPU、記憶體與畫面仍由其他 host 持續更新。',
      parent: 'dgxtop 父程序',
      threads: [
        '終端 · 輸入與繪製，最多 4 fps',
        'Manager · 每輪 2 ms 的控制迴圈',
        'supervisor · 管線與回收',
        'collector worker × 2',
        'hot store · 單一寫入者',
        '歷史查詢 × 2',
        '設定 · 稽核 · 封存 · 日誌',
        '程序操作 worker',
      ],
      hosts: 'adapter host · 各自一個程序',
      fresh: '新鮮',
      late: '逾時',
      pipe: '匿名管線 · 長度前綴 JSON · 每個 frame ≤ 1 MiB',
      lifecycle: '持續失敗的 host',
      states: [
        '降級',
        'circuit 打開',
        '退避 1 s · 2 s · 4 s … 60 s',
        '探測',
        '暖機',
      ],
      quarantine: '回收不了 → 隔離 · 最多 8 個 host',
    },
  },
  arbitration: {
    intro: (
      <>
        Linux 可能用好幾個介面暴露同一顆感測器，標籤也不保證它量的是什麼：
        {code('temp1')}
        不一定是 CPU。dgxtop
        先決定一筆讀值代表什麼（由主機、開機、實體、指標與範圍組成的 metric
        key），然後只比較同一個 key 的讀值。
      </>
    ),
    diagram: {
      title: '仲裁：每個 metric key 九個步驟',
      text: '每個候選、它被保留或排除的原因、age 與來源，都跟著提交的數值一起保存。',
      inputs: [
        ['A · hwmon · package 0', '68 °C'],
        ['B · thermal zone', '42 °C'],
      ],
      steps: [
        '建立語意對應',
        '正規化單位',
        '硬性驗證',
        '檢查新鮮度',
        '同源去重',
        '排序候選',
        '檢查衝突',
        '遲滯 · 連勝 3 次 · 5 秒',
        '提交與解釋',
      ],
      outcomes: '可能的結果',
      selected: '選中 · 68 °C · hwmon',
      conflict: '來源衝突 · A 68 °C／B 42 °C',
      missing: ['不支援', '讀取失敗', '過期'],
      average: '絕不取平均',
      axes: '四個獨立的軸，不壓成一個信任分數',
      axisNames: ['讀取狀態', '資料種類', '品質', '新鮮度'],
    },
    table: {
      caption:
        '合成範例。A：hwmon package 0 讀到 68 °C；B：一個 thermal zone 讀到 42 °C。',
      head: ['情境', 'dgxtop 怎麼處理', '畫面上看到'],
      rows: [
        [
          'B 是 SoC 的 zone',
          '不同指標，不互相比較',
          'CPU package 68 °C、SoC 42 °C',
        ],
        [
          'B 是 A 已證明的別名',
          '同一顆感測器的兩個入口，只算一票',
          '一個數值，附不一致的提示',
        ],
        [
          'A、B 是獨立、同級且已對齊的量測',
          '相差 26 °C，超過容差：衝突，數值為 null',
          '來源衝突與兩個讀值，絕不顯示 55 °C',
        ],
        ['B 回報 fault', '排除 B，選中 A', '68 °C 來自 A，並標示 B 故障'],
      ],
    },
    outro:
      '要切換到另一個來源，必須連續勝出 3 次且至少經過 5 秒，數值不會在感測器之間來回跳。讀取狀態、資料種類、品質與新鮮度維持四個獨立的軸，不壓成一個信任分數。',
  },
  history: {
    paragraphs: [
      <>
        速率是兩個 {code('u64')} counter 的差值，除以
        {code('CLOCK_BOOTTIME')}
        上的真實經過時間；這個時鐘在休眠期間也會繼續計時。counter
        歸零、重新開機或來源切換時，會開始新的區段，而不是產生負的或捏造的速率。
      </>,
      <>
        一分鐘的彙總無法知道區間裡的位元組是在哪一刻流動的。所以時窗總量只計入完全落在窗內的區間；跨越分鐘邊界的區間以精確的
        bridge 保存、只算一次，絕不按比例拆分。
      </>,
      <>
        gauge
        依時間加權，數值只有效到來源的過期期限為止，空窗就留著空窗。歷史存在{' '}
        {code('history.sqlite3')}，保留 7 天、最多 1
        GiB，之前執行的紀錄也會畫出來。封存使用 {code('synchronous=NORMAL')}
        ，操作稽核使用 {code('FULL')}
        ：圖表少了最後一秒可以接受，訊號的紀錄不見則不行。
      </>,
    ],
    diagram: {
      title: '歷史：counter、bridge 與空窗',
      text: 'bridge 跨越分鐘邊界，只在完整包含它的時窗裡算一次；空窗畫成空窗，不畫成 0。',
      buckets: ['12:00–12:01', '12:01–12:02', '12:02–12:03'],
      delta: 'Δ counter ÷ Δt',
      bridge: 'bridge',
      gap: '空窗',
      legend: '圓點是採樣點；每一段線是一個精確的區間',
    },
  },
  actions: {
    paragraphs: [
      <>
        終止錯的程序，是監控工具最糟的失誤。所以終止是兩階段、有稽核的操作，對象是{' '}
        {code('ProcessKey')}
        （主機、開機、PID namespace、PID 與啟動時間），絕不是列號或單獨的 PID。
      </>,
      <>
        準備階段檢查使用者，拒絕 root 會話、PID 1、dgxtop 本身與它自己的
        host，開啟 {code('pidfd')} 後再透過 {code('/proc')}
        重新核對身分。確認用的是 10 秒內有效的一次性 token。送訊號之前先以{' '}
        {code('synchronous=FULL')}
        寫入 intent，訊號再透過準備時就持有的 pidfd 送出，所以重用的 PID
        不會被誤擊。
      </>,
      <>
        結果會分開標示<em>已送出訊號</em>與<em>已觀察到結束</em>。如果在 intent
        落盤後、結果寫入前崩潰，該操作記為未知且絕不重送：資料庫 commit
        與系統呼叫沒有共同的交易，所以誠實的保證是「至多一次」。
        {code('SIGKILL')} 預設關閉，除非設定 {code('actions.allow_force')}；
        {code('--read-only')} 會關閉所有操作。
      </>,
    ],
    diagram: {
      title: '程序終止：至多一次 SIGTERM',
      text: '每一種拒絕都不會送出任何訊號；在訊號送出之前，操作都可以取消。',
      steps: [
        ['K', '選取一個 GPU 程序'],
        ['準備', '同使用者 · 非 root · 不是 PID 1、dgxtop 或其 host'],
        ['pidfd_open', '核對 /proc 身分'],
        ['確認', '10 秒一次性 token · y'],
        ['稽核 intent', 'SQLite synchronous=FULL'],
        ['pidfd_send_signal', 'SIGTERM'],
      ],
      outcomes: ['已送出訊號', '已觀察到結束', '仍在執行'],
      notes: [
        'intent 之後崩潰 → 未知，絕不重送',
        'SIGKILL 預設關閉（allow_force）',
      ],
    },
  },
  budget: {
    intro:
      'dgxtop 管理的每一筆配置都從同一本 256 MiB 的帳目扣除，並依用途分區。這些是准入上限，不是量到的記憶體：配置器開銷、執行緒堆疊與 NVIDIA 函式庫都另外計算，所以規格另外為整個程序樹訂了 384 MiB 的目標。',
    table: {
      caption: '256 MiB 資料預算（預設值）',
      head: ['分區', 'MiB', '內容'],
      rows: [
        ['目錄與 metadata', '24', '名稱、tombstone、仲裁前態'],
        ['原始候選', '32', '供來源診斷的 60 秒證據'],
        ['即時狀態', '16', '512 條序列、256 個程序、1,024 個 GPU 關聯'],
        ['原解析歷史', '32', '最近 300 秒'],
        ['分鐘彙總', '96', '24 小時的彙總、來源切換與空窗'],
        ['輸入（ingress）', '8', '所有存活的 IPC 與解碼 buffer'],
        ['呈現', '12', 'view model 與格式化快取'],
        ['歷史查詢', '16', '執行中查詢釘住的快照'],
        ['控制與保留', '20', '命令、封存 journal、日誌、安全保留'],
      ],
    },
    overload: (
      <>
        負載過高時，dgxtop
        會看得見地降級，而不是默默失真。壓力狀態先停掉可選工作、繪製降到最多 2
        fps；節流狀態限制查詢並拉長採樣週期，橫幅會同時顯示設定值與實際值。恢復時每
        30 秒健康才退一級，遺失的採樣絕不補值。
      </>
    ),
    diagram: {
      title: '過載狀態',
      text: '佇列位元組達 75% 或採集變慢時進入壓力狀態；記憶體達 90% 時進入節流狀態。',
      states: [
        ['正常', '完整速率'],
        ['壓力', '停可選工作 · 2 fps'],
        ['節流', '限制查詢 · 拉長週期'],
        ['恢復中', '每 30 秒退一級'],
      ],
    },
  },
  boundaries: {
    paragraphs: [
      <>
        workspace 有八個 crate。每個實作 crate 只依賴 {code('dgxtop-core')}
        ，只有組裝根看得到全部；CI 腳本讀取 {code('cargo metadata')}，任何 crate
        依賴另一個實作 crate 就讓建置失敗。core 本身從不依賴 NVML、libc、SQLite
        或 UI。
      </>,
      <>
        格式、lint、1,373 項測試（aarch64 上 1,372
        項）、依賴邊界與真實硬體測試，在裝有 RTX 5080 與 RTX 3060 的 Debian 13
        工作站和 DGX Spark 上都通過。驗收報告追蹤 40 個案例：12 個通過、24
        個尚未執行（多半是需要另外啟動的端對端測試），4 個卡在正式 release、3 次
        30 分鐘的效能基準與 72 小時
        soak。在這些完成之前，沒有任何平台被宣稱為已驗收，效能數字也仍只是目標。
      </>,
    ],
    diagram: {
      title: 'Workspace：一個契約 crate 在中心',
      text: '具體實作只在組裝根相遇。',
      root: ['dgxtop', '組裝根 + CLI'],
      crates: [
        ['dgxtop-runtime', 'host · IPC · worker'],
        ['dgxtop-adapters', 'procfs · NVML · pidfd'],
        ['dgxtop-collectors', '仲裁 · 速率'],
        ['dgxtop-store', '歷史 · SQLite'],
        ['dgxtop-manager', '用例 · 會話'],
        ['dgxtop-ui', 'Ratatui · keymap'],
      ],
      depends: '→ 只依賴 dgxtop-core',
      core: ['dgxtop-core', '型別 · 單位 · port · 命令 · 位元組預算'],
      check: 'CI 檢查 · check_boundaries.py',
    },
  },
  tradeoffs: [
    <>
      <strong>每個 adapter 一個程序，而不是一條執行緒。</strong>
      多付常駐記憶體與 IPC 的成本，換來卡住的驅動無法凍結其他任何東西。
    </>,
    <>
      <strong>固定的執行緒與 crossbeam channel，而不是 async runtime。</strong>
      沒有網路 I/O 值得引入它。
    </>,
    <>
      <strong>編譯期註冊，而不是外掛。</strong>
      adapter 與顯示模組不需要不穩定的 Rust ABI，也不增加攻擊面。
    </>,
    <>
      <strong>顯示衝突，而不是取平均。</strong>
      畫面沒那麼整齊，但絕不出現沒有任何感測器回報過的數字。
    </>,
    <>
      <strong>至多一次訊號，而不是重試。</strong>
      結果未知，就顯示未知。
    </>,
    <>
      <strong>只在變化時重繪，最多 4 fps。</strong>
      監控不需要 60 fps，而且慢的終端絕不能卡住輸入。
    </>,
  ],
  links: [
    {
      label: '原始碼與 README（English · 繁體中文 · 日本語）',
      href: repository,
    },
    {
      label: '完整規格（繁體中文）',
      href: `${repository}/tree/main/spec/dgxtop-v2`,
    },
    {
      label: '實作決策 D-01 到 D-57',
      href: `${blob}/docs/process/v2-rewrite/DECISIONS.md`,
    },
    {
      label: '驗證報告與證據',
      href: `${blob}/docs/validation/VALIDATION.md`,
    },
  ],
};

export const dgxtopCopy: Record<ProjectEdition, DgxtopCopy> = {
  'zh-hant': zh,
  en,
};
