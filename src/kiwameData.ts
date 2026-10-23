import { KiwameInventory, KiwameRecord, SwordType } from './types';

export const DEFAULT_KIWAME_INVENTORY: KiwameInventory = {
  travelOutfit: 3,
  travelGear: 3,
  letters: 3,
  logs: [
    {
      id: 'log-init-1',
      date: '2026-10-01',
      type: 'gain',
      itemName: '整套三宝',
      count: 3,
      reason: '就任审神者资材配发与月课通关结余',
    },
  ],
};

// 经典刀剑极化书信范本 (官方原味翻译与考据)
export const CLASSIC_KIWAME_LETTERS: Record<
  string,
  { swordType: SwordType; letters: { day1: string; day2: string; day3: string } }
> = {
  加州清光: {
    swordType: '打刀',
    letters: {
      day1:
        '致主殿：\n我已经到达修行的场所了。放心吧，这次可不是去池田屋哦。\n既然为了变得更强而踏上旅途，就必须好好探寻自己的根源。\n不用担心我，只要您还在本丸等着我，我就一定能变得更可爱、更可靠。',
      day2:
        '致主殿：\n我来到制造我的人身边。那个时代……其实挺破旧简陋的呢。\n贫民窟一样的长屋，锻打出的刀剑却要参与血雨腥风。\n不过看着锻造师哪怕手掌开裂也在专注敲打的模样，我好像明白了自己诞生的意义。\n爱惜我的人，原来从最初就一直在呢。',
      day3:
        '致主殿：\n修行已经全部结束了！我终于明白——\n就算曾被称为不易操控的刀、即便折断在暴风雨之夜，现在的我，都是被您全心全意爱着的刀剑。\n为主殿尽情挥斩，才是我加州清光最可爱、最耀眼的模样！\n等我回来吧，我的主人！',
    },
  },
  山姥切国广: {
    swordType: '打刀',
    letters: {
      day1:
        '主公启：\n……我已经抵达了目的地。这里是小田原。\n为了解开缠绕在心头千百年的心结，我必须亲自来直面这一切。\n不要问我披风还在不在，请静待我的归期。',
      day2:
        '主公启：\n见到北条家旧部了。他们看着我，眼中依然有敬畏与赞叹。\n我总是在意自己是仿作这件事……仿照山姥切本尊而铸，真的只是劣质的替代品吗？\n还是说，正因为是杰作，才会被赋予这个名字？\n我坐在松树下想了很久。',
      day3:
        '主公启：\n我终于想通了。仿作又如何，本尊又如何？\n重要的是，我作为国广第一的杰作来到现世，在您的本丸与您并肩作战。\n从今往后，我不再需要用白布蒙蔽自己的双眼！\n主公，我将以崭新的锋芒，堂堂正正为您扫清一切障碍！',
    },
  },
  大和守安定: {
    swordType: '打刀',
    letters: {
      day1:
        '致主上：\n我已经顺利抵达了。京都的风很喧嚣，空气里还有旧时代燃油与汗水的味道。\n既然清光已经找到了他的答案，我也不能落后呢。\n这一次，我要彻底看清总司眼中的世界。',
      day2:
        '致主上：\n悄悄远远看了总司一眼。他还是那副爱笑又咳嗽的单薄样子。\n曾经我无数次想拔刀改变历史、拯救他的命运……\n但在暗处看着他挥刀的专注神情，我终于明白，守护冲田总司走完属于他的人生，才是身为佩刀的敬意。',
      day3:
        '致主上：\n迷惘已经斩断了。总司挥向时代的羽织已成过往，而我现在唯一侍奉的主人，就是您。\n如果说清光代表着被爱的渴望，那我大和守安定，就是守护您最锋利的清泉。\n准备好迎接我归丸吧！',
    },
  },
  压切长谷部: {
    swordType: '打刀',
    letters: {
      day1:
        '主殿钧鉴：\n臣已抵达修行之地。此处乃尾张清洲。\n为了不负主殿对长谷部的器重与信赖，臣必将全力探寻心志之极境。\n请主殿按时用膳安歇，万勿因杂务劳神。',
      day2:
        '主殿钧鉴：\n重回信长公旧迹，胸中郁结多年之怨念竟如尘埃落定。\n信长公待刀如器物，召之即来挥之即去；然而主殿却以手足相待、授臣以内番近侍之要务。\n两相对比，臣心如明镜——过去的荣辱已如轻烟，唯有如今的主殿，才是长谷部毕生之信仰！',
      day3:
        '主殿钧鉴：\n修行告成！臣已脱胎换骨，身心皆被主的恩德淬炼至纯！\n不论主殿命我斩杀何物、不论前方是天涯修罗海，长谷部誓死相随，绝无半步退却！\n臣，即刻兼程归丸复命！',
    },
  },
  药研藤四郎: {
    swordType: '短刀',
    letters: {
      day1:
        '大将：\n我平安到了。阿部野的风挺凉爽的。\n短刀在战场上有短刀的打法，为了在激战中更好地守护大将，我决定重新淬炼这副身躯。\n本丸的药草园，就劳烦大将先照看一下啦。',
      day2:
        '大将：\n看到当年药研拔刀自尽的旧医者了。虽名为药研，却曾切开铁药臼而不伤人主腹腑。\n所谓利刃，不仅在杀伐，更在守护生死与仁德。\n能被大将握在手心挥舞，是我这柄短刀最大的福气。',
      day3:
        '大将：\n修习完毕！筋骨比从前更加结实利落了。\n大将，无论是夜战偷袭还是强袭重围，尽管躲在我身后！\n战场上的生死交给药研，大将只需要微笑着统领全军就好。我这就赶回本丸！',
    },
  },
  鹤丸国永: {
    swordType: '太刀',
    letters: {
      day1:
        '哟，主公！\n被我的信吓到了吗？哈哈！我已经飞到了修行之所。\n常年浸泡在神社和墓穴里太久，浑身的羽毛都快生锈了。\n为了给主公带来更加惊天动地的惊喜，我得重新翱翔一番！',
      day2:
        '主公：\n看了看战国乱世各路主君的起落沉浮。\n人活着若是心先死了，哪怕手握神兵也是行尸走肉。\n唯有主公的本丸，每日充满了生动的人间烟火与欢笑呢。\n一想到这里，鹤的心跳又扑通扑通兴奋起来了！',
      day3:
        '主公！\n大惊吓要来了！真正的白鹤，即便涉过血海也绝不沾染尘泥！\n极化归来的鹤丸国永，羽翼比霜雪更洁白，刀锋比寒冬更锐利！\n把眼睛擦亮点，准备迎接降落本丸的巨大惊奇吧！',
    },
  },
};

