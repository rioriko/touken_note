export type NoteTag =
  | '日常'
  | '内番'
  | '马当番'
  | '畑当番'
  | '手合场'
  | '寝当番'
  | '出征'
  | '远征'
  | '演练'
  | '刀装'
  | '锻刀'
  | '刀解';

export interface Note {
  id: string;
  content: string;
  date: string;
  tag: NoteTag | string;
}

export type NeibanType = '马当番' | '畑当番' | '手合场' | '寝当番';

export type NeibanStatus = 'completed' | 'half' | 'escaped' | 'pending';

export interface NeibanRecord {
  id: number;
  date: string;
  name: string;
  type: NeibanType;
  done: boolean; // 兼容旧字段 (progress === 100)
  progress?: number; // 0, 50, 100 (%)
  status?: NeibanStatus; // 'completed' | 'half' | 'escaped' | 'pending'
  escapeReason?: string; // 逃番借口/逸事 (如: "偷溜去后山捉雀被歌仙抓包", "借口保养白布逃离畑当番")
}

export type SwordType =
  | '短刀'
  | '胁差'
  | '打刀'
  | '太刀'
  | '大太刀'
  | '枪'
  | '薙刀'
  | '剑';

export interface DaozhangMemoEntry {
  id: string;
  date: string;
  category: '互动小记' | '刀装心得' | '问答签文' | '出阵手札';
  content: string;
}

// ================= EXPEDITION REPORT (远征战报与资源统计) =================
export interface ExpeditionRecord {
  id: string;
  date: string; // YYYY-MM-DD
  area: string; // e.g. "时代1-鸟羽", "B-1 公武合体运动"
  fleet: string; // e.g. "第二部队", "第三部队"
  result: '大成功' | '成功' | '失败';
  charcoal: number; // 木炭收获
  steel: number; // 玉钢收获
  coolant: number; // 冷却材收获
  whetstone: number; // 砥石收获
  charcoalExpense?: number; // 木炭消耗 (手入/补给)
  steelExpense?: number; // 玉钢消耗
  coolantExpense?: number; // 冷却材消耗
  whetstoneExpense?: number; // 砥石消耗
  itemsEarned?: string; // 获赠道具 (例如: 小判箱、加速札、手入札)
  notes?: string;
}

// ================= FORGE & DISMANTLE (锻刀显现与刀解消纳) =================
export type OfudaType = '无' | '梅' | '竹' | '松' | '富士';

export interface ForgeRecord {
  id: string;
  date: string; // YYYY-MM-DD
  charcoal: number; // 木材 / 木炭 (例如: 350, 500, 800)
  steel: number; // 玉钢 (例如: 350, 500, 800)
  coolant: number; // 冷却材 (例如: 350, 500, 800)
  whetstone: number; // 砥石 (例如: 350, 500, 800)
  duration: string; // 锻刀时长 (例如: "04:00:00", "03:20:00", "01:30:00", "00:20:00")
  swordName: string; // 锻获刀剑男士名讳 (例如: "三日月宗近")
  swordType?: SwordType | string; // 刀种 (例如: "太刀")
  assistant?: string; // 执炉近侍 (例如: "山姥切国广")
  ofuda?: OfudaType | string; // 御札加护 (无/梅/竹/松/富士)
  notes?: string; // 锻刀心得、祈愿或炉火记事
}

export interface ForgeRecipe {
  id: string;
  name: string; // 配方名称 (如 "All 350", "大太刀专用公式", "三日月黄金配方")
  charcoal: number; // 木材 / 木炭
  steel: number; // 玉钢
  coolant: number; // 冷却材
  whetstone: number; // 砥石
  targetSword?: string; // 目标刀剑男士 (如 "三日月宗近 / 小狐丸")
  swordType?: SwordType | string; // 推荐刀种
  expectedDuration?: string; // 预期时长 (如 "04:00:00")
  notes?: string; // 玄学配方小注、御札搭配等
  isFavorite?: boolean; // 是否收藏置顶
  createdAt?: string; // 创建时间
}

export interface DismantleRecord {
  id: string;
  date: string; // YYYY-MM-DD
  swordName: string; // 刀解刀剑男士名讳
  swordType?: SwordType | string; // 刀种
  count: number; // 刀解数量 (如 1 振)
  charcoalReturned: number; // 回收木材
  steelReturned: number; // 回收玉钢
  coolantReturned: number; // 回收冷却材
  whetstoneReturned: number; // 回收砥石
  reason?: string; // 刀解缘由 (例如: "重复显现回炉", "兵库满位整理", "资材周转")
  notes?: string; // 刀解札记
}

export type TreasureTag = '出阵战绩' | '男士肖像' | '近侍手绘' | '本丸景趣' | '现世谷美' | '特别机密';

