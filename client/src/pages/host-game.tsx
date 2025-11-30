import { useState, useEffect, useCallback } from "react";
import { useParams, useLocation, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  ChevronRight,
  Clock,
  Users,
  Trophy,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import type { GameSession, GamePlayer, Question } from "@shared/schema";

const ANSWER_COLORS = [
  "answer-button-a",
  "answer-button-b",
  "answer-button-c",
  "answer-button-d",
];

const ANSWER_LETTERS = ["A", "B", "C", "D"];

export default function HostGamePage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [timeLeft, setTimeLeft] = useState(30);
  const [showAnswer, setShowAnswer] = useState(false);
  const [answerCounts, setAnswerCounts] = useState<number[]>([0, 0, 0, 0]);

  const { data: session } = useQuery<GameSession>({
    queryKey: ["/api/sessions", id],
    refetchInterval: showAnswer ? false : 2000,
  });

  const { data: questions } = useQuery<Question[]>({
    queryKey: ["/api/sessions", id, "questions"],
  });

  const { data: players } = useQuery<GamePlayer[]>({
    queryKey: ["/api/sessions", id, "players"],
    refetchInterval: 2000,
  });

  const currentQuestion = questions?.[session?.currentQuestionIndex || 0];
  const totalQuestions = questions?.length || 0;
  const currentIndex = (session?.currentQuestionIndex || 0) + 1;

  const nextQuestionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/sessions/${id}/next`);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.finished) {
        setLocation(`/host/${id}/results`);
      } else {
        setShowAnswer(false);
        setTimeLeft(session?.timePerQuestion || 30);
        setAnswerCounts([0, 0, 0, 0]);
        queryClient.invalidateQueries({ queryKey: ["/api/sessions", id] });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const revealAnswerMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/sessions/${id}/reveal`);
      return response.json();
    },
    onSuccess: (data) => {
      setShowAnswer(true);
      setAnswerCounts(data.answerCounts || [0, 0, 0, 0]);
    },
  });

  // Timer countdown
  useEffect(() => {
    if (showAnswer || !session || session.status !== "playing") return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          revealAnswerMutation.mutate();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showAnswer, session]);

  // Reset timer when question changes
  useEffect(() => {
    if (session?.timePerQuestion) {
      setTimeLeft(session.timePerQuestion);
    }
  }, [session?.currentQuestionIndex, session?.timePerQuestion]);

  // Redirect if game finished
  useEffect(() => {
    if (session?.status === "finished") {
      setLocation(`/host/${id}/results`);
    }
  }, [session?.status, id, setLocation]);

  if (!session || !currentQuestion) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground">Loading game...</p>
        </div>
      </div>
    );
  }

  const timerProgress = (timeLeft / (session.timePerQuestion || 30)) * 100;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-muted-foreground">
              Question {currentIndex} of {totalQuestions}
            </span>
            <Progress value={(currentIndex / totalQuestions) * 100} className="w-32 h-2" />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4" />
              {players?.length || 0} players
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 flex flex-col">
        {/* Timer */}
        <div className="flex justify-center mb-6">
          <div
            className={`relative w-24 h-24 rounded-full border-4 flex items-center justify-center ${
              timeLeft <= 5 && !showAnswer ? "border-destructive animate-pulse-ring" : "border-primary"
            }`}
          >
            <span className="font-display text-3xl font-bold" data-testid="text-timer">
              {showAnswer ? "-" : timeLeft}
            </span>
          </div>
        </div>

        {/* Question */}
        <Card className="mb-8">
          <CardContent className="p-8 md:p-12 text-center">
            <p
              className="font-display text-2xl md:text-4xl lg:text-5xl font-bold"
              data-testid="text-question"
            >
              {currentQuestion.questionText}
            </p>
          </CardContent>
        </Card>

        {/* Answer Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8">
          {(currentQuestion.options as string[]).map((option, index) => {
            const isCorrect = index === currentQuestion.correctAnswer;
            const count = answerCounts[index];
            const totalAnswers = answerCounts.reduce((a, b) => a + b, 0);
            const percentage = totalAnswers > 0 ? Math.round((count / totalAnswers) * 100) : 0;

            return (
              <div
                key={index}
                className={`relative h-20 md:h-24 rounded-2xl ${ANSWER_COLORS[index]} flex items-center px-6 transition-all ${
                  showAnswer
                    ? isCorrect
                      ? "ring-4 ring-white scale-105"
                      : "opacity-50"
                    : ""
                }`}
                data-testid={`answer-option-${index}`}
              >
                <div className="absolute top-2 left-2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-white font-bold text-lg md:text-xl">
                    {ANSWER_LETTERS[index]}
                  </span>
                </div>
                <span className="text-white font-semibold text-lg md:text-xl ml-14 flex-1 truncate">
                  {option}
                </span>
                {showAnswer && (
                  <div className="flex items-center gap-2">
                    {isCorrect ? (
                      <CheckCircle2 className="h-6 w-6 text-white" />
                    ) : (
                      <XCircle className="h-6 w-6 text-white/60" />
                    )}
                    <span className="text-white font-bold">{percentage}%</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4">
          {!showAnswer ? (
            <Button
              size="lg"
              onClick={() => revealAnswerMutation.mutate()}
              disabled={revealAnswerMutation.isPending}
              data-testid="button-reveal-answer"
            >
              Show Answer
            </Button>
          ) : (
            <Button
              size="lg"
              className="gap-2"
              onClick={() => nextQuestionMutation.mutate()}
              disabled={nextQuestionMutation.isPending}
              data-testid="button-next-question"
            >
              {currentIndex === totalQuestions ? "See Results" : "Next Question"}
              <ChevronRight className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Live Leaderboard Preview */}
        {showAnswer && players && players.length > 0 && (
          <Card className="mt-8 max-w-lg mx-auto">
            <CardContent className="p-4">
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Trophy className="h-4 w-4 text-chart-3" />
                Current Standings
              </h3>
              <div className="space-y-2">
                {[...players]
                  .sort((a, b) => b.score - a.score)
                  .slice(0, 5)
                  .map((player, index) => (
                    <div
                      key={player.id}
                      className="flex items-center gap-3"
                    >
                      <span className="text-sm font-medium w-4">{index + 1}</span>
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                          {player.nickname.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="flex-1 text-sm truncate">{player.nickname}</span>
                      <span className="text-sm font-bold">{player.score.toLocaleString()}</span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
