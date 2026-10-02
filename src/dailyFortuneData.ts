export interface DailyFortune {
  dateStr: string; // e.g. "2026年10月01日 星期四"
  lunarDateStr: string; // e.g. "丙申年 仲秋 廿一"
  solarTerm?: string; // 节气或吉相
  luckLevel: '大吉' | '中吉' | '吉' | '小吉' | '末吉';
  luckColor: string; // color code
  quote: string; // 箴言
  quoteSpeaker: string; // 发言刀男
  characterTitle: string; // 刀男称号或身份
  goodFor: string[]; // 宜 (2-3条)
  badFor: string[]; // 忌 (2-3条)
  encouragement: string; // 寄语
}

// 常见刀剑男士专属箴言库
export const SWORD_CHARACTER_QUOTES: Record<
  string,
  {
    quotes: string[];
    title: string;
    good: string[];
    bad: string[];
  }
> = {
  '加州清光': {
    title: '新选组冲田总司之刃',
    quotes: [
      '主公，今天也把我打扮得漂漂亮亮吧！哪怕是出阵，我们也要保持最可爱的姿态哦。',
      '指甲油涂好了！今天无论是手合还是出征，我都会好好表现争取得到您的称赞的。',
      '被主公爱惜着，我就能发挥出真正的价值。今天也请不要移开注视我的目光哦。',
      '河原之子又如何？只要能在主公身边斩落敌人，我就永远是本丸最耀眼的那柄打刀。',
    ],
    good: ['修容理装', '出阵合战', '涂抹红甲', '讨要夸奖'],
    bad: ['衣衫不整', '忽视近侍', '轻慢保养'],
  },
  '三日月宗近': {
    title: '天下五剑 · 平安名刃',
    quotes: [
      '哈哈哈，甚好甚好。今日天朗气清，老爷爷我正想与主上一同品一杯清茶呢。',
      '人生路漫漫，不必急于求成。打磨刀刃正如磨砺心性，且随新月静看阴晴圆缺。',
      '无论时空如何变幻，守卫本丸的意志历经千年亦未曾磨损。主上，万事皆有定数，顺心即可。',
      '打除犹如夜空之月。今日出阵，老夫亦当为你披坚执锐。',
    ],
    good: ['对月品茗', '静心观澜', '锻造太刀', '从容处世'],
    bad: ['急躁冒进', '心神不宁', '忘餐废茶'],
  },
  '山姥切国广': {
    title: '堀川国广杰作 · 灵剑之仿',
    quotes: [
      '……别盯着我看！就算盖着这块白布，我斩落敌人的锋芒也不会有丝毫迟钝。',
      '不要称呼我为“赝品”……我是堀川国广倾注毕生心血的杰作。今天，就由我为你斩开前路。',
      '主公若是需要我，我就拔刀。仅此而已……哼，才没有因为被你依赖而高兴呢。',
    ],
    good: ['擦拭白布', '沉静潜修', '远征督查', '默默尽忠'],
    bad: ['肆意夸赞', '揭露面貌', '妄自菲薄'],
  },
  '压切长谷部': {
    title: '为主尽忠之烈刃',
    quotes: [
      '无论何时何地，只要主公一声令下，纵使斩断案几、手刃强敌，长谷部万死不辞！',
      '今日的本丸政务、内番与军需，臣已全部筹备妥当。主殿，请下达您今日的指示！',
      '只要是为了主公的宏愿，哪怕火烧敌阵，我也在所不惜。我的一切，皆为主公所赐。',
    ],
    good: ['恪尽职守', '雷厉风行', '整肃军纪', '请领御令'],
    bad: ['拖延公文', '懈怠阵务', '怠慢主公'],
  },
  '鹤丸国永': {
    title: '惊艳千载之白鹤',
    quotes: [
      '哟！今天又会有什么意想不到的惊吓等着我们呢？人生要是平平淡淡，那和死人有什么分别！',
      '白色的战袍若是染上鲜红的敌血，才是最壮丽的画卷啊。主殿，今天准备带我去哪儿大闹一场？',
      '嘿嘿，吓到你了吗？放松点，紧绷的弦容易折断，带着惊喜去迎战今日吧！',
    ],
    good: ['制造惊吓', '奇袭敌阵', '尝试新方', '开怀大笑'],
    bad: ['按部就班', '死气沉沉', '恐惧变局'],
  },
  '烛台切光忠': {
    title: '伊达忠义 · 潇洒刀客',
    quotes: [
      '今天也要保持帅气的仪容哦。无论是厨艺、内番还是作战，都要做得风度翩翩。',
      '主殿，午膳我已经拟好菜单了。填饱肚子，出战时才能保持最潇洒的身姿呢。',
      '刀出如龙，斩物如泥。哪怕劈碎青铜烛台，举止也要优雅利落。',
    ],
    good: ['精烹美食', '注重仪表', '潇洒出征', '照拂同僚'],
    bad: ['狼狈邋遢', '粗鲁言行', '腹空作战'],
  },
  '一期一振': {
    title: '粟田口长兄 · 丰臣遗爱',
    quotes: [
      '弟弟们承蒙主公关照了。今天我也会作为粟田口的长兄，坚定地守卫主公与本丸的安宁。',
      '无论经历了多少战火洗礼，只要看到弟弟们与主公的笑颜，一切磨难皆化为春风。',
    ],
    good: ['关照同袍', '抚育幼弟', '演练切磋', '温润待人'],
    bad: ['兄弟阋墙', '冷落家人', '冲动行事'],
  },
};

