
export enum SearchEngineType {
  GOOGLE = 'google',
  BING = 'bing',
  BAIDU = 'baidu',
  ZHIHU = 'zhihu',
  GITHUB = 'github',
  BILIBILI = 'bilibili',
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
  suggestServer: 'auto' | 'google' | 'bing' | 'baidu' | 'custom';
  customSuggestUrl: string | null;
}

export const DEFAULT_SHORTCUTS: Shortcut[] = [
  { id: '1', title: '知乎', url: 'https://www.zhihu.com', icon: '/svg/www.zhihu.com.png', type: 'link' },
  { id: '2', title: 'GiHub', url: 'https://github.com', icon: '/svg/github.svg', type: 'link' },
  { id: '3', title: '抖音', url: 'https://www.douyin.com', icon: '/svg/www.douyin.com.png', type: 'link' },
  { id: '4', title: '网易云', url: 'https://music.163.com', icon: '/svg/music.163.com.png', type: 'link' },
  { id: '5', title: 'DeepSeek', url: 'https://chat.deepseek.com', icon: '/svg/deepseek.png', type: 'link' },
  { id: '6', title: 'Qwen AI', url: 'https://chat.qwen.ai', icon: '/svg/chat.qwen.ai.png', type: 'link' },
  { id: '7', title: 'AI Studio', url: 'https://aistudio.google.com', icon: '/svg/aistudio.google.com.jpg', type: 'link' },
  { id: '8', title: 'V2EX', url: 'https://www.v2ex.com', icon: '/svg/www.v2ex.com.jpg', type: 'link' },
  { id: '9', title: '哔哩哔哩', url: 'https://www.bilibili.com', icon: '/svg/www.bilibili.com.jpg', type: 'link' },
  { id: '10', title: '腾讯视频', url: 'https://v.qq.com', icon: '/svg/v.qq.com.jpg', type: 'link' },
  { id: '11', title: 'YouTube', url: 'https://www.youtube.com', icon: '/svg/www.youtube.com.png', type: 'link' },
  { id: '12', title: '微信读书', url: 'https://weread.qq.com', icon: '/svg/weread.qq.com.jpg', type: 'link' },
  { id: '13', title: 'Gitee', url: 'https://gitee.com', icon: '/svg/gitee.com.png', type: 'link' },
  { id: '14', title: '翻译', url: 'https://translate.google.com', icon: '/svg/translate.google.com.png', type: 'link' },
];