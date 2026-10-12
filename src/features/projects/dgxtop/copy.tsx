import type { ReactNode } from 'react';
import type { ProjectEdition } from '../../../lib/project-pages.ts';

// What dgxtop does, what it runs on and how it is built, as the dgxtop
// README states it in English, Traditional Chinese and Japanese (checked
// 2026-10-12, v2.1.0). The technical sections and their diagrams follow the
// v2.1 code itself: its constants, defaults and crates, not the design spec.

/** The technical sections after the architecture, each with its diagram. */
export const techSectionIds = [
  'data-path',
  'isolation',
  'sources',
  'history',
  'process-history',
  'gpu-memory',
  'actions',
  'limits',
  'storage',
  'code',
] as const;
export type TechSectionId = (typeof techSectionIds)[number];

export const sectionIds = [
  'install',
  'features',
  'screens',
  'capabilities',
  'architecture',
  ...techSectionIds,
] as const;
export type SectionId = (typeof sectionIds)[number];

export const shotFiles = [
  'dgx-spark-overview.webp',
  'workstation-overview.webp',
  'dgx-spark-gpu.webp',
  'workstation-gpu.webp',
  'workstation-overview-history.webp',
  'workstation-process-history.webp',
  'workstation-process-run.webp',
] as const;
export type ShotFile = (typeof shotFiles)[number];

/** GPT-generated diagrams, one image per edition (DESIGN.md §7). */
export const diagramNames = [
  'architecture',
  'one-sample',
  'isolation',
  'source-arbitration',
  'history-tiers',
  'process-history',
  'gpu-memory',
  'safe-actions',
  'budgets',
  'storage',
  'crates',
] as const;
export type DiagramName = (typeof diagramNames)[number];

export const techDiagrams: Record<TechSectionId, DiagramName> = {
  'data-path': 'one-sample',
  isolation: 'isolation',
  sources: 'source-arbitration',
  history: 'history-tiers',
  'process-history': 'process-history',
  'gpu-memory': 'gpu-memory',
  actions: 'safe-actions',
  limits: 'budgets',
  storage: 'storage',
  code: 'crates',
};

// github.com's raw path redirects to the same file as the README's
// raw.githubusercontent.com URL; the asset policy keeps that host out of
// bundles (src/lib/asset-policy.ts), and curl -L follows the redirect.
export const installCommand =
  'curl -fsSL https://github.com/DennySORA/dgxtop/raw/main/install.sh | bash';

type Table = { head: string[]; rows: string[][] };

/** One feature or capability: a bold name, its text and an optional list. */
export type Point = { title: string; text: ReactNode; list?: string[] };

/** A technical section: an intro, its points and an optional table. */
type TechSection = { intro: ReactNode; points: Point[]; table?: Table };

export type DgxtopCopy = {
  eyebrow: string;
  lead: string;
  facts: { stack: string; platforms: string; status: string };
  sectionsLabel: string;
  openImage: string;
  sections: Record<SectionId, string>;
  shots: Record<ShotFile, { alt: string; caption: string }>;
  install: {
    platforms: string;
    installer: ReactNode;
    source: string;
  };
  features: { intro: string; points: Point[] };
  screens: { intro: string };
  capabilities: Point[];
  architecture: {
    intro: string;
    diagram: {
      title: string;
      text: string;
      data: string;
      history: string;
      control: string;
      adapters: string;
      dataNodes: [string, string][];
      historyNodes: [string, string][];
      controlNodes: [string, string][];
    };
    components: Table;
    /** Leads from the overview into the technical sections. */
    next: string;
  };
  /** The window label and alt-text opening of every generated diagram. */
  generated: { title: string; alt: string };
  diagrams: Record<DiagramName, { alt: string; caption: string }>;
  tech: Record<TechSectionId, TechSection>;
};

const code = (text: string) => <code>{text}</code>;

const crates = [
  'dgxtop',
  'dgxtop-core',
  'dgxtop-runtime',
  'dgxtop-adapters',
  'dgxtop-collectors',
  'dgxtop-state',
  'dgxtop-history',
  'dgxtop-compression',
  'dgxtop-store',
  'dgxtop-manager',
  'dgxtop-ui',
] as const;

const crateRows = (contents: readonly string[]) =>
  crates.map((crate, index) => [crate, contents[index] ?? '']);

