import React from 'react';
import { CurrentWeather, ClothingAdvice } from '../types';
import { Cloud, CloudRain, CloudSnow, Sun, Wind, Zap, Thermometer } from 'lucide-react';

interface WeatherSummaryProps {
  current: CurrentWeather;
  advice: ClothingAdvice | null;
}

const WeatherSummary: React.FC<WeatherSummaryProps> = ({ current, advice }) => {
  const key = advice?.weatherIconKey || 'cloud';
  
  // Modern Pastel Logic:
  // Light Mode: Sun, Cloud, Snow -> Dark Text, Pastel Backgrounds
  // Dark Mode: Rain, Storm, Wind -> White Text, Muted Dark Backgrounds
  const isLightMode = key === 'snow' || key === 'sun' || key === 'cloud';

  const getThemeClasses = () => {
    switch (key) {
      // Sun: Very soft pastel orange/yellow
      case 'sun': return 'from-orange-200 via-orange-100 to-amber-100 text-orange-950 border border-orange-100';
      
      // Rain: Desaturated dark blue/slate
      case 'rain': return 'from-slate-700 to-slate-600 text-white';
      
      // Snow: White to very light grey
      case 'snow': return 'from-slate-50 to-white text-slate-800 border border-slate-200';
      
      // Storm: Muted indigo/slate
      case 'storm': return 'from-slate-800 to-indigo-900 text-white';
      
      // Wind: Muted teal/grey
      case 'wind': return 'from-teal-800 to-slate-700 text-white';
      
      // Default/Cloud: Soft blue/grey pastel
      case 'cloud':
      default: return 'from-blue-100 to-slate-200 text-slate-800 border border-blue-50';
    }
  };

  const getIcon = () => {
    const size = 72;
    // Icon color logic
    const className = isLightMode 
      ? "text-slate-700 drop-shadow-none opacity-80" 
      : "text-white drop-shadow-lg opacity-90";

    switch (key) {
      case 'sun': return <Sun size={size} className={isLightMode ? "text-orange-500/80" : className} />;
      case 'rain': return <CloudRain size={size} className={className} />;
      case 'snow': return <CloudSnow size={size} className={className} />;
      case 'storm': return <Zap size={size} className={className} />;
      case 'wind': return <Wind size={size} className={className} />;
      default: return <Cloud size={size} className={isLightMode ? "text-blue-400" : className} />;
    }
  };

  return (
    <div className={`relative w-full p-8 rounded-3xl shadow-xl bg-gradient-to-br ${getThemeClasses()} overflow-hidden transition-all duration-500`}>
      {/* Background Decoration Icon */}
      <div className={`absolute top-0 right-0 p-4 transition-opacity duration-500 ${isLightMode ? 'opacity-5 text-slate-900' : 'opacity-10 text-white'}`}>
        <Thermometer size={140} />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-2">
        <div className="animate-pulse-slow mb-2">
          {getIcon()}
        </div>
        
        <div>
          <h1 className={`text-7xl font-bold tracking-tighter ${isLightMode ? 'drop-shadow-none' : 'drop-shadow-sm'}`}>
            {Math.round(current.main.temp)}°
          </h1>
          <p className={`text-xl font-medium mt-2 capitalize ${isLightMode ? 'text-slate-600' : 'text-white/90'}`}>
            {current.weather[0].description}
          </p>
          <p className={`text-md mt-1 ${isLightMode ? 'text-slate-500' : 'text-white/80'}`}>
            Feels like {Math.round(current.main.feels_like)}°
          </p>
        </div>
      </div>
    </div>
  );
};

export default WeatherSummary;