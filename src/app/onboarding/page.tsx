"use client";

import { useState, useEffect, useCallback, useMemo, memo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, User, Calendar, Flame, Drumstick, Droplets, Wheat } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useGoals } from "@/hooks/use-goals";
import { AnimatedBackground, FadeIn, SimplePulse } from "@/components/ui/optimized-animations";
import { useAdaptivePerformance } from "@/hooks/use-performance";

interface UserProfile {
  name: string;
  age: number;
  gender: "male" | "female" | "other";
  weight: number;
  height: number;
  unit: "metric" | "imperial";
  fitnessGoal: "muscle_gain" | "weight_loss" | "get_fit" | "overall_health" | "stamina";
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

// Function to calculate BMR (Basal Metabolic Rate) using Mifflin-St Jeor Equation
const calculateBMR = (weight: number, height: number, age: number, gender: string, unit: "metric" | "imperial"): number => {
  // Convert imperial to metric if needed
  let weightKg = weight;
  let heightCm = height;
  
  if (unit === "imperial") {
    weightKg = weight * 0.453592; // pounds to kg
    heightCm = height * 2.54; // inches to cm
  }
  
  // Mifflin-St Jeor Equation
  if (gender === "male") {
    return (10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5;
  } else {
    return (10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161;
  }
};

// Calculate recommended macros based on BMR and fitness goal
const calculateMacros = (bmr: number, fitnessGoal: string): { calories: number; protein: number; fat: number; carbs: number } => {
  let activityMultiplier = 1.4; // Base: Light activity
  let proteinPercentage = 0.3; // 30% default
  let fatPercentage = 0.25; // 25% default
  let carbsPercentage = 0.45; // 45% default
  
  // Adjust based on fitness goal
  switch (fitnessGoal) {
    case "muscle_gain":
      activityMultiplier = 1.6; // Higher for muscle gain
      proteinPercentage = 0.35; // More protein for muscle building
      fatPercentage = 0.25;
      carbsPercentage = 0.40;
      break;
    case "weight_loss":
      activityMultiplier = 1.3; // Slight deficit for weight loss
      proteinPercentage = 0.35; // Higher protein to preserve muscle
      fatPercentage = 0.30;
      carbsPercentage = 0.35; // Lower carbs for fat loss
      break;
    case "get_fit":
      activityMultiplier = 1.5;
      proteinPercentage = 0.30;
      fatPercentage = 0.25;
      carbsPercentage = 0.45;
      break;
    case "overall_health":
      activityMultiplier = 1.4;
      proteinPercentage = 0.25;
      fatPercentage = 0.30;
      carbsPercentage = 0.45;
      break;
    case "stamina":
      activityMultiplier = 1.6;
      proteinPercentage = 0.25;
      fatPercentage = 0.25;
      carbsPercentage = 0.50; // Higher carbs for endurance
      break;
  }
  
  const calories = Math.round(bmr * activityMultiplier);
  const protein = Math.round((calories * proteinPercentage) / 4); // 4 calories per gram of protein
  const fat = Math.round((calories * fatPercentage) / 9); // 9 calories per gram of fat
  const carbs = Math.round((calories * carbsPercentage) / 4); // 4 calories per gram of carbs
  
  return { calories, protein, fat, carbs };
};

// Default recommended values based on gender (simplified)
const getDefaultValues = (
  gender: "male" | "female" | "other", 
  age: number, 
  weight: number = 0, 
  height: number = 0, 
  unit: "metric" | "imperial" = "metric",
  fitnessGoal: "muscle_gain" | "weight_loss" | "get_fit" | "overall_health" | "stamina" = "overall_health"
): Partial<UserProfile> => {
  // If weight and height are provided, calculate based on those
  if (weight > 0 && height > 0) {
    const bmr = calculateBMR(weight, height, age, gender, unit);
    const macros = calculateMacros(bmr, fitnessGoal);
    return macros;
  }
  
  // Otherwise use default values
  if (gender === "male") {
    return {
      calories: 2500,
      protein: 180,
      fat: 80,
      carbs: 300,
    };
  } else if (gender === "female") {
    return {
      calories: 2000,
      protein: 140,
      fat: 65,
      carbs: 250,
    };
  } else {
    return {
      calories: 2200,
      protein: 160,
      fat: 70,
      carbs: 280,
    };
  }
};

// GoalOption component for fitness goal selection
interface GoalOptionProps {
  id: string;
  title: string;
  icon: string;
  description: string;
  isSelected: boolean;
  onSelect: () => void;
  delay: number;
}

// Memoize the GoalOption component to prevent unnecessary re-renders
const GoalOption = memo(({ id, title, icon, description, isSelected, onSelect, delay }: GoalOptionProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="w-full"
    >
      <motion.button
        whileHover={{ y: -4 }}
        whileTap={{ scale: 0.98 }}
        onClick={onSelect}
        className={`w-full text-left p-4 rounded-xl border relative transition-all duration-300 ${
          isSelected 
            ? "bg-primary/10 border-primary/30 dark:bg-primary/20 dark:border-primary/40 shadow-md shadow-primary/10" 
            : "bg-white/70 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md"
        }`}
      >
        {isSelected && (
          <motion.div 
            className="absolute inset-0 rounded-xl overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className="absolute inset-0 bg-primary/5 dark:bg-primary/10" />
          </motion.div>
        )}
        
        <div className="flex items-center gap-4">
          <div className={`relative ${isSelected ? "" : ""}`}>
            {isSelected && (
              <motion.div 
                className="absolute inset-0 rounded-full bg-primary/20 dark:bg-primary/30 blur-md" 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              />
            )}
            <div className={`text-3xl relative z-10 ${
              isSelected 
                ? "scale-110 transform transition-transform duration-300" 
                : ""
            }`}>
              {icon}
            </div>
          </div>
          <div className="flex-grow">
            <h3 className={`font-medium text-base ${isSelected ? "text-primary font-semibold" : "text-slate-700 dark:text-slate-300"}`}>
              {title}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {description}
            </p>
          </div>
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
            isSelected 
              ? "border-primary bg-primary/20" 
              : "border-slate-300 dark:border-slate-600"
          }`}>
            {isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-2.5 h-2.5 rounded-full bg-primary"
              />
            )}
          </div>
        </div>
      </motion.button>
    </motion.div>
  );
});

GoalOption.displayName = "GoalOption";

// Fast fade in animation
interface FastFadeInProps {
  children: React.ReactNode;
  delay?: number;
}

const FastFadeIn = ({ children, delay = 0 }: FastFadeInProps) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3, delay }}
  >
    {children}
  </motion.div>
);

// Continue button
interface ContinueButtonProps {
  onClick: () => void;
  text?: string;
  isLoading?: boolean;
}

const ContinueButton = memo(({ onClick, text = "Continue", isLoading = false }: ContinueButtonProps) => (
  <motion.div
    whileHover={{ scale: 1.02, translateY: -2 }}
    whileTap={{ scale: 0.98 }}
    transition={{ type: "spring", stiffness: 400, damping: 10 }}
  >
    <Button 
      onClick={onClick} 
      disabled={isLoading}
      className="gap-4 h-12 px-8 rounded-xl relative overflow-hidden bg-gradient-to-r from-primary to-primary/90 text-primary-foreground font-medium shadow-lg shadow-primary/20"
    >
      <span className="relative z-10">
        {isLoading ? "Processing..." : text}
      </span>
      {isLoading ? (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="relative z-10"
        >
          <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </motion.div>
      ) : (
        <motion.div
          className="relative z-10 ml-1"
          animate={{ x: [0, 5, 0] }}
          transition={{ 
            duration: 1,
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut",
            repeatDelay: 1,
          }}
        >
          <ArrowRight className="h-4 w-4" />
        </motion.div>
      )}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-foreground/10 to-transparent"
        initial={{ x: '-100%' }}
        animate={{ x: '100%' }}
        transition={{ 
          duration: 1.5, 
          repeat: Infinity, 
          repeatDelay: 2
        }}
      />
    </Button>
  </motion.div>
));

ContinueButton.displayName = "ContinueButton";

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    age: 30,
    gender: "male",
    weight: 70,
    height: 170,
    unit: "metric",
    fitnessGoal: "overall_health",
    calories: 2500,
    protein: 180,
    fat: 80,
    carbs: 300,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [hasUserProfile, setHasUserProfile] = useState(false);
  
  const router = useRouter();
  const { toast } = useToast();
  const { updateGoals } = useGoals();

  // Check if user already completed onboarding
  useEffect(() => {
    const savedProfile = localStorage.getItem("userProfile");
    if (savedProfile) {
      setHasUserProfile(true);
      // We'll let the app layout handle redirection to prevent loops
    }
  }, []);

  // Memoize handlers to prevent unnecessary re-renders
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: name === "age" || name === "weight" || name === "height" ? parseInt(value) || 0 : value,
    }));
  }, []);

  const handleGenderChange = useCallback((value: "male" | "female" | "other") => {
    const defaults = getDefaultValues(value, profile.age);
    setProfile((prev) => ({
      ...prev,
      gender: value,
      ...defaults,
    }));
  }, [profile.age]);
  
  const handleFitnessGoalChange = useCallback((value: "muscle_gain" | "weight_loss" | "get_fit" | "overall_health" | "stamina") => {
    setProfile((prev) => {
      // If we already have weight and height, recalculate nutrition goals based on new fitness goal
      if (prev.weight > 0 && prev.height > 0) {
        const bmr = calculateBMR(prev.weight, prev.height, prev.age, prev.gender, prev.unit);
        const macros = calculateMacros(bmr, value);
        
        return {
          ...prev,
          fitnessGoal: value,
          ...macros,
        };
      }
      
      return {
        ...prev,
        fitnessGoal: value,
      };
    });
  }, []);
  
  const handleUnitChange = useCallback((value: "metric" | "imperial") => {
    // Convert measurements when changing units
    setProfile((prev) => {
      let newWeight = prev.weight;
      let newHeight = prev.height;
      
      if (value === "imperial" && prev.unit === "metric") {
        // Convert metric to imperial
        newWeight = Math.round(prev.weight * 2.20462); // kg to pounds
        newHeight = Math.round(prev.height / 2.54); // cm to inches
      } else if (value === "metric" && prev.unit === "imperial") {
        // Convert imperial to metric
        newWeight = Math.round(prev.weight * 0.453592); // pounds to kg
        newHeight = Math.round(prev.height * 2.54); // inches to cm
      }
      
      return {
        ...prev,
        unit: value,
        weight: newWeight,
        height: newHeight
      };
    });
  }, []);

  const handleNumberInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: parseInt(value) || 0,
    }));
  }, []);
  
  const updateNutritionGoals = useCallback(() => {
    // Calculate nutrition goals based on profile data
    setProfile((prev) => {
      const bmr = calculateBMR(prev.weight, prev.height, prev.age, prev.gender, prev.unit);
      const macros = calculateMacros(bmr, prev.fitnessGoal);
      
      return {
        ...prev,
        ...macros
      };
    });
  }, []);

  const handleNextStep = useCallback(() => {
    if (step === 1) {
      // Validate first step
      if (!profile.name) {
        toast({
          variant: "destructive",
          title: "Missing name",
          description: "Please enter your name to continue.",
        });
        return;
      }
      if (profile.age < 12 || profile.age > 100) {
        toast({
          variant: "destructive",
          title: "Invalid age",
          description: "Please enter a valid age between 12 and 100.",
        });
        return;
      }
      setStep(2);
    } else if (step === 2) {
      // No validation needed for fitness goal - just proceed
      setStep(3);
    } else if (step === 3) {
      // Validate measurements
      if (profile.unit === "metric" && (profile.weight < 30 || profile.weight > 250)) {
        toast({
          variant: "destructive",
          title: "Invalid weight",
          description: "Please enter a valid weight between 30kg and 250kg.",
        });
        return;
      }
      if (profile.unit === "imperial" && (profile.weight < 66 || profile.weight > 550)) {
        toast({
          variant: "destructive",
          title: "Invalid weight",
          description: "Please enter a valid weight between 66lbs and 550lbs.",
        });
        return;
      }
      if (profile.unit === "metric" && (profile.height < 100 || profile.height > 250)) {
        toast({
          variant: "destructive",
          title: "Invalid height",
          description: "Please enter a valid height between 100cm and 250cm.",
        });
        return;
      }
      if (profile.unit === "imperial" && (profile.height < 39 || profile.height > 98)) {
        toast({
          variant: "destructive",
          title: "Invalid height",
          description: "Please enter a valid height between 39in and 98in.",
        });
        return;
      }
      
      // Calculate nutrition goals based on measurements
      updateNutritionGoals();
      setStep(4);
    } else {
      // Submit the form
      handleSubmit();
    }
  }, [step, profile, toast, updateNutritionGoals]);

  const handlePreviousStep = useCallback(() => {
    if (step > 1) {
      setStep(step - 1);
    }
  }, [step]);

  const handleSubmit = useCallback(() => {
    setIsLoading(true);
    
    // Validate nutrition values
    if (profile.calories < 1000 || profile.protein < 10 || profile.fat < 10 || profile.carbs < 10) {
      toast({
        variant: "destructive",
        title: "Invalid nutrition values",
        description: "Please enter reasonable values for your nutrition goals.",
      });
      setIsLoading(false);
      return;
    }
    
    // Simulate API call
    setTimeout(() => {
      // Save user profile to localStorage
      localStorage.setItem("userProfile", JSON.stringify(profile));
      
      // Save nutrition goals to the same location used by the Goals page
      const nutritionGoals = {
        calories: profile.calories,
        protein: profile.protein,
        fat: profile.fat,
        carbs: profile.carbs
      };
      
      // Use the updateGoals function from the hook to ensure consistency
      updateGoals(nutritionGoals);
      
      // Show success message
      toast({
        title: "Profile Saved!",
        description: "Your profile and nutrition goals have been created successfully.",
      });
      
      // Redirect to welcome page
      router.push("/welcome");
      setIsLoading(false);
    }, 1000); // Reduced from 1500ms to 1000ms for faster response
  }, [profile, toast, router, updateGoals]);

  // Memoize fitness goal options to prevent re-renders
  const fitnessGoalOptions = useMemo(() => [
    {
      id: "muscle_gain" as const,
      title: "Muscle Gain",
      icon: "💪",
      description: "Build and maintain muscle mass",
    },
    {
      id: "weight_loss" as const,
      title: "Weight Loss",
      icon: "🔻",
      description: "Reduce body fat and lose weight",
    },
    {
      id: "get_fit" as const,
      title: "Get Fit",
      icon: "🏃",
      description: "Improve overall fitness and condition",
    },
    {
      id: "overall_health" as const,
      title: "Overall Health",
      icon: "❤️",
      description: "Maintain a balanced lifestyle",
    },
    {
      id: "stamina" as const,
      title: "Stamina",
      icon: "⚡",
      description: "Improve endurance and energy levels",
    },
  ], []);

  if (hasUserProfile) {
    return (
      <div className="container flex items-center justify-center min-h-screen relative bg-gradient-to-br from-background via-background/95 to-primary/5 dark:from-background dark:via-background/95 dark:to-primary/10 overflow-hidden">
        <AnimatedBackground />

        <div className="relative z-10 max-w-md w-full px-6">
          {/* Logo */}
          <motion.div
            className="flex justify-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary to-primary/60 blur-xl opacity-70" />
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground flex items-center justify-center relative shadow-lg shadow-primary/20">
                  <Flame className="h-6 w-6" />
                </div>
              </div>
              <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 dark:from-primary dark:to-primary/80 text-transparent bg-clip-text">
                CalorieTracker
              </h1>
            </div>
          </motion.div>
          
          <motion.div
            className="text-center bg-white/90 dark:bg-slate-900/90 p-8 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.2)] backdrop-blur-md"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-6 mx-auto"
            >
              <div className="relative mx-auto">
                <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl transform scale-110" />
                <div className="h-20 w-20 rounded-full border border-primary/10 bg-gradient-to-br from-primary/20 to-primary/5 shadow-inner text-primary flex items-center justify-center mx-auto relative">
                  <User className="h-10 w-10" />
                </div>
              </div>
            </motion.div>
            
            <motion.h2
              className="text-3xl font-bold mb-3 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-50 dark:to-slate-300 text-transparent bg-clip-text"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              Profile Exists
            </motion.h2>
            
            <motion.p 
              className="text-slate-600 dark:text-slate-400 mb-6 text-base"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              You already have a profile! Redirecting to your dashboard shortly...
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
            <Button 
                onClick={() => router.push("/welcome")}
                className="gap-2 h-12 px-8 rounded-xl w-full bg-gradient-to-r from-primary to-primary/90 text-primary-foreground font-medium shadow-lg shadow-primary/20 relative overflow-hidden"
            >
                <span className="relative z-10">Go to Welcome</span>
                <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-0 flex items-center justify-center min-h-screen relative bg-gradient-to-br from-background via-background/95 to-primary/5 dark:from-background dark:via-background/95 dark:to-primary/10 overflow-hidden">
      <AnimatedBackground />
      
      <motion.div 
        className="max-w-lg w-full relative z-10"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Logo & Brand */}
        <motion.div
          className="flex flex-col items-center mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="flex items-center gap-3 mb-3">
            <motion.div
              className="relative group"
              initial={{ rotate: -20, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary to-primary/60 blur-xl opacity-70 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground flex items-center justify-center relative shadow-lg shadow-primary/20">
                <Flame className="h-7 w-7" />
              </div>
            </motion.div>
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 dark:from-primary dark:to-primary/80 text-transparent bg-clip-text">
                CalorieTracker
              </h1>
              <p className="text-muted-foreground text-sm font-medium mt-0.5">Your personal nutrition assistant</p>
            </motion.div>
          </div>
        </motion.div>

        {/* Progress Indicator - simplified animation */}
        <div className="flex justify-center mb-8">
          <div className="relative w-56 h-1.5 bg-primary/10 dark:bg-primary/20 rounded-full overflow-hidden backdrop-blur-sm">
            <motion.div 
              className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-primary to-primary/70"
              initial={{ width: "0%" }}
              animate={{ width: step === 1 ? "25%" : step === 2 ? "50%" : step === 3 ? "75%" : "100%" }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <FastFadeIn key="step1">
              <Card className="border-none shadow-[0_10px_40px_rgba(0,0,0,0.08)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.2)] backdrop-blur-md bg-white/90 dark:bg-slate-900/90 overflow-hidden rounded-2xl">
                <CardHeader className="space-y-2 text-center pb-8 pt-8">
                  <div className="flex justify-center mb-4">
                    <motion.div
                      className="relative"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 260, 
                        damping: 20,
                        delay: 0.1 
                      }}
                    >
                      <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl" />
                      <div className="p-4 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 relative border border-primary/10 shadow-inner">
                        <User className="h-8 w-8 text-primary" />
                      </div>
                    </motion.div>
                  </div>
                  
                    <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <CardTitle className="text-3xl font-bold flex justify-center items-center gap-2 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-50 dark:to-slate-300 text-transparent bg-clip-text">
                      Welcome!
                      <motion.div
                        initial={{ opacity: 0, rotate: -20, scale: 0 }}
                        animate={{ opacity: 1, rotate: 0, scale: 1 }}
                        transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                      >
                        <Sparkles className="h-6 w-6 text-primary" />
                    </motion.div>
                  </CardTitle>
                    <CardDescription className="text-center max-w-sm mx-auto mt-3 text-slate-600 dark:text-slate-400 text-base">
                      Let's set up your profile to personalize your experience
                  </CardDescription>
                  </motion.div>
                </CardHeader>
                
                <CardContent className="space-y-7 px-8">
                  <div className="space-y-6">
                    <motion.div
                      className="space-y-2.5"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                    >
                      <Label htmlFor="name" className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                        <User className="h-4 w-4 text-primary" /> Your Name
                      </Label>
                      <motion.div
                        whileFocus={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <Input
                          id="name"
                          name="name"
                          value={profile.name}
                          onChange={handleInputChange}
                          className="bg-white/50 dark:bg-slate-800/50 h-12 rounded-xl border-slate-200 dark:border-slate-700 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300 shadow-sm"
                          placeholder="Enter your name"
                          autoComplete="off"
                        />
                      </motion.div>
                    </motion.div>
                    
                    <motion.div
                      className="space-y-2.5"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                    >
                      <Label htmlFor="age" className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                        <Calendar className="h-4 w-4 text-primary" /> Your Age
                      </Label>
                      <motion.div
                        whileFocus={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <Input
                          id="age"
                          name="age"
                          type="number"
                          value={profile.age === 0 ? "" : profile.age}
                          onChange={handleInputChange}
                          className="bg-white/50 dark:bg-slate-800/50 h-12 rounded-xl border-slate-200 dark:border-slate-700 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300 shadow-sm"
                          placeholder="Enter your age"
                          min={12}
                          max={100}
                        />
                      </motion.div>
                    </motion.div>
                    
                    <motion.div
                      className="space-y-3"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                    >
                      <Label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                        Gender
                      </Label>
                      <div className="grid grid-cols-3 gap-3">
                        <motion.div whileHover={{ y: -3, transition: { duration: 0.2 } }} whileTap={{ scale: 0.97 }}>
                          <Button
                            type="button"
                            variant={profile.gender === "male" ? "default" : "outline"}
                            className={`w-full h-12 rounded-xl transition-all duration-300 relative overflow-hidden font-medium ${
                              profile.gender === "male" 
                                ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground border-0 shadow-lg shadow-primary/20" 
                                : "bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700"
                            }`}
                            onClick={() => handleGenderChange("male")}
                          >
                            {profile.gender === "male" && (
                              <motion.div
                                className="absolute inset-0 bg-primary-foreground/10"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.3 }}
                              />
                            )}
                            Male
                          </Button>
                        </motion.div>
                        
                        <motion.div whileHover={{ y: -3, transition: { duration: 0.2 } }} whileTap={{ scale: 0.97 }}>
                          <Button
                            type="button"
                            variant={profile.gender === "female" ? "default" : "outline"}
                            className={`w-full h-12 rounded-xl transition-all duration-300 relative overflow-hidden font-medium ${
                              profile.gender === "female" 
                                ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground border-0 shadow-lg shadow-primary/20" 
                                : "bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700"
                            }`}
                            onClick={() => handleGenderChange("female")}
                          >
                            {profile.gender === "female" && (
                              <motion.div
                                className="absolute inset-0 bg-primary-foreground/10"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.3 }}
                              />
                            )}
                            Female
                          </Button>
                        </motion.div>
                        
                        <motion.div whileHover={{ y: -3, transition: { duration: 0.2 } }} whileTap={{ scale: 0.97 }}>
                          <Button
                            type="button"
                            variant={profile.gender === "other" ? "default" : "outline"}
                            className={`w-full h-12 rounded-xl transition-all duration-300 relative overflow-hidden font-medium ${
                              profile.gender === "other" 
                                ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground border-0 shadow-lg shadow-primary/20" 
                                : "bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700"
                            }`}
                            onClick={() => handleGenderChange("other")}
                          >
                            {profile.gender === "other" && (
                              <motion.div
                                className="absolute inset-0 bg-primary-foreground/10"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.3 }}
                              />
                            )}
                            Other
                          </Button>
                        </motion.div>
                        </div>
                    </motion.div>
                        </div>
                </CardContent>
                
                <CardFooter className="flex justify-between pt-6 pb-8 px-8">
                  <motion.div
                    whileHover={{ scale: 1.02, translateY: -2 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <Button 
                      variant="outline" 
                      onClick={handlePreviousStep}
                      className="h-12 px-6 gap-2 rounded-xl bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 font-medium"
                    >
                      Back
                    </Button>
                  </motion.div>
                  <ContinueButton onClick={handleNextStep} />
                </CardFooter>
              </Card>
            </FastFadeIn>
          ) : step === 2 ? (
            <FastFadeIn key="step2">
              <Card className="border-none shadow-[0_10px_40px_rgba(0,0,0,0.08)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.2)] backdrop-blur-md bg-white/90 dark:bg-slate-900/90 overflow-hidden rounded-2xl">
                <CardHeader className="space-y-2 text-center pb-6 pt-8">
                  <div className="flex justify-center mb-4">
                    <motion.div
                      className="relative"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 260, 
                        damping: 20,
                        delay: 0.1 
                      }}
                    >
                      <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl" />
                      <div className="p-4 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 relative border border-primary/10 shadow-inner">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 2L2 7l10 5 10-5-10-5z" />
                          <path d="M2 17l10 5 10-5" />
                          <path d="M2 12l10 5 10-5" />
                        </svg>
                        </div>
                    </motion.div>
                    </div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-50 dark:to-slate-300 text-transparent bg-clip-text">
                      What's Your Primary Goal?
                    </CardTitle>
                    <CardDescription className="text-center max-w-sm mx-auto mt-3 text-slate-600 dark:text-slate-400 text-base">
                      Select your main fitness objective to personalize your plan
                    </CardDescription>
                  </motion.div>
                </CardHeader>
                
                <CardContent className="px-6 pb-2">
                  <div className="grid grid-cols-1 gap-3">
                    {fitnessGoalOptions.map((option, index) => (
                      <GoalOption
                        key={option.id}
                        id={option.id}
                        title={option.title}
                        icon={option.icon}
                        description={option.description}
                        isSelected={profile.fitnessGoal === option.id}
                        onSelect={() => handleFitnessGoalChange(option.id as "muscle_gain" | "weight_loss" | "get_fit" | "overall_health" | "stamina")}
                        delay={index * 0.1}
                      />
                    ))}
                  </div>
                </CardContent>
                
                <CardFooter className="flex justify-between pt-6 pb-8 px-8">
                  <motion.div
                    whileHover={{ scale: 1.02, translateY: -2 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <Button 
                      variant="outline" 
                      onClick={handlePreviousStep}
                      className="h-12 px-6 gap-2 rounded-xl bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 font-medium"
                    >
                      Back
                    </Button>
                  </motion.div>
                  <ContinueButton onClick={handleNextStep} />
                </CardFooter>
              </Card>
            </FastFadeIn>
          ) : step === 3 ? (
            <FastFadeIn key="step3">
              <Card className="border-none shadow-[0_10px_40px_rgba(0,0,0,0.08)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.2)] backdrop-blur-md bg-white/90 dark:bg-slate-900/90 overflow-hidden rounded-2xl">
                <CardHeader className="space-y-2 text-center pb-8 pt-8">
                  <div className="flex justify-center mb-4">
                    <motion.div
                      className="relative"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 260, 
                        damping: 20,
                        delay: 0.1 
                      }}
                    >
                      <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl" />
                      <div className="p-4 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 relative border border-primary/10 shadow-inner">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M19 4h-4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
                          <path d="M5 8h4a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2z" />
                          <line x1="10" y1="10" x2="14" y2="10" />
                        </svg>
                      </div>
            </motion.div>
                  </div>
                  
            <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-50 dark:to-slate-300 text-transparent bg-clip-text">
                      Your Measurements
                    </CardTitle>
                    <CardDescription className="text-center max-w-sm mx-auto mt-3 text-slate-600 dark:text-slate-400 text-base">
                      Let's get your measurements to calculate personalized nutrition goals
                    </CardDescription>
                  </motion.div>
                </CardHeader>
                
                <CardContent className="space-y-7 px-8">
                  <motion.div
                    className="flex justify-center mb-6"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <div className="inline-flex h-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 p-1 text-slate-500 dark:text-slate-400">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => handleUnitChange("metric")}
                        className={`flex items-center justify-center h-8 px-4 rounded-lg text-sm font-medium transition-all ${
                          profile.unit === "metric"
                            ? "bg-white dark:bg-slate-700 text-primary shadow-sm"
                            : "hover:text-slate-900 dark:hover:text-slate-100"
                        }`}
                      >
                        Metric (cm/kg)
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => handleUnitChange("imperial")}
                        className={`flex items-center justify-center h-8 px-4 rounded-lg text-sm font-medium transition-all ${
                          profile.unit === "imperial"
                            ? "bg-white dark:bg-slate-700 text-primary shadow-sm"
                            : "hover:text-slate-900 dark:hover:text-slate-100"
                        }`}
                      >
                        Imperial (in/lbs)
                      </Button>
                    </div>
                  </motion.div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <motion.div
                      className="space-y-2.5"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                    >
                      <Label htmlFor="height" className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="12" y1="3" x2="12" y2="21"></line>
                          <polyline points="8 8 12 4 16 8"></polyline>
                          <polyline points="8 16 12 20 16 16"></polyline>
                        </svg>
                        Height
                      </Label>
                      <motion.div
                        whileFocus={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <div className="relative">
                          <Input
                            id="height"
                            name="height"
                            type="number"
                            value={profile.height === 0 ? "" : profile.height}
                            onChange={handleInputChange}
                            className="bg-white/50 dark:bg-slate-800/50 h-12 pr-12 rounded-xl border-slate-200 dark:border-slate-700 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300 shadow-sm"
                            placeholder={profile.unit === "metric" ? "Enter height" : "Enter height"}
                            min={profile.unit === "metric" ? 100 : 39}
                            max={profile.unit === "metric" ? 250 : 98}
                          />
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 dark:text-slate-400 font-medium text-sm">
                            {profile.unit === "metric" ? "cm" : "in"}
                          </div>
                        </div>
                      </motion.div>
                    </motion.div>
                    
                    <motion.div
                      className="space-y-2.5"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                    >
                      <Label htmlFor="weight" className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" y1="8" x2="12" y2="16"></line>
                          <line x1="8" y1="12" x2="16" y2="12"></line>
                        </svg>
                        Weight
                      </Label>
                      <motion.div
                        whileFocus={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <div className="relative">
                          <Input
                            id="weight"
                            name="weight"
                            type="number"
                            value={profile.weight === 0 ? "" : profile.weight}
                            onChange={handleInputChange}
                            className="bg-white/50 dark:bg-slate-800/50 h-12 pr-12 rounded-xl border-slate-200 dark:border-slate-700 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300 shadow-sm"
                            placeholder={profile.unit === "metric" ? "Enter weight" : "Enter weight"}
                            min={profile.unit === "metric" ? 30 : 66}
                            max={profile.unit === "metric" ? 250 : 550}
                          />
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 dark:text-slate-400 font-medium text-sm">
                            {profile.unit === "metric" ? "kg" : "lbs"}
                          </div>
                        </div>
                      </motion.div>
                    </motion.div>
                  </div>
                  
                  <motion.div
                    className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1 text-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" y1="16" x2="12" y2="12"></line>
                          <line x1="12" y1="8" x2="12.01" y2="8"></line>
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">Why we need this information</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Your height and weight help us calculate personalized nutrition goals based on your body's specific needs for optimal health.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </CardContent>
                
                <CardFooter className="flex justify-between pt-6 pb-8 px-8">
                  <motion.div
                    whileHover={{ scale: 1.02, translateY: -2 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <Button 
                      variant="outline" 
                      onClick={handlePreviousStep}
                      className="h-12 px-6 gap-2 rounded-xl bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 font-medium"
                    >
                      Back
                    </Button>
                  </motion.div>
                  <ContinueButton onClick={handleNextStep} />
                </CardFooter>
              </Card>
            </FastFadeIn>
          ) : (
            <FastFadeIn key="step4">
              <Card className="border-none shadow-[0_10px_40px_rgba(0,0,0,0.08)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.2)] backdrop-blur-md bg-white/90 dark:bg-slate-900/90 overflow-hidden rounded-2xl">
                <CardHeader className="space-y-2 text-center pb-8 pt-8">
                  <div className="flex justify-center mb-4">
                    <motion.div
                      className="relative"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 260, 
                        damping: 20,
                        delay: 0.1 
                      }}
                    >
                      <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl" />
                      <div className="p-4 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 relative border border-primary/10 shadow-inner">
                        <Flame className="h-8 w-8 text-primary" />
                      </div>
                    </motion.div>
                  </div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-50 dark:to-slate-300 text-transparent bg-clip-text">
                      Your Nutrition Goals
                  </CardTitle>
                    <CardDescription className="text-center max-w-sm mx-auto mt-3 text-slate-600 dark:text-slate-400 text-base">
                      Personalized based on your profile and measurements
                  </CardDescription>
                  </motion.div>
                </CardHeader>
                
                <CardContent className="space-y-7 px-8">
                  <div className="space-y-6">
                    <NutritionInput 
                      label="Daily Calories" 
                      name="calories"
                      value={profile.calories}
                      onChange={handleNumberInputChange}
                      icon={<Flame className="h-5 w-5" />}
                      color="red"
                      unit="kcal"
                      min={1000}
                      max={5000}
                      delay={0.2}
                    />
                    
                    <NutritionInput 
                      label="Daily Protein" 
                      name="protein"
                      value={profile.protein}
                      onChange={handleNumberInputChange}
                      icon={<Drumstick className="h-5 w-5" />}
                      color="blue"
                      unit="g"
                      min={10}
                      max={300}
                      delay={0.3}
                    />
                    
                    <NutritionInput 
                      label="Daily Fat" 
                      name="fat"
                      value={profile.fat}
                      onChange={handleNumberInputChange}
                      icon={<Droplets className="h-5 w-5" />}
                      color="amber"
                      unit="g"
                      min={10}
                      max={200}
                      delay={0.4}
                    />
                    
                    <NutritionInput 
                      label="Daily Carbohydrates" 
                      name="carbs"
                      value={profile.carbs}
                      onChange={handleNumberInputChange}
                      icon={<Wheat className="h-5 w-5" />}
                      color="emerald"
                      unit="g"
                      min={10}
                      max={500}
                      delay={0.5}
                    />
                  </div>
                  
                  <motion.div
                    className="mt-2 p-4 rounded-xl bg-primary/5 border border-primary/10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.7 }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1 text-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" y1="16" x2="12" y2="12"></line>
                          <line x1="12" y1="8" x2="12.01" y2="8"></line>
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">These are your suggested values</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Calculated based on your age, gender, weight, and height. You can adjust them if needed.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </CardContent>
                
                <CardFooter className="flex justify-between pt-6 pb-8 px-8">
                  <motion.div
                    whileHover={{ scale: 1.02, translateY: -2 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <Button 
                      variant="outline" 
                      onClick={handlePreviousStep}
                      className="h-12 px-6 gap-2 rounded-xl bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 font-medium"
                    >
                      Back
                    </Button>
                  </motion.div>
                  <ContinueButton 
                      onClick={handleNextStep} 
                    text="Complete Setup"
                    isLoading={isLoading}
                  />
                </CardFooter>
              </Card>
            </FastFadeIn>
          )}
        </AnimatePresence>
        
        {/* Step Indicators - simplified animation */}
        <div className="flex justify-center mt-6 gap-3">
          {[1, 2, 3, 4].map((stepNum) => (
            <motion.button
              key={`step-${stepNum}`}
              onClick={() => !isLoading && canNavigateToStep(stepNum) && setStep(stepNum)}
              className={`h-3 rounded-full transition-all duration-200 ${
                step === stepNum ? 'w-8 bg-gradient-to-r from-primary to-primary/70 shadow-sm shadow-primary/20' : 
                'w-3 bg-slate-300/50 dark:bg-slate-700/50 hover:bg-slate-300 dark:hover:bg-slate-700'
              }`}
              animate={{ scale: step === stepNum ? 1.05 : 1 }}
              transition={{ duration: 0.2 }}
              disabled={isLoading}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
  
  // Helper function to determine if user can navigate to a step
  function canNavigateToStep(targetStep: number): boolean {
    if (targetStep === 1) return true;
    if (targetStep === 2) return Boolean(profile.name) && profile.age >= 12 && profile.age <= 100;
    if (targetStep === 3) return Boolean(profile.name) && profile.age >= 12 && profile.age <= 100;
    if (targetStep === 4) return Boolean(profile.name) && profile.age >= 12 && profile.weight > 0 && profile.height > 0;
    return false;
  }
}

interface NutritionInputProps {
  label: string;
  name: string;
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon: React.ReactNode;
  color: "red" | "blue" | "amber" | "emerald";
  unit: string;
  min: number;
  max: number;
  delay: number;
}

function NutritionInput({ 
  label, 
  name, 
  value, 
  onChange, 
  icon, 
  color,
  unit,
  min,
  max,
  delay = 0
}: NutritionInputProps) {
  const colorClasses = {
    red: {
      container: "bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800/30",
      icon: "text-red-500 dark:text-red-400",
      ring: "focus:ring-red-500/20",
      progress: "from-red-500 to-red-400 dark:from-red-400 dark:to-red-500/70",
      shadow: "shadow-red-500/20",
      text: "text-red-600 dark:text-red-400"
    },
    blue: {
      container: "bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800/30",
      icon: "text-blue-500 dark:text-blue-400",
      ring: "focus:ring-blue-500/20",
      progress: "from-blue-500 to-blue-400 dark:from-blue-400 dark:to-blue-500/70",
      shadow: "shadow-blue-500/20",
      text: "text-blue-600 dark:text-blue-400"
    },
    amber: {
      container: "bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800/30",
      icon: "text-amber-500 dark:text-amber-400",
      ring: "focus:ring-amber-500/20",
      progress: "from-amber-500 to-amber-400 dark:from-amber-400 dark:to-amber-500/70",
      shadow: "shadow-amber-500/20",
      text: "text-amber-600 dark:text-amber-400"
    },
    emerald: {
      container: "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/30",
      icon: "text-emerald-500 dark:text-emerald-400",
      ring: "focus:ring-emerald-500/20",
      progress: "from-emerald-500 to-emerald-400 dark:from-emerald-400 dark:to-emerald-500/70",
      shadow: "shadow-emerald-500/20",
      text: "text-emerald-600 dark:text-emerald-400"
    },
  };
  
  return (
    <motion.div 
      className="space-y-3"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        delay: delay,
        type: "spring",
        stiffness: 100
      }}
      whileHover={{ y: -4, transition: { type: "spring", stiffness: 300 } }}
    >
      <div className="flex items-center space-x-3">
        <motion.div 
          className={cn(
            "p-2.5 rounded-xl border shadow-sm",
            colorClasses[color].container, 
            colorClasses[color].shadow
          )}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: delay + 0.2, type: "spring", stiffness: 200 }}
        >
          <div className={cn(colorClasses[color].icon)}>
          {icon}
        </div>
        </motion.div>
        <div>
          <Label htmlFor={name} className="text-sm font-medium text-slate-700 dark:text-slate-300 block">
            {label}
          </Label>
          <div className="text-xs text-muted-foreground mt-0.5">{value} {unit} of {max} {unit}</div>
        </div>
      </div>
      
      <div className="space-y-2">
      <div className="relative">
          <motion.div
            whileTap={{ scale: 0.98 }}
            whileFocus={{ scale: 1.01 }}
          >
        <Input
          id={name}
          name={name}
          type="number"
          value={value}
          onChange={onChange}
              className={cn(
                "pr-12 h-12 rounded-xl transition-all duration-300 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 shadow-sm",
                colorClasses[color].ring
              )}
          min={min}
          max={max}
        />
          </motion.div>
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 font-medium">
            <span className={cn("text-sm", colorClasses[color].text)}>{unit}</span>
        </div>
      </div>
      
        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
        <motion.div 
            className={cn("h-full bg-gradient-to-r", colorClasses[color].progress)}
          initial={{ width: "0%" }}
          animate={{ width: `${Math.min(100, (value / max) * 100)}%` }}
            transition={{ duration: 0.8, delay: delay + 0.3, ease: "easeOut" }}
        />
      </div>
      
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-slate-400 dark:text-slate-500">{min}</span>
          <div className="flex space-x-1">
            {[...Array(5)].map((_, i) => {
              const threshold = min + ((max - min) / 5) * (i + 1);
              const isActive = value >= threshold;
              return (
                <motion.div
                  key={`marker-${i}`}
                  className={cn(
                    "h-1 w-1 rounded-full transition-colors",
                    isActive ? colorClasses[color].text : "bg-slate-200 dark:bg-slate-700"
                  )}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: delay + 0.4 + (i * 0.05) }}
                />
              );
            })}
          </div>
          <span className="text-xs text-slate-400 dark:text-slate-500">{max}</span>
        </div>
      </div>
    </motion.div>
  );
} 