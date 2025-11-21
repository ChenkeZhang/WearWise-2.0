import { GoogleGenAI, Type, Schema } from "@google/genai";
import { WeatherData, ClothingAdvice } from "../types";
import { AI_MODEL_NAME } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Define the schema for the structured output we want from Gemini
const adviceSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.STRING,
      description: "A very short, punchy phrase (max 8 words) summarizing the vibe.",
    },
    outfitTop: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of recommended upper body clothing items (e.g., T-shirt, Hoodie).",
    },
    outfitBottom: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of recommended lower body clothing items (e.g., Shorts, Jeans).",
    },
    accessories: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Necessary accessories (e.g., Umbrella, Sunglasses).",
    },
    alerts: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          type: { type: Type.STRING, enum: ["rain", "snow", "heat", "cold", "wind", "hail", "temp_drop", "temp_rise", "uv"] },
          message: { type: Type.STRING },
          severity: { type: Type.STRING, enum: ["low", "medium", "high"] }
        },
        required: ["type", "message", "severity"]
      },
      description: "Specific warnings for extreme weather or sudden changes."
    },
    reasoning: {
      type: Type.STRING,
      description: "A single, short sentence (max 15 words) explaining the main factor (e.g. 'High wind chill makes it feel freezing')."
    },
    temperatureTrend: {
      type: Type.STRING,
      enum: ["stable", "rising_sharp", "falling_sharp", "fluctuating"],
      description: "The general trend of temperature over the next 12-24 hours."
    },
    weatherIconKey: {
      type: Type.STRING,
      enum: ["sun", "rain", "cloud", "snow", "storm", "wind"],
      description: "The best representative icon for the overall condition."
    }
  },
  required: ["summary", "outfitTop", "outfitBottom", "accessories", "alerts", "reasoning", "temperatureTrend", "weatherIconKey"]
};

export const analyzeWeatherWithGemini = async (weatherData: WeatherData): Promise<ClothingAdvice> => {
  try {
    // simplify data to reduce token usage, focus on next 24h
    const next24Hours = weatherData.forecast.list.slice(0, 8).map(item => ({
      time: item.dt_txt,
      temp: item.main.temp,
      feels_like: item.main.feels_like,
      condition: item.weather[0].description,
      rain_prob: item.pop,
      wind: item.wind.speed
    }));

    const simplifiedData = {
      current: {
        temp: weatherData.current.main.temp,
        feels_like: weatherData.current.main.feels_like,
        condition: weatherData.current.weather[0].description,
        wind: weatherData.current.wind.speed,
        humidity: weatherData.current.main.humidity
      },
      forecast_next_24h: next24Hours
    };

    const prompt = `
      You are a minimalist meteorological stylist.
      
      **Goal:** suggest the perfect outfit with EXTREMELY BRIEF explanations. Users are in a hurry.
      
      **Constraints:**
      - Summary: Max 8 words. Funny or direct.
      - Reasoning: Max 15 words. One sentence only.
      
      **Logic:**
      1. **Base Layer:** Determine based on 'feels_like' temperature.
      2. **Precipitation:** If precipitation probability (pop) > 0.3, suggest rain/snow gear.
      3. **Wind:** If wind speed > 8 m/s, suggest windbreakers.
      4. **Temperature Swings:** Check if temp drops/rises > 8°C in 6h.
      
      Data: ${JSON.stringify(simplifiedData)}
    `;

    const response = await ai.models.generateContent({
      model: AI_MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: adviceSchema,
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as ClothingAdvice;
    }
    throw new Error("No text returned from Gemini");

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    // Fallback object in case of AI failure to prevent app crash
    return {
      summary: "Weather analysis unavailable.",
      outfitTop: ["Standard layers"],
      outfitBottom: ["Comfortable pants"],
      accessories: [],
      alerts: [{ type: "cold", message: "AI unavailable, dress cautiously.", severity: "low" }],
      reasoning: "Could not connect to AI stylist.",
      temperatureTrend: "stable",
      weatherIconKey: "cloud"
    };
  }
};