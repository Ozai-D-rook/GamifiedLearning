import { useState } from "react";
import { useLocation, useParams, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  ArrowLeft,
  Loader2,
  Play,
  Clock,
  HelpCircle,
  CheckCircle2,
  XCircle,
  Gamepad2,
} from "lucide-react";
import type { Quiz, Question } from "@shared/schema";

export default function QuizDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isStarting, setIsStarting] = useState(false);

  const { data: quiz, isLoading: quizLoading } = useQuery<Quiz>({
    queryKey: ["/api/quizzes", id],
  });

  const { data: questions, isLoading: questionsLoading } = useQuery<Question[]>({
    queryKey: ["/api/quizzes", id, "questions"],
  });

  const startGameMutation = useMutation({
    mutationFn: async () => {
      setIsStarting(true);
      const response = await apiRequest("POST", "/api/sessions", {
        quizId: id,
      });
      return response.json();
    },
    onSuccess: (session) => {
      toast({
        title: "Game created!",
        description: `Share code: ${session.gameCode}`,
      });
      setLocation(`/host/${session.id}`);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to start game",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsStarting(false);
    },
  });

  if (quizLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-64" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="text-center py-16">
        <Gamepad2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="font-display text-2xl font-bold mb-2">Quiz not found</h2>
        <Link href="/quizzes">
          <Button>Back to Quizzes</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link href="/quizzes">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="font-display text-2xl font-bold" data-testid="text-quiz-title">
            {quiz.title}
          </h1>
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
          disabled={isStarting}
          data-testid="button-start-game"
        >
          {isStarting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Play className="h-5 w-5" />
              Host Game
            </>
          )}
        </Button>
      </div>

      {/* Questions Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Questions Preview</CardTitle>
          <CardDescription>
            Review the questions before starting the game
          </CardDescription>
        </CardHeader>
        <CardContent>
          {questionsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          ) : questions && questions.length > 0 ? (
            <div className="space-y-4">
              {questions.map((question, index) => (
                <div
                  key={question.id}
                  className="p-4 rounded-lg border"
                  data-testid={`question-preview-${index}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium mb-3">{question.questionText}</p>
                      <div className="grid grid-cols-2 gap-2">
                        {(question.options as string[]).map((option, optIndex) => (
                          <div
                            key={optIndex}
                            className={`p-2 rounded-md text-sm flex items-center gap-2 ${
                              optIndex === question.correctAnswer
                                ? "bg-chart-2/10 text-chart-2"
                                : "bg-muted"
                            }`}
                          >
                            {optIndex === question.correctAnswer ? (
                              <CheckCircle2 className="h-4 w-4 shrink-0" />
                            ) : (
                              <XCircle className="h-4 w-4 shrink-0 text-muted-foreground" />
                            )}
                            <span className="font-medium mr-1">
                              {String.fromCharCode(65 + optIndex)}.
                            </span>
                            <span className="truncate">{option}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No questions in this quiz</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
