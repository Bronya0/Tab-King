import { SearchEngineType } from '../types';

let jsonpCounter = 0;

/**
 * A lightweight JSONP implementation to fetch suggestions from
 * search engines that don't support CORS for direct browser fetches.
 */
export const fetchSuggestions = (
  query: string,
  engineType: SearchEngineType,
  urlTemplate: string
): Promise<string[]> => {
  return new Promise((resolve) => {
    if (!query.trim()) {
      resolve([]);
      return;
    }

    const callbackName = `jsonp_callback_${Date.now()}_${jsonpCounter++}`;
    
    // Baidu requires a specific callback param name 'cb', others usually 'jsonp' or implied by structure
    let src = urlTemplate + encodeURIComponent(query);
    
    if (engineType === SearchEngineType.BAIDU) {
       src += `&cb=${callbackName}`;
    } else if (engineType === SearchEngineType.BING) {
       src += `&cb=${callbackName}`;
    } else {
       // Google's specific client=chrome returns JSON directly, but blocks CORS often.
       // We use a different endpoint for JSONP or handle via simple fetch if in extension mode.
       // For this web demo, Google is tricky without a proxy. 
       // We will try the client=youtube method which often supports JSONP or standard callback
       src = `https://suggestqueries.google.com/complete/search?client=youtube&q=${encodeURIComponent(query)}&jsonp=${callbackName}`;
    }

    // Create script
    const script = document.createElement('script');
    script.src = src;

    // Window callback
    (window as any)[callbackName] = (data: any) => {
      let results: string[] = [];
      
      if (engineType === SearchEngineType.GOOGLE) {
        // format: [query, [suggestions...], ...]
        results = data[1].map((item: any) => item[0]);
      } else if (engineType === SearchEngineType.BING) {
        // format: { AS: { Results: [ { Suggests: [ { Txt: "..." } ] } ] } }
        const suggests = data?.AS?.Results?.[0]?.Suggests;
        if (suggests) {
            results = suggests.map((s: any) => s.Txt);
        }
      } else if (engineType === SearchEngineType.BAIDU) {
        // format: { s: ["..."] }
        results = data.s || [];
      }

      cleanup();
      resolve(results.slice(0, 8)); // Limit to 8
    };

    // Error handling
    script.onerror = () => {
      cleanup();
      resolve([]);
    };

    function cleanup() {
      if (script.parentNode) script.parentNode.removeChild(script);
      delete (window as any)[callbackName];
    }

    document.head.appendChild(script);
  });
};