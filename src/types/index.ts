import { GenerateIndianDietChartOutput } from "@/ai/flows/generateIndianDietChartFlow";

export interface Goal {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

export interface FoodEntry {
  id: string;
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  timestamp: number; // Unix timestamp
}

// Used for AI summary flow input, omitting id and timestamp
export interface FoodEntryShort {
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

export interface DailyLogEntry {
  date: string; // YYYY-MM-DD
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

export interface UserProfile {
  name: string;
  email: string;
  avatarUrl?: string;
  age?: number;
  height?: number;  // in centimeters
  weight?: number;  // in kilograms
  gender?: "male" | "female" | "other";
  heightUnit?: "cm" | "ft"; // Unit for height (centimeters or feet-inches)
  weightUnit?: "kg" | "lbs"; // Unit for weight (kilograms or pounds)
  savedDietCharts?: SavedDietChart[];
}

export interface SavedDietChart {
  id: string;
  name: string;
  createdAt: string;
  dietChart: GenerateIndianDietChartOutput;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  imageUrl: string;
  imageHint?: string;
  readMoreLink: string; // This will be used to construct the dynamic route
  author?: string | {
    name: string;
    role: string;
    imageUrl: string;
  };
  authorRole?: string;
  authorImage?: string;
  publishDate?: string;
  category?: string;
  content?: string;
}
