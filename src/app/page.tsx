"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Bell,
  Camera,
  UploadCloud,
  FilePenLine,
  CalendarDays,
  Flame,
  Wheat,
  Drumstick,
  Droplets,
  PlusCircle,
  Lightbulb,
  TrendingUp,
  Utensils,
  BarChart2,
  ChevronDown,
  Trash2,
  BookOpen,
  ArrowRight,
  Loader2,
  Sparkles,
  InfoIcon,
  MoreVertical,
  Egg,
  Delete,
  DeleteIcon,
  Trash,
} from "lucide-react";
import { useState, type FC, useEffect, ReactNode, useMemo } from "react";
import type { FoodEntry as LoggedFoodEntry, BlogPost, DailyLogEntry } from "@/types";
import { useDailyLog } from "@/hooks/use-daily-log";
import { useGoals } from "@/hooks/use-goals";
import { useUserProfile } from "@/hooks/use-user-profile";
import { format, isToday, subDays } from "date-fns";
import Image from "next/image";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Label, type TooltipProps } from 'recharts';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import React from "react"; // Added React import for React.memo
import dynamic from "next/dynamic"; // Added dynamic import
import { resetOnboarding } from "@/lib/onboarding";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

// Dynamically import CalorieDonutChart
const CalorieDonutChart = dynamic(
  () => import('@/components/dashboard/calorie-donut-chart'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-36 h-36 md:w-32 md:h-32 flex justify-center items-center relative">
        <Skeleton className="w-full h-full rounded-full" />
        <Loader2 className="absolute h-8 w-8 animate-spin text-primary/50" />
      </div>
    )
  }
);

// Dynamically import SmartInsights
const SmartInsights = dynamic(
  () => import('@/components/dashboard/smart-insights'),
  { 
    ssr: false,
    loading: () => (
      <Card className="shadow-lg rounded-xl overflow-hidden">
        <CardContent className="p-5 space-y-4">
          <div className="h-6 w-40 bg-muted animate-pulse rounded" />
          <div className="h-4 w-full bg-muted animate-pulse rounded" />
          <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    )
  }
);

interface MealCardProps {
  id: string;
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  onDelete: (id: string) => void;
}

const MealCard: React.FC<MealCardProps> = React.memo(({ id, name, calories, protein, fat, carbs, onDelete }) => (
  <motion.div
    key={id}
    initial={{ opacity: 0, y: 20, scale: 0.98 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95, y: -10 }}
    transition={{ 
      duration: 0.4, 
      delay: 0.1,
      type: "spring",
      stiffness: 100
    }}
    layout
    whileHover={{ 
      y: -3,
      boxShadow: "0 10px 30px -10px rgba(0,0,0,0.15)",
      transition: { duration: 0.2 }
    }}
  >
    <Card className="border border-[#E5E5EA] dark:border-gray-800/20 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden rounded-xl relative">
      <div className="absolute inset-0 bg-gradient-to-br from-white to-amber-50/20 dark:from-gray-900/80 dark:to-amber-900/10 z-0"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-amber-50/30 dark:to-amber-800/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"></div>
      <div className="relative z-10 p-4">
        <div className="flex flex-col space-y-1">
          <div className="flex justify-between items-center pr-5">
            <div className="max-w-[calc(100%-70px)]">
              <h3 className="text-lg font-semibold text-foreground title-poppins line-clamp-1" title={name}>{name}</h3>
              {name.length > 20 && (
                <p className="text-xs text-muted-foreground -mt-0.5 line-clamp-1">{name}</p>
              )}
            </div>
            <div className="flex items-center font-bold text-lg text-poppins shrink-0" style={{color: 'hsl(var(--text-kcal-raw))'}}>
              <Flame className="h-5 w-5 mr-1.5" />
              {Math.round(calories)}
              <span className="text-xs font-normal ml-1 text-muted-foreground">kcal</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
          <div className="flex flex-col items-center p-2 bg-secondary/20 rounded-md">
            <span className="font-medium text-sm text-poppins" style={{color: 'hsl(var(--text-protein-raw))'}}>{Math.round(protein)}g</span>
            <span className="text-poppins">Protein</span>
          </div>
          <div className="flex flex-col items-center p-2 bg-secondary/20 rounded-md">
            <span className="font-medium text-sm text-poppins" style={{color: 'hsl(var(--text-fat-raw))'}}>{Math.round(fat)}g</span>
            <span className="text-poppins">Fat</span>
          </div>
          <div className="flex flex-col items-center p-2 bg-secondary/20 rounded-md">
            <span className="font-medium text-sm text-poppins" style={{color: 'hsl(var(--text-carbs-raw))'}}>{Math.round(carbs)}g</span>
            <span className="text-poppins">Carbs</span>
          </div>
        </div>
      </div>
    </Card>
  </motion.div>
));
MealCard.displayName = 'MealCard';


interface SummaryCardProps {
  icon: React.ElementType;
  value: string;
  label: string;
  iconColorVariable: string;
}

const SummaryCard: React.FC<SummaryCardProps> = React.memo(({ icon: Icon, value, label, iconColorVariable }) => (
  <Card className="p-3 shadow-md hover:shadow-lg transition-shadow bg-card rounded-xl text-center">
      <div className="p-2 rounded-lg inline-block mx-auto" style={{ backgroundColor: `hsla(${iconColorVariable}, 0.1)` }}>
        <Icon className="h-6 w-6" style={{ color: `hsl(${iconColorVariable})` }} />
      </div>
      <p className="text-lg font-bold mt-1 title-poppins" style={{ color: `hsl(${iconColorVariable})` }}>{value}</p>
      <p className="text-xs text-muted-foreground text-poppins">{label}</p>
  </Card>
));
SummaryCard.displayName = 'SummaryCard';


