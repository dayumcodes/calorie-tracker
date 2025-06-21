"use client";

import { useState, useEffect, type FormEvent, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Save, User, Mail, ArrowLeft, UploadCloud, Scale, Ruler, Calendar } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import type { UserProfile } from "@/types";
import { motion, AnimatePresence } from "framer-motion";

const DEFAULT_USER_PROFILE: UserProfile = {
  name: "Alex Johnson",
  email: "alex.johnson@example.com",
  avatarUrl: "https://placehold.co/120x120.png",
};

// Create a reusable animated field component 
const AnimatedField: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = "" 
}) => {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0.95, y: 0 }}
      whileFocus={{ scale: 1.01 }}
      whileHover={{ y: -2 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
};

export default function EditProfilePage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState<number | undefined>(undefined);
  const [height, setHeight] = useState<number | undefined>(undefined);
  const [weight, setWeight] = useState<number | undefined>(undefined);
  
  // Unit state
  const [heightUnit, setHeightUnit] = useState<"cm" | "ft">("cm");
  const [weightUnit, setWeightUnit] = useState<"kg" | "lbs">("kg");
  
  // For feet-inches input
  const [feet, setFeet] = useState<number>(0);
  const [inches, setInches] = useState<number>(0);
  
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(DEFAULT_USER_PROFILE.avatarUrl);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const storedProfile = localStorage.getItem("userProfile");
    if (storedProfile) {
      try {
        const profile: UserProfile = JSON.parse(storedProfile);
        setName(profile.name);
        setEmail(profile.email || "");
        setAge(profile.age);
        setHeight(profile.height);
        setWeight(profile.weight);
        
        // Set stored units if available
        if (profile.heightUnit) setHeightUnit(profile.heightUnit);
        if (profile.weightUnit) setWeightUnit(profile.weightUnit);
        
        // Calculate feet and inches if height is in cm
        if (profile.height && profile.heightUnit === "ft") {
          const totalInches = profile.height;
          setFeet(Math.floor(totalInches / 12));
          setInches(Math.round(totalInches % 12));
        } else if (profile.height && heightUnit === "ft") {
          // Convert cm to feet/inches for display
          const totalInches = profile.height / 2.54;
          setFeet(Math.floor(totalInches / 12));
          setInches(Math.round(totalInches % 12));
        }
        
        setAvatarUrl(profile.avatarUrl || DEFAULT_USER_PROFILE.avatarUrl);
        setImagePreview(profile.avatarUrl || null);
      } catch (e) {
        console.error("Failed to parse user profile from localStorage", e);
        setName(DEFAULT_USER_PROFILE.name);
        setEmail(DEFAULT_USER_PROFILE.email);
        setAvatarUrl(DEFAULT_USER_PROFILE.avatarUrl);
        setImagePreview(DEFAULT_USER_PROFILE.avatarUrl || null);
      }
    } else {
      setName(DEFAULT_USER_PROFILE.name);
      setEmail(DEFAULT_USER_PROFILE.email);
      setAvatarUrl(DEFAULT_USER_PROFILE.avatarUrl);
      setImagePreview(DEFAULT_USER_PROFILE.avatarUrl || null);
    }
  }, []);

  // Convert height between units
  const toggleHeightUnit = () => {
    if (heightUnit === "cm" && height) {
      // Convert cm to inches (stored as total inches)
      const totalInches = Math.round(height / 2.54);
      setFeet(Math.floor(totalInches / 12));
      setInches(totalInches % 12);
      setHeight(totalInches);
      setHeightUnit("ft");
    } else if (heightUnit === "ft") {
      // Convert feet & inches to cm
      if (feet || inches) {
        const totalCm = Math.round((feet * 12 + inches) * 2.54);
        setHeight(totalCm);
      }
      setHeightUnit("cm");
    } else {
      // Just toggle unit if no value present
      setHeightUnit(heightUnit === "cm" ? "ft" : "cm");
    }
  };

  // Convert weight between units
  const toggleWeightUnit = () => {
    if (weightUnit === "kg" && weight) {
      // Convert kg to lbs
      setWeight(Math.round(weight * 2.20462));
      setWeightUnit("lbs");
    } else if (weightUnit === "lbs" && weight) {
      // Convert lbs to kg
      setWeight(Math.round(weight / 2.20462 * 10) / 10); // Round to 1 decimal place
      setWeightUnit("kg");
    } else {
      // Just toggle unit if no value present
      setWeightUnit(weightUnit === "kg" ? "lbs" : "kg");
    }
  };

  // Handle feet/inches changes and update height
  const handleFeetChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setFeet(value);
    setHeight((value * 12) + inches);
  };

  const handleInchesChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setInches(value);
    setHeight((feet * 12) + value);
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!name.trim()) {
      toast({
        title: "Validation Error",
        description: "Name cannot be empty.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    const updatedProfile: UserProfile = { 
      name, 
      email, 
      avatarUrl: imagePreview || avatarUrl, // Prefer new preview, fallback to old URL
      age,
      height,
      weight,
      heightUnit,
      weightUnit
    };
    localStorage.setItem("userProfile", JSON.stringify(updatedProfile));

    setTimeout(() => {
      toast({
        title: "Profile Updated!",
        description: "Your profile details have been saved.",
      });
      setIsLoading(false);
      router.push("/profile"); 
    }, 500);
  };

  return (
    <div className="container mx-auto max-w-xl py-8 px-4">
       <Button variant="ghost" onClick={() => router.back()} className="mb-4 group">
          <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Profile
        </Button>
      <Card className="shadow-xl rounded-xl overflow-hidden">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center">
            <User className="mr-2 h-6 w-6 text-primary" />
            Edit Your Profile
          </CardTitle>
          <CardDescription>
            Update your personal information and profile picture.
           
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
              >
                <Avatar className="h-32 w-32 border-4 border-muted shadow-md">
                  <AvatarImage src={imagePreview || DEFAULT_USER_PROFILE.avatarUrl} alt={name} data-ai-hint="user avatar" />
                  <AvatarFallback className="text-4xl">
                    {name?.charAt(0).toUpperCase() || "A"}
                  </AvatarFallback>
                </Avatar>
              </motion.div>
              <Label htmlFor="avatarUpload" className="cursor-pointer text-sm text-primary hover:underline flex items-center gap-2">
                <motion.div
                  whileHover={{ y: -2 }}
                  whileTap={{ y: 2 }}
                >
                  <UploadCloud className="h-4 w-4" />
                </motion.div>
                Change Profile Picture
              </Label>
              <Input
                id="avatarUpload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="sr-only" // Hidden, triggered by label
              />
            </div>

            <Separator />

            <div>
              <Label htmlFor="name" className="text-sm font-medium flex items-center">
                <User className="mr-2 h-4 w-4 text-muted-foreground" /> Full Name
              </Label>
              <AnimatedField>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1"
                  placeholder="e.g., Alex Johnson"
                  required
                />
              </AnimatedField>
            </div>
            <div>
              <Label htmlFor="email" className="text-sm font-medium flex items-center">
                <Mail className="mr-2 h-4 w-4 text-muted-foreground" /> Email Address
              </Label>
              <AnimatedField>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1"
                  placeholder="e.g., alex.johnson@example.com"
                />
              </AnimatedField>
            </div>
            <div>
              <Label htmlFor="age" className="text-sm font-medium flex items-center">
                <Calendar className="mr-2 h-4 w-4 text-muted-foreground" /> Age
              </Label>
              <AnimatedField>
                <Input
                  id="age"
                  type="number"
                  min="1"
                  max="120"
                  value={age || ""}
                  onChange={(e) => setAge(e.target.value ? Number(e.target.value) : undefined)}
                  className="mt-1"
                  placeholder="e.g., 25"
                />
              </AnimatedField>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="height" className="text-sm font-medium flex items-center">
                  <Ruler className="mr-2 h-4 w-4 text-muted-foreground" /> Height
                </Label>
                <div className="flex items-center bg-background border rounded-md overflow-hidden relative shadow-sm">
                  <motion.div 
                    className="absolute h-full bg-muted rounded-md z-0"
                    animate={{ 
                      left: heightUnit === "cm" ? 0 : "50%", 
                      width: "50%" 
                    }}
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                  <Button 
                    type="button"
                    variant="ghost"
                    size="sm"
                    className={`h-8 px-3 text-xs rounded-none z-10 transition-colors ${heightUnit === "cm" ? "font-medium text-primary" : "text-muted-foreground"}`}
                    onClick={() => {
                      if (heightUnit !== "cm") toggleHeightUnit();
                    }}
                  >
                    cm
                  </Button>
                  <div className="h-8 border-r border-border/30"></div>
                  <Button 
                    type="button"
                    variant="ghost"
                    size="sm"
                    className={`h-8 px-3 text-xs rounded-none z-10 transition-colors ${heightUnit === "ft" ? "font-medium text-primary" : "text-muted-foreground"}`}
                    onClick={() => {
                      if (heightUnit !== "ft") toggleHeightUnit();
                    }}
                  >
                    ft-in
                  </Button>
                </div>
              </div>
              
              <AnimatePresence mode="wait">
                {heightUnit === "cm" ? (
                  <motion.div
                    key="cm-height"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Input
                      id="height"
                      type="number"
                      min="50"
                      max="300"
                      value={height || ""}
                      onChange={(e) => setHeight(e.target.value ? Number(e.target.value) : undefined)}
                      className="mt-1"
                      placeholder="e.g., 170"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Height in centimeters</p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="ft-height"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="feet" className="text-xs">Feet</Label>
                        <Input
                          id="feet"
                          type="number"
                          min="0"
                          max="9"
                          value={feet || ""}
                          onChange={handleFeetChange}
                          className="mt-1"
                          placeholder="ft"
                        />
                      </div>
                      <div>
                        <Label htmlFor="inches" className="text-xs">Inches</Label>
                        <Input
                          id="inches"
                          type="number"
                          min="0"
                          max="11"
                          value={inches || ""}
                          onChange={handleInchesChange}
                          className="mt-1"
                          placeholder="in"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Height in feet and inches</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="weight" className="text-sm font-medium flex items-center">
                  <Scale className="mr-2 h-4 w-4 text-muted-foreground" /> Weight
                </Label>
                <div className="flex items-center bg-background border rounded-md overflow-hidden relative shadow-sm">
                  <motion.div 
                    className="absolute h-full bg-muted rounded-md z-0"
                    animate={{ 
                      left: weightUnit === "kg" ? 0 : "50%", 
                      width: "50%" 
                    }}
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                  <Button 
                    type="button"
                    variant="ghost"
                    size="sm"
                    className={`h-8 px-3 text-xs rounded-none z-10 transition-colors ${weightUnit === "kg" ? "font-medium text-primary" : "text-muted-foreground"}`}
                    onClick={() => {
                      if (weightUnit !== "kg") toggleWeightUnit();
                    }}
                  >
                    kg
                  </Button>
                  <div className="h-8 border-r border-border/30"></div>
                  <Button 
                    type="button"
                    variant="ghost"
                    size="sm"
                    className={`h-8 px-3 text-xs rounded-none z-10 transition-colors ${weightUnit === "lbs" ? "font-medium text-primary" : "text-muted-foreground"}`}
                    onClick={() => {
                      if (weightUnit !== "lbs") toggleWeightUnit();
                    }}
                  >
                    lbs
                  </Button>
                </div>
              </div>
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={`weight-${weightUnit}`}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Input
                    id="weight"
                    type="number"
                    min="1"
                    max={weightUnit === "kg" ? "500" : "1100"}
                    step="0.1"
                    value={weight || ""}
                    onChange={(e) => setWeight(e.target.value ? Number(e.target.value) : undefined)}
                    className="mt-1"
                    placeholder={weightUnit === "kg" ? "e.g., 65.5" : "e.g., 145"}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Weight in {weightUnit === "kg" ? "kilograms" : "pounds"} 
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          </CardContent>
          <CardFooter>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                {isLoading ? (
                  <Save className="mr-2 h-4 w-4 animate-pulse" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Changes
              </Button>
            </motion.div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
