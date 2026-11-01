import type { Locale } from '../../i18n/index.ts';

export const fanLabCopy = {
  'zh-hant': {
    title: 'P–Q 情境實驗室',
    intro:
      '這裡使用可調整的假想風扇，不代表任何產品或實測資料。先觀察曲線，再自行啟用系統阻抗；未輸入 K 時，不顯示工作點。',
    noScript:
      '互動控制需要 JavaScript；預設圖與下表仍可閱讀。預設為假想單顆風扇、全速、線性曲線，系統阻抗關閉。',
    controls: '假想條件',
    shape: '曲線形狀',
    linear: '線性示意',
    quadratic: '二次示意',
    flow: '全速自由風量 Qmax（CFM）',
    pressure: '全速截止壓力 Pmax（Pa）',
    speed: '轉速比例 r',
    arrangement: '理想配置',
    single: '單顆',
    parallel: '兩顆並聯',
    series: '兩顆串聯',
    system: '啟用假設的系統曲線',
    k: 'K（Pa / CFM²；自行輸入）',
    kHelp:
      'K 不是通用的機殼或冷排常數。可用同一系統的實測壓差與風量估算 K = ΔP / Q²，但平方律本身仍是近似。此欄不預填。',
    invalid:
      '請填入有效值：Qmax、Pmax 大於 0 且不超過 1000，r 大於 0 且不超過 1；啟用系統時，K 大於 0 且不超過 10。',
    off: '系統曲線關閉：沒有推算工作點。',
    pending: '尚未輸入有效 K：沒有推算工作點。',
    result: '模型交點',
    fan: '風扇模型（實線）',
    resistance: '系統模型（虛線）',
    chart: '假想風扇與系統的壓力–風量圖',
    flowAxis: '風量 Q（CFM）',
    pressureAxis: '壓差 ΔP（Pa）',
    table: '模型曲線取樣（不是實測）',
    sample: '取樣點',
    limits:
      'Qmax 與 Pmax 是不同端點，不能同時取得。公式：P = Pmax × (1 − Q/Qmax) 或 Pmax × (1 − (Q/Qmax)²)；轉速縮放 Q ∝ r、P ∝ r²。',
    assumptions:
      '串聯與並聯只示範相同風扇、相同轉速、理想均勻氣流的組合：串聯在相同風量下加壓，並聯在相同壓力下加風量。實際安裝的洩漏、旋流、進氣干擾、失速、振動與噪音不在模型內；不能用此圖預測溫度、噪音或產品排名。',
  },
  en: {
    title: 'P–Q scenario lab',
    intro:
      'This adjustable hypothetical fan represents no product or measured dataset. Explore the curve, then optionally enable system resistance. No operating point appears until you enter K.',
    noScript:
      'Interactive controls require JavaScript; the default chart and table remain readable. The default is one hypothetical fan at full speed with a linear curve and system resistance off.',
    controls: 'Hypothetical conditions',
    shape: 'Curve shape',
    linear: 'Linear illustration',
    quadratic: 'Quadratic illustration',
    flow: 'Full-speed free-air flow Qmax (CFM)',
    pressure: 'Full-speed shutoff pressure Pmax (Pa)',
    speed: 'Speed ratio r',
    arrangement: 'Ideal arrangement',
    single: 'One fan',
    parallel: 'Two in parallel',
    series: 'Two in series',
    system: 'Enable an assumed system curve',
    k: 'K (Pa / CFM²; enter your own value)',
    kHelp:
      'K is not a universal case or radiator constant. Measurements of pressure drop and flow in the same system can estimate K = ΔP / Q², but the square law itself remains an approximation. This field has no preset.',
    invalid:
      'Enter valid values: Qmax and Pmax above 0 and at most 1000; r above 0 and at most 1; with the system enabled, K above 0 and at most 10.',
    off: 'System curve off: no estimated operating point.',
    pending: 'No valid K entered: no estimated operating point.',
    result: 'Model intersection',
    fan: 'Fan model (solid)',
    resistance: 'System model (dashed)',
    chart: 'Pressure–flow chart of a hypothetical fan and system',
    flowAxis: 'Flow Q (CFM)',
    pressureAxis: 'Pressure ΔP (Pa)',
    table: 'Model curve samples (not measurements)',
    sample: 'Sample',
    limits:
      'Qmax and Pmax are different endpoints and cannot occur together. Equations: P = Pmax × (1 − Q/Qmax) or Pmax × (1 − (Q/Qmax)²); speed scaling uses Q ∝ r and P ∝ r².',
    assumptions:
      'Series and parallel illustrate identical fans at identical speed with ideal uniform airflow: series adds pressure at equal flow; parallel adds flow at equal pressure. Installation leakage, swirl, inlet interference, stall, vibration and noise are outside this model. Do not use it to predict temperatures, noise or product rankings.',
  },
  ja: {
    title: 'P–Q シナリオ実験室',
    intro:
      '調整できる仮想ファンであり、製品や実測データを表すものではありません。曲線を確認した後、必要ならシステム抵抗を有効にしてください。K を入力するまで動作点は表示しません。',
    noScript:
      '操作には JavaScript が必要です。初期状態の図と表はそのまま読めます。初期状態は全速の仮想ファン 1 台、線形曲線、システム抵抗は無効です。',
    controls: '仮定する条件',
    shape: '曲線の形',
    linear: '線形の模式曲線',
    quadratic: '二次の模式曲線',
    flow: '全速の自由風量 Qmax（CFM）',
    pressure: '全速の締切圧力 Pmax（Pa）',
    speed: '回転数比 r',
    arrangement: '理想的な配置',
    single: '1 台',
    parallel: '2 台を並列',
    series: '2 台を直列',
    system: '仮定したシステム曲線を有効にする',
    k: 'K（Pa / CFM²；値を入力）',
    kHelp:
      'K はケースやラジエーターに共通する定数ではありません。同じシステムの圧力損失と風量の実測値から K = ΔP / Q² と推定できますが、二乗則自体も近似です。初期値は設定していません。',
    invalid:
      '有効な値を入力してください。Qmax と Pmax は 0 より大きく 1000 以下、r は 0 より大きく 1 以下。システムを有効にした場合、K は 0 より大きく 10 以下です。',
    off: 'システム曲線は無効です。動作点は推定しません。',
    pending: '有効な K が未入力のため、動作点は推定しません。',
    result: 'モデルの交点',
    fan: 'ファンモデル（実線）',
    resistance: 'システムモデル（破線）',
    chart: '仮想ファンとシステムの圧力–風量図',
    flowAxis: '風量 Q（CFM）',
    pressureAxis: '圧力差 ΔP（Pa）',
    table: 'モデル曲線のサンプル（実測ではない）',
    sample: 'サンプル',
    limits:
      'Qmax と Pmax は異なる端点であり、同時には得られません。式：P = Pmax × (1 − Q/Qmax) または Pmax × (1 − (Q/Qmax)²)。回転数による換算は Q ∝ r、P ∝ r² です。',
    assumptions:
      '直列と並列は、同じファンを同じ回転数で使い、気流が理想的に均一な場合の例です。直列では同じ風量で圧力を加算し、並列では同じ圧力で風量を加算します。取り付け時の漏れ、旋回流、吸気干渉、失速、振動、騒音はモデルに含みません。温度、騒音、製品順位の予測には使えません。',
  },
} satisfies Record<Locale, Record<string, string>>;

