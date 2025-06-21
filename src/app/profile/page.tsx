"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  UserCircle2, 
  HeartPulse,
  Bell,
  Settings,
  LogOut,
  ChevronRight,
  Pencil,
  Calendar,
  User,
  Info,
  ArrowRight,
  RefreshCw,
  Shield,
  Camera,
  FileText,
  Apple,
  Plus,
  Eye,
  Scale,
  Ruler,
  Mail
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserProfile } from "@/hooks/use-user-profile";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ListItemProps {
  href?: string;
  icon: React.ElementType;
  iconColorClass: string;
  text: string;
  subtext?: string;
  isLink?: boolean;
  onClick?: () => void;
  isDestructive?: boolean;
}

const ListItem: React.FC<ListItemProps> = ({ 
  href, 
  icon: Icon, 
  iconColorClass, 
  text, 
  subtext, 
  isLink = true, 
  onClick, 
  isDestructive = false 
}) => {
  const itemContent = (
    <div className={cn(
      "flex items-center justify-between p-4 rounded-xl transition-all duration-200",
      isDestructive 
        ? "hover:bg-destructive/10 group" 
        : "hover:bg-primary/5 hover:shadow-sm group"
    )}>
      <div className="flex items-center gap-3">
        <div className={cn(
          "p-2.5 rounded-full transition-colors duration-200",
          `${iconColorClass}/10 group-hover:${iconColorClass}/20`
        )}>
          <Icon className={cn(
            "h-5 w-5", 
            isDestructive ? "text-destructive" : `text-${iconColorClass}`
          )} />
        </div>
        <div>
          <div className={cn(
            "font-medium",
            isDestructive && "text-destructive"
          )}>
            {text}
          </div>
          {subtext && (
            <div className="text-xs text-muted-foreground mt-0.5">{subtext}</div>
          )}
        </div>
      </div>
      <div className={cn(
        "h-8 w-8 rounded-full flex items-center justify-center transition-colors duration-200",
        isDestructive 
          ? "text-destructive group-hover:bg-destructive/10" 
          : "text-muted-foreground group-hover:bg-primary/10"
      )}>
        {isDestructive ? (
          <LogOut className="h-4 w-4" />
        ) : (
          <ArrowRight className="h-4 w-4" />
        )}
      </div>
    </div>
  );

  if (isLink && href) {
    return (
      <Link href={href} className="block">
        {itemContent}
      </Link>
    );
  }
  
  return (
    <button className="w-full text-left" onClick={onClick}>
      {itemContent}
    </button>
  );
};