export const mockBlogData: BlogPost[] = [
  {
    id: "1",
    title: "The Science Behind Morning Workouts: Boost Your Metabolism",
    excerpt: "Morning exercise can increase your metabolic rate for hours and improve cognitive function throughout the day. Learn the science-backed benefits and how to build a sustainable routine.",
    imageUrl: "https://images.unsplash.com/photo-1599058917765-a780eda07a3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1469&q=80",
    imageHint: "morning workout routine",
    readMoreLink: "/blog/1",
    author: {
      name: "John Doe",
      role: "Fitness Expert",
      imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    },
    publishDate: "2023-07-15",
    category: "Fitness",
    content: `
      <p>Morning exercise can increase your metabolic rate for hours and improve cognitive function throughout the day. Learn the science-backed benefits and how to build a sustainable routine.</p>
      <p>Morning exercise can increase your metabolic rate for hours and improve cognitive function throughout the day. Learn the science-backed benefits and how to build a sustainable routine.</p>
      <p>Morning exercise can increase your metabolic rate for hours and improve cognitive function throughout the day. Learn the science-backed benefits and how to build a sustainable routine.</p>
      <p>Morning exercise can increase your metabolic rate for hours and improve cognitive function throughout the day. Learn the science-backed benefits and how to build a sustainable routine.</p>
      <p>Morning exercise can increase your metabolic rate for hours and improve cognitive function throughout the day. Learn the science-backed benefits and how to build a sustainable routine.</p>
    `,
  },
  {
    id: "2",
    title: "Macronutrients Demystified: Building Your Optimal Diet Plan",
    excerpt: "Understanding the roles of proteins, carbohydrates, and fats is essential for creating a balanced nutrition plan. Learn how to calculate your ideal macronutrient ratios based on your specific goals.",
    imageUrl: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    imageHint: "balanced nutrition macronutrients",
    readMoreLink: "/blog/2",
    author: {
      name: "Jane Smith",
      role: "Nutritionist",
      imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    },
    publishDate: "2023-07-14",
    category: "Nutrition",
    content: `
      <p>Understanding the roles of proteins, carbohydrates, and fats is essential for creating a balanced nutrition plan. Learn how to calculate your ideal macronutrient ratios based on your specific goals.</p>
      <p>Understanding the roles of proteins, carbohydrates, and fats is essential for creating a balanced nutrition plan. Learn how to calculate your ideal macronutrient ratios based on your specific goals.</p>
      <p>Understanding the roles of proteins, carbohydrates, and fats is essential for creating a balanced nutrition plan. Learn how to calculate your ideal macronutrient ratios based on your specific goals.</p>
      <p>Understanding the roles of proteins, carbohydrates, and fats is essential for creating a balanced nutrition plan. Learn how to calculate your ideal macronutrient ratios based on your specific goals.</p>
      <p>Understanding the roles of proteins, carbohydrates, and fats is essential for creating a balanced nutrition plan. Learn how to calculate your ideal macronutrient ratios based on your specific goals.</p>
    `,
  },
  {
    id: "3",
    title: "Mindful Eating: Transform Your Relationship with Food",
    excerpt: "Mindful eating practices can help reduce overeating, improve digestion, and create a healthier relationship with food. Discover practical techniques to bring awareness to your meals.",
    imageUrl: "https://images.unsplash.com/photo-1515023115689-589c33041d3c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80",
    imageHint: "mindful eating meditation",
    readMoreLink: "/blog/3",
    author: {
      name: "Emily Johnson",
      role: "Wellness Coach",
      imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    },
    publishDate: "2023-07-13",
    category: "Wellness",
    content: `
      <p>Mindful eating practices can help reduce overeating, improve digestion, and create a healthier relationship with food. Discover practical techniques to bring awareness to your meals.</p>
      <p>Mindful eating practices can help reduce overeating, improve digestion, and create a healthier relationship with food. Discover practical techniques to bring awareness to your meals.</p>
      <p>Mindful eating practices can help reduce overeating, improve digestion, and create a healthier relationship with food. Discover practical techniques to bring awareness to your meals.</p>
      <p>Mindful eating practices can help reduce overeating, improve digestion, and create a healthier relationship with food. Discover practical techniques to bring awareness to your meals.</p>
      <p>Mindful eating practices can help reduce overeating, improve digestion, and create a healthier relationship with food. Discover practical techniques to bring awareness to your meals.</p>
    `,
  },
  {
    id: "4",
    title: "Hydration Science: Optimizing Water Intake for Health and Performance",
    excerpt: "Water is essential for every bodily function, yet many people remain chronically dehydrated. Learn how proper hydration can boost energy, improve skin health, and enhance athletic performance.",
    imageUrl: "https://images.unsplash.com/photo-1502208327471-d5dde4d78995?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    imageHint: "hydration water health",
    readMoreLink: "/blog/4",
    author: {
      name: "Michael Brown",
      role: "Sports Nutritionist",
      imageUrl: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    },
    publishDate: "2023-07-12",
    category: "Nutrition",
    content: `
      <p>Water is essential for every bodily function, yet many people remain chronically dehydrated. Learn how proper hydration can boost energy, improve skin health, and enhance athletic performance.</p>
      <p>Water is essential for every bodily function, yet many people remain chronically dehydrated. Learn how proper hydration can boost energy, improve skin health, and enhance athletic performance.</p>
      <p>Water is essential for every bodily function, yet many people remain chronically dehydrated. Learn how proper hydration can boost energy, improve skin health, and enhance athletic performance.</p>
      <p>Water is essential for every bodily function, yet many people remain chronically dehydrated. Learn how proper hydration can boost energy, improve skin health, and enhance athletic performance.</p>
      <p>Water is essential for every bodily function, yet many people remain chronically dehydrated. Learn how proper hydration can boost energy, improve skin health, and enhance athletic performance.</p>
    `,
  },
  {
    id: "5",
    title: "Strength Training for Longevity: Why Everyone Should Lift Weights",
    excerpt: "Resistance training is about more than building muscle—it's essential for maintaining independence and health as we age. Discover how to start safely at any age and experience level.",
    imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    imageHint: "senior strength training",
    readMoreLink: "/blog/5",
    author: {
      name: "Sarah Wilson",
      role: "Personal Trainer",
      imageUrl: "https://images.unsplash.com/photo-1552058544-f2b08422138a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    },
    publishDate: "2023-07-11",
    category: "Fitness",
    content: `
      <p>Resistance training is about more than building muscle—it's essential for maintaining independence and health as we age. Discover how to start safely at any age and experience level.</p>
      <p>Resistance training is about more than building muscle—it's essential for maintaining independence and health as we age. Discover how to start safely at any age and experience level.</p>
      <p>Resistance training is about more than building muscle—it's essential for maintaining independence and health as we age. Discover how to start safely at any age and experience level.</p>
      <p>Resistance training is about more than building muscle—it's essential for maintaining independence and health as we age. Discover how to start safely at any age and experience level.</p>
      <p>Resistance training is about more than building muscle—it's essential for maintaining independence and health as we age. Discover how to start safely at any age and experience level.</p>
    `,
  },
  {
    id: "6",
    title: "The Gut-Brain Connection: How Diet Affects Mental Health",
    excerpt: "Emerging research reveals the powerful link between gut health and mental wellbeing. Learn which foods can help reduce anxiety, improve mood, and support cognitive function.",
    imageUrl: "https://images.unsplash.com/photo-1511909525232-61113c912358?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1472&q=80",
    imageHint: "gut brain connection",
    readMoreLink: "/blog/6",
    author: {
      name: "David Johnson",
      role: "Psychiatrist",
      imageUrl: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    },
    publishDate: "2023-07-10",
    category: "Wellness",
    content: `
      <p>Emerging research reveals the powerful link between gut health and mental wellbeing. Learn which foods can help reduce anxiety, improve mood, and support cognitive function.</p>
      <p>Emerging research reveals the powerful link between gut health and mental wellbeing. Learn which foods can help reduce anxiety, improve mood, and support cognitive function.</p>
      <p>Emerging research reveals the powerful link between gut health and mental wellbeing. Learn which foods can help reduce anxiety, improve mood, and support cognitive function.</p>
      <p>Emerging research reveals the powerful link between gut health and mental wellbeing. Learn which foods can help reduce anxiety, improve mood, and support cognitive function.</p>
      <p>Emerging research reveals the powerful link between gut health and mental wellbeing. Learn which foods can help reduce anxiety, improve mood, and support cognitive function.</p>
    `,
  }
];


interface CaloriesCenterLabelProps {
  viewBox?: { cx?: number; cy?: number };
  value: number;
}

const CaloriesCenterLabel: FC<CaloriesCenterLabelProps> = ({ viewBox, value }) => {
  if (!viewBox || typeof viewBox.cx !== 'number' || typeof viewBox.cy !== 'number') {
    return null;
  }
  const { cx, cy } = viewBox;
  return (
    <text x={cx} y={cy} fill="hsl(var(--foreground))" textAnchor="middle" dominantBaseline="central">
      <tspan x={cx} y={cy - 8} fontSize="1.75rem" fontWeight="bold">{`${Math.round(value)}`}</tspan>
      <tspan x={cx} y={cy + 12} fontSize="0.75rem" fill="hsl(var(--muted-foreground))">Calories</tspan>
    </text>
  );
};

interface CustomDonutTooltipProps extends TooltipProps<number, string> {
  goalCalories: number;
}

const CustomDonutTooltip: FC<CustomDonutTooltipProps> = ({ active, payload, goalCalories }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const value = payload[0].value || 0; 
    const name = data.name;

    let displayName = name;
    if (name === 'ConsumedNoGoal') {
      displayName = 'Consumed';
    } else if (name === 'Empty') {
      displayName = goalCalories > 0 ? 'Goal Not Reached' : 'Goal Not Set';
    } else if (name === 'Remaining' && goalCalories > 0) {
      displayName = 'Remaining in Goal';
    }

    const displayValue = (name === 'Empty' && value === 1 && goalCalories === 0 && data.value === 1)
      ? '0 kcal'
      : `${Math.round(value)} kcal`;

    return (
      <div className="rounded-lg border bg-popover px-3 py-1.5 text-xs text-popover-foreground shadow-md" style={{backgroundColor: "hsl(var(--popover))", borderColor: "hsl(var(--border))"}}>
        <p className="font-semibold">{displayName}</p>
        <p className="text-muted-foreground">{displayValue}</p>
      </div>
    );
  }
  return null;
};

