
export enum SearchEngineType {
  GOOGLE = 'google',
  BING = 'bing',
  BAIDU = 'baidu',
}

export interface SearchEngine {
  type: SearchEngineType;
  name: string;
  searchUrl: string;
  suggestUrl: string;
  logo: string;
}

export interface Shortcut {
  id: string;
  title: string;
  url: string;
  icon?: string;
  type?: 'link' | 'folder';
  children?: Shortcut[];
}

export interface GridConfig {
  rows: number;
  cols: number;
  iconSize: number; // px
  gapX: number; // px
  gapY: number; // px
}

export interface AppSettings {
  backgroundImage: string | null;
  blurLevel: number;
  gridConfig: GridConfig;
  defaultEngine: SearchEngineType;
  openInNewTab: boolean;
}

export const DEFAULT_SHORTCUTS: Shortcut[] = [
  { id: '1', title: '抖音', url: 'https://www.douyin.com', type: 'link' },
  { id: '2', title: 'GitHub', url: 'https://github.com', type: 'link' },
  { id: '3', title: '知乎', url: 'https://www.zhihu.com', type: 'link' },
  { id: '4', title: 'V2EX', url: 'https://www.v2ex.com', type: 'link' },
  { id: '5', title: 'DeepSeek', url: 'https://chat.deepseek.com', type: 'link' },
  { id: '6', title: 'Qwen AI', url: 'https://chat.qwen.ai', type: 'link' },
  { id: '7', title: 'AI Studio', url: 'https://aistudio.google.com', type: 'link' },
  { id: '8', title: '哔哩哔哩', url: 'https://www.bilibili.com', type: 'link' },
  { id: '9', title: '网易云', url: 'https://music.163.com', type: 'link' },
  { id: '10', title: '腾讯视频', url: 'https://v.qq.com', type: 'link' },
  { id: '11', title: '微信读书', url: 'https://weread.qq.com', type: 'link' },
  { id: '12', title: 'Gitee', url: 'https://gitee.com', type: 'link' },
  { id: '14', title: '翻译', url: 'https://translate.google.com', type: 'link' },
  { id: '15', title: 'YouTube', url: 'https://www.youtube.com', type: 'link' },
  { id: '16', title: '掘金', url: 'https://juejin.cn', type: 'link' },
  { id: '17', title: '牛客网', url: 'https://www.nowcoder.com', type: 'link' },
  { id: '18', title: '力扣', url: 'https://leetcode.cn', type: 'link' },
];