import { SearchEngine, SearchEngineType } from './types';

export const SUGGEST_SERVERS = {
  auto: { name: 'Auto (跟随搜索引擎)', value: 'auto' },
  google: { name: 'Google', value: 'google' },
  bing: { name: 'Bing', value: 'bing' },
  baidu: { name: 'Baidu', value: 'baidu' },
  yandex: { name: 'Yandex', value: 'yandex' },
  custom: { name: '自定义', value: 'custom' },
} as const;

export type SuggestServerType = keyof typeof SUGGEST_SERVERS;

export const SEARCH_ENGINES: Record<SearchEngineType, SearchEngine> = {
  [SearchEngineType.GOOGLE]: {
    type: SearchEngineType.GOOGLE,
    name: 'Google',
    searchUrl: 'https://www.google.com/search?q=',
    suggestUrl: 'https://suggestqueries.google.com/complete/search?client=chrome&q=',
    logo: '/svg/google-icon.svg',
  },
  [SearchEngineType.BING]: {
    type: SearchEngineType.BING,
    name: 'Bing',
    searchUrl: 'https://www.bing.com/search?q=',
    suggestUrl: 'https://api.bing.com/qsonhs.aspx?type=cb&q=',
    logo: '/svg/bing-icon.svg',
  },
  [SearchEngineType.BAIDU]: {
    type: SearchEngineType.BAIDU,
    name: 'Baidu',
    searchUrl: 'https://www.baidu.com/s?wd=',
    suggestUrl: 'https://suggestion.baidu.com/su?wd=',
    logo: '/svg/baidu-icon.svg',
  },
  [SearchEngineType.YANDEX]: {
    type: SearchEngineType.YANDEX,
    name: 'Yandex',
    searchUrl: 'https://yandex.com/search?text=',
    suggestUrl: 'https://suggest.yandex.com/suggest-ya.cgi?part=',
    logo: '/svg/yandex.png',
  },
  [SearchEngineType.ZHIHU]: {
    type: SearchEngineType.ZHIHU,
    name: '知乎',
    searchUrl: 'https://www.zhihu.com/search?type=content&q=',
    suggestUrl: '',
    logo: '/svg/www.zhihu.com.png',
  },
  [SearchEngineType.GITHUB]: {
    type: SearchEngineType.GITHUB,
    name: 'GitHub',
    searchUrl: 'https://github.com/search?q=',
    suggestUrl: '',
    logo: '/svg/github.svg',
  },
  [SearchEngineType.BILIBILI]: {
    type: SearchEngineType.BILIBILI,
    name: '哔哩哔哩',
    searchUrl: 'https://search.bilibili.com/all?keyword=',
    suggestUrl: '',
    logo: '/svg/www.bilibili.com.jpg',
  },
  [SearchEngineType.DOUYIN]: {
    type: SearchEngineType.DOUYIN,
    name: '抖音',
    // Use base path; SearchBar will append encoded query
    searchUrl: 'https://www.douyin.com/jingxuan/search/',
    suggestUrl: '',
    logo: '/svg/douyin.png',
  },
};

// Pre-check search engine favicons on app load (now using local icons, no network requests needed)
export const preloadSearchEngineFavicons = async () => {
  // Since we're now using local SVG icons, no network preloading is needed
  // This function is kept for backward compatibility but does nothing
  return Promise.resolve();
};

export const getFaviconUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    return `${urlObj.protocol}//${urlObj.host}/favicon.ico`;
  } catch (e) {
    return '';
  }
};

export const checkFaviconExists = async (url: string): Promise<boolean> => {
  try {
    const faviconUrl = getFaviconUrl(url);
    if (!faviconUrl) return false;
    
    // Create an image element to test if favicon loads successfully
    return new Promise<boolean>((resolve) => {
      const img = new Image();
      
      img.onload = () => {
        // Image loaded successfully, favicon exists
        resolve(true);
      };
      
      img.onerror = () => {
        // Image failed to load, favicon doesn't exist or is inaccessible
        resolve(false);
      };
      
      // Try to load the favicon
      img.src = faviconUrl;
      
      // Fallback timeout
      setTimeout(() => {
        resolve(false);
      }, 3000);
    });
  } catch (error) {
    return false;
  }
};