// Custom Component for Insights
interface InsightCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  color: "blue" | "orange" | "green" | "red" | "purple";
}

const InsightCard: React.FC<InsightCardProps> = ({ icon: Icon, title, description, color }) => {
  const colors = {
    blue: {
      bg: "bg-[#5AC8FA]/10",
      text: "text-[#007AFF]",
      icon: "text-[#007AFF]"
    },
    green: {
      bg: "bg-[#4CD964]/10",
      text: "text-[#34C759]",
      icon: "text-[#34C759]"
    },
    orange: {
      bg: "bg-[#FF9500]/10",
      text: "text-[#FF9500]",
      icon: "text-[#FF9500]"
    },
    red: {
      bg: "bg-[#FF3B30]/10",
      text: "text-[#FF3B30]",
      icon: "text-[#FF3B30]"
    },
    purple: {
      bg: "bg-[#AF52DE]/10",
      text: "text-[#AF52DE]",
      icon: "text-[#AF52DE]"
    }
  };
  
  return (
    <motion.div 
      className="p-4 rounded-xl border border-[#E5E5EA] dark:border-[#38383A]/50 hover:border-[#C7C7CC]"
      whileHover={{ x: 5 }}
    >
      <div className="flex gap-3">
        <div className={`p-2 rounded-lg ${colors[color].bg} flex-shrink-0`}>
          <Icon className={`h-5 w-5 ${colors[color].icon}`} />
        </div>
        <div className="space-y-1">
          <h4 className={`text-sm font-semibold ${colors[color].text}`}>{title}</h4>
          <p className="text-xs text-[#8E8E93] dark:text-[#8E8E93]">{description}</p>
        </div>
      </div>
    </motion.div>
  );
};