export const measuredFanCopy = {
  'zh-hant': {
    title: '實測轉錄曲線瀏覽器',
    select: '報告與來源設定',
    setting: '來源設定',
    report: '報告',
    intro:
      '368 組原始有效掃描，加上 2 組獨立高速模式，共 370 條曲線。數據由 Cybenetics 量測，本頁轉錄自提供的資料；不是本站自行測試，也不宣稱所有點都已重新向原報告核對。13 組隔離掃描不提供計算。',
    source: '開啟原始報告',
    fresh: '這次已逐點核對 Q/P；不代表轉速、電流或噪音全部核對。',
    archived: '附件轉錄；這次未逐點重新核對原始報告。',
    caveat:
      '設定百分比是報告的 Speed Setting，不是已確認的 PWM duty。單次掃描中的 RPM 可能隨負載改變，請直接使用原始點，不套用固定 RPM 比例縮放。負壓與局部非單調段原樣保留。',
    probe: '查詢風量 Q（CFM）',
    result: '分段線性內插',
    invalid: '請輸入曲線涵蓋範圍內的有限風量；不外插、不補零壓端點。',
    chart: '原始採樣點與點對點直線',
    table: '來源採樣值；連線只是內插',
    flow: '風量',
    pressure: '壓差',
    rpm: '轉速',
    current: '電流',
    power: '功率',
    noScript:
      '無 JavaScript 時顯示預設報告的圖與完整採樣表；切換與查詢需要 JavaScript。',
    sandbox: '另開假想情境：不使用上方產品數據',
  },
  en: {
    title: 'Measured-curve transcription explorer',
    select: 'Report and source setting',
    setting: 'Source setting',
    report: 'Report',
    intro:
      '368 valid archive scans plus 2 separate high-speed modes: 370 curves. Cybenetics measured these data, transcribed here from the supplied material. These are not site-owner tests, and not every point has been rechecked against the original reports. Thirteen quarantined scans are excluded from calculation.',
    source: 'Open original report',
    fresh:
      'Q/P points rechecked this time; this does not imply every RPM, current or noise value was checked.',
    archived:
      'Attachment transcription; the original report was not rechecked point by point this time.',
    caveat:
      'The percentage is the report’s Speed Setting, not verified PWM duty. RPM may change with load within one scan. Use the recorded points directly, without fixed-RPM scaling. Negative pressures and locally nonmonotonic segments are preserved.',
    probe: 'Flow probe Q (CFM)',
    result: 'Piecewise-linear interpolation',
    invalid:
      'Enter a finite flow within the recorded domain. No extrapolation or invented zero-pressure endpoint.',
    chart: 'Recorded sample points with point-to-point straight lines',
    table: 'Recorded samples; connecting lines are interpolation only',
    flow: 'Flow',
    pressure: 'Pressure',
    rpm: 'Speed',
    current: 'Current',
    power: 'Power',
    noScript:
      'Without JavaScript, the default report’s chart and full sample table remain visible. Selection and probing require JavaScript.',
    sandbox:
      'Separate hypothetical scenario: does not use the product data above',
  },
  ja: {
    title: '実測値の転記曲線ビューアー',
    select: '報告と出典の設定',
    setting: '出典の設定',
    report: '報告',
    intro:
      '元資料の有効な 368 スキャンに、独立した高速モード 2 件を加えた計 370 曲線です。Cybenetics の測定値を提供資料から転記したもので、サイト運営者による測定ではありません。すべての点を元報告と再照合したわけではありません。隔離した 13 スキャンは計算から除外しています。',
    source: '元の報告を開く',
    fresh:
      '今回は Q/P の各点を照合済みです。回転数・電流・騒音の全項目を照合したことは意味しません。',
    archived:
      '添付資料からの転記です。今回は元報告との全点照合を行っていません。',
    caveat:
      '百分率は報告の Speed Setting であり、確認済みの PWM duty ではありません。1 回のスキャン中にも負荷で RPM が変わることがあります。記録された点を直接使い、固定 RPM による比例換算はしません。負圧と局所的に非単調な区間も保持しています。',
    probe: '照会する風量 Q（CFM）',
    result: '区分線形補間',
    invalid:
      '記録された範囲内の有限の風量を入力してください。外挿やゼロ圧端点の補完はしません。',
    chart: '記録された測定点と点同士を結ぶ直線',
    table: '出典の測定値。点を結ぶ線は補間のみ',
    flow: '風量',
    pressure: '圧力差',
    rpm: '回転数',
    current: '電流',
    power: '電力',
    noScript:
      'JavaScript がなくても初期報告の図と全測定点の表を読めます。切り替えと照会には JavaScript が必要です。',
    sandbox: '別の仮想シナリオ：上の製品データは使用しません',
  },
} satisfies Record<Locale, Record<string, string>>;