export interface TreasureItem {
  id: string;
  title: string;
  imageUrl: string; // Base64 data URL or external URL
  date: string;
  tag: TreasureTag | string;
  swordId?: string; // 关联本丸刀账中的刀剑男士 (可选)
  swordName?: string;
  caption?: string; // 手帐回忆小注
  rotation?: number; // 拍立得挂饰微旋转角度 (-4 到 +4 度)
}

// ================= WEEKLY PLANNER (周度手札) =================
export interface WeeklyTodoItem {
  id: string;
  text: string;
  done: boolean;
}

export type WeekdayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export interface SingleWeekRecord {
  goalMemo?: string;
  days: {
    [key in WeekdayKey]?: WeeklyTodoItem[];
  };
  todoStickyNotes?: string;
}

export interface WeeklyPlannerData {
  id: string; // e.g. "2026-W42"
  year: number;
  monthIndex: number; // 1-12
  weekIndex: number; // 1-5
  goalMemo: string; // 当前周便利贴寄语与习惯打卡 (兼容字段)
  days: {
    [key in WeekdayKey]?: WeeklyTodoItem[];
  }; // 当前周待办清单 (兼容字段)
  todoStickyNotes: string; // 当前周右下角手绘和纸板重要待办日程 (兼容字段)
  // 按星期独立保存之多周记录字典，键名格式："${year}-M${monthIndex}-W${weekIndex}" (如: "2026-M10-W1")
  weeks?: {
    [weekKey: string]: SingleWeekRecord;
  };
}

export interface DaozhangRecord {
  id: string;
  number: string; // 刀剑番号 (如 "No.003", "003", "085")
  name: string; // 刀剑男士名讳 (如 "三日月宗近")
  swordType: SwordType | string; // 刀种 (短刀/胁差/打刀/太刀等)
  school: string; // 流派 (三条/粟田口/来/左文字等)
  date: string; // 显现 / 收入日期 (如 "2026-09-25")
  notes: string; // 源起 / 逸事考录
  favorite?: boolean;
  bondLevel?: number; // 羁绊值 (1-5 颗星，默认 1)
  level?: number | string; // 刀剑修习等级 (如 1-99，或 "极 35"，默认 1)
  count?: number; // 本丸当前保有数量 (默认 1 振)
  forgeCount?: number; // 累计锻造显现数量 (默认 1)
  dismantleCount?: number; // 累计刀解回炉数量 (默认 0)
  memoEntries?: DaozhangMemoEntry[]; // 互动小记、刀装问答签文备忘录
}

export type ColorTheme = 'sakura' | 'koubai' | 'take' | 'fuji' | 'wisteria';

export type SceneryType = 'none' | 'sakura' | 'maple' | 'snow' | 'firefly';

export type AmbientSoundType = 'windbell' | 'paper' | 'brush' | 'rain' | 'custom';

export interface WordCard {
  id: string;
  text: string;
  author?: string; // 刀剑男士名讳或出处，如 "山姥切国广"
  category?: string; // 语录类别，如 "问候" | "激励" | "日常" | "出阵" | "玄学"
  createdAt?: string; // 记录时间
}

export interface BenwanConfig {
  confirmDelete: boolean;
  theme: 'light' | 'dark' | 'system';
  colorTheme?: ColorTheme;
  scenery?: SceneryType; // 本丸时令景趣轻动效
  audioEnabled?: boolean; // 是否启用和风环境音效 (默认静音 false)
  ambientSoundType?: AmbientSoundType; // 选用的环境音效模式
  customAudioUrl?: string; // 用户自定义上传或绑定的音频 URL / Base64
  customAudioName?: string; // 自定义音频名称
  about: string;
  honmaruName?: string; // 自定义本丸名字 (例如: "大和", "浅樱", "相模")
  saniwaName?: string; // 审神者尊号 (例如: "审神者", "主殿")
  hasInitializedProfile?: boolean; // 是否已完成初次就任引导登记
  bubbleEnabled?: boolean; // 是否启用近侍气泡问候 (默认开启 true)
  bubbleInterval?: number; // 气泡自动弹出间隔秒数 (默认 60 秒)
  bubbleDuration?: number; // 气泡停留时长秒数 (默认 12 秒)
}

export interface Assistant {
  name: string;
  school: string;
  swordType?: string;
}

export const COMMON_SWORD_TYPES: SwordType[] = [
  '短刀',
  '胁差',
  '打刀',
  '太刀',
  '大太刀',
  '枪',
  '薙刀',
  '剑',
];

export const COMMON_SCHOOLS = [
  '三条',
  '粟田口',
  '来',
  '古备前',
  '备前长船',
  '左文字',
  '兼定',
  '堀川',
  '青江',
  '虎彻',
  '村正',
  '正宗',
  '贞宗',
  '江',
  '一文字',
  '无铭',
];