const en: DgxtopCopy = {
  eyebrow: 'Tools · Rust · Ratatui · updated 2026-10-12',
  lead: 'dgxtop is a terminal monitor for NVIDIA GPUs. One screen shows every GPU’s utilization, memory, temperature, power and clocks, which job holds how much of its memory, each in its own color, and the rest of the machine: CPU, memory, disks and network. Every GPU job is recorded from start to end with its command line, peak memory and how it ended, and the history stays on disk across restarts. It is built for the DGX Spark and runs on any Linux machine with NVIDIA GPUs.',
  facts: {
    stack: 'Rust 1.92 · Ratatui · crossterm · NVML · SQLite',
    platforms:
      'Linux x86_64 / aarch64 (glibc 2.34+) · tested on a DGX Spark (GB10) and on an RTX 5080 + RTX 3060 workstation',
    status: 'v2.1, released 2026-10-12',
  },
  sectionsLabel: 'Sections',
  openImage: 'Open the full-size image',
  sections: {
    install: 'Install',
    features: 'Features',
    screens: 'Screens',
    capabilities: 'Capabilities',
    architecture: 'Architecture',
    'data-path': 'One sample, end to end',
    isolation: 'Adapter processes',
    sources: 'Choosing a source',
    history: 'History in tiers',
    'process-history': 'How Process History works',
    'gpu-memory': 'GPU memory by process',
    actions: 'Safe process actions',
    limits: 'Limits and overload',
    storage: 'Files on disk',
    code: 'Code structure',
  },
  shots: {
    'dgx-spark-overview.webp': {
      alt: 'dgxtop Overview on a DGX Spark: the CPU, the unified memory split into the system and two GPU processes in their colors, the GB10 GPU, the disk and network tables, and the GPU process table',
      caption:
        'Overview on a DGX Spark. The GB10 shares memory with the CPU, so the RAM bar shows the system’s share and each GPU process’s share in its own color.',
    },
    'workstation-overview.webp': {
      alt: 'Overview on a workstation with an RTX 5080 at 97 % and an RTX 3060, the disk and network tables, and four GPU processes, each with its color',
      caption:
        'Two GPUs on a workstation. Each GPU process keeps one color in the memory bars, the charts and the process table.',
    },
    'dgx-spark-gpu.webp': {
      alt: 'GPU view of the GB10: state, clocks, unified memory, PCIe, NVLink-C2C, thermal thresholds, power and energy, CUDA 13.0, driver and Linux kernel, device, PCI and firmware, topology',
      caption:
        'The GPU view of the GB10, with its unified memory and NVLink-C2C. A value the GPU does not report gets no row. The UUID is masked.',
    },
    'workstation-gpu.webp': {
      alt: 'GPU view of an RTX 5080 under load: power-capped state, clocks, VRAM and BAR1, PCIe Gen5, fans and thresholds, power limits, CUDA 13.4, driver, device, firmware and the path to the second GPU',
      caption:
        'The same view on an RTX 5080 under load: power capped, with VRAM, PCIe Gen5 x16, fans, power limits and the path to the second GPU. Serial number and UUID are masked.',
    },
    'workstation-overview-history.webp': {
      alt: 'Overview History of the two-GPU workstation in 1-minute bars: CPU, memory, GPU utilization, GPU memory, GPU temperature, GPU power with energy, disk and network, and a table of each GPU’s average and peak',
      caption:
        'Overview History in 1-minute bars: every chart with now, average and maximum, and below, each GPU’s average and peak with the energy it used.',
    },
    'workstation-process-history.webp': {
      alt: 'Process History listing GPU process runs with their start time, PID, name, GPU, runtime, peak GPU memory and RAM, GPU and CPU use and status, running or ended',
      caption:
        'Process History: every GPU process as a run, newest first, with its runtime, its peaks and how it ended.',
    },
    'workstation-process-run.webp': {
      alt: 'An opened run: PID, name, GPU, start, end, runtime and user, then charts of its CPU, memory, GPU utilization, GPU memory, threads and open files, disk and network',
      caption:
        'An opened run with its charts. The command line can be shown in full and copied; here its folder, program, cgroup and command line are masked.',
    },
  },
  install: {
    platforms:
      'Linux on x86_64 or aarch64 with glibc 2.34 or newer (Ubuntu 22.04, Debian 12, RHEL 9 and later), DGX Spark included. WSL 2 runs the Linux build. GPU metrics need the NVIDIA driver; without it, CPU, memory, disks and network still work. WSL 1, musl, macOS and Windows are not supported.',
    installer: (
      <>
        The installer picks the build for your CPU, checks it against the
        release’s {code('SHA256SUMS')} and installs it to {code('~/.local/bin')}
        . The previous version is kept, and {code('./install.sh --rollback')}{' '}
        brings it back.
      </>
    ),
    source: 'Source code, full usage and every release:',
  },
  features: {
    intro:
      'htop centers on the CPU, and nvtop and nvidia-smi show GPUs only while you watch. dgxtop puts the GPUs first, shows which job holds how much of their memory, and keeps a record of every GPU job and of the whole machine.',
    points: [
      {
        title: 'Every GPU at a glance.',
        text: 'Utilization, memory, temperature, power, clocks and fans for each GPU, with live charts. A gauge stays green below 50 % and turns from amber to red as it nears the redline (80 % by default).',
      },
      {
        title: 'Memory by process.',
        text: 'The eight processes holding the most GPU memory each get a color, the same in the memory bars, the charts and the process table, so you see which job holds how much. The color comes from the process name, so a job keeps it when the job or dgxtop restarts, unless another listed process already has it.',
      },
      {
        title: 'Named by what they run.',
        text: (
          <>
            {code('python -m vllm.entrypoints.openai.api_server')} shows as{' '}
            {code('vllm.api_server')}, and {code('python main.py')} in a{' '}
            {code('ComfyUI')} folder as {code('ComfyUI/main')}, not as{' '}
            {code('python3')}.
          </>
        ),
      },
      {
        title: 'GPU processes.',
        text: (
          <>
            Every process using a GPU, with its GPU, type (compute or graphics),
            GPU use, GPU memory, CPU and RAM. Sort by any column, filter by GPU
            or name, and stop a process with {code('K')} (SIGTERM) or{' '}
            {code('F9')} (SIGKILL) after a confirmation.
          </>
        ),
      },
      {
        title: 'Process History.',
        text: 'Every GPU process is recorded as a run, from start to end: its runtime, peak GPU memory and RAM, GPU and CPU use, and how it ended: exited with a code, killed by a signal, stopped from dgxtop, most likely the OOM killer, or still running. Open a run for its full command line, working folder and charts of its CPU, memory, GPU, threads, open files, disk and network.',
      },
      {
        title: 'Overview History.',
        text: 'CPU, memory, each GPU’s utilization, memory, temperature and power, disks and network as bars of 1 minute to 24 hours on the local clock, with now, average and maximum on every chart, and each GPU’s averages, peaks and energy.',
      },
      {
        title: 'Full GPU details.',
        text: 'One GPU at a time, with everything the driver reports; a value the GPU does not report gets no row:',
        list: [
          'performance state, throttle reasons and how long it was throttled, clocks',
          'memory and the memory bus, PCIe link and traffic, NVLink-C2C',
          'thermal limits, fans, power limits and energy',
          'CUDA, driver, NVML and Linux kernel versions',
          'device, PCI and firmware, NUMA and CPU affinity, P2P paths',
        ],
      },
      {
        title: 'The whole machine.',
        text: 'CPU usage per core, CPU temperature and the current and maximum frequency of each kind of core; memory, swap, buffers and cache; disks with free space, IOPS, latency and drive temperature; network throughput, errors and drops.',
      },
      {
        title: 'Made for DGX Spark.',
        text: 'On the GB10’s unified memory, the RAM bar splits into the system’s share and each GPU job’s share. dgxtop also reads the GB10’s CPU cluster temperatures and its NVLink-C2C links, and ships a native aarch64 build.',
      },
      {
        title: 'Settings in the app.',
        text: 'Change the sampling interval and the display modules, and see each data source’s state. Every setting shows its saved and effective value, where it came from, and whether it applies now or after a restart.',
      },
    ],
  },
  screens: {
    intro:
      'The Overview, the GPU view, Overview History, and Process History with an opened run, on the two machines dgxtop was tested on.',
  },
  capabilities: [
    {
      title: 'Several GPUs per machine.',
      text: 'Tested on a DGX Spark (GB10) and on a workstation with an RTX 5080 and an RTX 3060.',
    },
    {
      title: 'History that lasts.',
      text: 'History is saved on disk and survives restarts and reboots, with no age limit: each bar size keeps its latest 300 bars, so 1-minute bars cover the last 5 hours and 24-hour bars about 10 months. Process History lists the latest 512 runs. dgxtop records while it runs.',
    },
    {
      title: 'Light.',
      text: 'Written in Rust. It draws new data 4 times a second by default and keeps its data within a fixed 256 MiB.',
    },
    {
      title: 'Any terminal size.',
      text: 'Wide, single-column and compact layouts, down to 40×10. Keyboard and mouse, and four color themes.',
    },
    {
      title: 'Private.',
      text: 'No network access and no telemetry. Settings and history are files only you can read. Process History keeps the command lines, working folders and programs of GPU processes; environments are never stored.',
    },
    {
      title: 'Safe process actions.',
      text: (
        <>
          Only your own processes, never from a root session, and only after a
          confirmation that expires. Signals go through a pidfd, so a reused PID
          is never hit, and every action is logged. {code('--read-only')} turns
          them off.
        </>
      ),
    },
    {
      title: 'Safe upgrades.',
      text: 'The installer verifies every download and keeps the previous version for a one-command rollback.',
    },
  ],
  architecture: {
    intro:
      'dgxtop is one program. Adapters read the hardware in their own background processes, the readings flow down the data path, and the Manager turns them into the views the screen draws. Each snapshot also feeds the history, and your keys and commands travel the control path.',
    diagram: {
      title: 'Architecture: three paths through one program',
      text: 'Solid accents mark the data and history paths, dashed ones the control path.',
      data: 'data path',
      history: 'history path',
      control: 'control path',
      adapters: 'one background process each',
      dataNodes: [
        ['Linux + NVIDIA driver', '/proc · sysfs · NVML'],
        ['Adapters', ''],
        ['Collectors', 'units · sources · rates'],
        ['State', 'live snapshot · short trends'],
        ['Manager', 'reads State and History · views'],
        ['Viewer', 'screens · Ratatui'],
      ],
      historyNodes: [
        ['State', 'each committed snapshot'],
        ['History', 'Overview History · Process History'],
        ['Compression', 'bars of 1 min to 24 h'],
        ['Store', 'SQLite · files'],
      ],
      controlNodes: [
        ['Viewer', 'keys · mouse · command line'],
        ['Manager', 'checks each command'],
        ['Settings · sampling · process actions', 'pidfd · confirmed · logged'],
        ['Viewer', 'shows the result'],
      ],
    },
    components: {
      head: ['Component', 'What it does'],
      rows: [
        [
          'Adapters',
          'Read the hardware: /proc, hwmon, thermal zones, powercap, NVML for the GPUs, network and filesystems, each in its own background process. A read-only probe follows each GPU process.',
        ],
        [
          'Collectors',
          'Turn raw readings into metrics: units, the best source for each value, rates from counters, one record per process.',
        ],
        [
          'State',
          'Holds the live snapshot and the short trends, in memory only.',
        ],
        [
          'History',
          'Keeps the Overview History and the Process History, and decides what is kept and what goes.',
        ],
        [
          'Compression',
          'Merges samples into bars from 1 minute to 24 hours, aligned to the local clock.',
        ],
        [
          'Store',
          'Reads and writes the SQLite databases and files, only as it is asked.',
        ],
        [
          'Manager',
          'Schedules sampling, applies settings, checks commands and process actions, and builds the views. It keeps no data itself.',
        ],
        [
          'Viewer',
          'Draws the screens with Ratatui from the Manager’s views, and turns keys and mouse clicks into commands.',
        ],
        [
          'Runtime',
          'Supervises the adapter processes, their IPC and bounded queues, the log and the terminal.',
        ],
      ],
    },
    next: 'The sections below follow one sample through this design and then take each part in turn, as implemented in v2.1.',
  },
  generated: { title: 'GPT-generated', alt: 'GPT-generated diagram: ' },
  diagrams: {
    architecture: {
      alt: 'dgxtop’s architecture. The Linux kernel and the NVIDIA driver feed seven adapter processes: procfs, hwmon, thermal, powercap, nvml, network and filesystem. In the dgxtop process, readings pass from the Supervisor through the Collectors and State to History and Compression, and History writes to the Store. State and History feed the Manager, which feeds the Viewer, and the process probe feeds History. Keys and the mouse reach the Manager, which runs process actions through a pidfd and the audit log.',
      caption:
        'The whole program: seven adapter processes read the hardware, and the main process turns their readings into the screen, the history and the files on disk. Solid arrows carry data, dashed ones commands.',
    },
    'one-sample': {
      alt: 'One sample from the kernel to the screen in eight steps. The Manager schedules a read every second with a 500 ms deadline; the Supervisor sends it to an adapter process over a pipe; the adapter reads /proc/stat, meminfo or NVML; the collectors fix units, pick the best source and turn counters into rates; State commits one snapshot with one writer; History keeps 5-second buckets and bars of 1 minute to 24 hours; the Manager builds the view; the Viewer draws it with Ratatui, 4 frames per second by default. A late reply is dropped and never overwrites newer data.',
      caption:
        'One sample, step by step. Nothing on this path waits for the screen or for a slow adapter.',
    },
    isolation: {
      alt: 'The dgxtop process, with the terminal, the manager, the supervisor, two collector workers, state, history and store workers, is connected by pipes to seven child processes started as dgxtop --adapter-host <name>. Frames are length-prefixed JSON of at most 1 MiB, with a handshake nonce. The nvml child is marked stuck: a read misses its 500 ms deadline, late replies are dropped, and after 3 failures the supervisor backs off 1, 2 and 4 seconds up to 60, restarts the child with shutdown, SIGTERM, SIGKILL and reap, and quarantines it if it cannot be reaped. CPU, memory, disks and network keep updating.',
      caption:
        'Each hardware interface runs in its own child process, so a driver call that hangs stalls only that child.',
    },
    'source-arbitration': {
      alt: 'An example with illustrative values. hwmon package 0 and the package thermal zone both read 68 °C from the same sensor, and a SoC thermal zone reads 42 °C. The collector applies five rules: the same metric key of host, boot, entity, metric and scope; units are checked and a fault or unsupported value never becomes 0; the same sensor counts once; candidates are ranked by quality grade, priority, newest read and source ID; sources more than 8 °C apart are a conflict and never averaged. The result is the CPU package at 68 °C from hwmon package 0, ok; the SoC reading is another metric. A challenger takes over only after 3 good reads and at least 5 seconds.',
      caption:
        'How one value is chosen when several sources report it. The values are illustrative.',
    },
    'history-tiers': {
      alt: 'One sample per second goes into 5-second buckets, 120 of them for the last 10 minutes, and then into twelve bar sizes that each keep their latest 300 bars: 1 minute reaches 5 hours, 5 minutes 25 hours, 10 minutes 50 hours, 30 minutes 6 days, 1 hour 12 days, 2 hours 25 days, 4 hours 50 days, 6 hours 75 days, 8 hours 100 days, 12 hours 150 days, 18 hours 225 days and 24 hours 300 days. A bucket holds its start on the local clock, the time covered, the sum of value times time, the minimum, the maximum and the samples merged; its mean is that sum divided by the time covered, and time without data stays a gap. The bars go to history_tiers.sqlite3, about 40 MiB, and minute rows to history.sqlite3, 7 days, at most 1 GiB.',
      caption:
        'Overview History stores one series at twelve bar sizes. Long bars come from merged buckets, not from resampling the screen.',
    },
    'process-history': {
      alt: 'The five stages of a run. Seen: NVML lists the process on a GPU, identified by PID, start time and boot. Followed: a read-only probe of stat, io, threads and files, with the command line and folder read once, up to 64 processes at a time. Recorded: CPU, RSS, GPU use, GPU memory, disk reads and writes and host network. Ended: with an exit code, by SIGTERM or SIGKILL, stopped from dgxtop, most likely by the OOM killer, or while dgxtop was off. Kept: the latest 512 runs listed, about 40 MiB on disk, the oldest ended runs first to go. Recent buckets are saved to process_recent.json every 30 seconds, and bars of 1 minute to 24 hours to process_history.sqlite3.',
      caption:
        'Every GPU process becomes a run, recorded from the first time NVML lists it until it ends.',
    },
    'gpu-memory': {
      alt: 'An example with illustrative values on a DGX Spark with 122 GiB of RAM shared with the GPU. The memory bar splits into OS 11.6 GiB, vllm.api_server 40 GiB, train_supervisor 18 GiB, ComfyUI/main 6 GiB and free. Processes are named by what they run: python -m vllm.entrypoints.openai.api_server becomes vllm.api_server, python train_supervisor.py becomes train_supervisor, and python main.py in a ComfyUI folder becomes ComfyUI/main. Eight colors: the color is an FNV-1a hash of the name and is kept when the job or dgxtop restarts; a taken color moves on to the next free one; with all eight in use, a newcomer needs twice the smallest one’s memory plus 256 MiB. The memory bar, the GPU memory chart and the process table share the colors.',
      caption:
        'Each GPU job keeps one color everywhere it appears. The values are illustrative.',
    },
    'safe-actions': {
      alt: 'A sequence between you, the Manager, the action worker, audit.sqlite3 and the Linux kernel. You press K for SIGTERM or F9 for SIGKILL on the selected row; the Manager checks that it is the same user, not root, not PID 1 and not dgxtop itself; the worker opens a pidfd and checks the start time, user and namespace again; you get a one-time confirmation valid for 10 seconds; on y or Enter the intent is written first, with WAL and synchronous=FULL; the signal goes out with pidfd_send_signal, never by PID; the outcome is recorded and the exit watched for 10 seconds. Refused: read-only mode, another user’s process, a reused PID, or an audit log that cannot be written.',
      caption:
        'Stopping a process takes two steps and sends exactly one signal, through a pidfd.',
    },
    budgets: {
      alt: 'A 256 MiB budget split into raw history 144 MiB, aggregates 32, catalog 24, reserve 20, live state 16, views 12 and ingress 8. Caps: 128 commands, where a full queue answers busy; 32 batches and 8 MiB of readings in flight; pipe frames of at most 1 MiB, 256 records and depth 32; 512 series and 2048 sources with at most 4 candidates each; 256 processes and 1024 GPU process links; views at 4 frames per second by default, from 1 to 20, and at most 2 sessions. Overload moves from normal to pressured, throttled and recovering, and back to normal; under load dgxtop samples less often, and the footer shows the effective interval.',
      caption:
        'Every queue and every store has a limit, and dgxtop says when it slows down.',
    },
    storage: {
      alt: 'Files under the default XDG paths, with directories 0700 and files 0600. ~/.config/dgxtop/v2/ holds config.json, written to a temporary file and then renamed. ~/.local/state/dgxtop/v2/ holds history_tiers.sqlite3, bars of 1 minute to 24 hours, about 40 MiB; history.sqlite3, minute rows, 7 days, at most 1 GiB; process_history.sqlite3, GPU process runs, about 40 MiB; process_recent.json, the latest 5-second buckets every 30 seconds; audit.sqlite3, process actions, 30 days, at most 128 MiB, synchronous=FULL; and dgxtop.log and instance.lock, one dgxtop per state directory. Rules: every database and the log have a size limit and the oldest data goes first; each database records its format, and one in another format is recreated, never migrated; symlinked paths are refused; environment variables are never read or stored.',
      caption:
        'Everything dgxtop writes, where it goes and how large it can grow.',
    },
    crates: {
      alt: 'Eleven crates in three tiers. At the top, dgxtop: the command line, startup and wiring. In the middle, adapters, collectors, state, history, compression, store, manager, ui and runtime. At the bottom, core: types, views and ports, with no I/O. Every middle crate depends only on core; the one exception is history using compression. dgxtop depends on all of them but compression. The rule is checked in CI by scripts/check_boundaries.py and the contract tests.',
      caption: 'The workspace and its one dependency rule.',
    },
  },
  tech: {
    'data-path': {
      intro:
        'Every second, readings take the same eight steps from the kernel to your terminal, and no step waits for the screen or for a slow adapter.',
      points: [
        {
          title: 'Scheduling.',
          text: 'The Manager keeps each group of reads on its own clock: the main group every second, capacity and slow health readings every 5 seconds, device discovery every 10 seconds, and a recheck of unsupported sources every minute. A missed slot is never replayed, and a group still running when its next slot comes is counted as skipped instead of queuing behind itself.',
        },
        {
          title: 'Requests.',
          text: 'Each read plan carries a deadline 500 ms ahead and the adapter’s generation. The supervisor writes it to that adapter’s pipe, and adapters answer in pages, so no request names more than 256 sources.',
        },
        {
          title: 'Readings.',
          text: 'An adapter returns a value or a status: unsupported, permission denied, timeout, error or removed. A failed read never becomes 0.',
        },
        {
          title: 'Collection.',
          text: 'Two collector workers normalize units, turn counters into rates, choose one source for each metric and fold each process into one record.',
        },
        {
          title: 'One writer.',
          text: 'The state actor is the only writer. It checks a commit in full (epoch, base revision, values, units and memory) before changing anything, passes it to the history, and only then publishes one new immutable snapshot. Readers never hold a mutable handle, and a value on the screen is already in the history.',
        },
        {
          title: 'Drawing.',
          text: 'The Manager builds the views from the latest snapshot and the history. The viewer draws new data 4 times a second by default (configurable from 1 to 20), 2 times while dgxtop is under pressure, and redraws at once after a key or a resize, at most 20 times a second.',
        },
        {
          title: 'Late replies.',
          text: 'A reply that comes after its deadline or from an older adapter generation is dropped, and a value older than three sampling periods is marked stale.',
        },
      ],
    },
    isolation: {
      intro:
        'A call into a driver can block, and a blocked call freezes the thread that made it. So dgxtop makes those calls neither on the screen’s thread nor in its own process.',
      points: [
        {
          title: 'Seven children.',
          text: (
            <>
              procfs, hwmon, thermal, powercap, nvml, network and filesystem
              each run in a child process: the same binary, started as{' '}
              {code('dgxtop --adapter-host <name>')}, at most 8 of them.
            </>
          ),
        },
        {
          title: 'Framed pipes.',
          text: 'Each child talks to the supervisor over its own pipes, in frames of a 4-byte length and JSON: at most 1 MiB on the wire and 4 MiB decoded, nested at most 32 deep, 256 records per batch. A handshake nonce and a generation number make sure a reply from an older child is never taken for a new one.',
        },
        {
          title: 'Back-off.',
          text: 'After 3 failures in a row the supervisor waits 1, 2, 4 and up to 60 seconds, with ±10 % jitter, before it starts the child again.',
        },
        {
          title: 'Clean stops.',
          text: 'A child is stopped in steps: a shutdown request with 200 ms of grace, SIGTERM and another 200 ms, then SIGKILL and up to 1 second to reap it. A child that cannot be reaped is quarantined and never started again, so stuck processes never pile up.',
        },
        {
          title: 'Threads, not async.',
          text: 'The main process runs no async runtime. The terminal runs on the main thread beside named threads for the manager, the supervisor, the log and signals, two collector workers, and small actors for state, history, the audit log, process actions and the process probe. They talk over bounded crossbeam channels; no queue anywhere is unbounded.',
        },
        {
          title: 'In view.',
          text: 'Settings lists each adapter process with its state, its last success and its back-off.',
        },
      ],
    },
    sources: {
      intro:
        'One quantity often has several sources: a CPU temperature can come from hwmon and from a thermal zone. dgxtop shows one value per metric and never averages sources.',
      points: [
        {
          title: 'One key.',
          text: 'A metric key names the host, the boot, the entity, the metric and its scope. Only readings with the same key compete, so a SoC temperature never competes with the CPU package.',
        },
        {
          title: 'Four labels on every value.',
          text: 'Each value carries its read status, its kind (measured, derived or estimated), a quality grade (verified, usable, suspect, unknown or invalid) and its freshness. Only verified and usable values can stand for the metric.',
        },
        {
          title: 'A fixed order.',
          text: 'Units are normalized and checked. A sensor confirmed to be the same one seen through two interfaces counts once; equal values alone never prove it. The rest are ranked by quality grade, then the source’s priority, then the newest read, then the source ID. At most 4 candidates are compared, and the result never depends on the order in which readings arrive.',
        },
        {
          title: 'Conflicts, not averages.',
          text: 'When two different sensors disagree by more than a tolerance (8 °C for temperatures), dgxtop marks a conflict instead of averaging them.',
        },
        {
          title: 'No flapping.',
          text: 'A better source takes over only after it wins 3 rounds in a row over at least 5 seconds.',
        },
        {
          title: 'Repeatable.',
          text: 'The arbitration does no I/O, holds no state and records why each value won, so the same readings always give the same answer.',
        },
      ],
    },
    history: {
      intro:
        'Overview History keeps months of data in a fixed space: every series is stored at twelve bar sizes, and each size keeps its latest 300 bars.',
      points: [
        {
          title: 'Buckets.',
          text: 'Each sample lands in a 5-second bucket, and the latest 120 buckets cover the last 10 minutes. A bucket stores its start, the time it covers, the sum of value × time, the minimum, the maximum and the number of samples it merged.',
        },
        {
          title: 'Twelve bar sizes.',
          text: 'Buckets merge into bars of 1, 5, 10 and 30 minutes and of 1, 2, 4, 6, 8, 12, 18 and 24 hours. At 300 bars each, 1-minute bars reach back 5 hours and 24-hour bars about 300 days.',
        },
        {
          title: 'Time-weighted means.',
          text: 'A bar’s mean is its sum of value × time divided by the time it covers, so a bar with a gap is not diluted, and time without data stays a gap instead of becoming 0.',
        },
        {
          title: 'The local clock.',
          text: 'Bars follow the local clock: hours start on the hour where you are, and a 24-hour bar runs from local midnight to midnight.',
        },
        {
          title: 'On disk.',
          text: 'The bars live in history_tiers.sqlite3 within about 40 MiB, and minute rows also go to history.sqlite3 for 7 days, up to 1 GiB. Both survive restarts; dgxtop records while it runs.',
        },
      ],
    },
    'process-history': {
      intro:
        'Process History follows each GPU process from the first time NVML lists it until it ends, without root and without scanning /proc.',
      points: [
        {
          title: 'Identity.',
          text: 'A run is a PID together with the process’s start time and the boot it runs in, so a reused PID never continues another process’s run.',
        },
        {
          title: 'A read-only probe.',
          text: (
            <>
              For up to 64 processes at a time it reads{' '}
              {code('/proc/<pid>/stat')}, {code('io')} and {code('status')},
              counts open files every 10 seconds, and reads the command line,
              working folder, program and cgroup once, at most 4096 bytes each.
            </>
          ),
        },
        {
          title: 'What a run records.',
          text: 'CPU, resident memory, GPU use, GPU memory, disk reads and writes and the host’s network, in 5-second buckets and the same twelve bar sizes as Overview History.',
        },
        {
          title: 'How it ended.',
          text: 'dgxtop works out the end from what an ordinary user can see: its own signal, if it sent one in the last 60 seconds; the OOM killer, when the kernel’s oom_kill count rose and the process died by SIGKILL or left no status; otherwise the exit code or signal read while it was a zombie. A run still open when dgxtop stopped is marked as ended while dgxtop was off.',
        },
        {
          title: 'What is kept.',
          text: 'Recent buckets are saved to process_recent.json every 30 seconds and runs to process_history.sqlite3 within about 40 MiB. The list shows the latest 512 runs, and the oldest ended runs go first.',
        },
      ],
    },
    'gpu-memory': {
      intro:
        'dgxtop gives each of the processes holding the most GPU memory a color and keeps it stable, so one job can be followed across the memory bars, the charts and the process table.',
      points: [
        {
          title: 'Names that say what runs.',
          text: (
            <>
              A process is named by what it runs: the module of{' '}
              {code('python -m')} ({code('vllm.entrypoints.openai.api_server')}{' '}
              → {code('vllm.api_server')}), the script (
              {code('train_supervisor.py')} → {code('train_supervisor')}), the
              full program name when the kernel’s 15-byte {code('comm')} cut it
              short, and the folder for generic names ({code('main.py')} in{' '}
              {code('ComfyUI')} → {code('ComfyUI/main')}). Only that name is
              kept, cleaned of control characters.
            </>
          ),
        },
        {
          title: 'Stable colors.',
          text: 'The color is an FNV-1a hash of the name over eight colors, so a job keeps its color when it or dgxtop restarts. When that color is taken, the next free one is used.',
        },
        {
          title: 'No flicker.',
          text: 'With all eight colors in use, a newcomer takes the place of the smallest only if it holds twice as much memory plus 256 MiB. dgxtop tracks 16 processes, twice the colors, so a job that just exited keeps its color for a while.',
        },
        {
          title: 'Unified memory.',
          text: 'On a DGX Spark the GPU shares the system’s memory, so the RAM bar splits into the system’s share and each GPU process’s share, in its color.',
        },
      ],
    },
    actions: {
      intro:
        'Stopping a GPU job from dgxtop takes two steps and sends exactly one signal, and every attempt is on record.',
      points: [
        {
          title: 'Whose processes.',
          text: (
            <>
              Only your own, never PID 1 or dgxtop itself, and never from a root
              session. SIGKILL is allowed by default and can be turned off;{' '}
              {code('--read-only')} turns every action off.
            </>
          ),
        },
        {
          title: 'Two steps.',
          text: (
            <>
              {code('K')} (SIGTERM) or {code('F9')} (SIGKILL) asks first. The
              confirmation names that one process, expires after 10 seconds, and
              at most 8 can wait at once.
            </>
          ),
        },
        {
          title: 'A pidfd, not a PID.',
          text: (
            <>
              dgxtop opens a pidfd, checks the start time, user and namespace
              again, and signals through {code('pidfd_send_signal')}, so a PID
              reused in the meantime is never hit.
            </>
          ),
        },
        {
          title: 'Intent first.',
          text: 'The intent is written to audit.sqlite3 (WAL, synchronous=FULL) before the signal goes out, and the outcome after it; if the intent cannot be written within 1 second, nothing is sent. If dgxtop stops between the two, the outcome stays unknown and the signal is never sent again.',
        },
        {
          title: 'After the signal.',
          text: 'dgxtop watches the process for 10 seconds, every 250 ms, and the run in Process History records that it was stopped from dgxtop.',
        },
      ],
    },
    limits: {
      intro:
        'dgxtop is meant to run for months beside the jobs it watches, so nothing in it grows without bound.',
      points: [
        {
          title: 'One memory budget.',
          text: 'Its data lives in a fixed 256 MiB, split in advance: raw history 144 MiB, aggregates 32, catalog 24, reserve 20, live state 16, views 12 and incoming readings 8. Memory is reserved before it is used.',
        },
        {
          title: 'Every queue has a cap.',
          text: 'A full command queue (128) answers busy instead of growing, and readings in flight stop at 32 batches and 8 MiB. dgxtop tracks at most 512 series, 2048 sources with 4 candidates per metric, 256 processes and 1024 GPU process links, and allows 2 view sessions.',
        },
        {
          title: 'Pressured.',
          text: 'When a queue stays 75 % full, or a round of work takes longer than the sampling period, for at least 3 seconds, dgxtop is pressured and draws at most 2 frames a second.',
        },
        {
          title: 'Throttled.',
          text: 'When memory reaches 90 % of the budget or incoming readings stay full, dgxtop is throttled: it samples the main group 2 times, then 4 times, less often.',
        },
        {
          title: 'Recovering, in the open.',
          text: 'Once queues are under 50 % and memory under 75 %, dgxtop steps back one level at a time, at most every 30 seconds. The footer shows the effective interval whenever it differs from the one you set.',
        },
      ],
    },
    storage: {
      intro:
        'dgxtop writes only under your XDG config and state directories, with permissions that let only you read them.',
      points: [
        {
          title: 'Private by default.',
          text: 'Directories are created 0700 and files 0600, and a path that runs through a symlink is refused. One dgxtop runs per state directory, guarded by instance.lock.',
        },
        {
          title: 'Atomic settings.',
          text: 'config.json is written to a new temporary file (0600, created exclusively), synced, renamed over the old file, and the directory is synced, so a crash never leaves half a file.',
        },
        {
          title: 'Formats, not migrations.',
          text: 'Each database records its format in the SQLite application_id. A database in another format, such as one from v2.0, is recreated empty instead of migrated.',
        },
        {
          title: 'Durable where it matters.',
          text: 'audit.sqlite3 syncs every write (synchronous=FULL). The history databases use WAL with synchronous=NORMAL: a power cut can lose the last moments of history, but they sync far less often.',
        },
        {
          title: 'Private data.',
          text: 'No network access and no telemetry. Process History keeps the command lines, working folders and programs of GPU processes; environment variables are never read.',
        },
      ],
      table: {
        head: ['File', 'Holds', 'Limit'],
        rows: [
          ['config.json', 'settings', '—'],
          [
            'history_tiers.sqlite3',
            'Overview History bars, 1 minute to 24 hours',
            'about 40 MiB',
          ],
          ['history.sqlite3', 'minute rows', '7 days and 1 GiB by default'],
          [
            'process_history.sqlite3',
            'Process History runs and their bars',
            'about 40 MiB',
          ],
          [
            'process_recent.json',
            'recent 5-second buckets of GPU processes, saved every 30 s',
            'recent buckets only',
          ],
          [
            'audit.sqlite3',
            'process actions, the intent before the outcome',
            '30 days, 128 MiB',
          ],
          ['dgxtop.log', 'the log', 'rotates at 10 MiB, 3 files'],
          ['instance.lock', 'one dgxtop per state directory', '—'],
        ],
      },
    },
    code: {
      intro:
        'The code is a Rust workspace of eleven crates around one shared contract crate.',
      points: [
        {
          title: 'One dependency rule.',
          text: 'Every crate depends only on dgxtop-core, which holds the shared types, views and ports and does no I/O. The one exception is history using the pure compression crate, and only the dgxtop crate wires the others together.',
        },
        {
          title: 'Checked in CI.',
          text: (
            <>
              {code('scripts/check_boundaries.py')} checks the rule in CI, next
              to {code('cargo fmt')}, {code('clippy')} with warnings as errors,
              and the tests on x86_64 and aarch64.
            </>
          ),
        },
        {
          title: 'Released by CI.',
          text: 'A release is built on Ubuntu 22.04 for x86_64 and aarch64 and published with SHA256SUMS. The installer then installs it on Ubuntu 22.04 and 24.04 on both architectures, Debian 12 and Rocky 9, and must refuse Alpine’s musl.',
        },
      ],
      table: {
        head: ['Crate', 'Contains'],
        rows: crateRows([
          'The program: command line, modes, startup and wiring',
          'Shared types: metrics, commands, views and the interfaces between components',
          'Background processes, IPC, queues, the log, the terminal and the time zone',
          'procfs, hwmon, thermal, powercap, NVML, network, filesystems, the process probe and process actions',
          'Metrics from readings: rates, source selection and process records',
          'The live snapshot and the short trends',
          'Overview History, Process History and what each keeps',
          'Bars from 1 minute to 24 hours',
          'SQLite databases and files',
          'Scheduling, settings, sessions, process actions and views',
          'Screens, widgets and the key map',
        ]),
      },
    },
  },
};

