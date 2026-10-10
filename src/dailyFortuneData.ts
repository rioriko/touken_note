export type SacredFortuneLevel =
  | '大吉'
  | '中吉'
  | '小吉'
  | '吉'
  | '半吉'
  | '末吉'
  | '末小吉'
  | '平'
  | '小凶'
  | '半凶'
  | '凶'
  | '末凶';

export interface SacredFortuneDefinition {
  level: SacredFortuneLevel;
  symbol: string;      // 象征: 天晴, 玉, 花, 灯, 月, 雪解, 芽, 水面, 薄雾, 缺月, 锈, 断火
  meaning: string;     // 核心含义: 万事通达, 得偿所愿, 缓慢生长, 等等
  color: string;       // 雅致主题色
  bgLight: string;     // 徽章背景色
  weight: number;      // 抽签权重
  divinationDesc: string; // 刀装占卜详解
  dailyEncouragement: string; // 每日晨签寄语
}

export const SACRED_FORTUNE_MAP: Record<SacredFortuneLevel, SacredFortuneDefinition> = {
  '大吉': {
    level: '大吉',
    symbol: '天晴',
    meaning: '万事通达',
    color: '#c62828', // 绯红正色
    bgLight: 'rgba(198, 40, 40, 0.1)',
    weight: 12,
    divinationDesc: '【天晴·万事通达】云开雾散，天光大彻！炉火纯青，刀装皆为特上精锐，出阵连战皆捷。',
    dailyEncouragement: '云开日朗，所行无阻。主殿尽可放手施为，万事皆随心愿。',
  },
  '中吉': {
    level: '中吉',
    symbol: '玉',
    meaning: '得偿所愿',
    color: '#e65100', // 琉璃暖金
    bgLight: 'rgba(230, 81, 0, 0.1)',
    weight: 14,
    divinationDesc: '【玉·得偿所愿】温润璞玉，渐露华彩。锻造得心应手，所期刀装与功勋必有回响。',
    dailyEncouragement: '心诚则灵，玉汝于成。静待佳音，所期所盼定得圆满。',
  },
  '小吉': {
    level: '小吉',
    symbol: '花',
    meaning: '缓慢生长',
    color: '#2e7d32', // 春木青翠
    bgLight: 'rgba(46, 125, 50, 0.1)',
    weight: 14,
    divinationDesc: '【花·缓慢生长】含苞待放，静候春信。刀装坚实可用，虽非极品亦蕴含生机。',
    dailyEncouragement: '花开有时，不急于一时。按部就班积累，枝头自见嫣红。',
  },
  '吉': {
    level: '吉',
    symbol: '灯',
    meaning: '有人指路',
    color: '#d97706', // 提灯暖黄
    bgLight: 'rgba(217, 119, 6, 0.1)',
    weight: 15,
    divinationDesc: '【灯·有人指路】孤夜明灯，照亮幽径。出征或锻造宜多问近侍良策，自得顺遂。',
    dailyEncouragement: '灯火长明，前路朗照。遇事不妨倾听众刃建言，自有良方。',
  },
  '半吉': {
    level: '半吉',
    symbol: '月',
    meaning: '半明半暗',
    color: '#0284c7', // 霁月天青
    bgLight: 'rgba(2, 132, 199, 0.1)',
    weight: 10,
    divinationDesc: '【月·半明半暗】阴晴圆缺，各安其位。刀装品质半数上乘、半数平常，处之泰然即可。',
    dailyEncouragement: '明月流转，暗处亦有清辉。得失之间，持平常心方见定力。',
  },
  '末吉': {
    level: '末吉',
    symbol: '雪解',
    meaning: '等待转机',
    color: '#0d9488', // 融雪松石青
    bgLight: 'rgba(13, 148, 136, 0.1)',
    weight: 9,
    divinationDesc: '【雪解·等待转机】寒冬将尽，残雪初融。刀装暂有波折，稍待时辰便现转机。',
    dailyEncouragement: '冰雪初融，春水方生。眼下困局将消，静守片刻即见生机。',
  },
  '末小吉': {
    level: '末小吉',
    symbol: '芽',
    meaning: '尚未显现',
    color: '#65a30d', // 嫩芽初青
    bgLight: 'rgba(101, 163, 13, 0.1)',
    weight: 8,
    divinationDesc: '【芽·尚未显现】地底萌芽，含蓄未发。所锻刀装潜力内敛，且待后续实战磨砺。',
    dailyEncouragement: '新芽破土，锋芒微露。虽未名动四方，潜心蓄力自待凌云。',
  },
  '平': {
    level: '平',
    symbol: '水面',
    meaning: '守常即可',
    color: '#475569', // 静水天蓝灰
    bgLight: 'rgba(71, 85, 105, 0.1)',
    weight: 8,
    divinationDesc: '【水面·守常即可】风平浪静，不起波澜。普通刀装照常配备，恪守本分，不求奇功。',
    dailyEncouragement: '心如止水，波澜不惊。按常理处本丸事务，无惊无险即是清福。',
  },
  '小凶': {
    level: '小凶',
    symbol: '薄雾',
    meaning: '判断失误',
    color: '#78716c', // 迷雾霭灰
    bgLight: 'rgba(120, 113, 108, 0.1)',
    weight: 4,
    divinationDesc: '【薄雾·判断失误】雾气障目，难辨虚实。刀装配比或有差错，宜复查配方后再动炉火。',
    dailyEncouragement: '雾气迷离，慎勿轻信初感。三思而定计，自可避开疏漏。',
  },
  '半凶': {
    level: '半凶',
    symbol: '缺月',
    meaning: '有所不足',
    color: '#64748b', // 缺角冷夜灰
    bgLight: 'rgba(100, 116, 139, 0.1)',
    weight: 3,
    divinationDesc: '【缺月·有所不足】器物有憾，砥石稍欠。刀装略有残损或兵力折损，宜及时修补。',
    dailyEncouragement: '世事难求全美，缺憾处乃精进之机。固本培元，查漏补缺。',
  },
  '凶': {
    level: '凶',
    symbol: '锈',
    meaning: '停滞、消耗',
    color: '#b45309', // 赤铁重锈色
    bgLight: 'rgba(180, 83, 9, 0.1)',
    weight: 2,
    divinationDesc: '【锈·停滞、消耗】锋芒积锈，虚掷粮草。锻造徒耗资源，宜暂歇炉火、保养佩刀。',
    dailyEncouragement: '久战易疲，空耗无益。今日宜闭门研墨、沐浴理装，切忌冒进。',
  },
  '末凶': {
    level: '末凶',
    symbol: '断火',
    meaning: '旧事未了',
    color: '#4c1d95', // 残烬玄紫
    bgLight: 'rgba(76, 29, 149, 0.1)',
    weight: 1,
    divinationDesc: '【断火·旧事未了】灶火骤歇，余烬尚存。先理清积压政务旧案，方可再谋新篇。',
    dailyEncouragement: '旧事未了，何开新局？收束往日羁绊，重燃炉火方见光明。',
  },
};

