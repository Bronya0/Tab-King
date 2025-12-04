import { SearchEngine, SearchEngineType } from './types';

export const SEARCH_ENGINES: Record<SearchEngineType, SearchEngine> = {
  [SearchEngineType.GOOGLE]: {
    type: SearchEngineType.GOOGLE,
    name: 'Google',
    searchUrl: 'https://www.google.com/search?q=',
    suggestUrl: 'https://suggestqueries.google.com/complete/search?client=chrome&q=',
    logo: 'https://www.google.com/favicon.ico',
  },
  [SearchEngineType.BING]: {
    type: SearchEngineType.BING,
    name: 'Bing',
    searchUrl: 'https://www.bing.com/search?q=',
    suggestUrl: 'https://api.bing.com/qsonhs.aspx?type=cb&q=',
    logo: 'https://www.bing.com/favicon.ico',
  },
  [SearchEngineType.BAIDU]: {
    type: SearchEngineType.BAIDU,
    name: 'Baidu',
    searchUrl: 'https://www.baidu.com/s?wd=',
    suggestUrl: 'https://suggestion.baidu.com/su?wd=',
    logo: 'https://www.baidu.com/favicon.ico',
  },
};

export const getFaviconUrl = (url: string): string => {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  } catch (e) {
    return '';
  }
};