import type { ReactNode } from 'react';
import type { ProjectEdition } from '../../../lib/project-pages.ts';

// What dgxtop does, what it runs on and how it is built, as the dgxtop
// README states it in English, Traditional Chinese and Japanese (checked
// 2026-10-11).

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
  'dgx-spark-history.webp',
  'workstation-history.webp',
  'dgx-spark-settings.webp',
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
      control: string;
      adapters: string;
      dataNodes: [string, string][];
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
  'dgxtop-store',
  'dgxtop-manager',
  'dgxtop-ui',
] as const;

const crateRows = (contents: readonly string[]) =>
  crates.map((crate, index) => [crate, contents[index] ?? '']);

const en: DgxtopCopy = {
  eyebrow: 'Tools · Rust · Ratatui · updated 2026-10-11',
  lead: 'dgxtop is a terminal monitor for NVIDIA GPUs. One screen shows every GPU’s utilization, memory, temperature, power and clocks, the processes using it, and the rest of the machine: CPU, memory, disks and network. It keeps the history, up to 24 hours of charts saved on disk for 7 days, so a job that ran overnight is still there after a restart. It is built for the DGX Spark and runs on any Linux machine with NVIDIA GPUs.',
  facts: {
    stack: 'Rust 1.92 · Ratatui · crossterm · NVML · SQLite',
    platforms:
      'Linux x86_64 / aarch64 (glibc 2.34+) · tested on a DGX Spark (GB10) and on an RTX 5080 + RTX 3060 workstation',
    status: 'v2, released 2026-10-11',
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
      'htop centers on the CPU, and nvtop and nvidia-smi show GPUs only while you watch. dgxtop puts the GPUs first, shows the whole machine around them, and keeps the history.',
    points: [
      {
        title: 'Every GPU at a glance.',
        text: 'Utilization, memory, temperature, power, clocks and fans for each GPU, with live charts.',
      },
      {
        title: 'Full GPU details.',
        text: 'One GPU at a time, with everything the driver reports; a value the GPU does not report gets no row:',
        list: [
          'performance state and throttle reasons, clocks',
          'memory and the memory bus, PCIe link and traffic, NVLink-C2C',
          'thermal limits, power and energy',
          'CUDA and driver versions',
          'NUMA and CPU affinity, P2P paths, device and firmware',
        ],
      },
      {
        title: 'GPU processes.',
        text: 'Every process using a GPU, with its GPU, type (compute or graphics), GPU memory, CPU and RAM. Filter by GPU or name, sort by any column, and stop a process after a confirmation.',
      },
      {
        title: 'History.',
        text: 'Charts from 5 minutes to 24 hours on one time axis, saved on disk for 7 days and kept across restarts and reboots:',
        list: [
          'CPU, memory, disks and network',
          'each GPU’s utilization, memory, temperature and power',
          'now, average and maximum for every chart',
          'each GPU’s last 1, 6, 12 and 24 hours, with the energy it used',
        ],
      },
      {
        title: 'The whole machine.',
        text: 'CPU usage per core, CPU temperature and power where the hardware reports them, memory and swap, disk throughput and filesystem capacity, network throughput.',
      },
      {
        title: 'Made for DGX Spark.',
        text: 'The GB10 shares memory with the CPU: dgxtop shows how much system RAM GPU processes hold, and the GB10’s NVLink-C2C link. Native aarch64 build.',
      },
      {
        title: 'Settings in the app.',
        text: 'Change the sampling interval and the display modules. Each setting shows its saved and effective value, where it came from, and whether it applies now or after a restart.',
      },
    ],
  },
  screens: {
    intro:
      'Four views: Overview, GPU, History and Settings, on the two machines dgxtop was tested on.',
  },
  capabilities: [
    {
      title: 'Several GPUs per machine.',
      text: 'Tested on a DGX Spark (GB10) and on a workstation with an RTX 5080 and an RTX 3060.',
    },
    {
      title: 'Light.',
      text: 'Written in Rust. It redraws only when something changes, at most 4 times a second, and keeps its data within a fixed 256 MiB.',
    },
    {
      title: 'Any terminal size.',
      text: 'The full layout from 80×24, a compact one below that. Keyboard and mouse.',
    },
    {
      title: 'Private.',
      text: 'No network access and no telemetry. Settings and history are files only you can read, and command lines and environments are never stored.',
    },
    {
      title: 'Safe modes.',
      text: (
        <>
          {code('--read-only')} turns off process actions. {code('--replay')}{' '}
          shows simulated data for demos and tests. {code('--diagnostics-json')}{' '}
          prints versions and health.
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
      'dgxtop is one program built from six components. Readings travel the data path; your keys and commands travel the control path.',
    diagram: {
      title: 'Architecture: six components, two paths',
      text: 'Solid accents mark the data path, dashed ones the control path.',
      data: 'data path',
      control: 'control path',
      adapters: 'one background process each',
      dataNodes: [
        ['Linux + NVIDIA driver', '/proc · sysfs · NVML'],
        ['Adapters', ''],
        ['Collectors', 'units · sources · rates'],
        ['Manager', 'sampling · settings · the only writer'],
        ['Store', 'snapshot · history · settings · action log'],
        ['Viewer', 'screens · Ratatui'],
      ],
      controlNodes: [
        ['Controller', 'keys · mouse · command line'],
        ['Manager', 'checks each command'],
        ['Settings · sampling · process actions', ''],
        ['Viewer', 'shows the result'],
      ],
    },
    components: {
      head: ['Component', 'What it does'],
      rows: [
        [
          'Adapters',
          'Read the hardware: /proc, hwmon, thermal zones, powercap, NVML for the GPUs, network and filesystems. Each adapter runs in its own background process.',
        ],
        [
          'Collectors',
          'Turn raw readings into metrics: units, duplicates, the best source for each value, and rates from counters.',
        ],
        [
          'Manager',
          'Schedules sampling, applies settings, checks commands, and is the only part that writes data.',
        ],
        [
          'Store',
          'Holds the live snapshot, the history, the settings and the log of process actions.',
        ],
        [
          'Viewer',
          'Draws the screen with Ratatui from ready-made views of the data.',
        ],
        [
          'Controller',
          'Turns keys, mouse clicks and command-line options into commands.',
        ],
      ],
    },
    codeIntro:
      'The code is a Rust workspace of eight crates around one shared contract crate.',
    code: {
      head: ['Crate', 'Contains'],
      rows: crateRows([
        'The program: startup, command line and wiring',
        'Shared types: metrics, units, commands and interfaces',
        'Background processes, IPC, workers and terminal I/O',
        'procfs, sysfs, NVML and process actions',
        'Normalization, source selection and rates',
        'Snapshot, history, settings and the action log (SQLite)',
        'Sampling, settings, commands and views',
        'Screens, widgets and the key map',
      ]),
    },
  },
};

const zh: DgxtopCopy = {
  eyebrow: '工具 · Rust · Ratatui · 2026-10-11 更新',
  lead: 'dgxtop 是 NVIDIA GPU 的終端監控工具。一個畫面就能看到每張 GPU 的使用率、記憶體、溫度、功耗與時脈、使用它的程序，以及整台機器的 CPU、記憶體、磁碟與網路。它會保留歷史：最長 24 小時的圖表在磁碟上保存 7 天，夜裡跑的工作重開之後還看得到。它為 DGX Spark 打造，也能在任何裝有 NVIDIA GPU 的 Linux 主機上使用。',
  facts: {
    stack: 'Rust 1.92 · Ratatui · crossterm · NVML · SQLite',
    platforms:
      'Linux x86_64／aarch64（glibc 2.34 以上）· 已在 DGX Spark（GB10）與 RTX 5080 + RTX 3060 工作站上測試',
    status: 'v2，2026-10-11 發佈',
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
      'htop 以 CPU 為主，nvtop 和 nvidia-smi 只在你盯著的時候顯示 GPU。dgxtop 以 GPU 為主，把整台機器放在旁邊，而且保留歷史。',
    points: [
      {
        title: '一眼看完所有 GPU。',
        text: '每張 GPU 的使用率、記憶體、溫度、功耗、時脈與風扇，附即時圖表。',
      },
      {
        title: '完整的 GPU 細節。',
        text: '一次看一張 GPU，列出驅動回報的所有資訊；GPU 不回報的值不會佔一行：',
        list: [
          '效能狀態與降頻原因、時脈',
          '記憶體與記憶體匯流排、PCIe 連線與流量、NVLink-C2C',
          '溫度上限、功耗與耗電量',
          'CUDA 與驅動版本',
          'NUMA 與 CPU 親和性、P2P 路徑、裝置與韌體',
        ],
      },
      {
        title: 'GPU 程序。',
        text: '所有使用 GPU 的程序，以及所在的 GPU、類型（運算或圖形）、GPU 記憶體、CPU 與 RAM。可依 GPU 或名稱篩選、依任一欄排序，確認後即可結束程序。',
      },
      {
        title: '歷史紀錄。',
        text: '5 分鐘到 24 小時的圖表共用一條時間軸，寫入磁碟保存 7 天，重開程式或重開機都還在：',
        list: [
          'CPU、記憶體、磁碟與網路',
          '每張 GPU 的使用率、記憶體、溫度與功耗',
          '每張圖都標出目前值、平均與最大值',
          '每張 GPU 最近 1、6、12、24 小時的統計與耗電量',
        ],
      },
      {
        title: '整台機器。',
        text: '每顆核心的 CPU 使用率、硬體有回報時的 CPU 溫度與功耗、記憶體與 swap、磁碟流量與檔案系統容量、網路流量。',
      },
      {
        title: '為 DGX Spark 打造。',
        text: 'GB10 與 CPU 共用記憶體：dgxtop 會顯示 GPU 程序佔用多少系統 RAM，以及 GB10 的 NVLink-C2C 連線。提供原生 aarch64 版本。',
      },
      {
        title: '程式內設定。',
        text: '調整採樣間隔與顯示模組。每項設定都顯示儲存值與生效值、來源，以及是立即生效還是重開後生效。',
      },
    ],
  },
  screens: {
    intro: '四個畫面：總覽、GPU、歷史與設定，截自實際測試的兩台機器。',
  },
  capabilities: [
    {
      title: '一台機器多張 GPU。',
      text: '已在 DGX Spark（GB10）與裝有 RTX 5080 和 RTX 3060 的工作站上測試。',
    },
    {
      title: '輕量。',
      text: '以 Rust 撰寫。只在內容變化時重繪，每秒最多 4 次，資料使用量固定在 256 MiB 以內。',
    },
    {
      title: '任何終端尺寸。',
      text: '80×24 以上顯示完整版面，更小時改用精簡版面。支援鍵盤與滑鼠。',
    },
    {
      title: '隱私。',
      text: '不連網，也不回傳任何資料。設定與歷史是只有你能讀的檔案，不會儲存命令列與環境變數。',
    },
    {
      title: '安全模式。',
      text: (
        <>
          {code('--read-only')} 關閉程序操作；{code('--replay')}{' '}
          用模擬資料做展示或測試；{code('--diagnostics-json')}{' '}
          輸出版本與健康狀態。
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
      'dgxtop 是由六個元件組成的單一程式。讀值走資料路徑；你的按鍵與指令走控制路徑。',
    diagram: {
      title: '架構：六個元件、兩條路徑',
      text: '實線標示資料路徑，虛線標示控制路徑。',
      data: '資料路徑',
      control: '控制路徑',
      adapters: '各自在背景程序中執行',
      dataNodes: [
        ['Linux + NVIDIA 驅動', '/proc · sysfs · NVML'],
        ['Adapter', ''],
        ['Collector', '單位 · 來源 · 速率'],
        ['Manager', '採樣 · 設定 · 唯一寫入者'],
        ['Store', '快照 · 歷史 · 設定 · 操作紀錄'],
        ['Viewer', '畫面 · Ratatui'],
      ],
      controlNodes: [
        ['Controller', '按鍵 · 滑鼠 · 命令列'],
        ['Manager', '檢查每個指令'],
        ['設定 · 採樣 · 程序操作', ''],
        ['Viewer', '顯示結果'],
      ],
    },
    components: {
      head: ['元件', '功能'],
      rows: [
        [
          'Adapter',
          '讀取硬體：/proc、hwmon、thermal zone、powercap、GPU 的 NVML、網路與檔案系統。每個 adapter 在自己的背景程序裡執行。',
        ],
        [
          'Collector',
          '把原始讀值整理成指標：單位、重複的來源、每個值的最佳來源，以及由計數器算出的速率。',
        ],
        ['Manager', '排定採樣、套用設定、檢查指令，也是唯一寫入資料的元件。'],
        ['Store', '保存即時快照、歷史、設定與程序操作紀錄。'],
        ['Viewer', '用整理好的畫面資料，以 Ratatui 繪製畫面。'],
        ['Controller', '把按鍵、滑鼠點擊與命令列選項轉成指令。'],
      ],
    },
    codeIntro:
      '程式碼是 8 個 crate 組成的 Rust workspace，圍繞一個共用的契約 crate。',
    code: {
      head: ['Crate', '內容'],
      rows: crateRows([
        '主程式：啟動、命令列與組裝',
        '共用型別：指標、單位、指令與介面',
        '背景程序、IPC、worker 與終端 I/O',
        'procfs、sysfs、NVML 與程序操作',
        '正規化、來源選擇與速率',
        '快照、歷史、設定與操作紀錄（SQLite）',
        '採樣、設定、指令與畫面資料',
        '畫面、元件與按鍵對應',
      ]),
    },
  },
};

const ja: DgxtopCopy = {
  eyebrow: 'ツール · Rust · Ratatui · 2026-10-11 更新',
  lead: 'dgxtop は NVIDIA GPU のためのターミナルモニターです。1 つの画面に、各 GPU の使用率、メモリ、温度、電力、クロック、それを使うプロセス、そしてマシンの CPU、メモリ、ディスク、ネットワークを表示します。最大 24 時間のグラフを 7 日間ディスクに保存するので、夜間に動かしたジョブも再起動後に確認できます。DGX Spark のために作り、NVIDIA GPU を搭載したどの Linux マシンでも動きます。',
  facts: {
    stack: 'Rust 1.92 · Ratatui · crossterm · NVML · SQLite',
    platforms:
      'Linux x86_64／aarch64（glibc 2.34 以降）· DGX Spark（GB10）と RTX 5080 + RTX 3060 搭載ワークステーションでテスト済み',
    status: 'v2（2026-10-11 リリース）',
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
      alt: 'DGX Spark 上の dgxtop 概要画面。CPU とメモリ、使用率 92% の GB10 GPU と RAM のバー、ディスクとネットワークの表、GPU メモリを 69.8 GiB 使用する Python プロセス 1 つを表示',
      caption:
        'DGX Spark の概要画面。Python のジョブが GB10 を使用率 92% に保っています。CPU とメモリを共有するため、GPU プロセスが使用する RAM はシステムメモリの内側に別の色で描かれます。',
    },
    'workstation-overview.webp': {
      alt: 'RTX 5080 と RTX 3060 の 2 基の GPU を搭載したワークステーションの概要画面。GPU メモリを使用するプロセスを一覧表示',
      caption:
        'ワークステーションの 2 基の GPU。プロセス表には GPU を使うプロセスだけを載せ、nvidia-smi と同じ C または G の区分を表示します。',
    },
    'dgx-spark-gpu.webp': {
      alt: 'GB10 の GPU 画面。状態、クロック、統合メモリ、PCIe、NVLink-C2C、温度閾値、消費電力、CUDA、ドライバー、デバイス、トポロジーを表示',
      caption:
        'GB10 の GPU 画面。コマンドを実行せず、NVML と CUDA toolkit のファイルから読み取ります。GPU が報告しない値には行を設けません。',
    },
    'workstation-gpu.webp': {
      alt: 'RTX 5080 の GPU 画面。クロック、VRAM と BAR1、PCIe Gen5、ファンと温度閾値、電力上限、CUDA、ドライバー、ファームウェア、2 基目の GPU への P2P 経路を表示',
      caption:
        'RTX 5080 での同じ画面。VRAM、PCIe Gen5 x16、ファン、電力上限、2 基目の GPU への経路を表示します。シリアル番号と UUID は伏せています。',
    },
    'dgx-spark-history.webp': {
      alt: 'DGX Spark の 1 時間の履歴。CPU、メモリ、GPU 使用率とメモリ、温度、消費電力と消費電力量、ディスク、ネットワークを表示',
      caption:
        'DGX Spark で GPU ジョブを動かした 1 時間。対になったパネルが同じ時間軸を共有し、各列は値に応じて色分けした平均を表します。現在値、平均、最大値も併記します。',
    },
    'workstation-history.webp': {
      alt: 'GPU を 2 基搭載したワークステーションの履歴画面。各 GPU の直近 1、6、12、24 時間の平均値とピーク値を表示',
      caption:
        '時間軸の下には、各 GPU の直近 1、6、12、24 時間の使用率、メモリ、温度、消費電力の平均とピーク、および消費電力量を表示します。',
    },
    'dgx-spark-settings.webp': {
      alt: '各設定の保存値、適用値、出所、再起動の要否を示す設定画面。横には表示モジュールの切り替えを配置',
      caption:
        '設定画面では、各項目の保存値と現在の適用値、その出所、即時適用か再起動が必要かを確認できます。',
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
      'htop は CPU が中心で、nvtop や nvidia-smi は見ている間だけ GPU を表示します。dgxtop は GPU を中心に、マシン全体を並べて表示し、履歴も残します。',
    points: [
      {
        title: 'すべての GPU をひと目で。',
        text: '各 GPU の使用率、メモリ、温度、電力、クロック、ファンをライブグラフ付きで表示します。',
      },
      {
        title: 'GPU の詳細。',
        text: '1 台ずつ、ドライバーが報告するすべての情報を表示します。GPU が報告しない値は行を作りません：',
        list: [
          'パフォーマンスステートとスロットルの理由、クロック',
          'メモリとメモリバス、PCIe リンクと転送量、NVLink-C2C',
          '温度の上限、電力と消費電力量',
          'CUDA とドライバーのバージョン',
          'NUMA と CPU アフィニティ、P2P 経路、デバイスとファームウェア',
        ],
      },
      {
        title: 'GPU プロセス。',
        text: 'GPU を使うすべてのプロセスを、GPU、種別（計算またはグラフィックス）、GPU メモリ、CPU、RAM とともに表示します。GPU や名前で絞り込み、任意の列で並べ替え、確認のうえでプロセスを終了できます。',
      },
      {
        title: '履歴。',
        text: '5 分から 24 時間のグラフを 1 本の時間軸で表示します。履歴は 7 日間ディスクに保存され、再起動しても残ります：',
        list: [
          'CPU、メモリ、ディスク、ネットワーク',
          '各 GPU の使用率、メモリ、温度、電力',
          'すべてのグラフに現在値、平均、最大値',
          '各 GPU の直近 1・6・12・24 時間の統計と消費電力量',
        ],
      },
      {
        title: 'マシン全体。',
        text: 'コアごとの CPU 使用率、ハードウェアが報告する CPU の温度と電力、メモリとスワップ、ディスクの転送量とファイルシステムの容量、ネットワークの転送量。',
      },
      {
        title: 'DGX Spark のために。',
        text: 'GB10 は CPU とメモリを共有しています。dgxtop は GPU プロセスが使うシステム RAM の量と、GB10 の NVLink-C2C リンクを表示します。aarch64 ネイティブビルドです。',
      },
      {
        title: 'アプリ内の設定。',
        text: 'サンプリング間隔と表示モジュールを変更できます。各設定の保存値と適用中の値、その出所、すぐ反映されるか再起動が必要かを表示します。',
      },
    ],
  },
  screens: {
    intro:
      '概要、GPU、履歴、設定の 4 つの画面です。実際にテストした 2 台のマシンで撮影しました。',
  },
  capabilities: [
    {
      title: '1 台のマシンに複数の GPU。',
      text: 'DGX Spark（GB10）と、RTX 5080 と RTX 3060 を積んだワークステーションでテスト済みです。',
    },
    {
      title: '軽量。',
      text: 'Rust 製です。変化があったときだけ最大で毎秒 4 回描画し、データは固定の 256 MiB に収めます。',
    },
    {
      title: 'どの端末サイズでも。',
      text: '80×24 以上ではフルレイアウト、それ未満ではコンパクト表示です。キーボードとマウスに対応しています。',
    },
    {
      title: 'プライバシー。',
      text: 'ネットワークアクセスもテレメトリーもありません。設定と履歴は本人だけが読めるファイルで、コマンドラインや環境変数は保存しません。',
    },
    {
      title: '安全なモード。',
      text: (
        <>
          {code('--read-only')} でプロセス操作を無効にします。
          {code('--replay')} はシミュレーションデータでデモやテストを行い、
          {code('--diagnostics-json')} はバージョンと状態を出力します。
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
      'dgxtop は 6 つの構成要素からなる 1 つのプログラムです。読み取った値はデータ経路を、キー操作やコマンドは制御経路を通ります。',
    diagram: {
      title: 'アーキテクチャ：6 つの構成要素、2 つの経路',
      text: '実線がデータ経路、破線が制御経路です。',
      data: 'データ経路',
      control: '制御経路',
      adapters: 'それぞれ専用のバックグラウンドプロセス',
      dataNodes: [
        ['Linux + NVIDIA ドライバー', '/proc · sysfs · NVML'],
        ['Adapter', ''],
        ['Collector', '単位 · 出所 · レート'],
        ['Manager', 'サンプリング · 設定 · 唯一の書き込み主体'],
        ['Store', 'スナップショット · 履歴 · 設定 · 操作の記録'],
        ['Viewer', '画面 · Ratatui'],
      ],
      controlNodes: [
        ['Controller', 'キー · マウス · コマンドライン'],
        ['Manager', 'コマンドを確認'],
        ['設定 · サンプリング · プロセス操作', ''],
        ['Viewer', '結果を表示'],
      ],
    },
    components: {
      head: ['構成要素', '役割'],
      rows: [
        [
          'Adapter',
          'ハードウェアを読みます：/proc、hwmon、thermal zone、powercap、GPU の NVML、ネットワーク、ファイルシステム。各 adapter は専用のバックグラウンドプロセスで動きます。',
        ],
        [
          'Collector',
          '読み取り値を指標に整えます：単位、重複する出所、値ごとの最適な出所、カウンターからのレート。',
        ],
        [
          'Manager',
          'サンプリングの計画、設定の適用、コマンドの確認を行い、データを書き込む唯一の構成要素です。',
        ],
        [
          'Store',
          'ライブスナップショット、履歴、設定、プロセス操作の記録を保持します。',
        ],
        ['Viewer', '整えられた表示用データから、Ratatui で画面を描きます。'],
        [
          'Controller',
          'キー、マウス操作、コマンドラインオプションをコマンドに変換します。',
        ],
      ],
    },
    codeIntro:
      'コードは、共通の契約 crate を中心にした 8 つの crate からなる Rust workspace です。',
    code: {
      head: ['Crate', '内容'],
      rows: crateRows([
        'プログラム本体：起動、コマンドライン、組み立て',
        '共通の型：指標、単位、コマンド、インターフェース',
        'バックグラウンドプロセス、IPC、worker、端末 I/O',
        'procfs、sysfs、NVML、プロセス操作',
        '正規化、出所の選択、レート',
        'スナップショット、履歴、設定、操作の記録（SQLite）',
        'サンプリング、設定、コマンド、表示用データ',
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