export const SACRED_FORTUNE_LIST = Object.values(SACRED_FORTUNE_MAP);

export interface DailyFortune {
  dateStr: string; // e.g. "2026年10月01日 星期四"
  lunarDateStr: string; // e.g. "丙申年 仲秋 廿一"
  solarTerm?: string; // 节气或吉相
  luckLevel: SacredFortuneLevel;
  symbol: string;      // 象征: 天晴, 玉, 花...
  meaning: string;     // 核心含义: 万事通达, 得偿所愿...
  luckColor: string; // color code
  bgLight?: string;
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

// 常见吉相宜忌词库 (扩展至60条和风本丸吉相与规诫词汇)
export const ALL_GOOD = [
  '锻造名刃', '整军出征', '马当番', '精铸刀装', '登用新刃',
  '远征筹粮', '演练切磋', '沐浴理发', '封缄奏帖', '品茗会友',
  '田当番', '手合锻炼', '手入修复', '整理兵库', '清点资材',
  '擦拭刀身', '更换刀装', '查阅战报', '巡视本丸', '晨起点名',
  '夜间巡逻', '修缮廊下', '打扫庭院', '晾晒御守', '赏樱观月',
  '静坐练字', '研墨抄经', '烹制点心', '备办宴席', '与近侍对弈',
  '翻阅古籍', '整理账册', '修剪庭木', '擦拭刀架', '缝补战袍',
  '调配药膏', '添置新茶', '悬挂风铃', '清扫锻刀房', '晾晒被褥',
  '陪短刀游戏', '照看马匹', '灶前试味', '登记战功', '校对出阵表',
  '更换拉门纸', '添购砥石', '巡查结界', '练习居合', '重读旧信',
  '书写日记', '与同僚谈心', '散步庭前', '晒太阳', '早睡养神',
  '整顿队伍编成', '赠送御守', '道谢同袍', '拜访神社', '收拾行装',
];

export const ALL_BAD = [
  '轻敌冒进', '强行锻刀', '懈怠内番', '刀装碎裂', '盲目单骑',
  '心浮气躁', '熬夜阅卷',
  '拖延手入', '空腹出阵', '无视远征归来', '临阵换队', '乱花资源',
  '暴食暴饮', '晨起迟到', '争吵拌嘴', '迁怒近侍', '擅自开炉',
  '疏于巡夜', '积压文书', '遗忘御守', '刀身积尘', '带伤出阵',
  '逞强硬撑', '夜半喧哗', '乱动他人刀架', '随意取笑', '揭人旧事',
  '忽视短刀', '冷落兄弟', '无端猜疑', '轻信传言', '空许承诺',
  '浪费茶饭', '弄脏白布', '踩踏庭苔', '拆东补西', '盲目囤积',
  '钻牛角尖', '拖欠回信', '贪功冒领', '错过点名', '偷懒耍滑',
  '不看战报', '刀装带错', '乱放砥石', '深夜锻刀', '通宵游戏',
  '抱怨连连', '过度自责', '与人赌气', '沉溺旧事', '拒绝帮助',
  '忘记道谢', '敷衍了事', '边走边看战报', '缺席手合', '疏忽结界',
  '夸夸其谈', '过度攀比', '临时变卦',
];

// Helper to check if a Neiban task matches today's '宜' (神佑)
export function isNeibanBlessed(
  neibanType: string,
  goodFor: string[]
): { isBlessed: boolean; matchedReason?: string } {
  if (!goodFor || goodFor.length === 0) return { isBlessed: false };
  for (const good of goodFor) {
    if (good === neibanType) {
      return { isBlessed: true, matchedReason: good };
    }
    // 马当番 / 照看马匹
    if (neibanType === '马当番' && (good === '马当番' || good === '照看马匹' || good.includes('马'))) {
      return { isBlessed: true, matchedReason: good };
    }
    // 畑当番 / 田当番
    if (neibanType === '畑当番' && (good === '田当番' || good === '畑当番' || good.includes('田') || good.includes('畑'))) {
      return { isBlessed: true, matchedReason: good };
    }
    // 手合场 / 手合锻炼
    if (neibanType === '手合场' && (good === '手合锻炼' || good === '手合场' || good.includes('手合'))) {
      return { isBlessed: true, matchedReason: good };
    }
    // 寝当番 / 早睡养神 / 晾晒被褥
    if (neibanType === '寝当番' && (good === '寝当番' || good.includes('早睡') || good.includes('被褥') || good.includes('寝'))) {
      return { isBlessed: true, matchedReason: good };
    }
  }
  return { isBlessed: false };
}

// Helper to check if a Neiban task matches today's '忌'
export function isNeibanTaboo(
  neibanType: string,
  badFor: string[]
): { isTaboo: boolean; matchedReason?: string } {
  if (!badFor || badFor.length === 0) return { isTaboo: false };
  for (const bad of badFor) {
    if (bad === '懈怠内番' || bad.includes('内番')) {
      return { isTaboo: true, matchedReason: bad };
    }
    if (neibanType === '手合场' && (bad === '缺席手合' || bad.includes('手合'))) {
      return { isTaboo: true, matchedReason: bad };
    }
    if (bad === neibanType || bad.includes(neibanType)) {
      return { isTaboo: true, matchedReason: bad };
    }
  }
  return { isTaboo: false };
}

const CHINESE_LUNAR_DAYS = [
  '', '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
  '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
  '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十',
];

const GANZHI = [
  '甲子', '乙丑', '丙寅', '丁卯', '戊辰', '己巳', '庚午', '辛未', '壬申', '癸酉',
  '甲戌', '乙亥', '丙子', '丁丑', '戊寅', '己卯', '庚辰', '辛巳', '壬午', '癸未',
  '甲申', '乙酉', '丙戌', '丁亥', '戊子', '己丑', '庚寅', '辛卯', '壬辰', '癸巳',
  '甲午', '乙未', '丙申', '丁酉', '戊戌', '己亥', '庚子', '辛丑', '壬寅', '癸卯',
  '甲辰', '乙巳', '丙午', '丁未', '戊申', '己酉', '庚戌', '辛亥', '壬子', '癸丑',
  '甲寅', '乙卯', '丙辰', '丁巳', '戊午', '己未', '庚申', '辛酉', '壬戌', '癸亥',
];

// 高精度精准农历算法（基于 JavaScript 原生 Intl.DateTimeFormat 'zh-Hans-u-ca-chinese' 真实天文学历法）
export function getAccurateLunarDate(date: Date = new Date()): string {
  try {
    const formatter = new Intl.DateTimeFormat('zh-Hans-u-ca-chinese', {
      dateStyle: 'full',
    });
    const parts = formatter.formatToParts(date);
    let yearName = parts.find((p) => (p.type as string) === 'yearName')?.value;
    let month = parts.find((p) => p.type === 'month')?.value || '';
    let day = parts.find((p) => p.type === 'day')?.value || '';

    // 若日数为数字（如 "1" 或 "21"），规范转换为传统农历称谓（如 "初一"、"廿一"）
    const dayNum = parseInt(day, 10);
    if (!isNaN(dayNum) && dayNum >= 1 && dayNum <= 30) {
      day = CHINESE_LUNAR_DAYS[dayNum];
    }

    if (!yearName) {
      const year = date.getFullYear();
      yearName = GANZHI[Math.abs(year - 4) % 60];
    }

    if (month && day) {
      return `${yearName}年 农历${month}${day}`;
    }
  } catch (err) {
    console.warn('Intl Chinese calendar fallback used:', err);
  }

  // 严谨降级
  return `${GANZHI[Math.abs(date.getFullYear() - 4) % 60]}年 农历九月初一`;
}

// 抽取今日签文与农历吉相
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

