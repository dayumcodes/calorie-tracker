"use client";

import { useState, useEffect, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useNotificationService } from "@/lib/notification-service";
import { 
  BellRing, Save, CheckCircle, Clock, Droplets, Scale, 
  CalendarCheck, RefreshCw, BellDot, Bell, BellOff, 
  Sparkles, AlarmCheck, Calendar, Smartphone, Globe
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ReminderSettings {
  logMeals: boolean;
  logMealsTime: string;
  drinkWater: boolean;
  drinkWaterFrequency: string; // e.g., "every_2_hours"
  weighIn: boolean;
  weighInDay: string; // e.g., "monday"
  weighInTime: string;
}

const initialSettings: ReminderSettings = {
  logMeals: true,
  logMealsTime: "19:00",
  drinkWater: false,
  drinkWaterFrequency: "every_2_hours",
  weighIn: false,
  weighInDay: "monday",
  weighInTime: "08:00",
};

// For rendering time in a more human-readable format
const formatTime = (time: string) => {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

// For rendering day of week with proper capitalization
const formatDay = (day: string) => {
  return day.charAt(0).toUpperCase() + day.slice(1);
};

// For rendering frequency in a more human-readable format
const formatFrequency = (frequency: string) => {
  switch (frequency) {
    case 'every_hour':
      return 'Every hour';
    case 'every_2_hours':
      return 'Every 2 hours';
    case 'every_3_hours':
      return 'Every 3 hours';
    default:
      return frequency;
  }
};

export default function RemindersPage() {
  const [settings, setSettings] = useState<ReminderSettings>(initialSettings);
  const [isLoading, setIsLoading] = useState(false);
  const [savedSettings, setSavedSettings] = useState<ReminderSettings | null>(null);
  const [activeReminder, setActiveReminder] = useState<keyof ReminderSettings | null>(null);
  const [notificationStatus, setNotificationStatus] = useState<'idle' | 'requesting' | 'granted' | 'denied'>('idle');
  const { toast } = useToast();
  const { 
    initializeNotifications, 
    subscribeToNotifications, 
    unsubscribeFromNotifications, 
    showTestNotification,
    isSupported,
    subscription 
  } = useNotificationService();

  // Load settings from localStorage
  useEffect(() => {
    const storedSettings = localStorage.getItem("reminderSettings");
    if (storedSettings) {
      const parsedSettings = JSON.parse(storedSettings);
      setSettings(parsedSettings);
      setSavedSettings(parsedSettings);
    }
  }, []);

  // Initialize notifications on component mount
  useEffect(() => {
    if (isSupported) {
      initializeNotifications();
    }
  }, [isSupported, initializeNotifications]);

  const handleSwitchChange = (checked: boolean, name: keyof ReminderSettings) => {
    setSettings((prev) => ({ ...prev, [name]: checked }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };
  
  const handleSelectChange = (value: string, name: keyof ReminderSettings) => {
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Save settings to localStorage
      localStorage.setItem("reminderSettings", JSON.stringify(settings));
      setSavedSettings(settings);
      
      // Initialize notifications if supported
      if (isSupported) {
        await initializeNotifications();
      }
      
      toast({
        title: "Reminders Updated!",
        description: "Your reminder preferences have been saved and notifications are now active.",
        variant: "default",
        action: <CheckCircle className="text-green-500" />,
      });
    } catch (error) {
      console.error('Error saving reminder settings:', error);
      toast({
        title: "Error",
        description: "Failed to save reminder settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnableNotifications = async () => {
    setNotificationStatus('requesting');
    
    try {
      const subscription = await subscribeToNotifications();
      if (subscription) {
        setNotificationStatus('granted');
        toast({
          title: "Notifications Enabled!",
          description: "You'll now receive push notifications for your reminders.",
          variant: "default",
        });
      } else {
        setNotificationStatus('denied');
        toast({
          title: "Permission Denied",
          description: "Please enable notifications in your browser settings to receive reminders.",
          variant: "destructive",
        });
      }
    } catch (error) {
      setNotificationStatus('denied');
      toast({
        title: "Error",
        description: "Failed to enable notifications. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDisableNotifications = async () => {
    try {
      await unsubscribeFromNotifications();
      setNotificationStatus('idle');
      toast({
        title: "Notifications Disabled",
        description: "Push notifications have been disabled.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to disable notifications. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleTestNotification = async () => {
    try {
      await showTestNotification();
      toast({
        title: "Test Notification Sent!",
        description: "Check if you received the notification.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send test notification. Please try again.",
        variant: "destructive",
      });
    }
  };

  const resetToDefaults = () => {
    setSettings(initialSettings);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto"
      >
        <motion.div 
          className="mb-8 text-center"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="inline-flex items-center justify-center mb-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.7, delay: 0.5, type: "spring" }}
              className="relative"
            >
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl" />
              <div className="bg-primary/10 p-3.5 rounded-full relative">
                <BellRing className="h-8 w-8 text-primary" />
              </div>
            </motion.div>
          </div>
          <h1 className="text-3xl font-bold mb-2">Smart Reminders</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Set up personalized notifications to help you stay on track with your health and nutrition goals.
          </p>
        </motion.div>

        {/* Notification Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-primary/20">
                    {isSupported ? <Smartphone className="h-5 w-5 text-primary" /> : <Globe className="h-5 w-5 text-primary" />}
                  </div>
                  <div>
                    <h3 className="font-medium">Notification Status</h3>
                    <p className="text-sm text-muted-foreground">
                      {isSupported 
                        ? subscription 
                          ? "Push notifications enabled" 
                          : "Local notifications only"
                        : "Notifications not supported in this browser"
                      }
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {isSupported && (
                    <Button
                      size="sm"
                      onClick={handleEnableNotifications}
                      disabled={!!subscription || notificationStatus === 'requesting'}
                      variant={subscription ? 'default' : 'outline'}
                    >
                      {subscription ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                          Notifications Enabled
                        </>
                      ) : notificationStatus === 'requesting' ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Enabling...
                        </>
                      ) : (
                        <>
                          <Bell className="h-4 w-4 mr-2" />
                          Enable Notifications
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <Card className="overflow-hidden border border-border/40 shadow-lg bg-gradient-to-b from-background to-muted/10">
          <CardHeader className="border-b border-border/10 pb-4">
            <CardTitle className="text-xl font-semibold text-center relative">
              <motion.div
                className="absolute -top-4 right-0 text-primary/20"
                initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ delay: 1, duration: 0.5 }}
              >
                <Sparkles className="h-8 w-8" />
              </motion.div>
              Smart Notification Center
          </CardTitle>
            <CardDescription className="text-center">
              Customize your reminders to support your healthy habits
          </CardDescription>
        </CardHeader>
          
          <CardContent className="py-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Evening Meal Reminder */}
              <motion.div 
                className={`p-5 rounded-xl border ${settings.logMeals ? 'border-primary/30 bg-primary/5' : 'border-border/50 bg-background/80'} relative overflow-hidden transition-colors duration-300`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                whileHover={{ y: -2 }}
                onFocus={() => setActiveReminder('logMeals')}
                onBlur={() => setActiveReminder(null)}
              >
                {/* Animated background pattern */}
                {settings.logMeals && (
                  <motion.div 
                    className="absolute inset-0 opacity-10 pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <svg width="100%" height="100%" className="absolute inset-0">
                      <pattern id="pattern-circles" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse" patternContentUnits="userSpaceOnUse">
                        <circle id="pattern-circle" cx="10" cy="10" r="1.6257413380501518" fill="none" stroke="currentColor" strokeWidth="1"></circle>
                      </pattern>
                      <rect id="rect" x="0" y="0" width="100%" height="100%" fill="url(#pattern-circles)"></rect>
                    </svg>
                  </motion.div>
                )}
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2.5 rounded-lg ${settings.logMeals ? 'bg-primary/20 text-primary' : 'bg-muted/80'}`}>
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-medium">Evening Meal Reminder</h3>
                      <p className="text-sm text-muted-foreground">Reminds you to log your dinner</p>
                    </div>
                  </div>
                  
                <Switch
                  checked={settings.logMeals}
                  onCheckedChange={(checked) => handleSwitchChange(checked, "logMeals")}
                    className="data-[state=checked]:bg-primary"
                />
              </div>
                
                <AnimatePresence>
              {settings.logMeals && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-3 border-t border-border/30">
                        <Label htmlFor="logMealsTime" className="text-sm font-medium mb-2 flex items-center">
                          <Clock className="h-3.5 w-3.5 mr-1.5 text-primary/70" /> Reminder Time
                        </Label>
                        <div className="mt-1 relative">
                  <Input
                    id="logMealsTime"
                    name="logMealsTime"
                    type="time"
                    value={settings.logMealsTime}
                    onChange={handleInputChange}
                            className={`pr-16 ${activeReminder === 'logMeals' ? 'border-primary/50 ring-1 ring-primary/20' : ''}`}
                          />
                          
                          <Badge className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                            {formatTime(settings.logMealsTime)}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center mt-3 text-xs text-muted-foreground">
                          <BellDot className="h-3 w-3 mr-1.5" />
                          <span>We'll notify you every day at this time</span>
                        </div>
                </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
              
              {/* Drink Water Reminder */}
              <motion.div 
                className={`p-5 rounded-xl border ${settings.drinkWater ? 'border-primary/30 bg-primary/5' : 'border-border/50 bg-background/80'} relative overflow-hidden transition-colors duration-300`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                whileHover={{ y: -2 }}
                onFocus={() => setActiveReminder('drinkWater')}
                onBlur={() => setActiveReminder(null)}
              >
                {settings.drinkWater && (
                  <motion.div 
                    className="absolute inset-0 opacity-10 pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ 
                      opacity: [0.05, 0.1, 0.05],
                      y: [0, 5, 0]
                    }}
                    transition={{ 
                      repeat: Infinity,
                      duration: 3
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" className="absolute inset-0">
                      <pattern id="water-pattern" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M0 10 Q5 5, 10 10 T20 10" fill="none" stroke="currentColor" strokeWidth="1" />
                      </pattern>
                      <rect width="100%" height="100%" fill="url(#water-pattern)" />
                    </svg>
                  </motion.div>
                )}
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2.5 rounded-lg ${settings.drinkWater ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-500' : 'bg-muted/80'}`}>
                      <Droplets className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-medium">Hydration Reminders</h3>
                      <p className="text-sm text-muted-foreground">Regular water drinking notifications</p>
                    </div>
            </div>

                <Switch
                  checked={settings.drinkWater}
                  onCheckedChange={(checked) => handleSwitchChange(checked, "drinkWater")}
                    className="data-[state=checked]:bg-blue-500"
                />
              </div>
                
                <AnimatePresence>
              {settings.drinkWater && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-3 border-t border-border/30">
                        <Label htmlFor="drinkWaterFrequency" className="text-sm font-medium mb-2 flex items-center">
                          <Bell className="h-3.5 w-3.5 mr-1.5 text-blue-500/70" /> Reminder Frequency
                        </Label>
                        <div className="mt-1 relative">
                          <Select 
                            name="drinkWaterFrequency" 
                            value={settings.drinkWaterFrequency} 
                            onValueChange={(value) => handleSelectChange(value, "drinkWaterFrequency")}
                          >
                            <SelectTrigger className={`${activeReminder === 'drinkWater' ? 'border-blue-500/50 ring-1 ring-blue-500/20' : ''}`}>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="every_hour">Every Hour</SelectItem>
                      <SelectItem value="every_2_hours">Every 2 Hours</SelectItem>
                      <SelectItem value="every_3_hours">Every 3 Hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                        
                        <div className="flex items-center mt-3 text-xs text-muted-foreground">
                          <Droplets className="h-3 w-3 mr-1.5" />
                          <span>We'll remind you to stay hydrated during waking hours</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
              
              {/* Weekly Weigh-In Reminder */}
              <motion.div 
                className={`p-5 rounded-xl border ${settings.weighIn ? 'border-primary/30 bg-primary/5' : 'border-border/50 bg-background/80'} relative overflow-hidden transition-colors duration-300`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                whileHover={{ y: -2 }}
                onFocus={() => setActiveReminder('weighIn')}
                onBlur={() => setActiveReminder(null)}
              >
                {settings.weighIn && (
                  <motion.div 
                    className="absolute inset-0 opacity-10 pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.1 }}
                  >
                    <svg width="100%" height="100%" className="absolute inset-0">
                      <pattern id="grid-pattern" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" />
                      </pattern>
                      <rect width="100%" height="100%" fill="url(#grid-pattern)" />
                    </svg>
                  </motion.div>
                )}
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2.5 rounded-lg ${settings.weighIn ? 'bg-green-100 dark:bg-green-900/30 text-green-500' : 'bg-muted/80'}`}>
                      <Scale className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-medium">Weekly Weigh-In</h3>
                      <p className="text-sm text-muted-foreground">Track your progress consistently</p>
                    </div>
            </div>

                <Switch
                  checked={settings.weighIn}
                  onCheckedChange={(checked) => handleSwitchChange(checked, "weighIn")}
                    className="data-[state=checked]:bg-green-500"
                />
              </div>
                
                <AnimatePresence>
              {settings.weighIn && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-3 border-t border-border/30">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                            <Label htmlFor="weighInDay" className="text-sm font-medium mb-2 flex items-center">
                              <Calendar className="h-3.5 w-3.5 mr-1.5 text-green-500/70" /> Day of Week
                            </Label>
                            <div className="mt-1 relative">
                              <Select 
                                name="weighInDay" 
                                value={settings.weighInDay} 
                                onValueChange={(value) => handleSelectChange(value, "weighInDay")}
                              >
                                <SelectTrigger className={`${activeReminder === 'weighIn' ? 'border-green-500/50 ring-1 ring-green-500/20' : ''}`}>
                        <SelectValue placeholder="Select day" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monday">Monday</SelectItem>
                        <SelectItem value="tuesday">Tuesday</SelectItem>
                        <SelectItem value="wednesday">Wednesday</SelectItem>
                        <SelectItem value="thursday">Thursday</SelectItem>
                        <SelectItem value="friday">Friday</SelectItem>
                        <SelectItem value="saturday">Saturday</SelectItem>
                        <SelectItem value="sunday">Sunday</SelectItem>
                      </SelectContent>
                    </Select>
                            </div>
                  </div>
                  <div>
                            <Label htmlFor="weighInTime" className="text-sm font-medium mb-2 flex items-center">
                              <Clock className="h-3.5 w-3.5 mr-1.5 text-green-500/70" /> Time
                            </Label>
                            <div className="mt-1 relative">
                    <Input
                      id="weighInTime"
                      name="weighInTime"
                      type="time"
                      value={settings.weighInTime}
                      onChange={handleInputChange}
                                className={`pr-16 ${activeReminder === 'weighIn' ? 'border-green-500/50 ring-1 ring-green-500/20' : ''}`}
                              />
                              
                              <Badge className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none bg-green-100 dark:bg-green-900/30 text-green-500 border-green-200 dark:border-green-800 hover:bg-green-200 dark:hover:bg-green-900/40">
                                {formatTime(settings.weighInTime)}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center mt-3 text-xs text-muted-foreground">
                          <AlarmCheck className="h-3 w-3 mr-1.5" />
                          <span>You'll be reminded every {formatDay(settings.weighInDay)} at {formatTime(settings.weighInTime)}</span>
                  </div>
                </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
              
              <div className="flex justify-between pt-4 border-t border-border/30">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={resetToDefaults}
                  className="group"
                >
                  <RefreshCw className="h-3.5 w-3.5 mr-1.5 group-hover:rotate-180 transition-transform duration-500" />
                  Reset
                </Button>
                
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="relative overflow-hidden group"
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="mr-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </motion.div>
                  ) : (
                    <Save className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                  )}
                  <span>{isLoading ? 'Saving...' : 'Save Reminders'}</span>
                  
                  <motion.div
                    className="absolute inset-0 bg-primary/10"
                    initial={{ x: '-100%' }}
                    animate={{ 
                      x: isLoading ? '0%' : '-100%' 
                    }}
                    transition={{ duration: 0.8 }}
                  />
                </Button>
            </div>
            </form>
          </CardContent>
      </Card>
      </motion.div>
    </div>
  );
}