// InfoTooltip component
const InfoTooltip = ({ title, description, color }: { title: string; description: string; color: string }) => {
  const [open, setOpen] = useState(false);
  
  return (
    <>
      <motion.button 
        className="h-6 w-6 rounded-full bg-white/30 flex items-center justify-center hover:bg-white/50 transition-colors"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <InfoIcon className="h-4 w-4 text-white" />
      </motion.button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className={`bg-gradient-to-br ${color} text-white border-none rounded-2xl shadow-xl`}>
          <motion.div 
            className="absolute inset-0 bg-white opacity-5 rounded-2xl"
            animate={{
              opacity: [0.03, 0.05, 0.03]
            }}
            transition={{ duration: 5, repeat: Infinity }}
          />
          <DialogHeader className="relative z-10">
            <DialogTitle className="text-white">{title}</DialogTitle>
            <DialogDescription className="text-white/90">
              {description}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default function DashboardPage() {
  const { dailyLog, foodEntries, isLoading: isLoadingLog, deleteFoodEntry, currentSelectedDate, selectDateForLog, getLogDataForDate } = useDailyLog();
  const { goals, isLoading: isLoadingGoals } = useGoals();
  const { userProfile, isLoading: isLoadingProfile } = useUserProfile();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [showAllMeals, setShowAllMeals] = useState(false);
  const [showFAB, setShowFAB] = useState(false);

  // Fetch previous logs for Smart Insights (last 14 days)
  const [previousLogs, setPreviousLogs] = useState<DailyLogEntry[]>([]);
  const [isPreviousLogsLoading, setIsPreviousLogsLoading] = useState(true);

  useEffect(() => {
    if (currentSelectedDate) {
      setIsPreviousLogsLoading(true);
      const logs: DailyLogEntry[] = [];
      
      // Get logs from the last 14 days
      for (let i = 1; i <= 14; i++) {
        const date = subDays(new Date(), i);
        const { summary } = getLogDataForDate(date);
        if (summary) {
          logs.push(summary);
        }
      }
      
      setPreviousLogs(logs);
      setIsPreviousLogsLoading(false);
    }
  }, [currentSelectedDate, getLogDataForDate]);

  // Show/hide FAB based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      setShowFAB(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const consumedCalories = dailyLog?.calories ?? 0;
  const goalCalories = goals?.calories ?? 0;

  let percentAchieved = 0;
  if (goalCalories > 0) {
    percentAchieved = Math.round((consumedCalories / goalCalories) * 100);
  }

  const chartData = [];
  const COLORS = {
    Consumed: 'rgba(255, 149, 0, 0.7)', 
    Remaining: 'hsla(var(--primary-hsl), 0.7)', 
    Empty: 'hsla(var(--muted-foreground), 0.1)', 
    ConsumedNoGoal: 'hsl(var(--accent))', 
  };

  if (goalCalories > 0) {
    if (consumedCalories > 0) {
      chartData.push({ name: 'Consumed', value: consumedCalories, fill: COLORS.Consumed });
      if (consumedCalories < goalCalories) {
        chartData.push({ name: 'Remaining', value: Math.max(0, goalCalories - consumedCalories), fill: COLORS.Remaining });
      }
    } else { 
      chartData.push({ name: 'Remaining', value: goalCalories, fill: COLORS.Remaining });
    }
  } else { 
    if (consumedCalories > 0) {
      chartData.push({ name: 'ConsumedNoGoal', value: consumedCalories, fill: COLORS.ConsumedNoGoal });
    } else { 
      chartData.push({ name: 'Empty', value: 1, fill: COLORS.Empty });
    }
  }

  if (chartData.length === 0) { 
    chartData.push({ name: 'Empty', value: 1, fill: COLORS.Empty });
  }


  const todayCalories = dailyLog?.calories ?? 0;
  const todayCarbs = dailyLog?.carbs ?? 0;
  const todayProtein = dailyLog?.protein ?? 0;
  const todayFat = dailyLog?.fat ?? 0;

  const isDataLoading = isLoadingLog || isLoadingGoals || isLoadingProfile;

  const displayedFoodEntries = showAllMeals ? foodEntries : foodEntries.slice(0, 3);

  // Development tools
  const [showDevTools, setShowDevTools] = useState(false);

  const { toast } = useToast();

  const handleResetOnboarding = () => {
    resetOnboarding();
    toast({
      title: "Onboarding Reset",
      description: "Refresh the page to start onboarding",
    });
  };

  return (
    <div className="flex flex-col gap-5 p-6 max-w-2xl mx-auto bg-[#F2F2F7] dark:bg-background">
      {/* Header - Apple Health Inspired */}
      <motion.div 
        className="relative overflow-hidden rounded-2xl shadow-lg w-full"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, type: "spring", stiffness: 100 }}
      >
        {/* Animated gradient background */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-[#FF2D55] via-[#FF9500] to-[#FF3B30]"
          animate={{
            background: [
              "linear-gradient(to right, #FF2D55, #FF9500, #FF3B30)",
              "linear-gradient(to right, #FF3B30, #FF2D55, #FF9500)",
              "linear-gradient(to right, #FF9500, #FF3B30, #FF2D55)",
              "linear-gradient(to right, #FF2D55, #FF9500, #FF3B30)"
            ]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Animated particles overlay */}
        <div className="absolute inset-0 opacity-10 mix-blend-overlay" 
             style={{backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"20\" height=\"20\" viewBox=\"0 0 20 20\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.5\" fill-rule=\"evenodd\"%3E%3Ccircle cx=\"3\" cy=\"3\" r=\"1\"%2F%3E%3Ccircle cx=\"13\" cy=\"13\" r=\"1\"%2F%3E%3C%2Fg%3E%3C/svg%3E')"}}></div>
        
        {/* Animated shine effect */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0" 
          animate={{
            left: ["-100%", "100%"],
            opacity: [0, 0.1, 0]
          }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 7 }}
        />
        
        <div className="relative p-4 flex justify-between items-center z-10">
          <div className="flex items-center gap-3">
          {isLoadingProfile ? (
            <>
                <Skeleton className="h-10 w-10 rounded-full bg-white/20" />
                <Skeleton className="h-6 w-28 bg-white/20" />
            </>
          ) : (
            <>
              <Link href="/profile">
                  <motion.div 
                    whileHover={{ scale: 1.05 }} 
                    whileTap={{ scale: 0.95 }}
                    className="relative"
                  >
                    <Avatar className="h-12 w-12 cursor-pointer ring-2 ring-white/50 hover:ring-white/80 transition-all relative z-10 border-2 border-white/90 shadow-lg">
                      <AvatarImage src={userProfile.avatarUrl} alt={userProfile.name || ""} className="object-cover" data-ai-hint="user avatar" />
                      <AvatarFallback className="bg-white/10 text-white font-semibold">{userProfile.name?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                </Avatar>
                  </motion.div>
              </Link>
                <div className="flex flex-col">
                  <motion.h1 
                    className="text-xl font-bold text-white tracking-tight"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    Hi, {userProfile.name}
                    <motion.span 
                      className="inline-block ml-1"
                      initial={{ rotate: -15 }}
                      animate={{ rotate: 15 }}
                      transition={{ 
                        repeat: Infinity, 
                        repeatType: "reverse", 
                        duration: 0.5,
                        repeatDelay: 2
                      }}
                    >
                      👋
                    </motion.span>
                  </motion.h1>
                  <span className="text-white/90 text-xs font-medium">Track your nutrition journey</span>
                </div>
            </>
          )}
        </div>
          <div className="flex items-center gap-2">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <div className="rounded-full border-white/20 bg-white/15 hover:bg-white/25 text-white backdrop-blur-sm">
                <ThemeToggle />
              </div>
            </motion.div>
           <Link href="/reminders" legacyBehavior>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button variant="outline" size="icon" className="rounded-full border-white/20 bg-white/15 hover:bg-white/25 text-white backdrop-blur-sm">
                  <Bell className="h-5 w-5" />
                </Button>
              </motion.div>
          </Link>
        </div>
      </div>
      </motion.div>

      {/* Your Progress Card - Apple Health Style */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, type: "spring" }}
        className="mt-8 w-full"
      >
        <Card className="relative overflow-hidden rounded-xl border-none shadow-md bg-white dark:bg-black/20">
          {/* Subtle gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-gray-50 dark:from-black/30 dark:via-black/20 dark:to-black/10"></div>
          
          {/* Header with title */}
          <div className="relative px-6 pt-5 pb-2 flex items-center justify-between border-b border-[#E5E5EA] dark:border-gray-800/30">
            <div className="flex items-center gap-2">
              <motion.div 
                className="h-7 w-7 rounded-full bg-gradient-to-br from-[#FF3B30] to-[#FF2D55] flex items-center justify-center"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Flame className="h-4 w-4 text-white" />
              </motion.div>
              <h3 className="font-semibold text-base text-[#1C1C1E] dark:text-white">Calories</h3>
            </div>
                      
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button variant="ghost" size="sm" className="flex items-center gap-1 text-sm font-normal h-8 text-[#8E8E93]">
                  <CalendarDays className="h-3.5 w-3.5" />
                  <span>{currentSelectedDate ? (isToday(currentSelectedDate) ? "Today" : format(currentSelectedDate, "MMM d, yyyy")) : "Select Date"}</span>
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
              </motion.div>
            </PopoverTrigger>
              <PopoverContent className="w-auto p-0 shadow-xl border border-[#E5E5EA]/30 bg-white dark:bg-black/90 backdrop-blur-lg rounded-2xl" align="end">
              <Calendar
                mode="single"
                selected={currentSelectedDate || undefined}
                onSelect={(newDate) => {
                  if (newDate) {
                    selectDateForLog(newDate);
                    setShowAllMeals(false); // Reset view more on date change
                    setIsCalendarOpen(false);
                  }
                }}
                initialFocus
                disabled={(date) => date > new Date() || date < new Date("2000-01-01")}
              />
            </PopoverContent>
          </Popover>
        </div>
          
          {/* Main content */}
          <CardContent className="relative px-6 py-5 z-10">
            {isDataLoading ? (
              <div className="flex justify-between items-center gap-3">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-10 w-28 bg-[#E5E5EA]/70" />
                  <Skeleton className="h-4 w-20 bg-[#E5E5EA]/70" />
                </div>
                <div className="w-[120px] h-[120px] flex-shrink-0 flex justify-center items-center">
                  <Skeleton className="w-full h-full rounded-full bg-[#E5E5EA]/70" />
                  <Loader2 className="absolute h-8 w-8 animate-spin text-[#8E8E93]/60" />
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <div className="flex flex-col">
                    <motion.div 
                      className="text-4xl font-bold text-[#1C1C1E] dark:text-white tracking-tight"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.3 }}
                    >
                      {Math.round(consumedCalories)}
                      <span className="text-base font-normal text-[#8E8E93] ml-1">kcal</span>
                    </motion.div>

                    {goalCalories > 0 && (
                        <motion.div 
                        className="flex items-center gap-2 mt-1.5 text-sm text-[#8E8E93]"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.4 }}
                      >
                        <div className="flex items-center">
                          <span className="font-medium">{percentAchieved}%</span>
                          <span className="mx-1">of</span>
                          <span>{goalCalories} goal</span>
                        </div>
                      </motion.div>
                    )}
                    
                    {/* Apple Health style ring progress */}
                    {goalCalories > 0 && (
                      <motion.div 
                        className="mt-4 w-full max-w-xs"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                      >
                        <div className="h-2 bg-[#E5E5EA] dark:bg-gray-800/50 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(percentAchieved, 100)}%` }}
                            transition={{ duration: 1, delay: 0.6 }}
                          style={{
                              backgroundColor: percentAchieved >= 100 
                                ? '#FF3B30' // Apple Health red
                                : '#FF3B30' // Apple Health red
                          }}
                        />
                      </div>
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Apple Health style ring chart */}
                <motion.div 
                  className="w-[120px] h-[120px] flex-shrink-0 flex justify-center items-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
          <CalorieDonutChart 
                    chartData={chartData.map(item => ({
                      ...item,
                      fill: item.name === 'Consumed' || item.name === 'ConsumedNoGoal' 
                        ? '#FF3B30' // Apple Health red
                        : item.name === 'Remaining' 
                          ? '#E5E5EA' // Apple light gray
                          : '#E5E5EA' // Apple light gray
                    }))} 
            consumedCalories={consumedCalories} 
            goalCalories={goalCalories} 
          />
                </motion.div>
      </div>
    )}
          </CardContent>
          
          {/* Nutrition breakdown - Apple Health style */}
          <div className="relative px-6 pb-5">
            <motion.div 
              className="grid grid-cols-3 gap-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              <motion.div 
                className="flex flex-col items-center p-3 rounded-lg bg-gradient-to-br from-[#5AC8FA]/20 to-[#007AFF]/10"
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
              >
                <span className="text-xs text-[#8E8E93] mb-1">Carbs</span>
                <span className="text-lg font-semibold text-[#007AFF]">{Math.round(todayCarbs)}g</span>
              </motion.div>
              
              <motion.div 
                className="flex flex-col items-center p-3 rounded-lg bg-gradient-to-br from-[#4CD964]/20 to-[#34C759]/10"
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
              >
                <span className="text-xs text-[#8E8E93] mb-1">Protein</span>
                <span className="text-lg font-semibold text-[#34C759]">{Math.round(todayProtein)}g</span>
              </motion.div>
              
              <motion.div 
                className="flex flex-col items-center p-3 rounded-lg bg-gradient-to-br from-[#FF9500]/20 to-[#FF9500]/10"
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
              >
                <span className="text-xs text-[#8E8E93] mb-1">Fat</span>
                <span className="text-lg font-semibold text-[#FF9500]">{Math.round(todayFat)}g</span>
              </motion.div>
            </motion.div>
          </div>
</Card>
      </motion.div>

      {/* Action Buttons - Apple Health Style */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, type: "spring" }}
        className="mt-6 mx-auto max-w-2xl"
      >
        {isDataLoading ? (
          <div className="grid grid-cols-2 gap-4 w-full">
            {[1, 2].map(i => (
              <Card key={`skel-action-${i}`} className="shadow-sm bg-white dark:bg-black/20 flex-1 relative overflow-hidden border border-[#E5E5EA]/20 rounded-xl">
                <CardContent className="p-5">
                  <Skeleton className="h-12 w-12 rounded-full bg-[#E5E5EA]/40 mb-4 mx-auto" />
                  <Skeleton className="h-4 w-28 bg-[#E5E5EA]/40 mb-2 mx-auto" />
                  <Skeleton className="h-3 w-36 bg-[#E5E5EA]/40 mx-auto" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 w-full">
            {/* Take Photo Card */}
            <Link href="/log-food/photo" className="flex-1" passHref>
              <motion.div
                whileHover={{ 
                  y: -5,
                  boxShadow: "0 15px 30px -5px rgba(255, 59, 48, 0.2)"
                }}
                whileTap={{ scale: 0.98 }}
                className="h-full rounded-xl"
              >
                <Card className="relative h-full border border-[#E5E5EA] dark:border-gray-800/20 shadow-sm overflow-hidden rounded-xl bg-white dark:bg-black/20">
                  {/* Gradient background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white to-[#FF3B30]/5 dark:from-black/30 dark:to-[#FF3B30]/10 opacity-50"></div>
                  
                  {/* Info button with Dialog */}
                  <div className="absolute top-3 right-3 z-20">
                    <InfoTooltip 
                      title="AI Food Detection"
                      description="Take a picture of your food or upload an image and our AI will detect what you're eating and calculate the nutritional information"
                      color="from-[#FF3B30] to-[#FF2D55]"
                    />
                  </div>
                
                  <CardContent className="p-6 flex flex-col items-center text-center relative z-10">
                    <motion.div 
                      className="h-14 w-14 rounded-full bg-gradient-to-br from-[#FF3B30] to-[#FF2D55] flex items-center justify-center mb-4"
                      animate={{ 
                        boxShadow: ["0px 0px 0px rgba(255, 59, 48, 0.4)", "0px 0px 20px rgba(255, 59, 48, 0.2)", "0px 0px 0px rgba(255, 59, 48, 0.4)"] 
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Camera className="h-7 w-7 text-white" />
                    </motion.div>
            
                    <div className="text-center">
                      <h3 className="font-semibold text-base text-[#1C1C1E] dark:text-white mb-1">Take Photo</h3>
                      <p className="text-[#8E8E93] text-sm">Snap or upload food image</p>
                    </div>
                  </CardContent>
              </Card>
              </motion.div>
            </Link>
             
            {/* Manual Entry Card */}
            <Link href="/log-food/manual" className="flex-1" passHref>
              <motion.div
                whileHover={{ 
                  y: -5,
                  boxShadow: "0 15px 30px -5px rgba(0, 122, 255, 0.2)"
                }}
                whileTap={{ scale: 0.98 }}
                className="h-full rounded-xl"
              >
                <Card className="relative h-full border border-[#E5E5EA] dark:border-gray-800/20 shadow-sm overflow-hidden rounded-xl bg-white dark:bg-black/20">
                  {/* Gradient background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white to-[#007AFF]/5 dark:from-black/30 dark:to-[#007AFF]/10 opacity-50"></div>
                  
                  {/* Info button with Dialog */}
                  <div className="absolute top-3 right-3 z-20">
                    <InfoTooltip 
                      title="Custom Food Entry"
                      description="Manually log food items with precise measurements and access our extensive database of nutritional information"
                      color="from-[#007AFF] to-[#5AC8FA]"
                    />
                  </div>
                
                  <CardContent className="p-6 flex flex-col items-center text-center relative z-10">
                    <motion.div 
                      className="h-14 w-14 rounded-full bg-gradient-to-br from-[#007AFF] to-[#5AC8FA] flex items-center justify-center mb-4"
                      animate={{ 
                        boxShadow: ["0px 0px 0px rgba(0, 122, 255, 0.4)", "0px 0px 20px rgba(0, 122, 255, 0.2)", "0px 0px 0px rgba(0, 122, 255, 0.4)"] 
                      }}
                      transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                    >
                      <FilePenLine className="h-7 w-7 text-white" />
                    </motion.div>
                    
                    <div className="text-center">
                      <h3 className="font-semibold text-base text-[#1C1C1E] dark:text-white mb-1">Manual Entry</h3>
                      <p className="text-[#8E8E93] text-sm">Log food details manually</p>
                    </div>
                  </CardContent>
              </Card>
              </motion.div>
            </Link>
          </div>
        )}
      </motion.div>

      {/* Today's Summary - Completely redesigned */}
    
 {/* Nutrition Overview - Apple Health Style */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3, type: "spring" }}
        className="mt-8 w-full"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="h-7 w-7 rounded-full bg-[#AF52DE] flex items-center justify-center">
            <BarChart2 className="h-4 w-4 text-white" />
          </div>
          <h2 className="text-lg font-semibold text-[#1C1C1E] dark:text-white">Nutrition Overview</h2>
        </div>
        
         {isDataLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
              <Skeleton key={`skel-summary-${i}`} className="h-32 rounded-xl bg-[#E5E5EA]/30" />
            ))}
          </div>
        ) : (
          <Card className="p-5 shadow-md border border-[#E5E5EA] dark:border-gray-800/20 rounded-xl overflow-hidden bg-gradient-to-br from-white to-gray-50/50 dark:from-black/30 dark:to-black/10 backdrop-blur">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* Calories */}
              <motion.div 
                className="flex flex-col justify-between"
                whileHover={{ y: -2, transition: { duration: 0.2 } }}
              >
                <div className="mb-2">
                  <span className="text-sm text-[#8E8E93]">Calories</span>
                  <h3 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#FF3B30] to-[#FF2D55]">
                    {Math.round(todayCalories)}
                  </h3>
                  <span className="text-xs text-[#8E8E93]">kcal</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-full bg-gradient-to-r from-[#FF3B30]/20 to-[#FF2D55]/10">
                    <Flame className="h-4 w-4 text-[#FF3B30]" />
                  </div>
                  <div className="h-1.5 flex-1 rounded-full overflow-hidden bg-[#E5E5EA] dark:bg-gray-800/50">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: goalCalories > 0 ? `${Math.min((todayCalories / goalCalories) * 100, 100)}%` : '10%' }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className={`h-full rounded-full bg-gradient-to-r from-[#FF3B30] to-[#FF2D55] ${todayCalories === 0 ? 'opacity-30' : ''}`}
                    />
                  </div>
                </div>
              </motion.div>
              
              {/* Carbs */}
              <motion.div 
                className="flex flex-col justify-between"
                whileHover={{ y: -2, transition: { duration: 0.2 } }}
              >
                <div className="mb-2">
                  <span className="text-sm text-[#8E8E93]">Carbs</span>
                  <h3 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#007AFF] to-[#5AC8FA]">
                    {Math.round(todayCarbs)}
                  </h3>
                  <span className="text-xs text-[#8E8E93]">grams</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-full bg-gradient-to-r from-[#007AFF]/20 to-[#5AC8FA]/10">
                    <Wheat className="h-4 w-4 text-[#007AFF]" />
                  </div>
                  <div className="h-1.5 flex-1 rounded-full overflow-hidden bg-[#E5E5EA] dark:bg-gray-800/50">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: todayCarbs > 0 ? '60%' : '10%' }}
                      transition={{ duration: 1, delay: 0.6 }}
                      className={`h-full rounded-full bg-gradient-to-r from-[#007AFF] to-[#5AC8FA] ${todayCarbs === 0 ? 'opacity-30' : ''}`}
                    />
                  </div>
                </div>
              </motion.div>
              
              {/* Protein */}
              <motion.div 
                className="flex flex-col justify-between"
                whileHover={{ y: -2, transition: { duration: 0.2 } }}
              >
                <div className="mb-2">
                  <span className="text-sm text-[#8E8E93]">Protein</span>
                  <h3 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#34C759] to-[#4CD964]">
                    {Math.round(todayProtein)}
                  </h3>
                  <span className="text-xs text-[#8E8E93]">grams</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-full bg-gradient-to-r from-[#34C759]/20 to-[#4CD964]/10">
                    <Drumstick className="h-4 w-4 text-[#34C759]" />
                  </div>
                  <div className="h-1.5 flex-1 rounded-full overflow-hidden bg-[#E5E5EA] dark:bg-gray-800/50">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: todayProtein > 0 ? '75%' : '10%' }}
                      transition={{ duration: 1, delay: 0.7 }}
                      className={`h-full rounded-full bg-gradient-to-r from-[#34C759] to-[#4CD964] ${todayProtein === 0 ? 'opacity-30' : ''}`}
                    />
                  </div>
                </div>
              </motion.div>
              
              {/* Fat */}
              <motion.div 
                className="flex flex-col justify-between"
                whileHover={{ y: -2, transition: { duration: 0.2 } }}
              >
                <div className="mb-2">
                  <span className="text-sm text-[#8E8E93]">Fat</span>
                  <h3 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#FF9500] to-[#FFCC00]">
                    {Math.round(todayFat)}
                  </h3>
                  <span className="text-xs text-[#8E8E93]">grams</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-full bg-gradient-to-r from-[#FF9500]/20 to-[#FFCC00]/10">
                    <Droplets className="h-4 w-4 text-[#FF9500]" />
                  </div>
                  <div className="h-1.5 flex-1 rounded-full overflow-hidden bg-[#E5E5EA] dark:bg-gray-800/50">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: todayFat > 0 ? '40%' : '10%' }}
                      transition={{ duration: 1, delay: 0.8 }}
                      className={`h-full rounded-full bg-gradient-to-r from-[#FF9500] to-[#FFCC00] ${todayFat === 0 ? 'opacity-30' : ''}`}
                    />
                  </div>
                </div>
              </motion.div>
            </div>
          </Card>
        )}
      </motion.div>
      {/* Meal Log - Apple Health Style */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4, type: "spring" }}
        className="mt-8 w-full"
      >
        <div className="flex items-center gap-3 mb-4">
          <motion.div 
            className="h-7 w-7 rounded-full bg-gradient-to-r from-[#FF9500] to-[#FFCC00] flex items-center justify-center"
            whileHover={{ scale: 1.1 }}
            animate={{ 
              boxShadow: ["0px 0px 0px rgba(255, 149, 0, 0)", "0px 0px 8px rgba(255, 149, 0, 0.4)", "0px 0px 0px rgba(255, 149, 0, 0)"]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Utensils className="h-4 w-4 text-white" />
          </motion.div>
          <h2 className="text-lg font-semibold text-[#1C1C1E] dark:text-white">Food Journal</h2>
          
          <div className="ml-auto">
            <Link href="/log-food/photo" passHref>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  variant="default" 
                  size="sm" 
                  className="text-sm bg-gradient-to-r from-[#FF9500] to-[#FFCC00] hover:opacity-90 text-white border-none shadow-sm hover:shadow-md px-4 rounded-full h-8"
                >
                  <PlusCircle className="h-3.5 w-3.5 mr-1.5" />
                  Add Meal
                </Button>
              </motion.div>
            </Link>
          </div>
        </div>
        
        {isLoadingLog ? (
          <div className="space-y-4">
            {[1, 2].map(i => (
              <Skeleton key={`skel-meal-${i}`} className="h-24 w-full rounded-xl bg-[#E5E5EA]/30" />
            ))}
          </div>
        ) : foodEntries.length > 0 ? (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {displayedFoodEntries.map((entry: LoggedFoodEntry) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 20, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ 
                    duration: 0.4, 
                    delay: 0.1,
                    type: "spring",
                    stiffness: 100
                  }}
                  layout
                  whileHover={{ 
                    y: -3,
                    boxShadow: "0 10px 30px -10px rgba(0,0,0,0.15)",
                    transition: { duration: 0.2 }
                  }}
                  className="group"
                >
                  <Card className="border border-[#E5E5EA] dark:border-gray-800/20 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden rounded-xl relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-white to-amber-50/20 dark:from-gray-900/80 dark:to-amber-900/10 z-0"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent to-amber-50/30 dark:to-amber-800/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"></div>
                    
                    <div className="relative z-10 p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 max-w-[85%]">
                          <motion.div 
                            className="w-12 h-12 bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-500/20 dark:to-amber-600/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
                            whileHover={{ scale: 1.05 }}
                            animate={{ 
                              boxShadow: ["0px 0px 0px rgba(245, 158, 11, 0)", "0px 0px 8px rgba(245, 158, 11, 0.3)", "0px 0px 0px rgba(245, 158, 11, 0)"]
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <Egg className="h-6 w-6 text-amber-500" />
                          </motion.div>
                          <div className="min-w-0">
                            <h3 className="text-xl font-semibold text-[#1C1C1E] dark:text-white truncate">
                              {entry.name}
                            </h3>
                            <div className="flex items-center gap-1 text-sm text-[#8E8E93] mt-1">
                              <Flame className="h-3.5 w-3.5 text-orange-500" />
                              <span className="font-medium text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">{Math.round(entry.calories)} kcal</span>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-[#8E8E93] hover:text-[#FF3B30] dark:hover:text-orange-400 rounded-full flex-shrink-0"
                          onClick={() => deleteFoodEntry(entry.id)}
                          aria-label="Menu options"
                        >
                          <Trash className="h-5 w-5" />
                        </Button>
                      </div>

                      <div className="mt-6 grid grid-cols-3 gap-4">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-lg font-semibold text-[#1C1C1E] dark:text-white">{Math.round(entry.protein)}g</span>
                          </div>
                          <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <motion.div 
                              className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(100, (entry.protein / 50) * 100)}%` }}
                              transition={{ duration: 0.8, delay: 0.2 }}
                            ></motion.div>
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">Protein</span>
                        </div>

                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-lg font-semibold text-[#1C1C1E] dark:text-white">{Math.round(entry.fat)}g</span>
                          </div>
                          <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <motion.div 
                              className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(100, (entry.fat / 50) * 100)}%` }}
                              transition={{ duration: 0.8, delay: 0.3 }}
                            ></motion.div>
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">Fats</span>
                        </div>

                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-lg font-semibold text-[#1C1C1E] dark:text-white">{Math.round(entry.carbs)}g</span>
                          </div>
                          <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <motion.div 
                              className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(100, (entry.carbs / 50) * 100)}%` }}
                              transition={{ duration: 0.8, delay: 0.4 }}
                            ></motion.div>
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">Carbs</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {foodEntries.length > 3 && (
              <div className="text-center mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowAllMeals(!showAllMeals)}
                  className="px-4 rounded-full border-[#E5E5EA] dark:border-gray-800 text-[#8E8E93] hover:bg-[#F2F2F7] dark:hover:bg-gray-900/20 shadow-sm text-sm h-8"
                  >
                    {showAllMeals ? "View Less" : "View More"}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <Card className="border border-[#E5E5EA] dark:border-gray-800/20 shadow-md rounded-xl overflow-hidden text-center py-8 px-6 relative bg-white dark:bg-black/20">
            {/* Gradient background effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-black/30 dark:to-black/10"></div>
            
            {/* Animated gradient ring */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full opacity-30">
              <motion.div 
                className="absolute inset-0 rounded-full bg-gradient-to-r from-[#FF9500] via-[#FFCC00] to-[#FF9500]"
                animate={{ 
                  rotate: [0, 360],
                  background: [
                    "linear-gradient(to right, #FF9500, #FFCC00, #FF9500)",
                    "linear-gradient(to right, #FFCC00, #FF9500, #FFCC00)",
                    "linear-gradient(to right, #FF9500, #FFCC00, #FF9500)"
                  ]
                }}
                transition={{ 
                  rotate: { duration: 10, repeat: Infinity, ease: "linear" },
                  background: { duration: 5, repeat: Infinity, ease: "linear" },
                }}
              />
            </div>
            
            <div className="relative z-10">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#FF9500] to-[#FFCC00] rounded-full flex items-center justify-center">
                <Camera className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-[#1C1C1E] dark:text-white">No meals logged yet</h3>
              <p className="text-[#8E8E93] mb-5 text-sm max-w-md mx-auto">
                Track what you eat to get insights about your nutrition for{" "}
                <span className="font-medium text-[#1C1C1E] dark:text-white">
                  {currentSelectedDate
                    ? isToday(currentSelectedDate)
                      ? "today"
                      : format(currentSelectedDate, "MMM d, yyyy")
                    : "the selected date"}
                </span>
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  variant="default" 
                  size="sm" 
                  className="bg-gradient-to-r from-[#FF9500] to-[#FFCC00] hover:opacity-90 text-white border-none hover:opacity-90 rounded-full px-4 shadow-md"
                  asChild
                >
                  <Link href="/log-food/photo">
                    <motion.span 
                      className="flex items-center gap-1.5"
                      initial={{ x: 0 }}
                      whileHover={{ x: 3 }}
                    >
                      Add Your First Meal
                      <ArrowRight className="h-4 w-4" />
                    </motion.span>
                  </Link>
                </Button>
              </motion.div>
            </div>
          </Card>
        )}
      </motion.div>

      {/* Health Blogs Section - Apple Health Style */}
      <motion.div 
        className="mt-10 w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5, type: "spring" }}
      >
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-3">
            <motion.div
              className="h-9 w-9 rounded-full bg-[#5AC8FA] flex items-center justify-center shadow-md"
              initial={{ rotate: -5 }}
              animate={{ rotate: 5 }}
              transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
            >
              <BookOpen className="h-5 w-5 text-white" />
            </motion.div>
            <h2 className="text-xl font-bold text-[#1C1C1E] dark:text-white">Health & Wellness</h2>
      </div>

          <Link href="/blog" passHref>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-sm font-medium text-[#007AFF] hover:text-[#007AFF]/90 hover:bg-[#007AFF]/5"
              >
                View All
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </motion.div>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence>
            {mockBlogData.slice(0, 2).map((blog, index) => (
              <motion.div
              key={blog.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.4, 
                  delay: 0.6 + (index * 0.1),
                  type: "spring"
                }}
                whileHover={{ y: -5 }}
              >
                <Link href={blog.readMoreLink} passHref>
                  <Card className="overflow-hidden shadow-lg border-[#E5E5EA] dark:border-none h-full group">
                    <div className="relative h-44 w-full overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10" />
                      <Image
                        src={blog.imageUrl}
                        alt={blog.title}
                        layout="fill"
                        objectFit="cover"
                        className="transition-transform duration-700 group-hover:scale-110"
                        data-ai-hint={blog.imageHint || "health fitness"}
                      />
                      
                      {/* Category label */}
                      <div className="absolute top-4 left-4 z-20">
                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-white/90 text-[#007AFF]">
                          {index % 2 === 0 ? "Nutrition" : "Fitness"}
                        </span>
        </div>
      </div>

                    <CardContent className="relative p-5 bg-white dark:bg-gray-900/50">
                      {/* Visual indicator */}
                      <motion.div 
                        className="h-1 w-16 bg-[#007AFF] rounded-full mb-3"
                        initial={{ width: 0 }}
                        animate={{ width: "4rem" }}
                        transition={{ duration: 0.5, delay: 0.8 + (index * 0.1) }}
                      />
                      
                      <h3 className="text-lg font-bold line-clamp-2 text-[#1C1C1E] dark:text-white group-hover:text-[#007AFF] transition-colors duration-200">
                        {blog.title}
                      </h3>
                      <p className="text-[#8E8E93] text-sm mt-2 line-clamp-2">
                        {blog.excerpt}
                      </p>
                      
                      <div className="flex justify-between items-center mt-4">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8 border-2 border-white">
                            <AvatarImage 
                              src={
                                typeof blog.author === 'object' && blog.author?.imageUrl 
                                  ? blog.author.imageUrl 
                                  : blog.authorImage || `https://placehold.co/200x200.png`
                              } 
                              alt={
                                typeof blog.author === 'object' && blog.author?.name
                                  ? blog.author.name
                                  : typeof blog.author === 'string' 
                                    ? blog.author 
                                    : "Author"
                              } 
                            />
                            <AvatarFallback className="bg-[#007AFF]/10 text-[#007AFF]">
                              {typeof blog.author === 'object' && blog.author?.name
                                ? blog.author.name.charAt(0)
                                : typeof blog.author === 'string'
                                  ? blog.author.charAt(0)
                                  : (index % 2 === 0 ? "EW" : "MC")}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-[#8E8E93]">
                            {typeof blog.author === 'object' && blog.author?.name
                              ? blog.author.name
                              : typeof blog.author === 'string'
                                ? blog.author
                                : (index % 2 === 0 ? "Dr. Emma Wilson" : "Coach Mike Chen")}
                          </span>
        </div>
                        
                        <motion.div 
                          className="h-8 w-8 rounded-full flex items-center justify-center bg-white group-hover:bg-sky-100 shadow-sm"
                          whileHover={{ scale: 1.1 }}
                        >
                          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-sky-500" />
                        </motion.div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        
        {/* Related reading list */}
        <div className="mt-6">
          <Card className="border-none shadow-lg overflow-hidden">
            <CardHeader className="p-5 pb-3 bg-gradient-to-r from-sky-50/90 to-cyan-50/90 dark:from-sky-950/10 dark:to-cyan-950/5 border-b border-sky-100/80 dark:border-sky-900/10">
              <CardTitle className="text-md flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-400"></span>
                More Reading
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 bg-gradient-to-br from-sky-50/60 to-cyan-50/60 dark:from-sky-950/5 dark:to-cyan-950/5">
              <div className="divide-y divide-sky-100/80 dark:divide-sky-900/10">
                {mockBlogData.slice(2).map((blog, index) => (
                  <Link href={blog.readMoreLink} key={blog.id}>
                    <motion.div 
                      className="flex items-center gap-4 p-4 hover:bg-sky-50/80 dark:hover:bg-sky-950/10 transition-colors duration-200"
                      whileHover={{ x: 5 }}
                    >
                      <div className="h-12 w-12 rounded-md overflow-hidden relative flex-shrink-0 shadow-sm">
                        <Image
                          src={blog.imageUrl}
                          alt={blog.title}
                          layout="fill"
                          objectFit="cover"
                          data-ai-hint={blog.imageHint}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate text-foreground">{blog.title}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{blog.excerpt}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-sky-400 flex-shrink-0" />
                    </motion.div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Smart Insights - Apple Health Style */}
      <motion.div 
        className="mt-10 w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6, type: "spring" }}
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="relative">
            <motion.div
              className="absolute -inset-1 rounded-full"
              animate={{ 
                boxShadow: [
                  "0 0 0 0 rgba(175, 82, 222, 0)",
                  "0 0 0 15px rgba(175, 82, 222, 0.1)",
                  "0 0 0 0 rgba(175, 82, 222, 0)"
                ]
              }}
              transition={{ duration: 2.5, repeat: Infinity }}
            />
            <motion.div
              className="h-9 w-9 rounded-full bg-gradient-to-r from-[#AF52DE] to-[#5856D6] flex items-center justify-center shadow-md relative z-10"
              animate={{ 
                rotate: [0, 5, 0, -5, 0]
              }}
              transition={{ duration: 5, repeat: Infinity }}
            >
              <Sparkles className="h-5 w-5 text-white" />
            </motion.div>
          </div>
          <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#AF52DE] to-[#5856D6] dark:from-[#AF52DE] dark:to-[#5856D6]">AI Nutrition Insights</h2>
        </div>
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          whileHover={{ y: -5, transition: { duration: 0.3 } }}
          className="pb-1 px-0.5"
        >
          <div className="relative">
            {/* Animated gradient border effect */}
            <motion.div 
              className="absolute -inset-1 rounded-xl blur-md"
              animate={{
                background: [
                  "linear-gradient(to right, rgba(175, 82, 222, 0.3), rgba(88, 86, 214, 0.3))",
                  "linear-gradient(to right, rgba(88, 86, 214, 0.3), rgba(175, 82, 222, 0.3))",
                  "linear-gradient(to right, rgba(175, 82, 222, 0.3), rgba(88, 86, 214, 0.3))"
                ]
              }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            />
            
            <div className="relative z-10">
              <SmartInsights 
                goals={goals}
                dailyLog={dailyLog}
                currentSelectedDate={currentSelectedDate}
                previousLogs={previousLogs}
                loading={isDataLoading || isPreviousLogsLoading}
              />
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Floating Action Button for quick add - Apple Health Style */}
      <AnimatePresence>
        {showFAB && (
          <motion.div 
            className="fixed bottom-20 right-6 z-50"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <Link href="/log-food/photo">
              <div className="relative group">
                {/* Animated gradient glow effect */}
                <motion.div 
                  className="absolute -inset-0.5 rounded-full opacity-75 group-hover:opacity-100 blur-md"
                  animate={{
                    background: [
                      "linear-gradient(to right, #FF3B30, #FF2D55)",
                      "linear-gradient(to right, #FF2D55, #FF3B30)",
                      "linear-gradient(to right, #FF3B30, #FF2D55)"
                    ]
                  }}
                  transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                />
                
                {/* Pulsing animation */}
                <motion.div
                  className="absolute -inset-4 rounded-full opacity-0"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0, 0.3, 0],
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  style={{
                    background: "radial-gradient(circle, rgba(255,59,48,0.5) 0%, rgba(255,59,48,0) 70%)"
                  }}
                />
                
                <motion.button 
                  className="h-14 w-14 rounded-full bg-gradient-to-r from-[#FF3B30] to-[#FF2D55] shadow-lg hover:shadow-xl hover:shadow-[#FF3B30]/20 border-none text-white relative flex items-center justify-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <PlusCircle className="h-6 w-6" />
                  <span className="sr-only">Add food</span>
                </motion.button>
              </div>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Update the background to match Apple Health style with subtle gradient */}
      <style jsx global>{`
        body {
          background: linear-gradient(to bottom right, #F2F2F7, #F9F9F9);
        }
        .dark body {
          background: linear-gradient(to bottom right, #000000, #0A0A0A);
        }
      `}</style>
    </div>
  );
}
