import { SearchEngineType } from '../types';

/**
 * Fetch suggestions using fetch API with OpenSearch standard format
 * All three interfaces return: [ "keyword", [ "suggestion1", "suggestion2", ... ] ]
 */
export const fetchSuggestions = (
  query: string,
  engineType: SearchEngineType,
  urlTemplate: string
): Promise<string[]> => {
  return new Promise(async (resolve) => {
    if (!query.trim()) {
      resolve([]);
      return;
    }

    try {
      let url: string;
      
      // 1. Google
      if (engineType === SearchEngineType.GOOGLE) {
        url = `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(query)}`;
      }
      // 2. Baidu
      else if (engineType === SearchEngineType.BAIDU) {
        url = `https://suggestion.baidu.com/su?wd=${encodeURIComponent(query)}&action=opensearch`;
      }
      // 3. Bing
      else if (engineType === SearchEngineType.BING) {
        url = `https://api.bing.com/osjson.aspx?query=${encodeURIComponent(query)}`;
      }
      // Custom URL
      else {
        const isCustomUrl = urlTemplate.includes('{query}');
        url = isCustomUrl ? urlTemplate.replace('{query}', encodeURIComponent(query)) : urlTemplate + encodeURIComponent(query);
      }

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      let data;
      
      // Handle GBK encoded response for Baidu
      if (engineType === SearchEngineType.BAIDU) {
        const buffer = await response.arrayBuffer();
        const decoder = new TextDecoder('gbk');
        const text = decoder.decode(buffer);
        
        // Remove JSONP wrapper if present
        const jsonStr = text.replace(/^\w+\(/, '').replace(/\);?$/, '');
        data = JSON.parse(jsonStr);
      } else {
        data = await response.json();
      }
      let results: string[] = [];
      
      // Parse OpenSearch format: [ "keyword", [ "suggestion1", "suggestion2", ... ] ]
      if (Array.isArray(data) && data.length >= 2 && Array.isArray(data[1])) {
        results = data[1];
      }
      // Fallback for other formats
      else if (engineType === SearchEngineType.BAIDU && data.s && Array.isArray(data.s)) {
        results = data.s;
      }
      
      resolve(results.slice(0, 8)); // Limit to 8 suggestions
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      resolve([]);
    }
  });
};