import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';
import { SearchEngineType } from '../types';
import { SEARCH_ENGINES } from '../constants';
import { fetchSuggestions } from '../services/api';

interface SearchBarProps {
  currentEngine: SearchEngineType;
  onEngineChange: (engine: SearchEngineType) => void;
  suggestServer?: 'auto' | 'google' | 'bing' | 'baidu' | 'custom';
  customSuggestUrl?: string | null;
}

const SearchBar: React.FC<SearchBarProps> = ({ currentEngine, onEngineChange, suggestServer = 'auto', customSuggestUrl = null }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [showEngineMenu, setShowEngineMenu] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1); // -1 means input is focused
  
  const wrapperRef = useRef<HTMLDivElement>(null);
  const engine = SEARCH_ENGINES[currentEngine];

  // Get suggestion URL based on configuration
  const getSuggestionUrl = () => {
    if (suggestServer === 'custom' && customSuggestUrl) {
      return customSuggestUrl;
    }
    
    if (suggestServer === 'auto') {
      return engine.suggestUrl;
    }
    
    // Use specific search engine's suggestion URL
    const targetEngine = SEARCH_ENGINES[suggestServer as SearchEngineType];
    return targetEngine?.suggestUrl || engine.suggestUrl;
  };

  // Get suggestion engine type for API calls
  const getSuggestionEngineType = (): SearchEngineType => {
    if (suggestServer === 'custom') {
      return currentEngine; // For custom URLs, use current engine's parsing logic
    }
    
    if (suggestServer === 'auto') {
      return currentEngine;
    }
    
    return suggestServer as SearchEngineType;
  };

  // Debounce suggestion fetching
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        const suggestionUrl = getSuggestionUrl();
        const suggestionEngine = getSuggestionEngineType();
        
        // Replace {query} placeholder in custom URL
        const finalUrl = suggestServer === 'custom' && customSuggestUrl 
          ? customSuggestUrl.replace('{query}', encodeURIComponent(query))
          : suggestionUrl;
        
        fetchSuggestions(query, suggestionEngine, finalUrl).then((results) => {
            setSuggestions(results);
            setSelectedIndex(-1); // Reset selection on new results
        });
      } else {
        setSuggestions([]);
        setSelectedIndex(-1);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query, currentEngine, suggestServer, customSuggestUrl]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsFocused(false);
        setShowEngineMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (text: string) => {
    if (!text.trim()) return;
    window.location.href = `${engine.searchUrl}${encodeURIComponent(text)}`;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Navigation
    if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev > -1 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
            handleSearch(suggestions[selectedIndex]);
        } else {
            handleSearch(query);
        }
    } else if (e.key === 'Escape') {
        setIsFocused(false);
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto z-20" ref={wrapperRef}>
      <div
        className={`
          flex items-center w-full h-14 rounded-2xl
          bg-white/10 backdrop-blur-md border border-white/20 shadow-xl
          transition-all duration-300
          ${isFocused ? 'bg-white/20 border-white/40 shadow-2xl scale-[1.02]' : 'hover:bg-white/15'}
        `}
      >
        {/* Engine Selector */}
        <div className="relative">
          <button
            onClick={() => setShowEngineMenu(!showEngineMenu)}
            className="flex items-center justify-center h-full px-4 rounded-l-2xl hover:text-white/90 transition-colors border-r border-white/10 focus:outline-none focus:ring-0 active:bg-white/5 active:outline-none"
          >
            <img src={engine.logo} alt={engine.name} className="w-5 h-5 rounded-full" />
            <ChevronDown size={14} className="ml-2 text-white/70" />
          </button>

          {/* Engine Dropdown */}
          {showEngineMenu && (
            <div className="absolute top-full left-0 mt-2 w-40 bg-gray-900/90 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl py-1 z-50">
              {Object.values(SEARCH_ENGINES).map((eng) => (
                <button
                  key={eng.type}
                  onClick={() => {
                    onEngineChange(eng.type);
                    setShowEngineMenu(false);
                  }}
                  className={`flex items-center w-full px-4 py-3 text-sm text-left hover:bg-white/10 active:bg-white/15 transition-colors ${currentEngine === eng.type ? 'bg-white/10 text-white' : 'text-gray-300'}`}
                >
                  <img src={eng.logo} alt={eng.name} className="w-4 h-4 mr-3 rounded-full" />
                  {eng.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Input */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder={`Search with ${engine.name}...`}
          className="flex-1 h-full bg-transparent border-none outline-none px-4 text-white placeholder-white/50 text-lg"
          autoFocus
        />

        {/* Clear / Search Button */}
        <div className="px-4 flex items-center">
          {query && (
            <button onClick={() => setQuery('')} className="p-1 mr-2 text-white/50 hover:text-white transition-colors">
              <X size={18} />
            </button>
          )}
          <button onClick={() => handleSearch(query)} className="text-white/70 hover:text-white transition-colors">
            <Search size={22} />
          </button>
        </div>
      </div>

      {/* Suggestions Dropdown */}
      {isFocused && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200 z-50">
          {suggestions.map((item, index) => (
            <button
              key={index}
              onClick={() => handleSearch(item)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`flex items-center w-full px-5 py-3 text-left transition-colors group ${
                index === selectedIndex ? 'bg-white/20 text-white' : 'text-white/90 hover:bg-white/10'
              }`}
            >
              <Search size={18} className={`mr-4 transition-colors ${index === selectedIndex ? 'text-white' : 'text-white/40 group-hover:text-white/80'}`} />
              {/* Highlight matching part logic can be simple or strict. Here we just render text. */}
              <span className="text-base" dangerouslySetInnerHTML={{ __html: item.replace(new RegExp(`(${query})`, 'gi'), '<span class="font-bold text-blue-400">$1</span>') }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;