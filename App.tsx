import React, { useState, useEffect, useCallback, useRef } from 'react';
import { WeatherData, ClothingAdvice } from './types';
import { fetchWeatherData, fetchReverseGeocoding, fetchCoordinates } from './services/weatherService';
import { analyzeWeatherWithGemini } from './services/geminiService';
import { DEFAULT_LOCATION } from './constants';
import WeatherSummary from './components/WeatherSummary';
import ClothingCard from './components/ClothingCard';
import ForecastChart from './components/ForecastChart';
import { Loader2, RefreshCw, MapPin, Search, X } from 'lucide-react';

const App: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [advice, setAdvice] = useState<ClothingAdvice | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [locationName, setLocationName] = useState<string>("Locating...");
  
  // Search States
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const loadData = useCallback(async (lat: number, lon: number, overrideName?: string) => {
    setLoading(true);
    setError(null);
    setAdvice(null);
    
    // Temporary loading state for location
    if (!overrideName) {
      setLocationName("Checking location...");
    } else {
      setLocationName(overrideName);
    }

    try {
      // 1. Fetch Weather
      // If we have an override name (from search), we don't strictly need reverse geo, 
      // but fetching it confirms the exact location data if needed.
      // For efficiency, if overrideName is provided, we skip reverse geo to save an API call
      // or run it in background if we want to be super precise. 
      
      const promises: [Promise<WeatherData>, Promise<{ name: string; country: string } | null>?] = [
        fetchWeatherData(lat, lon)
      ];

      if (!overrideName) {
        promises.push(fetchReverseGeocoding(lat, lon));
      }

      const [weatherData, geoData] = await Promise.all(promises);

      setWeather(weatherData);
      
      // Set Location Name
      if (overrideName) {
        setLocationName(overrideName);
      } else if (geoData) {
        setLocationName(`${geoData.name}, ${geoData.country}`);
      } else {
        setLocationName(`${weatherData.current.name}, ${weatherData.current.sys.country}`);
      }

      // 2. Analyze with Gemini
      setAnalyzing(true);
      setLoading(false); // Show weather while AI thinks
      
      const aiAdvice = await analyzeWeatherWithGemini(weatherData);
      setAdvice(aiAdvice);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
      setAnalyzing(false);
    }
  }, []);

  const handleRefresh = () => {
    if (weather) {
      loadData(weather.current.coord.lat, weather.current.coord.lon, locationName);
    } else {
      requestLocation();
    }
  };

  const requestLocation = () => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          loadData(position.coords.latitude, position.coords.longitude);
        },
        (err) => {
          console.warn("Geolocation denied, using default.", err);
          // Use default location if denied
          loadData(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lon);
          setError("Location access denied. Showing New York.");
        }
      );
    } else {
      loadData(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lon);
      setError("Geolocation not supported. Showing default.");
    }
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setIsSearching(false);
      return;
    }

    setIsSearching(false); // Close input UI immediately
    setLoading(true);
    setLocationName(`Searching "${searchQuery}"...`);

    try {
      const coords = await fetchCoordinates(searchQuery);
      if (coords) {
        loadData(coords.lat, coords.lon, `${coords.name}, ${coords.country}`);
        setSearchQuery("");
      } else {
        setError(`Could not find city: "${searchQuery}"`);
        setLoading(false);
        // Restore previous name if possible, otherwise it stays on "Searching..." which is fine as error indicator
        if (weather) setLocationName("Unknown Location");
      }
    } catch (err) {
      setError("Search failed. Please try again.");
      setLoading(false);
    }
  };

  useEffect(() => {
    requestLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isSearching && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearching]);

  // -- Render States --

  if (loading && !weather) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-blue-500" />
        <p className="animate-pulse">{locationName === "Locating..." ? "Reading the skies..." : locationName}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      <div className="max-w-md mx-auto px-4 pt-6 space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-center h-10">
          
          {isSearching ? (
            <form onSubmit={handleSearchSubmit} className="flex-1 mr-4 relative animate-in fade-in zoom-in duration-200">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter city (e.g. Melbourne)..."
                className="w-full pl-9 pr-8 py-2 rounded-full bg-slate-100 border-none text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 text-sm transition-all"
                onBlur={() => {
                  // Small delay to allow form submission if enter was pressed
                  setTimeout(() => {
                     if (!loading) setIsSearching(false);
                  }, 200);
                }}
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <button 
                type="button"
                onClick={() => setIsSearching(false)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <button 
              onClick={() => setIsSearching(true)}
              className="flex items-center space-x-2 text-slate-700 bg-white px-3 py-1.5 rounded-full shadow-sm border border-slate-100 hover:bg-slate-50 transition-colors group"
            >
              <MapPin className="w-4 h-4 text-blue-500 group-hover:text-blue-600" />
              <span className="font-semibold text-sm max-w-[200px] truncate">{locationName}</span>
              <Search className="w-3 h-3 text-slate-300 group-hover:text-slate-400 ml-1" />
            </button>
          )}

          <button 
            onClick={handleRefresh}
            className="p-2 bg-white rounded-full shadow-sm text-slate-600 active:scale-95 transition-transform hover:bg-slate-50"
            disabled={analyzing || loading}
          >
            <RefreshCw className={`w-5 h-5 ${analyzing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-800 font-bold ml-2">✕</button>
          </div>
        )}

        {/* Main Weather Card */}
        {weather && (
          <WeatherSummary current={weather.current} advice={advice} />
        )}

        {/* AI Thinking State */}
        {weather && !advice && analyzing && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4">
             <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
            </div>
            <span className="text-slate-500 text-sm font-medium">Stylist is checking your wardrobe...</span>
          </div>
        )}

        {/* Clothing Advice */}
        {advice && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <ClothingCard advice={advice} />
          </div>
        )}

        {/* Forecast Chart */}
        {weather && (
           <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            <ForecastChart forecast={weather.forecast} />
           </div>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-slate-400 pt-6 pb-4">
          <p>Powered by OpenWeather & Gemini AI</p>
        </div>

      </div>
    </div>
  );
};

export default App;