// 通用备选箴言库
export const GENERAL_QUOTES = [
  '刃如秋水，心似明镜。今日武运必随春樱而至。',
  '战局瞬息万变，唯有持定初心，方能一击破敌。',
  '内番照料良驹，战场挥斥方遒。劳逸相济乃名将之风。',
  '锻刀房烈火熊熊，每一簇火星都是新缘分的昭示。',
  '时间溯行军虽动，有众刃护持，本丸坚如磐石。',
  '清晨出鞘闻龙吟，暮归回鞘沐夕晖。主殿，今日亦平安顺遂。',
];

// 常见吉相宜忌词库
const ALL_GOOD = [
  '锻造名刃',
  '整军出征',
  '马当番',
  '精铸刀装',
  '登用新刃',
  '远征筹粮',
  '演练切磋',
  '沐浴理发',
  '封缄奏帖',
  '品茗会友',
];

const ALL_BAD = [
  '轻敌冒进',
  '强行锻刀',
  '懈怠内番',
  '刀装碎裂',
  '盲目单骑',
  '心浮气躁',
  '熬夜阅卷',
];

// 计算简单的农历对应展示（基于日期的伪随机确定性算法）
export function generateDailyFortune(
  asstName: string,
  asstSchool: string,
  date: Date = new Date()
): DailyFortune {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dayOfWeek = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][
    date.getDay()
  ];

  // 固定的日期种子
  const seed = year * 10000 + month * 100 + day;

  // 随机函数
  const pseudoRand = (s: number) => {
    const x = Math.sin(s) * 10000;
    return x - Math.floor(x);
  };

  const luckLevels: ('大吉' | '中吉' | '吉' | '小吉' | '末吉')[] = [
    '大吉',
    '大吉',
    '中吉',
    '中吉',
    '吉',
    '吉',
    '小吉',
  ];
  const luckColors = {
    '大吉': '#c62828', // header red
    '中吉': '#e65100', // orange
    '吉': '#f57f17', // amber
    '小吉': '#558b2f', // green
    '末吉': '#5d5146', // muted
  };

  const luckIndex = Math.floor(pseudoRand(seed) * luckLevels.length);
  const luckLevel = luckLevels[luckIndex];
  const luckColor = luckColors[luckLevel];

  // 查找对应近侍的箴言
  const charData = SWORD_CHARACTER_QUOTES[asstName];
  let quote = '';
  let characterTitle = asstSchool ? `${asstSchool} · 本丸近侍` : '本丸近侍';
  let goodFor: string[] = [];
  let badFor: string[] = [];

  if (charData) {
    const qIdx = Math.floor(pseudoRand(seed + 1) * charData.quotes.length);
    quote = charData.quotes[qIdx];
    characterTitle = charData.title;
    goodFor = [...charData.good];
    badFor = [...charData.bad];
  } else {
    // 通用刀男风格
    const qIdx = Math.floor(pseudoRand(seed + 1) * GENERAL_QUOTES.length);
    quote = `主殿，今日由我【${asstName}】辅佐，定护佑本丸平安。${GENERAL_QUOTES[qIdx]}`;
    goodFor = [
      ALL_GOOD[Math.floor(pseudoRand(seed + 2) * ALL_GOOD.length)],
      ALL_GOOD[Math.floor(pseudoRand(seed + 3) * ALL_GOOD.length)],
    ];
    badFor = [
      ALL_BAD[Math.floor(pseudoRand(seed + 4) * ALL_BAD.length)],
      ALL_BAD[Math.floor(pseudoRand(seed + 5) * ALL_BAD.length)],
    ];
  }

  // 农历天干地支年份模拟 (2026年为丙午年)
  const ganzhiYears = ['甲辰', '乙巳', '丙午', '丁未', '戊申', '己酉', '庚戌', '辛亥'];
  const ganzhiYear = ganzhiYears[(year - 2024) % ganzhiYears.length] || '丙午';

  const lunarMonths = [
    '正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊',
  ];
  const lunarDays = [
    '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
    '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
    '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十',
  ];

  // 基于日期的近似推算展示农历雅致称谓
  const lunarMonthIdx = (month + 10) % 12;
  const lunarDayIdx = (day + 15) % 30;
  const lunarDateStr = `${ganzhiYear}年 农历${lunarMonths[lunarMonthIdx]}月${lunarDays[lunarDayIdx]}`;

  return {
    dateStr: `${year}年${String(month).padStart(2, '0')}月${String(day).padStart(2, '0')}日 ${dayOfWeek}`,
    lunarDateStr,
    solarTerm: '武运昌隆 · 剑气冲霄',
    luckLevel,
    luckColor,
    quote,
    quoteSpeaker: asstName,
    characterTitle,
    goodFor,
    badFor,
    encouragement: '万事顺遂，愿主公今日武运恒昌，心想事成。',
  };
}