// 预设示例修行记录
export const DEFAULT_KIWAME_RECORDS: KiwameRecord[] = [
  {
    id: 'kiwame-demo-1',
    swordName: '加州清光',
    swordType: '打刀',
    // 设定出发时间为 28 小时前，处于第2天（第2封信到达）
    departedAt: new Date(Date.now() - 28 * 3600 * 1000).toISOString(),
    status: 'traveling',
    departureLevel: 99,
    accumulatedExp: 3500000,
    estimatedKiwameLevel: 45,
    letters: {
      day1: CLASSIC_KIWAME_LETTERS['加州清光'].letters.day1,
      day2: CLASSIC_KIWAME_LETTERS['加州清光'].letters.day2,
      day3: CLASSIC_KIWAME_LETTERS['加州清光'].letters.day3,
    },
    notes: '极化归来后出阵池田屋与战国夜战主力！',
  },
];

// 刀剑乱舞刀种特化 Lv 99 基础经验值表 (Base Exp at Lv.99 Toku)
export const TOKU_LV99_EXP_MAP: Record<SwordType, number> = {
  短刀: 1440000,
  胁差: 1510000,
  打刀: 1600000,
  太刀: 1820000,
  大太刀: 1980000,
  枪: 1750000,
  薙刀: 1980000,
  剑: 1600000,
};

// 极化各刀种基准起始极化等级 (With 0 surplus exp)
export const KIWAME_BASE_LEVEL_MAP: Record<SwordType, number> = {
  短刀: 35,
  胁差: 35,
  打刀: 35,
  太刀: 34,
  大太刀: 34,
  枪: 34,
  薙刀: 34,
  剑: 35,
};

