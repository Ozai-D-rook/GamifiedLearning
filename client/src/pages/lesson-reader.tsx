import { useParams, Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  ArrowLeft,
  BookOpen,
  Play,
  Clock,
  HelpCircle,
  Loader2,
  ChevronRight,
} from "lucide-react";
import type { Lesson, Quiz, Question } from "@shared/schema";

export default function LessonReaderPage() {
  const { quizId } = useParams<{ quizId: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: quiz } = useQuery<Quiz>({
    queryKey: ["/api/quizzes", quizId],
  });

  const { data: lesson, isLoading: lessonLoading } = useQuery<Lesson>({
    queryKey: ["/api/lessons", quiz?.lessonId],
    enabled: !!quiz?.lessonId,
  });

  const { data: questions } = useQuery<Question[]>({
    queryKey: ["/api/quizzes", quizId, "questions"],
  });

  const startGameMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/sessions", {
        quizId,
      });
      return response.json();
    },
    onSuccess: (session) => {
      toast({
        title: "Game started!",
        description: `Share code: ${session.gameCode}`,
      });
      setLocation(`/host/${session.id}`);
    },
    onError: () => {
      toast({
        title: "Failed to start quiz",
        description: "Something went wrong",
        variant: "destructive",
      });
    },
  });

  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  } as React.CSSProperties;

  if (lessonLoading || !quiz) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  // If no lesson, just show quiz details
  if (!lesson) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-start gap-4">
          <Link href="/browse">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="font-display text-2xl font-bold">{quiz.title}</h1>
            {quiz.description && (
              <p className="text-muted-foreground mt-1">{quiz.description}</p>
            )}
            <div className="flex items-center gap-4 mt-3">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {quiz.timePerQuestion}s per question
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1">
                <HelpCircle className="h-3 w-3" />
                {questions?.length || 0} questions
              </Badge>
            </div>
          </div>
          <Button
            size="lg"
            className="gap-2"
            onClick={() => startGameMutation.mutate()}
            disabled={startGameMutation.isPending}
            data-testid="button-start-quiz"
          >
            {startGameMutation.isPending ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Starting...
              </>
            ) : (
              <>
                <Play className="h-5 w-5" />
                Start Quiz
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  // Format lesson content - split by lines and paragraphs
  const paragraphs = lesson.content
    .split("\n\n")
    .filter((p) => p.trim().length > 0);

  return (
    <SidebarProvider style={sidebarStyle}>
      <div className="flex w-full h-screen">
        <Sidebar className="hidden md:flex">
          <SidebarHeader className="p-4">
            <Link href="/browse">
              <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
          </SidebarHeader>
          <SidebarContent className="p-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-display font-semibold text-sm mb-2">Lesson Content</h3>
                <div className="space-y-2">
                  <a href="#top" className="block text-sm text-muted-foreground hover:text-foreground">
                    Overview
                  </a>
                  {paragraphs.map((_, index) => (
                    <a
                      key={index}
                      href={`#section-${index}`}
                      className="block text-sm text-muted-foreground hover:text-foreground line-clamp-2"
                    >
                      Section {index + 1}
                    </a>
                  ))}
                </div>
              </div>
              <div className="pt-4 border-t">
                <Button
                  className="w-full gap-2"
                  onClick={() => startGameMutation.mutate()}
                  disabled={startGameMutation.isPending}
                  data-testid="button-start-quiz-sidebar"
                >
                  {startGameMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Starting...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Start Quiz
                    </>
                  )}
                </Button>
              </div>
            </div>
          </SidebarContent>
        </Sidebar>

        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur px-4 md:hidden">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <span className="text-sm font-medium">Lesson</span>
          </header>

          <main className="flex-1 overflow-auto">
            <div className="max-w-4xl mx-auto p-6 space-y-6">
              {/* Back button for mobile */}
              <Link href="/browse">
                <Button variant="ghost" size="sm" className="gap-2 md:hidden">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              </Link>

              {/* Quiz Info */}
              <div id="top">
                <h1 className="font-display text-3xl font-bold mb-2" data-testid="text-lesson-title">
                  {quiz.title}
                </h1>
                {quiz.description && (
                  <p className="text-muted-foreground mb-4">{quiz.description}</p>
                )}
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    {lesson.subject || "General"}
                  </Badge>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {quiz.timePerQuestion}s per question
                  </Badge>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <HelpCircle className="h-3 w-3" />
                    {questions?.length || 0} questions
                  </Badge>
                </div>
              </div>

              {/* Lesson Content */}
              <Card>
                <CardHeader>
                  <CardTitle>{lesson.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 prose prose-sm dark:prose-invert max-w-none">
                  {paragraphs.map((paragraph, index) => (
                    <div
                      key={index}
                      id={`section-${index}`}
                      className="scroll-mt-20 text-base leading-relaxed text-foreground whitespace-pre-wrap"
                    >
                      {paragraph}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Call to Action */}
              <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h3 className="font-display font-semibold mb-1">Ready to test your knowledge?</h3>
                      <p className="text-sm text-muted-foreground">
                        Take the quiz to see how well you understood the material
                      </p>
                    </div>
                    <Button
                      size="lg"
                      className="gap-2"
                      onClick={() => startGameMutation.mutate()}
                      disabled={startGameMutation.isPending}
                      data-testid="button-start-quiz-cta"
                    >
                      {startGameMutation.isPending ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Starting...
                        </>
                      ) : (
                        <>
                          <Play className="h-5 w-5" />
                          Start Quiz
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