const zh: DgxtopCopy = {
  eyebrow: '工具 · Rust · Ratatui · 2026-10-12 更新',
  lead: 'dgxtop 是 NVIDIA GPU 的終端監控工具。一個畫面就能看到每張 GPU 的使用率、記憶體、溫度、功耗與時脈，每個工作佔用多少記憶體（各有自己的顏色），以及整台機器的 CPU、記憶體、磁碟與網路。每個 GPU 工作從開始到結束都有紀錄，包括命令列、記憶體峰值與結束方式；歷史寫入磁碟，重開之後還在。它為 DGX Spark 打造，也能在任何裝有 NVIDIA GPU 的 Linux 主機上使用。',
  facts: {
    stack: 'Rust 1.92 · Ratatui · crossterm · NVML · SQLite',
    platforms:
      'Linux x86_64／aarch64（glibc 2.34 以上）· 已在 DGX Spark（GB10）與 RTX 5080 + RTX 3060 工作站上測試',
    status: 'v2.1，2026-10-12 發佈',
  },
  sectionsLabel: '章節',
  openImage: '開啟原尺寸圖片',
  sections: {
    install: '安裝',
    features: '功能',
    screens: '畫面',
    capabilities: '能力',
    architecture: '架構',
    'data-path': '一筆資料的路徑',
    isolation: 'Adapter 子程序',
    sources: '來源仲裁',
    history: '分層歷史',
    'process-history': '程序歷史的運作',
    'gpu-memory': '各程序的 GPU 記憶體',
    actions: '安全的程序操作',
    limits: '上限與過載',
    storage: '磁碟上的檔案',
    code: '程式碼結構',
  },
  shots: {
    'dgx-spark-overview.webp': {
      alt: 'DGX Spark 上的 dgxtop 總覽：CPU、分成系統與兩個上色 GPU 程序的統一記憶體、GB10 GPU、磁碟與網路表格，以及 GPU 程序表',
      caption:
        'DGX Spark 上的總覽。GB10 與 CPU 共用記憶體，所以 RAM 長條會分出系統佔用的部分，以及每個 GPU 程序各自上色的部分。',
    },
    'workstation-overview.webp': {
      alt: '雙 GPU 工作站上的總覽：使用率 97% 的 RTX 5080 與 RTX 3060、磁碟與網路表格，以及四個各有顏色的 GPU 程序',
      caption:
        '工作站上的兩張 GPU。每個 GPU 程序在記憶體長條、圖表與程序表中都用同一種顏色。',
    },
    'dgx-spark-gpu.webp': {
      alt: 'GB10 的 GPU 頁面：狀態、時脈、統一記憶體、PCIe、NVLink-C2C、溫度門檻、功耗與耗電量、CUDA 13.0、驅動與 Linux 核心、裝置、PCI 與韌體、拓樸',
      caption:
        'GB10 的 GPU 頁面，有統一記憶體與 NVLink-C2C。GPU 沒有回報的值就不列出。UUID 已遮蔽。',
    },
    'workstation-gpu.webp': {
      alt: '滿載 RTX 5080 的 GPU 頁面：受功耗上限限制的狀態、時脈、VRAM 與 BAR1、PCIe Gen5、風扇與溫度門檻、功耗上限、CUDA 13.4、驅動、裝置、韌體，以及到第二張 GPU 的路徑',
      caption:
        '同一個頁面在滿載的 RTX 5080 上：受功耗上限限制，並列出 VRAM、PCIe Gen5 x16、風扇、功耗上限，以及到第二張 GPU 的路徑。序號與 UUID 已遮蔽。',
    },
    'workstation-overview-history.webp': {
      alt: '雙 GPU 工作站以 1 分鐘長條呈現的總覽歷史：CPU、記憶體、GPU 使用率、GPU 記憶體、GPU 溫度、GPU 功耗與耗電量、磁碟與網路，以及每張 GPU 的平均與峰值表',
      caption:
        '以 1 分鐘長條呈現的總覽歷史：每張圖都有目前值、平均與最大值，下方是每張 GPU 的平均、峰值與耗電量。',
    },
    'workstation-process-history.webp': {
      alt: '程序歷史列出 GPU 程序的執行：開始時間、PID、名稱、GPU、執行時間、GPU 記憶體與 RAM 峰值、GPU 與 CPU 使用率，以及執行中或已結束的狀態',
      caption:
        '程序歷史：每個 GPU 程序都是一次執行，最新的在最上面，列出執行時間、峰值與結束方式。',
    },
    'workstation-process-run.webp': {
      alt: '打開的一次執行：PID、名稱、GPU、開始、結束、執行時間與使用者，接著是 CPU、記憶體、GPU 使用率、GPU 記憶體、執行緒與開啟的檔案、磁碟與網路的圖表',
      caption:
        '打開的一次執行與它的圖表。命令列可以完整顯示與複製；這裡的目錄、程式、cgroup 與命令列已遮蔽。',
    },
  },
  install: {
    platforms:
      '支援 x86_64 或 aarch64 的 Linux，glibc 2.34 以上（Ubuntu 22.04、Debian 12、RHEL 9 及更新版本），包括 DGX Spark。WSL 2 可以執行 Linux 版。GPU 指標需要 NVIDIA 驅動；沒有驅動時，CPU、記憶體、磁碟與網路照常顯示。不支援 WSL 1、musl、macOS 與 Windows。',
    installer: (
      <>
        安裝程式會依 CPU 選擇對應的版本，以 release 的 {code('SHA256SUMS')}{' '}
        驗證後安裝到 {code('~/.local/bin')}。舊版本會保留，執行{' '}
        {code('./install.sh --rollback')} 就能還原。
      </>
    ),
    source: '原始碼、完整用法與所有版本：',
  },
  features: {
    intro:
      'htop 以 CPU 為主，nvtop 和 nvidia-smi 只在你盯著的時候顯示 GPU。dgxtop 以 GPU 為主，顯示每個工作佔用多少 GPU 記憶體，並記錄每個 GPU 工作與整台機器。',
    points: [
      {
        title: '一眼看完所有 GPU。',
        text: '每張 GPU 的使用率、記憶體、溫度、功耗、時脈與風扇，附即時圖表。量表低於 50% 是綠色，接近紅線（預設 80%）時由橘轉紅。',
      },
      {
        title: '依程序區分記憶體。',
        text: '佔用 GPU 記憶體最多的八個程序各有一種顏色，記憶體長條、圖表與程序表都用同一種顏色，一眼看出哪個工作佔用多少。顏色由程序名稱決定，所以工作或 dgxtop 重開後顏色不變，除非另一個列出的程序已經佔用那個顏色。',
      },
      {
        title: '用實際執行的程式命名。',
        text: (
          <>
            {code('python -m vllm.entrypoints.openai.api_server')} 顯示為{' '}
            {code('vllm.api_server')}，在 {code('ComfyUI')} 資料夾執行的{' '}
            {code('python main.py')} 顯示為 {code('ComfyUI/main')}，而不是{' '}
            {code('python3')}。
          </>
        ),
      },
      {
        title: 'GPU 程序。',
        text: (
          <>
            所有使用 GPU 的程序，以及所在的 GPU、類型（運算或圖形）、GPU
            使用率、GPU 記憶體、CPU 與 RAM。可依任一欄排序、依 GPU
            或名稱篩選，確認後用 {code('K')}（SIGTERM）或 {code('F9')}
            （SIGKILL）結束程序。
          </>
        ),
      },
      {
        title: '程序歷史（Process History）。',
        text: '每個 GPU 程序從開始到結束都記錄成一次執行：執行時間、GPU 記憶體與 RAM 峰值、GPU 與 CPU 使用率，以及結束方式：以結束碼結束、被訊號終止、從 dgxtop 結束、很可能是 OOM killer，或仍在執行。打開一次執行，可以看到完整命令列、工作目錄，以及 CPU、記憶體、GPU、執行緒、開啟的檔案、磁碟與網路的圖表。',
      },
      {
        title: '總覽歷史（Overview History）。',
        text: 'CPU、記憶體、每張 GPU 的使用率、記憶體、溫度與功耗、磁碟與網路，以 1 分鐘到 24 小時、對齊本地時間的長條呈現；每張圖都有目前值、平均與最大值，並列出每張 GPU 的平均、峰值與耗電量。',
      },
      {
        title: '完整的 GPU 細節。',
        text: '一次看一張 GPU，列出驅動回報的所有資訊；GPU 不回報的值不會佔一行：',
        list: [
          '效能狀態、降頻原因與降頻時間、時脈',
          '記憶體與記憶體匯流排、PCIe 連線與流量、NVLink-C2C',
          '溫度上限、風扇、功耗上限與耗電量',
          'CUDA、驅動、NVML 與 Linux 核心版本',
          '裝置、PCI 與韌體、NUMA 與 CPU 親和性、P2P 路徑',
        ],
      },
      {
        title: '整台機器。',
        text: '每顆核心的 CPU 使用率、CPU 溫度，以及每種核心目前與最高的頻率；記憶體、swap、緩衝區與快取；磁碟的可用空間、IOPS、延遲與硬碟溫度；網路流量、錯誤與丟包。',
      },
      {
        title: '為 DGX Spark 打造。',
        text: '在 GB10 的統一記憶體上，RAM 長條會分出系統佔用與每個 GPU 工作佔用的部分。dgxtop 也會讀取 GB10 的 CPU 叢集溫度與 NVLink-C2C 連線，並提供原生 aarch64 版本。',
      },
      {
        title: '程式內設定。',
        text: '調整採樣間隔與顯示模組，並查看每個資料來源的狀態。每項設定都顯示儲存值與生效值、來源，以及是立即生效還是重開後生效。',
      },
    ],
  },
  screens: {
    intro:
      '總覽、GPU 頁面、總覽歷史，以及程序歷史與打開的一次執行，截自實際測試的兩台機器。',
  },
  capabilities: [
    {
      title: '一台機器多張 GPU。',
      text: '已在 DGX Spark（GB10）與裝有 RTX 5080 和 RTX 3060 的工作站上測試。',
    },
    {
      title: '長久保存的歷史。',
      text: '歷史寫入磁碟，重開程式或重開機都還在，沒有保存期限：每種長條保留最新的 300 條，所以 1 分鐘長條涵蓋最近 5 小時，24 小時長條大約 10 個月。程序歷史列出最新的 512 次執行。dgxtop 在執行期間記錄。',
    },
    {
      title: '輕量。',
      text: '以 Rust 撰寫。預設每秒繪製 4 次新資料，資料使用量固定在 256 MiB 以內。',
    },
    {
      title: '任何終端尺寸。',
      text: '寬版、單欄與精簡版面，最小到 40×10。支援鍵盤與滑鼠，有四種配色主題。',
    },
    {
      title: '隱私。',
      text: '不連網，也不回傳任何資料。設定與歷史是只有你能讀的檔案。程序歷史會保存 GPU 程序的命令列、工作目錄與程式；環境變數從不儲存。',
    },
    {
      title: '安全的程序操作。',
      text: (
        <>
          只能操作自己的程序，root
          工作階段不能操作，而且要在會過期的確認之後才執行。訊號經由 pidfd
          送出，不會誤送到重複使用的 PID，每次操作都有紀錄。
          {code('--read-only')} 可以關閉程序操作。
        </>
      ),
    },
    {
      title: '安全升級。',
      text: '安裝程式會驗證每個下載的檔案，並保留上一版，一個指令就能還原。',
    },
  ],
  architecture: {
    intro:
      'dgxtop 是單一程式。Adapter 在各自的背景程序中讀取硬體，讀值沿著資料路徑往下流，Manager 再把它們整理成畫面要繪製的內容。每次的快照也會送進歷史；你的按鍵與指令則走控制路徑。',
    diagram: {
      title: '架構：同一個程式裡的三條路徑',
      text: '實線標示資料與歷史路徑，虛線標示控制路徑。',
      data: '資料路徑',
      history: '歷史路徑',
      control: '控制路徑',
      adapters: '各自在背景程序中執行',
      dataNodes: [
        ['Linux + NVIDIA 驅動', '/proc · sysfs · NVML'],
        ['Adapters', ''],
        ['Collectors', '單位 · 來源 · 速率'],
        ['State', '即時快照 · 短期趨勢'],
        ['Manager', '讀取 State 與 History · 畫面資料'],
        ['Viewer', '畫面 · Ratatui'],
      ],
      historyNodes: [
        ['State', '每次提交的快照'],
        ['History', '總覽歷史 · 程序歷史'],
        ['Compression', '1 分鐘到 24 小時的長條'],
        ['Store', 'SQLite · 檔案'],
      ],
      controlNodes: [
        ['Viewer', '按鍵 · 滑鼠 · 命令列'],
        ['Manager', '檢查每個指令'],
        ['設定 · 採樣 · 程序操作', 'pidfd · 確認後 · 有紀錄'],
        ['Viewer', '顯示結果'],
      ],
    },
    components: {
      head: ['元件', '功能'],
      rows: [
        [
          'Adapters',
          '讀取硬體：/proc、hwmon、thermal zone、powercap、GPU 的 NVML、網路與檔案系統，各自在背景程序中執行。唯讀的探測器會追蹤每個 GPU 程序。',
        ],
        [
          'Collectors',
          '把原始讀值整理成指標：單位、每個值的最佳來源、由計數器算出的速率，每個程序一筆紀錄。',
        ],
        ['State', '保存即時快照與短期趨勢，只放在記憶體中。'],
        ['History', '保存總覽歷史與程序歷史，並決定保留什麼、淘汰什麼。'],
        ['Compression', '把樣本合併成 1 分鐘到 24 小時、對齊本地時間的長條。'],
        ['Store', '讀寫 SQLite 資料庫與檔案，只執行收到的請求。'],
        [
          'Manager',
          '排定採樣、套用設定、檢查指令與程序操作，並產生畫面資料。本身不保存資料。',
        ],
        [
          'Viewer',
          '用 Manager 產生的畫面資料，以 Ratatui 繪製畫面，並把按鍵與滑鼠點擊轉成指令。',
        ],
        [
          'Runtime',
          '管理 adapter 程序、它們的 IPC 與有上限的佇列、日誌與終端。',
        ],
      ],
    },
    next: '接下來的章節先跟著一筆資料走過這個架構，再逐一說明每個部分在 v2.1 中的實作。',
  },
  generated: { title: 'GPT 生成', alt: 'GPT 生成的示意圖：' },
  diagrams: {
    architecture: {
      alt: 'dgxtop 的架構。Linux 核心與 NVIDIA 驅動提供資料給七個 adapter 子程序：procfs、hwmon、thermal、powercap、nvml、network 與 filesystem。在 dgxtop 主程序中，讀值從 Supervisor 經過 Collectors 與 State，流向 History 與 Compression，History 再寫入 Store。State 與 History 提供資料給 Manager，Manager 再提供給 Viewer；程序探測的結果送進 History。按鍵與滑鼠進入 Manager，由它透過 pidfd 與操作紀錄執行程序操作。',
      caption:
        '整個程式：七個 adapter 子程序讀取硬體，主程序把讀值變成畫面、歷史與磁碟上的檔案。實線傳遞資料，虛線傳遞指令。',
    },
    'one-sample': {
      alt: '一筆資料從核心到畫面的八個步驟。Manager 每秒排程一次讀取，期限 500 ms；Supervisor 經由管線送到 adapter 子程序；adapter 讀取 /proc/stat、meminfo 或 NVML；collectors 統一單位、選出最佳來源，並把計數器換算成速率；State 由單一寫入者提交一份快照；History 保存 5 秒桶與 1 分鐘到 24 小時的長條；Manager 產生畫面資料；Viewer 以 Ratatui 繪製，預設每秒 4 格。逾時的回覆一律丟棄，不會蓋過較新的資料。',
      caption:
        '一筆資料，一步一步。這條路徑上沒有任何一步會等畫面，也不會等慢下來的 adapter。',
    },
    isolation: {
      alt: 'dgxtop 主程序（包含終端、manager、supervisor、兩個 collector、state、history 與儲存工作執行緒）以管線連到七個以 dgxtop --adapter-host <name> 啟動的子程序。每一幀是長度前綴的 JSON，最大 1 MiB，並帶有握手 nonce。nvml 子程序被標示為卡住：讀取超過 500 ms 期限、逾時的回覆一律丟棄；連續失敗 3 次後，supervisor 以 1、2、4 秒直到 60 秒退避，依序以關閉、SIGTERM、SIGKILL、回收重啟它，無法回收就隔離。CPU、記憶體、磁碟與網路照常更新。',
      caption:
        '每個硬體介面都在自己的子程序裡執行，卡住的驅動呼叫只會拖住那一個子程序。',
    },
    'source-arbitration': {
      alt: '以示意數值舉例。hwmon package 0 與 package 的 thermal zone 都從同一個感測器讀到 68 °C，SoC 的 thermal zone 讀到 42 °C。Collector 依五條規則處理：相同的指標鍵（主機、開機、實體、指標、範圍）；檢查單位，故障或不支援的值絕不變成 0；同一個感測器只算一次；依品質等級、優先序、最新讀取與來源 ID 排序；相差超過 8 °C 就標示衝突，不取平均。結果是 CPU package 68 °C，來自 hwmon package 0，狀態正常；SoC 的讀值是另一個指標。挑戰者要連續 3 次正常讀取、且至少 5 秒後才會接手。',
      caption: '好幾個來源回報同一個量時，怎麼選出一個值。數值為示意。',
    },
    'history-tiers': {
      alt: '每秒一個樣本進入 5 秒的桶，120 個桶涵蓋最近 10 分鐘，再合併成十二種長條，每種保留最新的 300 條：1 分鐘可回溯 5 小時、5 分鐘 25 小時、10 分鐘 50 小時、30 分鐘 6 天、1 小時 12 天、2 小時 25 天、4 小時 50 天、6 小時 75 天、8 小時 100 天、12 小時 150 天、18 小時 225 天、24 小時 300 天。一個桶記錄對齊本地時間的起點、涵蓋時間、數值 × 時間的總和、最小值、最大值與合併的樣本數；平均是該總和除以涵蓋時間，沒有資料的時間保持空白。長條寫入 history_tiers.sqlite3，約 40 MiB；每分鐘的資料寫入 history.sqlite3，保留 7 天、最多 1 GiB。',
      caption:
        '總覽歷史把一條序列存成十二種長條。長的長條由合併的桶算出，不是把畫面重新取樣。',
    },
    'process-history': {
      alt: '一次執行的五個階段。出現：NVML 把程序列在某張 GPU 上，以 PID、啟動時間與開機識別。追蹤：以唯讀方式探測 stat、io、執行緒與檔案，命令列與目錄只讀一次，同時最多 64 個。記錄：CPU、RSS、GPU 使用率、GPU 記憶體、磁碟讀寫與主機網路。結束：以結束碼結束、被 SIGTERM 或 SIGKILL 終止、從 dgxtop 結束、很可能是 OOM killer，或在 dgxtop 關閉時結束。保留：列出最新的 512 次執行，磁碟約 40 MiB，最舊的已結束執行先讓出空間。最近的桶每 30 秒寫入 process_recent.json，1 分鐘到 24 小時的長條寫入 process_history.sqlite3。',
      caption:
        '每個 GPU 程序都成為一次執行，從 NVML 第一次列出它開始記錄，直到它結束。',
    },
    'gpu-memory': {
      alt: '以示意數值舉例，在 RAM 122 GiB、與 GPU 共用記憶體的 DGX Spark 上，記憶體長條分成 OS 11.6 GiB、vllm.api_server 40 GiB、train_supervisor 18 GiB、ComfyUI/main 6 GiB 與可用空間。程序以實際執行的程式命名：python -m vllm.entrypoints.openai.api_server 變成 vllm.api_server，python train_supervisor.py 變成 train_supervisor，ComfyUI 資料夾裡的 python main.py 變成 ComfyUI/main。八種顏色：顏色由名稱的 FNV-1a 雜湊決定，工作或 dgxtop 重開後不變；已被使用就改用下一個空著的顏色；八種都在用時，新程序需要最小者兩倍再加 256 MiB 的記憶體。記憶體長條、GPU 記憶體圖表與程序表使用相同的顏色。',
      caption: '每個 GPU 工作出現在哪裡都是同一種顏色。數值為示意。',
    },
    'safe-actions': {
      alt: '你、Manager、操作工作執行緒、audit.sqlite3 與 Linux 核心之間的流程。在選取的列按 K（SIGTERM）或 F9（SIGKILL）；Manager 確認是同一使用者、不是 root、不是 PID 1 也不是 dgxtop 本身；工作執行緒開啟 pidfd，再次核對啟動時間、使用者與 namespace；你會看到一次性、10 秒內有效的確認；按 y 或 Enter 後先寫入意圖（WAL、synchronous=FULL）；以 pidfd_send_signal 送出訊號，絕不經由 PID；記錄結果，並觀察 10 秒是否結束。以下情況會拒絕：唯讀模式、其他使用者的程序、PID 已被重用、操作紀錄無法寫入。',
      caption: '結束一個程序要兩個步驟，並且只透過 pidfd 送出一個訊號。',
    },
    budgets: {
      alt: '一份 256 MiB 的預算，分成原始歷史 144 MiB、彙總 32、目錄 24、保留 20、即時狀態 16、畫面資料 12 與輸入緩衝 8。上限：指令 128，滿了就回報忙碌；讀值同時 32 批、8 MiB；管線幀最大 1 MiB、256 筆、深度 32；序列 512、來源 2048，每個最多 4 個候選；程序 256、GPU 程序關聯 1024；畫面預設每秒 4 格（1 到 20）、最多 2 個工作階段。過載狀態從正常到吃緊、節流、恢復中，再回到正常；負載過重時 dgxtop 降低採樣頻率，底部會顯示實際的採樣間隔。',
      caption: '每條佇列與每個儲存都有上限，dgxtop 放慢時也會明確顯示。',
    },
    storage: {
      alt: '預設的 XDG 路徑，目錄 0700、檔案 0600。~/.config/dgxtop/v2/ 裡有 config.json，先寫入暫存檔再改名。~/.local/state/dgxtop/v2/ 裡有 history_tiers.sqlite3（1 分鐘到 24 小時的長條，約 40 MiB）、history.sqlite3（每分鐘的資料，7 天，最多 1 GiB）、process_history.sqlite3（GPU 程序的執行，約 40 MiB）、process_recent.json（最新的 5 秒桶，每 30 秒寫入）、audit.sqlite3（程序操作，30 天，最多 128 MiB，synchronous=FULL），以及 dgxtop.log 與 instance.lock（每個狀態目錄只跑一個 dgxtop）。規則：每個資料庫與日誌都有大小上限，最舊的資料先讓出空間；每個資料庫都記錄自己的格式，格式不同就重建，不做遷移；拒絕經過符號連結的路徑；從不讀取也不儲存環境變數。',
      caption: 'dgxtop 寫入的所有檔案：放在哪裡、最大能長到多大。',
    },
    crates: {
      alt: '十一個 crate 分成三層。最上層的 dgxtop 負責命令列、啟動與組裝；中間是 adapters、collectors、state、history、compression、store、manager、ui 與 runtime；最下層的 core 提供型別、畫面資料與介面，不做 I/O。中間的每個 crate 都只依賴 core，唯一的例外是 history 使用 compression。dgxtop 依賴 compression 以外的所有 crate。這條規則由 scripts/check_boundaries.py 與契約測試在 CI 中檢查。',
      caption: 'Workspace 與它唯一的依賴規則。',
    },
  },
  tech: {
    'data-path': {
      intro:
        '每秒鐘，讀值都走同樣的八個步驟，從核心到你的終端；沒有任何一步會等畫面，也不會等慢下來的 adapter。',
      points: [
        {
          title: '排程。',
          text: 'Manager 讓每組讀取各走各的時鐘：主要組每秒一次，容量與較慢的健康讀值每 5 秒，裝置探索每 10 秒，不支援的來源每分鐘重新確認一次。錯過的時段不補做；下一個時段到了還沒完成的組，記為略過，不會排在自己後面。',
        },
        {
          title: '請求。',
          text: '每份讀取計畫都帶著 500 ms 後的期限與 adapter 的世代編號。Supervisor 把它寫進該 adapter 的管線，adapter 分頁回覆，所以單一請求最多指定 256 個來源。',
        },
        {
          title: '讀值。',
          text: 'Adapter 回傳一個數值，或一個狀態：不支援、權限不足、逾時、錯誤或已移除。讀取失敗絕不會變成 0。',
        },
        {
          title: '整理。',
          text: '兩個 collector 工作執行緒統一單位、把計數器換算成速率、為每個指標選出一個來源，並把每個程序整理成一筆紀錄。',
        },
        {
          title: '單一寫入者。',
          text: 'State actor 是唯一的寫入者。它先完整檢查一次提交（epoch、基準版本、數值、單位與記憶體），沒問題才開始變更，交給歷史之後，才發布一份新的不可變快照。讀取端從不持有可變的參照，畫面上的值也一定已經進了歷史。',
        },
        {
          title: '繪製。',
          text: 'Manager 用最新的快照與歷史產生畫面資料。Viewer 預設每秒繪製 4 次新資料（可設定 1 到 20 次），dgxtop 吃緊時降為 2 次；按鍵或調整視窗大小會立刻重繪，最多每秒 20 次。',
        },
        {
          title: '逾時的回覆。',
          text: '超過期限才到的回覆，或來自舊世代 adapter 的回覆，一律丟棄；超過三個採樣週期的值會標示為過期。',
        },
      ],
    },
    isolation: {
      intro:
        '呼叫驅動程式可能會卡住，而卡住的呼叫會凍結發出呼叫的那條執行緒。所以 dgxtop 既不在畫面的執行緒上做這些呼叫，也不在自己的程序裡做。',
      points: [
        {
          title: '七個子程序。',
          text: (
            <>
              procfs、hwmon、thermal、powercap、nvml、network 與 filesystem
              各自在一個子程序裡執行：同一個執行檔，以{' '}
              {code('dgxtop --adapter-host <name>')} 啟動，最多 8 個。
            </>
          ),
        },
        {
          title: '分幀的管線。',
          text: '每個子程序都透過自己的管線和 supervisor 溝通，每一幀是 4 位元組的長度加上 JSON：傳輸時最大 1 MiB、解碼後最大 4 MiB、巢狀最深 32 層、每批最多 256 筆。握手用的 nonce 與世代編號確保舊子程序的回覆不會被當成新的。',
        },
        {
          title: '退避。',
          text: '連續失敗 3 次後，supervisor 會等 1、2、4 秒，最長 60 秒（加上 ±10% 的隨機誤差），再重新啟動子程序。',
        },
        {
          title: '乾淨地停止。',
          text: '停止子程序分成幾步：先要求關閉並給 200 ms 寬限，再送 SIGTERM 等 200 ms，然後送 SIGKILL，最多花 1 秒回收。無法回收的子程序會被隔離、不再重啟，卡住的程序不會越積越多。',
        },
        {
          title: '用執行緒，不用 async。',
          text: '主程序沒有 async runtime。終端在主執行緒上，旁邊是 manager、supervisor、日誌與訊號等具名執行緒、兩個 collector 工作執行緒，以及負責 state、歷史、操作紀錄、程序操作與程序探測的小型 actor。它們透過有上限的 crossbeam 通道溝通，任何地方都沒有無上限的佇列。',
        },
        {
          title: '看得到。',
          text: '設定頁列出每個 adapter 程序的狀態、上次成功的時間與退避時間。',
        },
      ],
    },
    sources: {
      intro:
        '同一個量常常有好幾個來源：CPU 溫度可能來自 hwmon，也可能來自 thermal zone。dgxtop 每個指標只顯示一個值，而且從不把來源平均。',
      points: [
        {
          title: '同一個鍵。',
          text: '指標鍵由主機、開機、實體、指標與範圍組成。只有鍵相同的讀值才會互相比較，所以 SoC 溫度不會和 CPU package 溫度競爭。',
        },
        {
          title: '每個值有四個標記。',
          text: '每個值都帶著讀取狀態、種類（量測、推導或估計）、品質等級（verified、usable、suspect、unknown 或 invalid）與新鮮度。只有 verified 與 usable 的值能代表這個指標。',
        },
        {
          title: '固定的順序。',
          text: '先統一並檢查單位。確認是同一個感測器、只是從兩個介面看到的，只算一次；數值相同不足以證明這一點。其餘依品質等級、來源優先序、最新讀取、來源 ID 排序。每個指標最多比較 4 個候選，結果不受讀值到達的順序影響。',
        },
        {
          title: '標示衝突，不取平均。',
          text: '兩個不同的感測器差距超過容許值（溫度是 8 °C）時，dgxtop 標示衝突，而不是取平均。',
        },
        {
          title: '不來回切換。',
          text: '更好的來源要連續勝出 3 輪、且持續至少 5 秒，才會接手。',
        },
        {
          title: '可重現。',
          text: '仲裁不做 I/O、不保存狀態，並記錄每個值勝出的原因，所以同樣的讀值永遠得到同樣的結果。',
        },
      ],
    },
    history: {
      intro:
        '總覽歷史用固定的空間保存好幾個月的資料：每條序列都以十二種長條保存，每種保留最新的 300 條。',
      points: [
        {
          title: '桶。',
          text: '每個樣本進入一個 5 秒的桶，最新的 120 個桶涵蓋最近 10 分鐘。每個桶記錄起點、涵蓋的時間、數值 × 時間的總和、最小值、最大值，以及合併了幾個樣本。',
        },
        {
          title: '十二種長條。',
          text: '桶再合併成 1、5、10、30 分鐘與 1、2、4、6、8、12、18、24 小時的長條。每種 300 條，所以 1 分鐘長條可回溯 5 小時，24 小時長條約 300 天。',
        },
        {
          title: '依時間加權的平均。',
          text: '長條的平均是數值 × 時間的總和除以涵蓋的時間，所以有缺口的長條不會被拉低，沒有資料的時間保持空白，不會變成 0。',
        },
        {
          title: '本地時間。',
          text: '長條依本地時間對齊：每小時從你所在時區的整點開始，24 小時長條從本地的午夜到午夜。',
        },
        {
          title: '寫入磁碟。',
          text: '長條存在 history_tiers.sqlite3，約 40 MiB 以內；每分鐘的資料另外寫入 history.sqlite3，保留 7 天、最多 1 GiB。兩者重開後都還在；dgxtop 在執行期間記錄。',
        },
      ],
    },
    'process-history': {
      intro:
        '程序歷史從 NVML 第一次列出某個 GPU 程序開始追蹤，直到它結束；不需要 root，也不掃描 /proc。',
      points: [
        {
          title: '身分。',
          text: '一次執行由 PID、程序的啟動時間與所在的開機共同識別，所以重複使用的 PID 不會接續別的程序的執行。',
        },
        {
          title: '唯讀探測。',
          text: (
            <>
              同時最多追蹤 64 個程序：每次讀 {code('/proc/<pid>/stat')}、
              {code('io')} 與 {code('status')}，每 10
              秒計算一次開啟的檔案，命令列、工作目錄、程式與 cgroup
              只讀一次，各自最多 4096 位元組。
            </>
          ),
        },
        {
          title: '記錄的內容。',
          text: 'CPU、常駐記憶體、GPU 使用率、GPU 記憶體、磁碟讀寫與主機的網路，以 5 秒的桶以及和總覽歷史相同的十二種長條保存。',
        },
        {
          title: '怎麼結束的。',
          text: 'dgxtop 只用一般使用者看得到的資訊判斷：60 秒內它自己送過訊號，就是它；核心的 oom_kill 計數增加，而程序被 SIGKILL 結束或沒有留下狀態，就是 OOM killer；否則是程序成為殭屍時讀到的結束碼或訊號。dgxtop 停止時還沒結束的執行，標示為在 dgxtop 關閉時結束。',
        },
        {
          title: '保留什麼。',
          text: '最近的桶每 30 秒寫入 process_recent.json，執行紀錄寫入 process_history.sqlite3，約 40 MiB 以內。列表顯示最新的 512 次執行，最舊的已結束執行最先讓出空間。',
        },
      ],
    },
    'gpu-memory': {
      intro:
        'dgxtop 為佔用最多 GPU 記憶體的程序各配一種顏色並保持穩定，讓你在記憶體長條、圖表與程序表之間追蹤同一個工作。',
      points: [
        {
          title: '說得出在跑什麼的名稱。',
          text: (
            <>
              程序以它實際執行的東西命名：{code('python -m')} 的模組（
              {code('vllm.entrypoints.openai.api_server')} →{' '}
              {code('vllm.api_server')}）、腳本（{code('train_supervisor.py')} →{' '}
              {code('train_supervisor')}）；被核心 15 位元組的 {code('comm')}{' '}
              截斷時用完整的程式名稱；通用的名稱加上所在的資料夾（
              {code('ComfyUI')} 裡的 {code('main.py')} → {code('ComfyUI/main')}
              ）。只保留這個名稱，並清除控制字元。
            </>
          ),
        },
        {
          title: '穩定的顏色。',
          text: '顏色由名稱的 FNV-1a 雜湊對應到八種顏色之一，所以工作或 dgxtop 重開後顏色不變。那個顏色已被使用時，就用下一個空著的顏色。',
        },
        {
          title: '不閃爍。',
          text: '八種顏色都在用時，新程序要佔用最小者兩倍再加 256 MiB 的記憶體，才會取代它。dgxtop 追蹤 16 個程序（顏色數的兩倍），所以剛結束的工作還會保留顏色一段時間。',
        },
        {
          title: '統一記憶體。',
          text: '在 DGX Spark 上 GPU 與系統共用記憶體，所以 RAM 長條會分出系統佔用的部分，以及每個 GPU 程序各自上色的部分。',
        },
      ],
    },
    actions: {
      intro:
        '在 dgxtop 裡結束 GPU 工作要兩個步驟、只送一個訊號，每次嘗試都有紀錄。',
      points: [
        {
          title: '誰的程序。',
          text: (
            <>
              只能是你自己的程序，不能是 PID 1 或 dgxtop 本身，也不能從 root
              工作階段操作。SIGKILL 預設允許，也可以關閉；
              {code('--read-only')} 會關閉所有操作。
            </>
          ),
        },
        {
          title: '兩個步驟。',
          text: (
            <>
              {code('K')}（SIGTERM）或 {code('F9')}
              （SIGKILL）會先詢問。確認只針對那一個程序，10 秒後失效，同時最多 8
              個等待確認。
            </>
          ),
        },
        {
          title: '用 pidfd，不用 PID。',
          text: (
            <>
              dgxtop 先開啟 pidfd，再次核對啟動時間、使用者與
              namespace，然後透過 {code('pidfd_send_signal')}{' '}
              送出訊號，所以這段期間被重複使用的 PID 絕不會被誤送。
            </>
          ),
        },
        {
          title: '先寫意圖。',
          text: '訊號送出前，意圖會先寫入 audit.sqlite3（WAL、synchronous=FULL），結果在之後寫入；1 秒內寫不進去就不送。如果 dgxtop 在兩者之間停止，結果維持未知，訊號也絕不重送。',
        },
        {
          title: '送出之後。',
          text: 'dgxtop 每 250 ms 檢查一次、持續 10 秒，程序歷史中的那次執行會記錄它是從 dgxtop 結束的。',
        },
      ],
    },
    limits: {
      intro:
        'dgxtop 要在它監看的工作旁邊連續執行好幾個月，所以裡面沒有任何東西會無限成長。',
      points: [
        {
          title: '一份記憶體預算。',
          text: '資料放在固定的 256 MiB 裡，事先分好：原始歷史 144 MiB、彙總 32、目錄 24、保留 20、即時狀態 16、畫面資料 12、輸入的讀值 8。記憶體先預留再使用。',
        },
        {
          title: '每條佇列都有上限。',
          text: '指令佇列（128）滿了就回報忙碌，不會變長；傳輸中的讀值最多 32 批、8 MiB。dgxtop 最多追蹤 512 條序列、2048 個來源（每個指標 4 個候選）、256 個程序與 1024 個 GPU 程序關聯，並允許 2 個畫面工作階段。',
        },
        {
          title: '吃緊。',
          text: '任何佇列持續 75% 滿，或一輪工作超過採樣週期，持續至少 3 秒，dgxtop 就進入吃緊狀態，畫面每秒最多繪製 2 次。',
        },
        {
          title: '節流。',
          text: '記憶體達到預算的 90%，或輸入的讀值持續滿載，dgxtop 就節流：主要組的採樣間隔先拉長為 2 倍，再拉長為 4 倍。',
        },
        {
          title: '恢復過程看得到。',
          text: '佇列低於 50%、記憶體低於 75% 之後，dgxtop 一次退回一級，最快每 30 秒一級。實際的採樣間隔和你設定的不同時，底部會顯示出來。',
        },
      ],
    },
    storage: {
      intro: 'dgxtop 只寫入你的 XDG 設定與狀態目錄，權限只有你自己能讀。',
      points: [
        {
          title: '預設私密。',
          text: '目錄以 0700 建立、檔案以 0600 建立，經過符號連結的路徑一律拒絕。每個狀態目錄只跑一個 dgxtop，由 instance.lock 把關。',
        },
        {
          title: '原子寫入設定。',
          text: 'config.json 先寫進新的暫存檔（0600、獨佔建立），同步到磁碟後改名蓋過舊檔，再同步目錄，所以當機也不會留下寫了一半的檔案。',
        },
        {
          title: '記錄格式，不做遷移。',
          text: '每個資料庫都在 SQLite 的 application_id 記錄自己的格式。格式不同的資料庫（例如 v2.0 的）會重建成空的，不做遷移。',
        },
        {
          title: '該可靠的地方才付出代價。',
          text: 'audit.sqlite3 每次寫入都同步（synchronous=FULL）。歷史資料庫用 WAL 加 synchronous=NORMAL：斷電時可能遺失最後一點歷史，但同步次數少得多。',
        },
        {
          title: '隱私。',
          text: '不連網，也不回傳任何資料。程序歷史會保存 GPU 程序的命令列、工作目錄與程式；環境變數從不讀取。',
        },
      ],
      table: {
        head: ['檔案', '內容', '上限'],
        rows: [
          ['config.json', '設定', '—'],
          [
            'history_tiers.sqlite3',
            '總覽歷史的長條，1 分鐘到 24 小時',
            '約 40 MiB',
          ],
          ['history.sqlite3', '每分鐘的資料', '預設 7 天、1 GiB'],
          ['process_history.sqlite3', '程序歷史的執行與長條', '約 40 MiB'],
          [
            'process_recent.json',
            'GPU 程序最近的 5 秒桶，每 30 秒寫入',
            '只有最近的桶',
          ],
          ['audit.sqlite3', '程序操作，先寫意圖、再寫結果', '30 天、128 MiB'],
          ['dgxtop.log', '日誌', '每 10 MiB 輪替，保留 3 個檔案'],
          ['instance.lock', '每個狀態目錄只跑一個 dgxtop', '—'],
        ],
      },
    },
    code: {
      intro:
        '程式碼是 11 個 crate 組成的 Rust workspace，圍繞一個共用的契約 crate。',
      points: [
        {
          title: '一條依賴規則。',
          text: '每個 crate 都只依賴 dgxtop-core：它提供共用的型別、畫面資料與介面，本身不做 I/O。唯一的例外是 history 使用純運算的 compression crate；只有 dgxtop 這個 crate 負責把其他 crate 組裝起來。',
        },
        {
          title: '在 CI 中檢查。',
          text: (
            <>
              {code('scripts/check_boundaries.py')} 在 CI
              中檢查這條規則，同時執行 {code('cargo fmt')}、把警告當成錯誤的{' '}
              {code('clippy')}，以及 x86_64 與 aarch64 上的測試。
            </>
          ),
        },
        {
          title: '由 CI 發佈。',
          text: '發佈版本在 Ubuntu 22.04 上建置 x86_64 與 aarch64，附上 SHA256SUMS 發佈；接著在兩種架構的 Ubuntu 22.04 與 24.04、Debian 12 與 Rocky 9 上實際安裝，Alpine 的 musl 則必須被拒絕。',
        },
      ],
      table: {
        head: ['Crate', '內容'],
        rows: crateRows([
          '主程式：命令列、模式、啟動與組裝',
          '共用型別：指標、指令、畫面資料與元件之間的介面',
          '背景程序、IPC、佇列、日誌、終端與時區',
          'procfs、hwmon、thermal、powercap、NVML、網路、檔案系統、程序探測與程序操作',
          '由讀值產生指標：速率、來源選擇與程序紀錄',
          '即時快照與短期趨勢',
          '總覽歷史、程序歷史與各自保留的內容',
          '1 分鐘到 24 小時的長條',
          'SQLite 資料庫與檔案',
          '排程、設定、工作階段、程序操作與畫面資料',
          '畫面、元件與按鍵對應',
        ]),
      },
    },
  },
};