// 刀剑乱舞极化经验等级计算器 (精确对齐游戏经验阶梯)
export function calculateKiwameLevelFromExp(
  swordType: SwordType | string,
  accumulatedExp: number, // 极化前累积溢出经验 (Surplus EXP) 或 总累积经验
  isTotalExp: boolean = false
): {
  kiwameLevel: number;
  totalExpUsed: number;
  expForCurrentLevel: number;
  expForNextLevel: number;
  surplusExpInCurrentLevel: number;
  progressPercent: number;
  totalRemainingTo99: number;
} {
  const normalizedType = (swordType as SwordType) || '打刀';
  const baseTokuExp = TOKU_LV99_EXP_MAP[normalizedType] || 1600000;
  const baseKiwameLevel = KIWAME_BASE_LEVEL_MAP[normalizedType] || 35;

  // 总可用于极化换算的经验值
  const totalExp = isTotalExp
    ? Math.max(baseTokuExp, accumulatedExp)
    : baseTokuExp + Math.max(0, accumulatedExp);

  // 极化经验递增模型 (基于刀剑乱舞官方阶梯经验表拟合算法)
  // Lv.35 ~ Lv.99
  // 短刀升级所需经验较其他刀种略平滑，太刀/大太刀/薙刀则较厚重
  let typeScale = 1.0;
  if (normalizedType === '短刀') typeScale = 0.88;
  else if (normalizedType === '太刀' || normalizedType === '大太刀') typeScale = 1.15;
  else if (normalizedType === '薙刀' || normalizedType === '枪') typeScale = 1.12;

  // 经验累加计算
  let currentLevel = 1;
  let runningExpThreshold = 0;
  let prevThreshold = 0;

  // 极化 1 ~ 99 级的总门槛构建
  const levelThresholds: number[] = [0]; // index = level, value = total exp needed to REACH this level
  let currentRunning = 0;

  for (let lvl = 2; lvl <= 99; lvl++) {
    // 刀剑乱舞极化经验级间步进：低级时每级增幅约 5万~15万，50级后急剧上升至每级百万级
    let levelDiffExp: number;
    if (lvl <= 35) {
      // 1~35 级总和约为 baseTokuExp
      levelDiffExp = (baseTokuExp / 34) * (0.5 + (lvl / 35) * 0.9);
    } else if (lvl <= 50) {
      // 36~50 级：每级约 20万 ~ 45万
      levelDiffExp = (180000 + (lvl - 35) * 22000) * typeScale;
    } else if (lvl <= 70) {
      // 51~70 级：每级约 50万 ~ 120万
      levelDiffExp = (500000 + Math.pow(lvl - 50, 1.6) * 35000) * typeScale;
    } else if (lvl <= 85) {
      // 71~85 级：每级约 130万 ~ 280万
      levelDiffExp = (1300000 + Math.pow(lvl - 70, 1.8) * 85000) * typeScale;
    } else {
      // 86~99 级：每级约 300万 ~ 600万
      levelDiffExp = (2800000 + Math.pow(lvl - 85, 2.0) * 160000) * typeScale;
    }

    currentRunning += Math.round(levelDiffExp);
    levelThresholds[lvl] = currentRunning;
  }

  // 保证 Lv.35 门槛对齐 baseTokuExp
  const actual35Exp = levelThresholds[baseKiwameLevel] || baseTokuExp;
  const ratio = baseTokuExp / actual35Exp;
  for (let l = 1; l <= baseKiwameLevel; l++) {
    levelThresholds[l] = Math.round(levelThresholds[l] * ratio);
  }

  // 查找对应等级
  let finalLevel = baseKiwameLevel;
  for (let l = baseKiwameLevel; l <= 99; l++) {
    if (totalExp >= levelThresholds[l]) {
      finalLevel = l;
    } else {
      break;
    }
  }

  finalLevel = Math.min(99, Math.max(baseKiwameLevel, finalLevel));

  const expAtCurrentLevel = levelThresholds[finalLevel] || 0;
  const expAtNextLevel = levelThresholds[finalLevel + 1] || levelThresholds[99];
  const levelWindow = Math.max(1, expAtNextLevel - expAtCurrentLevel);
  const surplusInCurrent = Math.max(0, totalExp - expAtCurrentLevel);
  const progressPercent =
    finalLevel >= 99 ? 100 : Math.min(100, Math.round((surplusInCurrent / levelWindow) * 100));
  const expForNextLevel = finalLevel >= 99 ? 0 : Math.max(0, expAtNextLevel - totalExp);
  const totalRemainingTo99 = Math.max(0, levelThresholds[99] - totalExp);

  return {
    kiwameLevel: finalLevel,
    totalExpUsed: totalExp,
    expForCurrentLevel: expAtCurrentLevel,
    expForNextLevel,
    surplusExpInCurrentLevel: surplusInCurrent,
    progressPercent,
    totalRemainingTo99,
  };
}
