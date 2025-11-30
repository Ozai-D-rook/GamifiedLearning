import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ArrowLeft, Loader2, BookOpen } from "lucide-react";
import { Link } from "wouter";

const lessonFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  subject: z.string().optional(),
  content: z.string().min(50, "Content must be at least 50 characters for quiz generation"),
});

type LessonFormData = z.infer<typeof lessonFormSchema>;

export default function NewLessonPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<LessonFormData>({
    resolver: zodResolver(lessonFormSchema),
    defaultValues: {
      title: "",
      subject: "",
      content: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: LessonFormData) => {
      const response = await apiRequest("POST", "/api/lessons", data);
      return response.json();
    },
    onSuccess: (lesson) => {
      queryClient.invalidateQueries({ queryKey: ["/api/lessons"] });
      toast({ title: "Lesson created!", description: "Now you can generate a quiz from it." });
      setLocation(`/lessons/${lesson.id}`);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create lesson",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LessonFormData) => {
    createMutation.mutate(data);
  };

  const contentLength = form.watch("content")?.length || 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/lessons">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="font-display text-2xl font-bold" data-testid="text-new-lesson-title">
            Create New Lesson
          </h1>
          <p className="text-muted-foreground">
            Add your lesson content to generate AI-powered quizzes
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Lesson Details</CardTitle>
              <CardDescription>
                Paste or type your lesson content below
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lesson Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Introduction to Photosynthesis"
                        className="h-12"
                        data-testid="input-lesson-title"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Biology, History, Mathematics"
                        className="h-12"
                        data-testid="input-lesson-subject"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lesson Content</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Paste or type your lesson content here. The AI will generate quiz questions based on this text.

Example:
Photosynthesis is the process by which plants convert light energy, usually from the sun, into chemical energy that can be later released to fuel the plant's activities. This process occurs primarily in the leaves of plants..."
                        className="min-h-[300px] resize-y"
                        data-testid="input-lesson-content"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="flex items-center justify-between">
                      <span>Minimum 50 characters for quiz generation</span>
                      <span className={contentLength < 50 ? "text-destructive" : "text-muted-foreground"}>
                        {contentLength} characters
                      </span>
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4">
                <Link href="/lessons">
                  <Button type="button" variant="outline" className="flex-1">
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={createMutation.isPending}
                  data-testid="button-create-lesson"
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Lesson"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