const ja: DgxtopCopy = {
  eyebrow: 'ツール · Rust · Ratatui · 2026-10-12 更新',
  lead: 'dgxtop は NVIDIA GPU のためのターミナルモニターです。1 つの画面に、各 GPU の使用率、メモリ、温度、電力、クロック、どのジョブがメモリをどれだけ使っているか（それぞれの色で）、そしてマシンの CPU、メモリ、ディスク、ネットワークを表示します。すべての GPU ジョブを開始から終了まで、コマンドライン、メモリのピーク、終わり方とともに記録し、履歴は再起動してもディスクに残ります。DGX Spark のために作り、NVIDIA GPU を搭載したどの Linux マシンでも動きます。',
  facts: {
    stack: 'Rust 1.92 · Ratatui · crossterm · NVML · SQLite',
    platforms:
      'Linux x86_64／aarch64（glibc 2.34 以降）· DGX Spark（GB10）と RTX 5080 + RTX 3060 搭載ワークステーションでテスト済み',
    status: 'v2.1（2026-10-12 リリース）',
  },
  sectionsLabel: '目次',
  openImage: '原寸の画像を開く',
  sections: {
    install: 'インストール',
    features: '機能',
    screens: '画面',
    capabilities: '特長',
    architecture: 'アーキテクチャ',
    'data-path': '1 つのサンプルの流れ',
    isolation: 'Adapter プロセス',
    sources: '出所の選択',
    history: '階層化された履歴',
    'process-history': 'Process History の仕組み',
    'gpu-memory': 'プロセスごとの GPU メモリ',
    actions: '安全なプロセス操作',
    limits: '上限と過負荷',
    storage: 'ディスク上のファイル',
    code: 'コード構成',
  },
  shots: {
    'dgx-spark-overview.webp': {
      alt: 'DGX Spark 上の dgxtop の Overview：CPU、システムと色分けされた 2 つの GPU プロセスに分かれたユニファイドメモリ、GB10 GPU、ディスクとネットワークの表、GPU プロセス表',
      caption:
        'DGX Spark の Overview。GB10 は CPU とメモリを共有しているため、RAM バーにはシステムの分と、GPU プロセスごとの分がそれぞれの色で表示されます。',
    },
    'workstation-overview.webp': {
      alt: 'RTX 5080（使用率 97%）と RTX 3060 を積んだワークステーションでの Overview：ディスクとネットワークの表と、それぞれの色を持つ 4 つの GPU プロセス',
      caption:
        'ワークステーションの 2 基の GPU。各 GPU プロセスは、メモリバー、グラフ、プロセス表で同じ色を使います。',
    },
    'dgx-spark-gpu.webp': {
      alt: 'GB10 の GPU ビュー：状態、クロック、ユニファイドメモリ、PCIe、NVLink-C2C、温度しきい値、電力と消費電力量、CUDA 13.0、ドライバーと Linux カーネル、デバイス、PCI とファームウェア、トポロジ',
      caption:
        'ユニファイドメモリと NVLink-C2C を持つ GB10 の GPU ビュー。GPU が報告しない値には行を設けません。UUID は伏せています。',
    },
    'workstation-gpu.webp': {
      alt: '高負荷の RTX 5080 の GPU ビュー：電力上限で制限された状態、クロック、VRAM と BAR1、PCIe Gen5、ファンとしきい値、電力上限、CUDA 13.4、ドライバー、デバイス、ファームウェア、2 枚目の GPU への経路',
      caption:
        '高負荷の RTX 5080 での同じ画面：電力上限で制限され、VRAM、PCIe Gen5 x16、ファン、電力上限、2 枚目の GPU への経路を表示します。シリアル番号と UUID は伏せています。',
    },
    'workstation-overview-history.webp': {
      alt: '2 GPU ワークステーションの 1 分バーの Overview History：CPU、メモリ、GPU 使用率、GPU メモリ、GPU 温度、消費電力量付きの GPU 電力、ディスク、ネットワーク、各 GPU の平均とピークの表',
      caption:
        '1 分バーの Overview History：すべてのグラフに現在値、平均、最大値があり、下には各 GPU の平均、ピーク、消費電力量を表示します。',
    },
    'workstation-process-history.webp': {
      alt: 'GPU プロセスの実行を並べた Process History：開始時刻、PID、名前、GPU、実行時間、GPU メモリと RAM のピーク、GPU と CPU の使用率、実行中か終了かの状態',
      caption:
        'Process History：すべての GPU プロセスを実行ごとに新しい順で、実行時間、ピーク、終わり方とともに表示します。',
    },
    'workstation-process-run.webp': {
      alt: '開いた実行：PID、名前、GPU、開始、終了、実行時間、ユーザー、そして CPU、メモリ、GPU 使用率、GPU メモリ、スレッドと開いているファイル、ディスク、ネットワークのグラフ',
      caption:
        '開いた実行とそのグラフ。コマンドラインは全体の表示とコピーができます。ここではフォルダー、プログラム、cgroup、コマンドラインを伏せています。',
    },
  },
  install: {
    platforms:
      'x86_64 または aarch64 の Linux で、glibc 2.34 以降（Ubuntu 22.04、Debian 12、RHEL 9 以降）。DGX Spark も含みます。WSL 2 では Linux 版が動きます。GPU の値には NVIDIA ドライバーが必要で、ない場合も CPU、メモリ、ディスク、ネットワークは表示します。WSL 1、musl、macOS、Windows には対応していません。',
    installer: (
      <>
        インストーラーは CPU に合ったビルドを選び、リリースの{' '}
        {code('SHA256SUMS')} で検証してから {code('~/.local/bin')}{' '}
        にインストールします。以前のバージョンは残り、
        {code('./install.sh --rollback')} で戻せます。
      </>
    ),
    source: 'ソースコード、詳しい使い方、すべてのリリース：',
  },
  features: {
    intro:
      'htop は CPU が中心で、nvtop や nvidia-smi は見ている間だけ GPU を表示します。dgxtop は GPU を中心に、どのジョブが GPU メモリをどれだけ使っているかを示し、すべての GPU ジョブとマシン全体を記録します。',
    points: [
      {
        title: 'すべての GPU をひと目で。',
        text: '各 GPU の使用率、メモリ、温度、電力、クロック、ファンをライブグラフ付きで表示します。ゲージは 50% 未満では緑で、レッドライン（既定 80%）に近づくにつれて橙から赤に変わります。',
      },
      {
        title: 'プロセスごとのメモリ。',
        text: 'GPU メモリを最も多く使う 8 つのプロセスにはそれぞれ色が付き、メモリバー、グラフ、プロセス表で同じ色を使うので、どのジョブがどれだけ使っているかがひと目でわかります。色はプロセス名から決まるため、ジョブや dgxtop を再起動しても同じ色のままです（表示中の別のプロセスがその色を使っている場合を除きます）。',
      },
      {
        title: '実行内容で名前を付ける。',
        text: (
          <>
            {code('python -m vllm.entrypoints.openai.api_server')} は{' '}
            {code('vllm.api_server')}、{code('ComfyUI')} フォルダーで実行した{' '}
            {code('python main.py')} は {code('ComfyUI/main')} と表示され、
            {code('python3')} にはなりません。
          </>
        ),
      },
      {
        title: 'GPU プロセス。',
        text: (
          <>
            GPU
            を使うすべてのプロセスを、GPU、種別（計算またはグラフィックス）、GPU
            使用率、GPU メモリ、CPU、RAM
            とともに表示します。任意の列で並べ替え、GPU
            や名前で絞り込み、確認のうえで {code('K')}（SIGTERM）または{' '}
            {code('F9')}（SIGKILL）でプロセスを終了できます。
          </>
        ),
      },
      {
        title: 'Process History。',
        text: 'すべての GPU プロセスを、開始から終了までの 1 回の実行として記録します：実行時間、GPU メモリと RAM のピーク、GPU と CPU の使用率、そして終わり方（終了コードでの終了、シグナルによる終了、dgxtop からの終了、おそらく OOM killer、または実行中）。実行を開くと、完全なコマンドライン、作業フォルダー、そして CPU、メモリ、GPU、スレッド、開いているファイル、ディスク、ネットワークのグラフを表示します。',
      },
      {
        title: 'Overview History。',
        text: 'CPU、メモリ、各 GPU の使用率・メモリ・温度・電力、ディスク、ネットワークを、ローカル時刻にそろえた 1 分から 24 時間のバーで表示します。すべてのグラフに現在値、平均、最大値があり、各 GPU の平均、ピーク、消費電力量も表示します。',
      },
      {
        title: 'GPU の詳細。',
        text: '1 台ずつ、ドライバーが報告するすべての情報を表示します。GPU が報告しない値は行を作りません：',
        list: [
          'パフォーマンスステート、スロットルの理由とスロットルされた時間、クロック',
          'メモリとメモリバス、PCIe リンクと転送量、NVLink-C2C',
          '温度の上限、ファン、電力上限と消費電力量',
          'CUDA、ドライバー、NVML、Linux カーネルのバージョン',
          'デバイス、PCI とファームウェア、NUMA と CPU アフィニティ、P2P 経路',
        ],
      },
      {
        title: 'マシン全体。',
        text: 'コアごとの CPU 使用率、CPU 温度、コアの種類ごとの現在と最大の周波数。メモリ、スワップ、バッファー、キャッシュ。ディスクの空き容量、IOPS、レイテンシー、ドライブ温度。ネットワークの転送量、エラー、ドロップ。',
      },
      {
        title: 'DGX Spark のために。',
        text: 'GB10 のユニファイドメモリでは、RAM バーがシステムの分と GPU ジョブごとの分に分かれます。GB10 の CPU クラスター温度と NVLink-C2C リンクも読み取り、aarch64 ネイティブビルドを提供します。',
      },
      {
        title: 'アプリ内の設定。',
        text: 'サンプリング間隔と表示モジュールを変更でき、各データソースの状態も確認できます。各設定の保存値と適用中の値、その出所、すぐ反映されるか再起動が必要かを表示します。',
      },
    ],
  },
  screens: {
    intro:
      'Overview、GPU ビュー、Overview History、そして開いた実行を含む Process History です。実際にテストした 2 台のマシンで撮影しました。',
  },
  capabilities: [
    {
      title: '1 台のマシンに複数の GPU。',
      text: 'DGX Spark（GB10）と、RTX 5080 と RTX 3060 を積んだワークステーションでテスト済みです。',
    },
    {
      title: '長く残る履歴。',
      text: '履歴はディスクに保存され、再起動しても残り、保存期限はありません。バーの大きさごとに最新の 300 本を残すので、1 分バーは直近 5 時間、24 時間バーは約 10 か月をカバーします。Process History は最新の 512 回の実行を表示します。記録するのは dgxtop の実行中です。',
    },
    {
      title: '軽量。',
      text: 'Rust 製です。新しいデータの描画は既定で毎秒 4 回、データは固定の 256 MiB に収めます。',
    },
    {
      title: 'どの端末サイズでも。',
      text: 'ワイド、1 カラム、コンパクトのレイアウトで、40×10 まで対応します。キーボードとマウス、4 つの配色テーマに対応しています。',
    },
    {
      title: 'プライバシー。',
      text: 'ネットワークアクセスもテレメトリーもありません。設定と履歴は本人だけが読めるファイルです。Process History は GPU プロセスのコマンドライン、作業フォルダー、プログラムを保存しますが、環境変数は保存しません。',
    },
    {
      title: '安全なプロセス操作。',
      text: (
        <>
          操作できるのは自分のプロセスだけで、root
          セッションからは操作できず、期限付きの確認の後にだけ実行します。シグナルは
          pidfd 経由で送るので、再利用された PID
          に届くことはなく、すべての操作を記録します。{code('--read-only')}{' '}
          で無効にできます。
        </>
      ),
    },
    {
      title: '安全な更新。',
      text: 'インストーラーはダウンロードしたファイルをすべて検証し、以前のバージョンを残すので、1 コマンドで戻せます。',
    },
  ],
  architecture: {
    intro:
      'dgxtop は 1 つのプログラムです。Adapter がそれぞれのバックグラウンドプロセスでハードウェアを読み、読み取った値はデータ経路を流れ、Manager が画面に描く表示用データにまとめます。各スナップショットは履歴にも送られ、キー操作やコマンドは制御経路を通ります。',
    diagram: {
      title: 'アーキテクチャ：1 つのプログラムを通る 3 つの経路',
      text: '実線がデータ経路と履歴の経路、破線が制御経路です。',
      data: 'データ経路',
      history: '履歴の経路',
      control: '制御経路',
      adapters: 'それぞれ専用のバックグラウンドプロセス',
      dataNodes: [
        ['Linux + NVIDIA ドライバー', '/proc · sysfs · NVML'],
        ['Adapters', ''],
        ['Collectors', '単位 · 出所 · レート'],
        ['State', 'ライブスナップショット · 短期のトレンド'],
        ['Manager', 'State と History を読む · 表示用データ'],
        ['Viewer', '画面 · Ratatui'],
      ],
      historyNodes: [
        ['State', 'コミットされた各スナップショット'],
        ['History', 'Overview History · Process History'],
        ['Compression', '1 分から 24 時間のバー'],
        ['Store', 'SQLite · ファイル'],
      ],
      controlNodes: [
        ['Viewer', 'キー · マウス · コマンドライン'],
        ['Manager', 'コマンドを確認'],
        ['設定 · サンプリング · プロセス操作', 'pidfd · 確認済み · 記録'],
        ['Viewer', '結果を表示'],
      ],
    },
    components: {
      head: ['構成要素', '役割'],
      rows: [
        [
          'Adapters',
          'ハードウェアを読みます：/proc、hwmon、thermal zone、powercap、GPU の NVML、ネットワーク、ファイルシステム。それぞれ専用のバックグラウンドプロセスで動きます。読み取り専用のプローブが各 GPU プロセスを追跡します。',
        ],
        [
          'Collectors',
          '読み取り値を指標に整えます：単位、値ごとの最適な出所、カウンターからのレート、プロセスごとに 1 件の記録。',
        ],
        [
          'State',
          'ライブスナップショットと短期のトレンドを、メモリ上にだけ保持します。',
        ],
        [
          'History',
          'Overview History と Process History を保持し、何を残し何を手放すかを決めます。',
        ],
        [
          'Compression',
          'サンプルを、ローカル時刻にそろえた 1 分から 24 時間のバーにまとめます。',
        ],
        [
          'Store',
          'SQLite データベースとファイルを、頼まれたとおりにだけ読み書きします。',
        ],
        [
          'Manager',
          'サンプリングの計画、設定の適用、コマンドとプロセス操作の確認を行い、表示用データを作ります。自身はデータを持ちません。',
        ],
        [
          'Viewer',
          'Manager の表示用データから Ratatui で画面を描き、キーやマウス操作をコマンドに変換します。',
        ],
        [
          'Runtime',
          'adapter プロセス、その IPC と上限付きのキュー、ログ、端末を管理します。',
        ],
      ],
    },
    next: '以下の節では、まず 1 つのサンプルをこの設計に沿って追い、続いて v2.1 での実装を部分ごとに説明します。',
  },
  generated: { title: 'GPT 生成', alt: 'GPT 生成の図：' },
  diagrams: {
    architecture: {
      alt: 'dgxtop のアーキテクチャ。Linux カーネルと NVIDIA ドライバーを、7 つの adapter プロセス（procfs、hwmon、thermal、powercap、nvml、network、filesystem）が読み取ります。dgxtop 本体プロセスでは、読み取り値が Supervisor から Collectors と State を通って History と Compression へ流れ、History は Store に書き込みます。State と History は Manager に、Manager は Viewer に渡し、プロセスプローブは History に渡します。キーとマウスは Manager に届き、Manager が pidfd と操作の記録を使ってプロセス操作を行います。',
      caption:
        'プログラム全体。7 つの adapter プロセスがハードウェアを読み、本体プロセスがその値を画面、履歴、ディスク上のファイルにします。実線はデータ、破線はコマンドの流れです。',
    },
    'one-sample': {
      alt: 'カーネルから画面までの 8 段階。Manager が 1 秒ごとに期限 500 ms の読み取りをスケジュールし、Supervisor がパイプ経由で adapter プロセスに送り、adapter が /proc/stat、meminfo、NVML を読み、collectors が単位をそろえて最適な出所を選びカウンターをレートにし、State が書き手 1 つでスナップショットをコミットし、History が 5 秒バケットと 1 分から 24 時間のバーを残し、Manager が表示用データを作り、Viewer が Ratatui で既定では毎秒 4 フレーム描画します。遅れた返答は破棄され、新しいデータを上書きしません。',
      caption:
        '1 つのサンプルを段階ごとに。この経路では、どの段階も画面や遅い adapter を待ちません。',
    },
    isolation: {
      alt: 'dgxtop 本体プロセス（端末、manager、supervisor、2 つの collector、state、history、保存用ワーカー）が、dgxtop --adapter-host <name> として起動した 7 つの子プロセスとパイプでつながっています。フレームは長さ付きの JSON で最大 1 MiB、ハンドシェイクの nonce を持ちます。nvml の子プロセスは止まったものとして示され、読み取りが 500 ms の期限を超え、遅れた返答は破棄されます。3 回失敗すると supervisor が 1、2、4 秒から最大 60 秒のバックオフをかけ、終了要求、SIGTERM、SIGKILL、回収の順に再起動し、回収できなければ隔離します。CPU、メモリ、ディスク、ネットワークは更新を続けます。',
      caption:
        'ハードウェアのインターフェースごとに子プロセスを分けているので、止まったドライバー呼び出しが止めるのはその子プロセスだけです。',
    },
    'source-arbitration': {
      alt: '説明用の値による例。hwmon の package 0 と package の thermal zone は同じセンサーから 68 °C を読み、SoC の thermal zone は 42 °C を読みます。Collector は 5 つのルールを適用します。ホスト、ブート、実体、指標、スコープからなる同じ指標キー。単位を確認し、故障や非対応の値を 0 にしない。同じセンサーは 1 回だけ数える。品質の等級、優先度、最新の読み取り、出所 ID の順に並べる。8 °C を超えて食い違えば平均せず衝突として示す。結果は hwmon の package 0 からの CPU package 68 °C で、状態は正常です。SoC の値は別の指標です。挑戦者が引き継ぐのは 3 回続けて正常に読め、5 秒以上たってからです。',
      caption:
        '複数の出所が同じ量を報告するとき、1 つの値をどう選ぶか。値は説明用です。',
    },
    'history-tiers': {
      alt: '毎秒 1 つのサンプルが 5 秒のバケットに入り、120 個で直近 10 分をカバーし、さらに 12 種類のバーにまとめられて、それぞれ最新の 300 本が残ります。1 分は 5 時間、5 分は 25 時間、10 分は 50 時間、30 分は 6 日、1 時間は 12 日、2 時間は 25 日、4 時間は 50 日、6 時間は 75 日、8 時間は 100 日、12 時間は 150 日、18 時間は 225 日、24 時間は 300 日さかのぼれます。バケットはローカル時刻にそろえた開始時刻、カバーした時間、値 × 時間の合計、最小、最大、まとめたサンプル数を持ち、平均はその合計をカバーした時間で割ったもので、データのない時間は空白のままです。バーは history_tiers.sqlite3（約 40 MiB）に、分単位の行は history.sqlite3（7 日、最大 1 GiB）に保存します。',
      caption:
        'Overview History は 1 つの系列を 12 種類のバーで保存します。長いバーは画面を再サンプリングしたものではなく、まとめたバケットから計算します。',
    },
    'process-history': {
      alt: '1 回の実行の 5 段階。検出：NVML が GPU 上に列挙し、PID、起動時刻、ブートで識別します。追跡：stat、io、スレッド、ファイルを読み取り専用で調べ、コマンドラインとフォルダーは 1 回だけ読み、同時に最大 64 個です。記録：CPU、RSS、GPU 使用率、GPU メモリ、ディスクの読み書き、ホストのネットワーク。終了：終了コードで終了、SIGTERM か SIGKILL で終了、dgxtop から終了、おそらく OOM killer、dgxtop の停止中に終了。保持：最新 512 回の実行を表示し、ディスク上は約 40 MiB で、終了済みの古い実行から手放します。最近のバケットは 30 秒ごとに process_recent.json へ、1 分から 24 時間のバーは process_history.sqlite3 へ保存します。',
      caption:
        'GPU プロセスはどれも 1 回の実行になり、NVML が初めて一覧に載せたときから終了まで記録されます。',
    },
    'gpu-memory': {
      alt: '説明用の値による例。GPU と共有する RAM 122 GiB の DGX Spark で、メモリバーは OS 11.6 GiB、vllm.api_server 40 GiB、train_supervisor 18 GiB、ComfyUI/main 6 GiB、空きに分かれます。プロセスは実行内容で名付けられ、python -m vllm.entrypoints.openai.api_server は vllm.api_server、python train_supervisor.py は train_supervisor、ComfyUI フォルダーの python main.py は ComfyUI/main になります。8 色：色は名前の FNV-1a ハッシュで決まり、ジョブや dgxtop を再起動しても同じ色です。使用中なら次の空いている色を使い、8 色すべて使用中なら新しいプロセスには最小のものの 2 倍 + 256 MiB が必要です。メモリバー、GPU メモリのグラフ、プロセス表は同じ色を使います。',
      caption: 'GPU ジョブはどこに出てきても同じ色です。値は説明用です。',
    },
    'safe-actions': {
      alt: 'あなた、Manager、操作ワーカー、audit.sqlite3、Linux カーネルのあいだの流れ。選択行で K（SIGTERM）か F9（SIGKILL）を押す。Manager が同じユーザーで、root ではなく、PID 1 でも dgxtop 自身でもないことを確かめる。ワーカーが pidfd を開き、起動時刻、ユーザー、namespace を再確認する。有効期限 10 秒の 1 回限りの確認が出る。y か Enter で、先に意図を記録する（WAL、synchronous=FULL）。pidfd_send_signal で送り、PID では送らない。結果を記録し、10 秒間終了を確認する。拒否されるのは、読み取り専用モード、他のユーザーのプロセス、PID の再利用、操作の記録が書けない場合です。',
      caption:
        'プロセスを止めるには 2 つの段階があり、シグナルは pidfd 経由で 1 つだけ送ります。',
    },
    budgets: {
      alt: '256 MiB の予算を、生の履歴 144 MiB、集計 32、カタログ 24、予備 20、ライブ状態 16、表示用データ 12、受信バッファー 8 に分けます。上限：コマンドは 128 で、満杯なら busy。読み取り値は 32 バッチ、同時に 8 MiB。パイプのフレームは最大 1 MiB、256 件、深さ 32。系列 512、出所 2048、それぞれ候補は最大 4。プロセス 256、GPU プロセスの関連 1024。表示は既定で毎秒 4 フレーム（1〜20）、セッションは最大 2。過負荷は通常、逼迫、スロットル、回復中を経て通常に戻り、負荷が高いと dgxtop は取得間隔を延ばし、フッターに実際の間隔を表示します。',
      caption:
        'キューにも保存にもすべて上限があり、dgxtop が遅くするときはそれを表示します。',
    },
    storage: {
      alt: '既定の XDG パスで、ディレクトリは 0700、ファイルは 0600。~/.config/dgxtop/v2/ には config.json があり、一時ファイルに書いてから名前を変えます。~/.local/state/dgxtop/v2/ には history_tiers.sqlite3（1 分から 24 時間のバー、約 40 MiB）、history.sqlite3（分単位の行、7 日、最大 1 GiB）、process_history.sqlite3（GPU プロセスの実行、約 40 MiB）、process_recent.json（最新の 5 秒バケット、30 秒ごと）、audit.sqlite3（プロセス操作、30 日、最大 128 MiB、synchronous=FULL）、dgxtop.log と instance.lock（状態ディレクトリごとに dgxtop は 1 つ）があります。ルール：データベースとログにはサイズの上限があり、古いデータから消える。各データベースは形式を記録し、形式が違えば移行せず作り直す。シンボリックリンクを含むパスは拒否する。環境変数は読み取りも保存もしない。',
      caption:
        'dgxtop が書き込むすべてのファイルと、その置き場所と大きさの上限。',
    },
    crates: {
      alt: '3 層に分かれた 11 個の crate。上の dgxtop はコマンドライン、起動、組み立てを担います。中段は adapters、collectors、state、history、compression、store、manager、ui、runtime。下の core は型、表示用データ、ポートを持ち、I/O を行いません。中段の crate はどれも core だけに依存し、唯一の例外は history が compression を使うことです。dgxtop は compression 以外のすべてに依存します。このルールは CI で scripts/check_boundaries.py と契約テストが検査します。',
      caption: 'ワークスペースと、ただ 1 つの依存ルール。',
    },
  },
  tech: {
    'data-path': {
      intro:
        '毎秒、読み取り値はカーネルからターミナルまで同じ 8 つの段階を通ります。どの段階も画面や遅い adapter を待ちません。',
      points: [
        {
          title: 'スケジュール。',
          text: 'Manager は読み取りのグループごとに別々の時計を持ちます。メインのグループは毎秒、容量と遅いヘルス値は 5 秒ごと、デバイスの検出は 10 秒ごと、非対応の出所の再確認は 1 分ごとです。逃した枠を後から実行することはなく、次の枠が来ても前の回が終わっていないグループはスキップとして数え、自分の後ろに並べません。',
        },
        {
          title: '要求。',
          text: '各読み取り計画は 500 ms 先の期限と adapter の世代を持ちます。Supervisor はそれをその adapter のパイプに書き込み、adapter はページ単位で答えるので、1 つの要求が指定する出所は最大 256 です。',
        },
        {
          title: '読み取り値。',
          text: 'Adapter は値か状態を返します。状態は非対応、権限なし、タイムアウト、エラー、削除済みのいずれかです。読み取りの失敗が 0 になることはありません。',
        },
        {
          title: '整理。',
          text: '2 つの collector ワーカーが単位をそろえ、カウンターをレートに変え、指標ごとに 1 つの出所を選び、プロセスごとに 1 件の記録にまとめます。',
        },
        {
          title: '書き手は 1 つ。',
          text: '書き込むのは state actor だけです。コミットを完全に検査し（epoch、基準リビジョン、値、単位、メモリ）、問題がなければ変更を始め、履歴に渡してから、新しい不変のスナップショットを 1 つ公開します。読み手が変更可能な参照を持つことはなく、画面に出た値はすでに履歴に入っています。',
        },
        {
          title: '描画。',
          text: 'Manager は最新のスナップショットと履歴から表示用データを作ります。Viewer は新しいデータを既定で毎秒 4 回描画し（1〜20 回で設定可能）、dgxtop が逼迫しているときは 2 回に下げます。キー入力やリサイズのときはすぐに描き直し、最大で毎秒 20 回です。',
        },
        {
          title: '遅れた返答。',
          text: '期限を過ぎて届いた返答や、古い世代の adapter からの返答は破棄し、サンプリング周期の 3 倍より古い値は古い値（stale）として扱います。',
        },
      ],
    },
    isolation: {
      intro:
        'ドライバーの呼び出しは止まることがあり、止まった呼び出しはそれを呼んだスレッドを凍らせます。そのため dgxtop は、画面のスレッドでも自分のプロセスの中でも、それらを呼びません。',
      points: [
        {
          title: '7 つの子プロセス。',
          text: (
            <>
              procfs、hwmon、thermal、powercap、nvml、network、filesystem
              は、それぞれ子プロセスで動きます。同じバイナリを{' '}
              {code('dgxtop --adapter-host <name>')} として起動したもので、最大
              8 個です。
            </>
          ),
        },
        {
          title: 'フレーム付きのパイプ。',
          text: '子プロセスは専用のパイプで supervisor とやり取りし、フレームは 4 バイトの長さと JSON です。転送時は最大 1 MiB、デコード後は最大 4 MiB、入れ子は最大 32 段、1 バッチ最大 256 件です。ハンドシェイクの nonce と世代番号により、古い子プロセスの返答を新しいものと取り違えません。',
        },
        {
          title: 'バックオフ。',
          text: '3 回続けて失敗すると、supervisor は 1、2、4 秒と待ち時間を延ばし（最大 60 秒、±10% のゆらぎ付き）、子プロセスを起動し直します。',
        },
        {
          title: 'きれいな停止。',
          text: '子プロセスは段階的に止めます。終了を要求して 200 ms 待ち、SIGTERM を送ってさらに 200 ms、次に SIGKILL を送り、回収には最大 1 秒かけます。回収できない子プロセスは隔離して二度と起動しないので、止まったプロセスがたまっていくことはありません。',
        },
        {
          title: 'async ではなくスレッド。',
          text: '本体プロセスに async ランタイムはありません。ターミナルはメインスレッドで動き、その横に manager、supervisor、ログ、シグナルの名前付きスレッド、2 つの collector ワーカー、そして state・履歴・操作の記録・プロセス操作・プロセスプローブの小さな actor があります。これらは上限付きの crossbeam チャネルでやり取りし、上限のないキューはどこにもありません。',
        },
        {
          title: '見える化。',
          text: '設定画面には、各 adapter プロセスの状態、最後に成功した時刻、バックオフが表示されます。',
        },
      ],
    },
    sources: {
      intro:
        '1 つの量に複数の出所があることはよくあります。CPU 温度は hwmon からも thermal zone からも読めます。dgxtop は指標ごとに 1 つの値だけを示し、出所どうしを平均しません。',
      points: [
        {
          title: '同じキー。',
          text: '指標キーはホスト、ブート、実体、指標、スコープで決まります。比べるのは同じキーの読み取り値だけなので、SoC の温度が CPU package の温度と競合することはありません。',
        },
        {
          title: '値ごとに 4 つのラベル。',
          text: '各値は読み取り状態、種類（measured、derived、estimated）、品質の等級（verified、usable、suspect、unknown、invalid）、新しさを持ちます。指標を代表できるのは verified と usable の値だけです。',
        },
        {
          title: '決まった順序。',
          text: '単位をそろえて検査します。2 つのインターフェースから見えている同じセンサーだと確認できたものは 1 つと数え、値が同じだけでは同じとはみなしません。残りを品質の等級、出所の優先度、最新の読み取り、出所 ID の順に並べます。比べる候補は指標ごとに最大 4 つで、結果は読み取り値の届く順序に左右されません。',
        },
        {
          title: '平均ではなく衝突。',
          text: '異なる 2 つのセンサーが許容差（温度なら 8 °C）を超えて食い違うと、dgxtop は平均せずに衝突として示します。',
        },
        {
          title: '行ったり来たりしない。',
          text: 'よりよい出所が引き継ぐのは、3 回続けて勝ち、それが 5 秒以上続いたときだけです。',
        },
        {
          title: '再現できる。',
          text: '選択は I/O を行わず状態も持たず、各値が選ばれた理由を記録します。同じ読み取り値からは常に同じ結果になります。',
        },
      ],
    },
    history: {
      intro:
        'Overview History は決まった容量で数か月分のデータを保ちます。各系列を 12 種類のバーで保存し、それぞれ最新の 300 本を残します。',
      points: [
        {
          title: 'バケット。',
          text: '各サンプルは 5 秒のバケットに入り、最新の 120 個で直近 10 分をカバーします。バケットは開始時刻、カバーした時間、値 × 時間の合計、最小、最大、まとめたサンプル数を持ちます。',
        },
        {
          title: '12 種類のバー。',
          text: 'バケットは 1、5、10、30 分と 1、2、4、6、8、12、18、24 時間のバーにまとめられます。それぞれ 300 本なので、1 分のバーは 5 時間前まで、24 時間のバーは約 300 日前までさかのぼれます。',
        },
        {
          title: '時間で重み付けした平均。',
          text: 'バーの平均は値 × 時間の合計をカバーした時間で割ったものです。欠けのあるバーが薄まることはなく、データのない時間は 0 にならず空白のままです。',
        },
        {
          title: 'ローカル時刻。',
          text: 'バーはローカル時刻にそろえます。1 時間のバーは現地の正時に始まり、24 時間のバーは現地の午前 0 時から午前 0 時までです。',
        },
        {
          title: 'ディスクに保存。',
          text: 'バーは history_tiers.sqlite3 に約 40 MiB 以内で保存し、分単位の行は history.sqlite3 にも 7 日分、最大 1 GiB 書きます。どちらも再起動後に残ります。記録するのは dgxtop の実行中です。',
        },
      ],
    },
    'process-history': {
      intro:
        'Process History は、NVML が GPU プロセスを初めて一覧に載せたときから終了まで追います。root も /proc の走査も要りません。',
      points: [
        {
          title: '識別。',
          text: '1 回の実行は PID、プロセスの起動時刻、動いているブートの組で識別するので、再利用された PID が別のプロセスの実行を引き継ぐことはありません。',
        },
        {
          title: '読み取り専用のプローブ。',
          text: (
            <>
              同時に最大 64 プロセスを追います。毎回 {code('/proc/<pid>/stat')}
              、{code('io')}、{code('status')} を読み、開いているファイルは 10
              秒ごとに数え、コマンドライン、作業フォルダー、プログラム、cgroup
              は 1 回だけ、それぞれ最大 4096 バイト読みます。
            </>
          ),
        },
        {
          title: '記録する内容。',
          text: 'CPU、常駐メモリ、GPU 使用率、GPU メモリ、ディスクの読み書き、ホストのネットワークを、5 秒のバケットと Overview History と同じ 12 種類のバーで残します。',
        },
        {
          title: 'どう終わったか。',
          text: 'dgxtop は一般ユーザーに見える情報だけで判断します。60 秒以内に自分がシグナルを送っていればそれ。カーネルの oom_kill カウントが増え、プロセスが SIGKILL で終わったか状態を残さなかったなら OOM killer。それ以外は、ゾンビの間に読んだ終了コードかシグナルです。dgxtop が止まったときに終わっていなかった実行は、dgxtop の停止中に終了したと記録します。',
        },
        {
          title: '残すもの。',
          text: '最近のバケットは 30 秒ごとに process_recent.json へ、実行の記録は process_history.sqlite3 へ約 40 MiB 以内で保存します。一覧には最新の 512 回を表示し、終了済みの古い実行から消えます。',
        },
      ],
    },
    'gpu-memory': {
      intro:
        'dgxtop は GPU メモリを多く使うプロセスに 1 色ずつ割り当て、その色を保ちます。メモリバー、グラフ、プロセス表のあいだで同じジョブを追えます。',
      points: [
        {
          title: '何を動かしているかがわかる名前。',
          text: (
            <>
              プロセスは実際に動かしているもので名付けます。{code('python -m')}{' '}
              のモジュール（{code('vllm.entrypoints.openai.api_server')} →{' '}
              {code('vllm.api_server')}）、スクリプト（
              {code('train_supervisor.py')} → {code('train_supervisor')}
              ）、カーネルの 15 バイトの {code('comm')}{' '}
              で切れているときは完全なプログラム名、一般的な名前にはフォルダー名を付けます（
              {code('ComfyUI')} の {code('main.py')} → {code('ComfyUI/main')}
              ）。残すのはこの名前だけで、制御文字は取り除きます。
            </>
          ),
        },
        {
          title: '安定した色。',
          text: '色は名前の FNV-1a ハッシュで 8 色から決まるので、ジョブや dgxtop を再起動しても同じ色です。その色が使用中なら、次の空いている色を使います。',
        },
        {
          title: 'ちらつかない。',
          text: '8 色すべて使用中のときは、新しいプロセスが最小のものの 2 倍 + 256 MiB のメモリを使っている場合にだけ入れ替わります。dgxtop は色の数の 2 倍の 16 プロセスを追うので、終わったばかりのジョブもしばらく色を保ちます。',
        },
        {
          title: 'ユニファイドメモリ。',
          text: 'DGX Spark では GPU がシステムのメモリを共有するので、RAM のバーはシステムの分と、各 GPU プロセスの分をそれぞれの色で示します。',
        },
      ],
    },
    actions: {
      intro:
        'dgxtop から GPU ジョブを止めるには 2 つの段階があり、送るシグナルは 1 つだけで、すべての試みが記録に残ります。',
      points: [
        {
          title: '対象。',
          text: (
            <>
              自分のプロセスだけで、PID 1 や dgxtop 自身は対象外、root
              のセッションからも操作できません。SIGKILL
              は既定で許可され、無効にもできます。
              {code('--read-only')} ですべての操作を無効にできます。
            </>
          ),
        },
        {
          title: '2 つの段階。',
          text: (
            <>
              {code('K')}（SIGTERM）か {code('F9')}
              （SIGKILL）を押すと、まず確認します。確認はその 1
              つのプロセスだけが対象で、10 秒で期限が切れ、同時に待てるのは 8
              件までです。
            </>
          ),
        },
        {
          title: 'PID ではなく pidfd。',
          text: (
            <>
              dgxtop は pidfd を開き、起動時刻、ユーザー、namespace
              をもう一度確かめてから {code('pidfd_send_signal')}{' '}
              で送るので、その間に再利用された PID に当たることはありません。
            </>
          ),
        },
        {
          title: '先に意図を記録。',
          text: 'シグナルを送る前に意図を audit.sqlite3（WAL、synchronous=FULL）に書き、結果は後で書きます。意図が 1 秒以内に書けなければ送りません。2 つのあいだで dgxtop が止まると結果は不明のまま残り、シグナルを送り直すことはありません。',
        },
        {
          title: '送ったあと。',
          text: 'dgxtop は 250 ms ごとに 10 秒間プロセスを見守り、Process History のその実行には dgxtop から止めたことが記録されます。',
        },
      ],
    },
    limits: {
      intro:
        'dgxtop は見守るジョブの横で何か月も動き続ける前提なので、際限なく大きくなるものはありません。',
      points: [
        {
          title: '1 つのメモリ予算。',
          text: 'データは固定の 256 MiB に収め、あらかじめ分けてあります。生の履歴 144 MiB、集計 32、カタログ 24、予備 20、ライブ状態 16、表示用データ 12、受信した読み取り値 8 です。メモリは使う前に予約します。',
        },
        {
          title: 'どのキューにも上限。',
          text: 'コマンドのキュー（128）は満杯なら伸びずに busy を返し、転送中の読み取り値は 32 バッチ、8 MiB までです。追跡するのは最大 512 系列、2048 の出所（指標ごとに候補 4 つ）、256 プロセス、1024 の GPU プロセスの関連で、表示のセッションは 2 つまでです。',
        },
        {
          title: '逼迫。',
          text: 'いずれかのキューが 75% 埋まったまま、または 1 回の処理がサンプリング周期より長くかかる状態が 3 秒以上続くと、dgxtop は逼迫状態になり、描画は毎秒 2 回までになります。',
        },
        {
          title: 'スロットル。',
          text: 'メモリが予算の 90% に達するか、受信した読み取り値が満杯のままだと、dgxtop はスロットルし、メインのグループの取得間隔を 2 倍、さらに 4 倍に延ばします。',
        },
        {
          title: '見える形で回復。',
          text: 'キューが 50% 未満、メモリが 75% 未満に戻ると、dgxtop は 1 段階ずつ、最短でも 30 秒おきに戻ります。実際の間隔が設定と違うあいだは、フッターにそれを表示します。',
        },
      ],
    },
    storage: {
      intro:
        'dgxtop が書き込むのは XDG の設定ディレクトリと状態ディレクトリだけで、権限は自分だけが読めるものです。',
      points: [
        {
          title: '既定で非公開。',
          text: 'ディレクトリは 0700、ファイルは 0600 で作り、シンボリックリンクを経由するパスは拒否します。1 つの状態ディレクトリで動く dgxtop は 1 つだけで、instance.lock が守ります。',
        },
        {
          title: 'アトミックな設定の保存。',
          text: 'config.json は新しい一時ファイル（0600、排他的に作成）に書いて同期し、古いファイルの上に名前を変え、ディレクトリも同期します。クラッシュしても書きかけのファイルは残りません。',
        },
        {
          title: '移行せず形式を記録。',
          text: '各データベースは SQLite の application_id に形式を記録します。v2.0 のものなど、形式が違うデータベースは移行せず、空の状態で作り直します。',
        },
        {
          title: '必要なところだけ耐久性を。',
          text: 'audit.sqlite3 は書き込みごとに同期します（synchronous=FULL）。履歴のデータベースは WAL と synchronous=NORMAL で、停電時には直前の履歴を失うことがありますが、同期の回数はずっと少なくなります。',
        },
        {
          title: 'プライバシー。',
          text: 'ネットワークにはアクセスせず、テレメトリーもありません。Process History は GPU プロセスのコマンドライン、作業フォルダー、プログラムを保存しますが、環境変数は読みません。',
        },
      ],
      table: {
        head: ['ファイル', '内容', '上限'],
        rows: [
          ['config.json', '設定', '—'],
          [
            'history_tiers.sqlite3',
            'Overview History のバー、1 分から 24 時間',
            '約 40 MiB',
          ],
          ['history.sqlite3', '分単位の行', '既定で 7 日、1 GiB'],
          [
            'process_history.sqlite3',
            'Process History の実行とバー',
            '約 40 MiB',
          ],
          [
            'process_recent.json',
            'GPU プロセスの最近の 5 秒バケット、30 秒ごとに保存',
            '最近のバケットだけ',
          ],
          [
            'audit.sqlite3',
            'プロセス操作、意図を先に、結果を後に',
            '30 日、128 MiB',
          ],
          ['dgxtop.log', 'ログ', '10 MiB ごとにローテーション、3 ファイル'],
          ['instance.lock', '状態ディレクトリごとに dgxtop は 1 つ', '—'],
        ],
      },
    },
    code: {
      intro:
        'コードは、共通の契約 crate を中心にした 11 個の crate からなる Rust workspace です。',
      points: [
        {
          title: '依存のルールは 1 つ。',
          text: 'どの crate も dgxtop-core だけに依存します。dgxtop-core は共有の型、表示用データ、ポートを持ち、それ自身は I/O を行いません。唯一の例外は history が純粋な compression crate を使うことで、ほかの crate を組み立てるのは dgxtop crate だけです。',
        },
        {
          title: 'CI で検査。',
          text: (
            <>
              {code('scripts/check_boundaries.py')} が CI でこのルールを検査し、
              {code('cargo fmt')}
              、警告をエラーとして扱う {code('clippy')}、x86_64 と aarch64
              のテストも実行します。
            </>
          ),
        },
        {
          title: 'CI でリリース。',
          text: 'リリースは Ubuntu 22.04 上で x86_64 と aarch64 向けにビルドし、SHA256SUMS を付けて公開します。そのあと、両アーキテクチャの Ubuntu 22.04 と 24.04、Debian 12、Rocky 9 で実際にインストールし、Alpine の musl では拒否されることを確かめます。',
        },
      ],
      table: {
        head: ['Crate', '内容'],
        rows: crateRows([
          'プログラム本体：コマンドライン、モード、起動、組み立て',
          '共通の型：指標、コマンド、表示用データ、構成要素間のインターフェース',
          'バックグラウンドプロセス、IPC、キュー、ログ、端末、タイムゾーン',
          'procfs、hwmon、thermal、powercap、NVML、ネットワーク、ファイルシステム、プロセスのプローブとプロセス操作',
          '読み取り値からの指標：レート、出所の選択、プロセスの記録',
          'ライブスナップショットと短期のトレンド',
          'Overview History、Process History と、それぞれが残すもの',
          '1 分から 24 時間のバー',
          'SQLite データベースとファイル',
          'スケジューリング、設定、セッション、プロセス操作、表示用データ',
          '画面、ウィジェット、キーマップ',
        ]),
      },
    },
  },
};

export const dgxtopCopy: Record<ProjectEdition, DgxtopCopy> = {
  'zh-hant': zh,
  en,
  ja,
};
