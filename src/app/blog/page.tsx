"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, ArrowRight, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { mockBlogData } from "@/app/page";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function BlogPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPosts, setFilteredPosts] = useState(mockBlogData);
  const [activeCategory, setActiveCategory] = useState("all");

  // Get unique categories
  const categories = ["all", ...Array.from(new Set(mockBlogData.map(post => post.category || "Uncategorized")))];

  // Filter posts based on search term and category
  useEffect(() => {
    const filtered = mockBlogData.filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = activeCategory === "all" || post.category === activeCategory;
      
      return matchesSearch && matchesCategory;
    });
    
    setFilteredPosts(filtered);
  }, [searchTerm, activeCategory]);

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4">Nutrition & Fitness Blog</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Expert advice, science-backed articles, and practical tips to help you achieve your health and fitness goals.
        </p>
      </div>
      
      {/* Search and filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search articles..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Tabs defaultValue="all" className="w-full sm:w-auto" onValueChange={setActiveCategory}>
          <TabsList className="w-full sm:w-auto">
            {categories.map(category => (
              <TabsTrigger 
                key={category} 
                value={category}
                className="capitalize"
              >
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      
      {/* Featured post */}
      {filteredPosts.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <Link href={filteredPosts[0].readMoreLink}>
            <Card className="overflow-hidden border-none shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative h-64 md:h-auto">
                  <Image 
                    src={filteredPosts[0].imageUrl}
                    alt={filteredPosts[0].title}
                    layout="fill"
                    objectFit="cover"
                  />
                  {filteredPosts[0].category && (
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-primary hover:bg-primary/90">
                        {filteredPosts[0].category}
                      </Badge>
                    </div>
                  )}
                </div>
                <div className="p-6 flex flex-col justify-between">
                  <div>
                    <CardTitle className="text-2xl mb-4">{filteredPosts[0].title}</CardTitle>
                    <CardDescription className="text-base mb-6">{filteredPosts[0].excerpt}</CardDescription>
                  </div>
                  
                  <div>
                    {filteredPosts[0].author && (
                      <div className="flex items-center gap-3 mb-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage 
                            src={
                              typeof filteredPosts[0].author === 'object' && filteredPosts[0].author?.imageUrl 
                                ? filteredPosts[0].author.imageUrl 
                                : filteredPosts[0].authorImage || `https://placehold.co/200x200.png`
                            }
                            alt={
                              typeof filteredPosts[0].author === 'object' && filteredPosts[0].author?.name
                                ? filteredPosts[0].author.name
                                : typeof filteredPosts[0].author === 'string' 
                                  ? filteredPosts[0].author 
                                  : "Author"
                            } 
                          />
                          <AvatarFallback>
                            {typeof filteredPosts[0].author === 'object' && filteredPosts[0].author?.name
                              ? filteredPosts[0].author.name.charAt(0)
                              : typeof filteredPosts[0].author === 'string'
                                ? filteredPosts[0].author.charAt(0)
                                : "A"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {typeof filteredPosts[0].author === 'object' && filteredPosts[0].author?.name
                              ? filteredPosts[0].author.name
                              : typeof filteredPosts[0].author === 'string'
                                ? filteredPosts[0].author
                                : "Author"}
                          </div>
                          {filteredPosts[0].publishDate && (
                            <div className="text-xs text-muted-foreground flex items-center">
                              <CalendarDays className="h-3 w-3 mr-1" />
                              {filteredPosts[0].publishDate}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <Button className="w-full sm:w-auto">
                      Read Article
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        </motion.div>
      )}
      
      {/* All posts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPosts.slice(1).map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Link href={post.readMoreLink}>
              <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow border-muted">
                <div className="relative h-48">
                  <Image 
                    src={post.imageUrl}
                    alt={post.title}
                    layout="fill"
                    objectFit="cover"
                  />
                  {post.category && (
                    <div className="absolute top-3 right-3">
                      <Badge variant="outline" className="bg-black/50 text-white border-none backdrop-blur-sm">
                        {post.category}
                      </Badge>
                    </div>
                  )}
                </div>
                
                <CardContent className="p-5">
                  <CardTitle className="text-xl mb-2 line-clamp-2">{post.title}</CardTitle>
                  <CardDescription className="line-clamp-3 mb-4">{post.excerpt}</CardDescription>
                  
                  {post.author && post.publishDate && (
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>
                        {typeof post.author === 'object' && post.author?.name
                          ? post.author.name
                          : typeof post.author === 'string'
                            ? post.author
                            : "Author"}
                      </span>
                      <span className="flex items-center">
                        <CalendarDays className="h-3 w-3 mr-1" />
                        {post.publishDate}
                      </span>
                    </div>
                  )}
                </CardContent>
                
                <CardFooter className="px-5 pb-5 pt-0">
                  <Button variant="ghost" className="p-0 h-auto text-primary hover:text-primary/80 hover:bg-transparent">
                    Read More
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
      
      {filteredPosts.length === 0 && (
        <div className="text-center py-20">
          <h3 className="text-xl font-medium mb-2">No articles found</h3>
          <p className="text-muted-foreground mb-6">
            Try adjusting your search or filter to find what you're looking for.
          </p>
          <Button onClick={() => {setSearchTerm(""); setActiveCategory("all");}}>
            Reset Filters
          </Button>
        </div>
      )}
    </div>
  );
} 