  // 固定的日期种子 (若是刷新时传入毫秒不同，可生成不同随机)
  const seed = Math.floor(date.getTime() / 1000) + year * 10000 + month * 100 + day;

  // 随机函数
  const pseudoRand = (s: number) => {
    const x = Math.sin(s) * 10000;
    return x - Math.floor(x);
  };

  // 12级神签加权抽选
  const totalFortuneWeight = SACRED_FORTUNE_LIST.reduce((sum, item) => sum + item.weight, 0);
  let fortuneRandVal = pseudoRand(seed) * totalFortuneWeight;
  let fortuneDef = SACRED_FORTUNE_LIST[0];
  for (const item of SACRED_FORTUNE_LIST) {
    if (fortuneRandVal < item.weight) {
      fortuneDef = item;
      break;
    }
    fortuneRandVal -= item.weight;
  }

  const luckLevel = fortuneDef.level;
  const luckColor = fortuneDef.color;
  const luckSymbol = fortuneDef.symbol;
  const luckMeaning = fortuneDef.meaning;

  // 查找对应近侍的箴言
  const charData = SWORD_CHARACTER_QUOTES[asstName];
  let quote = '';
  let characterTitle = asstSchool ? `${asstSchool} · 本丸近侍` : '本丸近侍';
  const goodSet = new Set<string>();
  const badSet = new Set<string>();

