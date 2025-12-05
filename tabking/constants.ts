import { SearchEngine, SearchEngineType } from './types';

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
      
      // Set a timeout to prevent hanging
      img.timeout = 3000;
      
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