export default function ProfilePage() {
  const { userProfile, isLoading, updateUserProfile } = useUserProfile();
  const { toast } = useToast();
  const [avatarHover, setAvatarHover] = useState(false);
  
  const handleLogout = () => {
    toast({
      title: "Coming Soon",
      description: "Logout functionality is not yet implemented.",
    });
  };
  
  const handleAppSettings = () => {
    toast({
      title: "Coming Soon",
      description: "App Settings page is not yet implemented.",
    });
  };

  // Get gender label with proper capitalization
  const getGenderLabel = (gender?: string) => {
    if (!gender) return "Not specified";
    return gender.charAt(0).toUpperCase() + gender.slice(1);
  };

  // Format height in feet-inches when the unit is feet
  const formatHeight = (height?: number, unit?: string) => {
    if (!height) return "";
    
    if (unit === "ft") {
      const feet = Math.floor(height / 12);
      const inches = Math.round(height % 12);
      return `${feet}'${inches}"`;
    }
    
    return `${height} ${unit || "cm"}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Profile Header Card */}
        <Card className="border-0 shadow-xl bg-gradient-to-r from-primary/90 via-primary to-primary/80 mb-6 text-primary-foreground overflow-hidden rounded-xl">
          <CardContent className="p-0 relative">
            {/* Modern Background Pattern */}
            <div className="absolute top-0 left-0 right-0 bottom-0 opacity-15 pointer-events-none">
              <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="wave-pattern" x="0" y="0" width="150" height="150" patternUnits="userSpaceOnUse">
                    <path d="M0,75 C30,52 45,98 75,75 C105,52 120,98 150,75 C180,52 195,98 225,75 C255,52 270,98 300,75" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="1" />
                    <path d="M0,112 C30,90 45,135 75,112 C105,90 120,135 150,112 C180,90 195,135 225,112 C255,90 270,135 300,112" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="1" />
                    <path d="M0,37 C30,15 45,60 75,37 C105,15 120,60 150,37 C180,15 195,60 225,37 C255,15 270,60 300,37" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="1" />
                  </pattern>
                </defs>
                <rect x="0" y="0" width="100%" height="100%" fill="url(#wave-pattern)" />
              </svg>
            </div>
            
            {/* Glowing Accent */}
            <div className="absolute -top-16 -right-16 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-16 -left-16 w-28 h-28 bg-white/10 rounded-full blur-2xl"></div>
            
            {/* Content Container with Padding */}
            <div className="p-5 relative z-10">
              {/* Header Top Section with Stats */}
              <div className="flex flex-wrap gap-2 mb-3 justify-end">
                {!isLoading && (
                  <>
                    {userProfile.weight && (
                      <Badge variant="outline" className="bg-white/10 text-white border-white/20 font-medium py-1 px-2">
                        <Scale className="h-3 w-3 mr-1 opacity-80" />
                        {userProfile.weight} {userProfile.weightUnit || "kg"}
                      </Badge>
                    )}
                    {userProfile.height && (
                      <Badge variant="outline" className="bg-white/10 text-white border-white/20 font-medium py-1 px-2">
                        <Ruler className="h-3 w-3 mr-1 opacity-80" />
                        {formatHeight(userProfile.height, userProfile.heightUnit)}
                      </Badge>
                    )}
                    {userProfile.age && (
                      <Badge variant="outline" className="bg-white/10 text-white border-white/20 font-medium py-1 px-2">
                        <Calendar className="h-3 w-3 mr-1 opacity-80" />
                        {userProfile.age} years
                      </Badge>
                    )}
                  </>
                )}
              </div>
              
              {/* Main Profile Content */}
              <div className="flex flex-col md:flex-row items-center md:items-start gap-5 relative">
                {isLoading ? (
                  <Skeleton className="h-24 w-24 rounded-full" />
                ) : (
                  <motion.div 
                    className="relative"
                    onHoverStart={() => setAvatarHover(true)}
                    onHoverEnd={() => setAvatarHover(false)}
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="relative">
                      <div className="absolute -inset-1.5 bg-white/20 rounded-full blur-md"></div>
                      <Avatar className="h-24 w-24 border-4 border-white/30 shadow-2xl relative">
                        <AvatarImage 
                          src={userProfile.avatarUrl} 
                          alt={userProfile.name || "User"} 
                          className="object-cover"
                        />
                        <AvatarFallback className="text-2xl bg-primary-foreground/10 text-white">
                          {userProfile.name?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      
                      <AnimatePresence>
                        {avatarHover && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center"
                          >
                            <Camera className="h-7 w-7 text-white" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                      
                      <Link href="/profile/edit" passHref>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="absolute bottom-0 right-0 rounded-full h-8 w-8 shadow-lg bg-white/90 hover:bg-white text-primary"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </motion.div>
                )}
                
                <div className="flex flex-col items-center md:items-start space-y-2 flex-1">
                  {isLoading ? (
                    <>
                      <Skeleton className="h-7 w-40" />
                      <Skeleton className="h-4 w-32" />
                    </>
                  ) : (
                    <>
                      <h1 className="text-2xl font-bold tracking-tight">{userProfile.name || "Guest User"}</h1>
                      
                      <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                        {userProfile.gender && (
                          <Badge variant="secondary" className="font-normal py-0.5 bg-white/20 hover:bg-white/30 border-transparent text-white">
                            <User className="h-3 w-3 mr-1 opacity-80" />
                            {getGenderLabel(userProfile.gender)}
                          </Badge>
                        )}
                        
                        {userProfile.email && (
                          <Badge variant="secondary" className="font-normal py-0.5 bg-white/20 hover:bg-white/30 border-transparent text-white max-w-[220px] truncate">
                            <Mail className="h-3 w-3 mr-1 opacity-80" />
                            {userProfile.email}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex gap-2 mt-1">
                        <Link href="/profile/edit">
                          <Button size="sm" variant="secondary" className="h-8 px-3 bg-white text-primary hover:bg-white/90 shadow-md">
                            Edit Profile
                          </Button>
                        </Link>
                        <Button size="sm" variant="outline" className="h-8 px-3 bg-transparent border-white/30 text-white hover:bg-white/10 hover:border-white/50">
                          Share
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Settings Section */}
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Settings className="h-5 w-5 mr-2 text-primary" />
          Settings & Preferences
        </h2>
        
        <Card className="border-border/40 shadow-md">
          <CardContent className="p-3">
            <ListItem 
              href="/goals" 
              icon={HeartPulse} 
              iconColorClass="text-red-500" 
              text="Nutrition Goals" 
              subtext="Set and manage your daily nutrition targets"
            />
            
            <Separator className="my-1" />
            
            <ListItem 
              href="/reminders" 
              icon={Bell} 
              iconColorClass="text-amber-500" 
              text="Reminders & Notifications" 
              subtext="Configure when and how you're notified"
            />
            
            <Separator className="my-1" />
            
            <ListItem 
              href="/privacy"
              icon={Shield} 
              iconColorClass="text-emerald-500" 
              text="Privacy & Security" 
              subtext="Manage your data and privacy preferences"
              isLink={true}
            />
            
            <Separator className="my-1" />
            
            <ListItem 
              href="/terms"
              icon={FileText} 
              iconColorClass="text-purple-500" 
              text="Terms of Service" 
              subtext="Read our terms and conditions"
              isLink={true}
            />
            
            <Separator className="my-1" />
            
            <ListItem 
              href="/about"
              icon={Info} 
              iconColorClass="text-blue-500" 
              text="About & Help" 
              subtext="App information and support"
              isLink={true}
            />
            
            <Separator className="my-1" />
            
            <ListItem 
              icon={LogOut} 
              iconColorClass="text-destructive" 
              text="Log Out" 
              subtext="Sign out of your account"
              isLink={false}
              onClick={handleLogout}
              isDestructive={true}
            />
          </CardContent>
        </Card>
        
       

        {/* Saved Diet Charts Section */}
        <Card className="mt-6">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Apple className="h-5 w-5 text-primary" />
                <CardTitle className="text-xl">Saved Diet Charts</CardTitle>
              </div>
              <Link href="/diet-chart">
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Diet Chart
                </Button>
              </Link>
            </div>
            <CardDescription>
              Your saved diet plans and nutrition charts
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : userProfile.savedDietCharts && userProfile.savedDietCharts.length > 0 ? (
              <div className="space-y-3">
                {userProfile.savedDietCharts.map((chart) => (
                  <div 
                    key={chart.id} 
                    className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-base">{chart.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Created on {formatDate(chart.createdAt)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/diet-chart?id=${chart.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                    
                    {chart.dietChart.macroBreakdown && (
                      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                        <div className="p-1 bg-primary/10 rounded">
                          <div className="text-xs text-muted-foreground">Protein</div>
                          <div className="font-medium">{chart.dietChart.macroBreakdown.protein}g</div>
                        </div>
                        <div className="p-1 bg-primary/10 rounded">
                          <div className="text-xs text-muted-foreground">Carbs</div>
                          <div className="font-medium">{chart.dietChart.macroBreakdown.carbs}g</div>
                        </div>
                        <div className="p-1 bg-primary/10 rounded">
                          <div className="text-xs text-muted-foreground">Fats</div>
                          <div className="font-medium">{chart.dietChart.macroBreakdown.fats}g</div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="bg-primary/5 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
                  <Apple className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-medium text-lg mb-2">No Saved Diet Charts</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  You haven't saved any diet charts yet.
                </p>
                <Link href="/diet-chart">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Diet Chart
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
         {/* App Version */}
         <div className="mt-8 text-center text-xs text-muted-foreground">
          <p>Calorie Tracker v1.0.0</p>
          <p className="mt-1">© 2025 All Rights Reserved</p>
        </div>
      </motion.div>
    </div>
  );
}
