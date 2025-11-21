import { OPENWEATHER_API_KEY } from '../constants';
import { CurrentWeather, ForecastResponse, WeatherData } from '../types';

const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const GEO_URL = 'https://api.openweathermap.org/geo/1.0';

export const fetchWeatherData = async (lat: number, lon: number): Promise<WeatherData> => {
  if (OPENWEATHER_API_KEY === 'YOUR_OPENWEATHER_API_KEY_HERE') {
    throw new Error("Missing OpenWeatherMap API Key. Please set it in constants.ts");
  }

  try {
    // 1. Fetch Current Weather
    const currentRes = await fetch(
      `${BASE_URL}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${OPENWEATHER_API_KEY}`
    );
    
    if (!currentRes.ok) throw new Error('Failed to fetch current weather');
    const currentData: CurrentWeather = await currentRes.json();

    // 2. Fetch 5 Day / 3 Hour Forecast
    const forecastRes = await fetch(
      `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${OPENWEATHER_API_KEY}`
    );

    if (!forecastRes.ok) throw new Error('Failed to fetch forecast');
    const forecastData: ForecastResponse = await forecastRes.json();

    return {
      current: currentData,
      forecast: forecastData,
    };
  } catch (error) {
    console.error("Weather Service Error:", error);
    throw error;
  }
};

export const fetchReverseGeocoding = async (lat: number, lon: number): Promise<{ name: string; country: string } | null> => {
  try {
    const res = await fetch(
      `${GEO_URL}/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${OPENWEATHER_API_KEY}`
    );
    
    if (!res.ok) return null;
    
    const data = await res.json();
    if (data && data.length > 0) {
      return {
        name: data[0].name,
        country: data[0].country
      };
    }
    return null;
  } catch (error) {
    console.warn("Reverse geocoding failed:", error);
    return null;
  }
};

export const fetchCoordinates = async (city: string): Promise<{ lat: number; lon: number; name: string; country: string } | null> => {
  try {
    const res = await fetch(
      `${GEO_URL}/direct?q=${encodeURIComponent(city)}&limit=1&appid=${OPENWEATHER_API_KEY}`
    );
    
    if (!res.ok) return null;
    
    const data = await res.json();
    if (data && data.length > 0) {
      return {
        lat: data[0].lat,
        lon: data[0].lon,
        name: data[0].name,
        country: data[0].country
      };
    }
    return null;
  } catch (error) {
    console.warn("Geocoding failed:", error);
    return null;
  }
};