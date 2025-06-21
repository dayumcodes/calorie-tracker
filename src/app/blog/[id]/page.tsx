"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { mockBlogData } from "@/app/page"; // Assuming mockBlogData is exported from page.tsx
import type { BlogPost } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import { ArrowLeft, CalendarDays, Tag, Clock, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function BlogPostPage() {
  const params = useParams();
  const postId = params.id as string;

  // In a real app, you'd fetch this data from a CMS or database
  const post: BlogPost | undefined = mockBlogData.find(p => p.id === postId);

  if (!post) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <Card className="max-w-md mx-auto p-8 shadow-lg">
          <CardTitle className="text-2xl font-bold text-destructive mb-4">Blog Post Not Found</CardTitle>
          <CardDescription className="mb-6">Sorry, we couldn't find the blog post you were looking for.</CardDescription>
          <Link href="/" passHref>
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <Link href="/" passHref className="mb-6 inline-block">
        <Button variant="ghost" className="text-primary hover:text-primary/80">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
      </Link>
      
      <Card className="shadow-xl overflow-hidden rounded-lg border-none">
        <div className="relative w-full h-64 md:h-80">
          <Image
            src={post.imageUrl}
            alt={post.title}
            layout="fill"
            objectFit="cover"
            data-ai-hint={post.imageHint || "blog post image"}
          />
          {post.category && (
            <div className="absolute top-4 left-4 z-10">
              <Badge variant="outline" className="bg-white/90 text-primary border-transparent font-medium">
                {post.category}
              </Badge>
            </div>
          )}
        </div>
        
        <CardHeader className="p-6 pb-4">
          <CardTitle className="text-3xl font-bold leading-tight mb-4">{post.title}</CardTitle>
          
          {/* Author information */}
          {post.author && (
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="h-10 w-10 border-2 border-muted">
                <AvatarImage 
                  src={
                    typeof post.author === 'object' && post.author?.imageUrl 
                      ? post.author.imageUrl 
                      : post.authorImage || `https://placehold.co/200x200.png`
                  }
                  alt={
                    typeof post.author === 'object' && post.author?.name
                      ? post.author.name
                      : typeof post.author === 'string' 
                        ? post.author 
                        : "Author"
                  }
                />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {typeof post.author === 'object' && post.author?.name
                    ? post.author.name.charAt(0)
                    : typeof post.author === 'string'
                      ? post.author.charAt(0)
                      : "A"}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">
                  {typeof post.author === 'object' && post.author?.name
                    ? post.author.name
                    : typeof post.author === 'string'
                      ? post.author
                      : "Author"}
                </div>
                {(typeof post.author === 'object' && post.author?.role) || post.authorRole ? (
                  <div className="text-xs text-muted-foreground">
                    {typeof post.author === 'object' && post.author?.role 
                      ? post.author.role 
                      : post.authorRole}
                  </div>
                ) : null}
              </div>
            </div>
          )}
          
          <div className="flex flex-wrap items-center text-sm text-muted-foreground gap-4">
            {post.publishDate && (
              <div className="flex items-center">
                <CalendarDays className="mr-1.5 h-4 w-4" />
                <span>{post.publishDate}</span>
              </div>
            )}
            {post.imageHint && (
              <div className="flex items-center">
                <Tag className="mr-1.5 h-4 w-4" />
                <span>{post.imageHint.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(', ')}</span>
              </div>
            )}
            <div className="flex items-center">
              <Clock className="mr-1.5 h-4 w-4" />
              <span>5 min read</span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 pt-0">
          <div className="prose prose-sm sm:prose-base lg:prose-lg dark:prose-invert max-w-none">
            <p className="lead text-lg text-muted-foreground mb-6">{post.excerpt}</p>
            
            {/* Render full content if available */}
            {post.content ? (
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            ) : (
              <>
                <p>
                  This is where more detailed content for the blog post titled "{post.title}" would go.
                  For now, we are only displaying the excerpt. Building out a full blog system would involve
                  storing and retrieving complete articles.
                </p>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                  Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                  Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                </p>
              </>
            )}
          </div>
          
          {/* Share and related articles section */}
          <div className="mt-10 pt-6 border-t">
            <h3 className="text-lg font-semibold mb-4">Related Articles</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {mockBlogData
                .filter(b => b.id !== post.id && b.category === post.category)
                .slice(0, 2)
                .map(relatedPost => (
                  <Link href={relatedPost.readMoreLink} key={relatedPost.id}>
                    <Card className="h-full hover:bg-accent/50 transition-colors border-muted">
                      <CardContent className="p-4 flex gap-3">
                        <div className="w-16 h-16 rounded-md overflow-hidden relative flex-shrink-0">
                          <Image
                            src={relatedPost.imageUrl}
                            alt={relatedPost.title}
                            layout="fill"
                            objectFit="cover"
                          />
                        </div>
                        <div>
                          <h4 className="font-medium text-sm line-clamp-2">{relatedPost.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {typeof relatedPost.author === 'object' && relatedPost.author?.name
                              ? relatedPost.author.name
                              : typeof relatedPost.author === 'string'
                                ? relatedPost.author
                                : "Editorial Team"}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