  if (charData) {
    const qIdx = Math.floor(pseudoRand(seed + 1) * charData.quotes.length);
    quote = charData.quotes[qIdx];
    characterTitle = charData.title;

    // 近侍特色宜项 (1项)
    if (charData.good && charData.good.length > 0) {
      const gIdx = Math.floor(pseudoRand(seed + 2) * charData.good.length);
      goodSet.add(charData.good[gIdx]);
    }
    // 近侍特色忌项 (1项)
    if (charData.bad && charData.bad.length > 0) {
      const bIdx = Math.floor(pseudoRand(seed + 3) * charData.bad.length);
      badSet.add(charData.bad[bIdx]);
    }
  } else {
    // 通用刀男风格
    const qIdx = Math.floor(pseudoRand(seed + 1) * GENERAL_QUOTES.length);
    quote = `主殿，今日由我【${asstName}】辅佐，定护佑本丸平安。${GENERAL_QUOTES[qIdx]}`;
  }

  // 从丰富的 ALL_GOOD 词库中抽选，补齐至 3~4 项
  let gSeedOffset = 4;
  while (goodSet.size < 4) {
    const candidate = ALL_GOOD[Math.floor(pseudoRand(seed + gSeedOffset) * ALL_GOOD.length)];
    if (candidate) goodSet.add(candidate);
    gSeedOffset++;
    if (gSeedOffset > 30) break;
  }

  // 从丰富的 ALL_BAD 词库中抽选，补齐至 3 项
  let bSeedOffset = 15;
  while (badSet.size < 3) {
    const candidate = ALL_BAD[Math.floor(pseudoRand(seed + bSeedOffset) * ALL_BAD.length)];
    if (candidate) badSet.add(candidate);
    bSeedOffset++;
    if (bSeedOffset > 45) break;
  }

  const goodFor = Array.from(goodSet);
  const badFor = Array.from(badSet);

  // 精准真实天文学农历称谓与天干地支年号
  const lunarDateStr = getAccurateLunarDate(date);

  return {
    dateStr: `${year}年${String(month).padStart(2, '0')}月${String(day).padStart(2, '0')}日 ${dayOfWeek}`,
    lunarDateStr,
    solarTerm: `神签象征 · 【${luckSymbol}】`,
    luckLevel,
    symbol: luckSymbol,
    meaning: luckMeaning,
    luckColor,
    bgLight: fortuneDef.bgLight,
    quote,
    quoteSpeaker: asstName,
    characterTitle,
    goodFor,
    badFor,
    encouragement: fortuneDef.dailyEncouragement,
  };
}
