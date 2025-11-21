// OpenWeatherMap Types
export interface WeatherCondition {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export interface CurrentWeather {
  coord: { lon: number; lat: number };
  weather: WeatherCondition[];
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  wind: { speed: number; deg: number };
  dt: number;
  sys: { country: string; sunrise: number; sunset: number };
  name: string;
}

export interface ForecastItem {
  dt: number;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  weather: WeatherCondition[];
  wind: { speed: number; deg: number; gust?: number };
  pop: number; // Probability of precipitation
  dt_txt: string;
}

export interface ForecastResponse {
  list: ForecastItem[];
  city: {
    name: string;
    country: string;
    sunrise: number;
    sunset: number;
  };
}

// Application State Types
export interface WeatherData {
  current: CurrentWeather;
  forecast: ForecastResponse;
}

// Gemini AI Advice Schema
export interface ClothingAdvice {
  summary: string;
  outfitTop: string[];
  outfitBottom: string[];
  accessories: string[];
  alerts: AlertType[];
  reasoning: string;
  temperatureTrend: 'stable' | 'rising_sharp' | 'falling_sharp' | 'fluctuating';
  weatherIconKey: 'sun' | 'rain' | 'cloud' | 'snow' | 'storm' | 'wind';
}

export interface AlertType {
  type: 'rain' | 'snow' | 'heat' | 'cold' | 'wind' | 'hail' | 'temp_drop' | 'temp_rise' | 'uv';
  message: string;
  severity: 'low' | 'medium' | 'high';
}
