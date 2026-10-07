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
  | '刀装';

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
  memoEntries?: DaozhangMemoEntry[]; // 互动小记、刀装问答签文备忘录
}

export type ColorTheme = 'sakura' | 'koubai' | 'take' | 'fuji' | 'wisteria';

export type SceneryType = 'none' | 'sakura' | 'maple' | 'snow' | 'firefly';

export type AmbientSoundType = 'windbell' | 'paper' | 'brush' | 'rain' | 'custom';

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
