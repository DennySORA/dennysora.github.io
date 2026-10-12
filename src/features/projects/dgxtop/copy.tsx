import type { ReactNode } from 'react';
import type { ProjectEdition } from '../../../lib/project-pages.ts';

// What dgxtop does, what it runs on and how it is built, as the dgxtop
// README states it in English, Traditional Chinese and Japanese (checked
// 2026-10-12, v2.1.0).

export const sectionIds = [
  'install',
  'features',
  'screens',
  'capabilities',
  'architecture',
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

// github.com's raw path redirects to the same file as the README's
// raw.githubusercontent.com URL; the asset policy keeps that host out of
// bundles (src/lib/asset-policy.ts), and curl -L follows the redirect.
export const installCommand =
  'curl -fsSL https://github.com/DennySORA/dgxtop/raw/main/install.sh | bash';

type Table = { head: string[]; rows: string[][] };

/** One feature or capability: a bold name, its text and an optional list. */
export type Point = { title: string; text: ReactNode; list?: string[] };

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
    codeIntro: string;
    code: Table;
  };
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
      text: 'Written in Rust. It redraws at most 4 times a second and keeps its data within a fixed 256 MiB.',
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
    codeIntro:
      'The code is a Rust workspace of eleven crates around one shared contract crate.',
    code: {
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
      text: '以 Rust 撰寫。每秒最多重繪 4 次，資料使用量固定在 256 MiB 以內。',
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
    codeIntro:
      '程式碼是 11 個 crate 組成的 Rust workspace，圍繞一個共用的契約 crate。',
    code: {
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
      text: 'Rust 製です。描画は最大で毎秒 4 回、データは固定の 256 MiB に収めます。',
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
    codeIntro:
      'コードは、共通の契約 crate を中心にした 11 個の crate からなる Rust workspace です。',
    code: {
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
};

export const dgxtopCopy: Record<ProjectEdition, DgxtopCopy> = {
  'zh-hant': zh,
  en,
  ja,
};
