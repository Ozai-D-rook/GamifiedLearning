import { useState } from "react";
import { useLocation, useParams, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  ArrowLeft,
  Loader2,
  BookOpen,
  Sparkles,
  Gamepad2,
  Clock,
  Calendar,
} from "lucide-react";
import type { Lesson, Quiz } from "@shared/schema";
import { format } from "date-fns";

export default function LessonDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [quizTitle, setQuizTitle] = useState("");
  const [numQuestions, setNumQuestions] = useState([10]);
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: lesson, isLoading } = useQuery<Lesson>({
    queryKey: ["/api/lessons", id],
  });

  const { data: quizzes } = useQuery<Quiz[]>({
    queryKey: ["/api/quizzes", { lessonId: id }],
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      setIsGenerating(true);
      const response = await apiRequest("POST", "/api/quizzes/generate", {
        lessonId: id,
        lessonText: lesson?.content,
        title: quizTitle || `${lesson?.title} Quiz`,
        numberOfQuestions: numQuestions[0],
      });
      return response.json();
    },
    onSuccess: (quiz) => {
      queryClient.invalidateQueries({ queryKey: ["/api/quizzes"] });
      toast({
        title: "Quiz generated!",
        description: `Created ${numQuestions[0]} questions from your lesson.`,
      });
      setLocation(`/quizzes/${quiz.id}`);
    },
    onError: (error: any) => {
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate quiz",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsGenerating(false);
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-64" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="text-center py-16">
        <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="font-display text-2xl font-bold mb-2">Lesson not found</h2>
        <Link href="/lessons">
          <Button>Back to Lessons</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link href="/lessons">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="font-display text-2xl font-bold" data-testid="text-lesson-title">
            {lesson.title}
          </h1>
          <div className="flex items-center gap-3 mt-2">
            {lesson.subject && (
              <Badge variant="secondary">{lesson.subject}</Badge>
            )}
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {lesson.createdAt ? format(new Date(lesson.createdAt), "MMMM d, yyyy") : "N/A"}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Lesson Content */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Lesson Content
            </CardTitle>
            <CardDescription>
              {lesson.content.length.toLocaleString()} characters
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm dark:prose-invert max-h-[400px] overflow-y-auto">
              <p className="whitespace-pre-wrap">{lesson.content}</p>
            </div>
          </CardContent>
        </Card>

        {/* Generate Quiz */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Generate Quiz
              </CardTitle>
              <CardDescription>
                Create AI-powered questions from this lesson
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="quiz-title">Quiz Title (Optional)</Label>
                <Input
                  id="quiz-title"
                  placeholder={`${lesson.title} Quiz`}
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  data-testid="input-quiz-title"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Number of Questions</Label>
                  <span className="text-sm font-medium">{numQuestions[0]}</span>
                </div>
                <Slider
                  value={numQuestions}
                  onValueChange={setNumQuestions}
                  min={5}
                  max={20}
                  step={1}
                  data-testid="slider-num-questions"
                />
                <p className="text-xs text-muted-foreground">
                  5-20 questions per quiz
                </p>
              </div>

              <Button
                className="w-full gap-2"
                onClick={() => generateMutation.mutate()}
                disabled={isGenerating}
                data-testid="button-generate-quiz"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate Quiz
                  </>
                )}
              </Button>

              {isGenerating && (
                <p className="text-xs text-center text-muted-foreground">
                  AI is creating questions. This may take a moment...
                </p>
              )}
            </CardContent>
          </Card>

          {/* Related Quizzes */}
          {quizzes && quizzes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Gamepad2 className="h-5 w-5" />
                  Related Quizzes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {quizzes.map((quiz) => (
                  <Link key={quiz.id} href={`/quizzes/${quiz.id}`}>
                    <div className="p-3 rounded-lg border hover-elevate cursor-pointer">
                      <p className="font-medium text-sm truncate">{quiz.title}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3" />
                        {quiz.timePerQuestion}s per question
                      </p>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
