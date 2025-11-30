import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Clock,
  CheckCircle2,
  XCircle,
  Trophy,
  Zap,
  Loader2,
} from "lucide-react";
import type { GameSession, Question, GamePlayer } from "@shared/schema";

const ANSWER_COLORS = [
  "answer-button-a",
  "answer-button-b",
  "answer-button-c",
  "answer-button-d",
];

const ANSWER_LETTERS = ["A", "B", "C", "D"];

export default function PlayGamePage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const params = new URLSearchParams(window.location.search);
  const playerId = params.get("playerId");

  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [startTime, setStartTime] = useState<number>(0);
  const [lastResult, setLastResult] = useState<{
    correct: boolean;
    points: number;
    streak: number;
  } | null>(null);

  const { data: session } = useQuery<GameSession>({
    queryKey: ["/api/sessions", id],
    refetchInterval: 2000,
  });

  const { data: questions } = useQuery<Question[]>({
    queryKey: ["/api/sessions", id, "questions"],
    enabled: session?.status === "playing",
  });

  const { data: player } = useQuery<GamePlayer>({
    queryKey: ["/api/players", playerId],
    enabled: !!playerId,
    refetchInterval: 2000,
  });

  const currentQuestion = questions?.[session?.currentQuestionIndex || 0];
  const totalQuestions = questions?.length || 0;
  const currentIndex = (session?.currentQuestionIndex || 0) + 1;

  const submitAnswerMutation = useMutation({
    mutationFn: async (answerIndex: number) => {
      const timeTaken = Date.now() - startTime;
      const response = await apiRequest("POST", `/api/sessions/${id}/answer`, {
        playerId,
        questionId: currentQuestion?.id,
        selectedAnswer: answerIndex,
        timeTaken,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setLastResult({
        correct: data.correct,
        points: data.pointsEarned,
        streak: data.streak,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/players", playerId] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSelectAnswer = (index: number) => {
    if (hasAnswered) return;
    setSelectedAnswer(index);
    setHasAnswered(true);
    submitAnswerMutation.mutate(index);
  };

  // Timer countdown
  useEffect(() => {
    if (hasAnswered || !session || session.status !== "playing") return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [hasAnswered, session]);

  // Reset state when question changes
  useEffect(() => {
    if (session?.currentQuestionIndex !== undefined) {
      setSelectedAnswer(null);
      setHasAnswered(false);
      setLastResult(null);
      setTimeLeft(session.timePerQuestion || 30);
      setStartTime(Date.now());
    }
  }, [session?.currentQuestionIndex, session?.timePerQuestion]);

  // Redirect if game finished
  useEffect(() => {
    if (session?.status === "finished") {
      setLocation(`/play/${id}/results?playerId=${playerId}`);
    }
  }, [session?.status, id, playerId, setLocation]);

  // Waiting screen
  if (session?.status === "waiting") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <div className="w-20 h-20 rounded-full bg-primary mx-auto mb-6 flex items-center justify-center">
              <Loader2 className="h-10 w-10 text-primary-foreground animate-spin" />
            </div>
            <h2 className="font-display text-2xl font-bold mb-2">
              You're in!
            </h2>
            <p className="text-muted-foreground mb-4">
              Waiting for the host to start the game...
            </p>
            {player && (
              <p className="text-lg font-medium">
                Playing as: <span className="text-primary">{player.nickname}</span>
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!session || !currentQuestion) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Clock className="h-12 w-12 text-muted-foreground animate-spin" />
      </div>
    );
  }

  const timerProgress = (timeLeft / (session.timePerQuestion || 30)) * 100;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">
              Q{currentIndex}/{totalQuestions}
            </span>
            <Progress value={(currentIndex / totalQuestions) * 100} className="w-20 h-2" />
          </div>
          <div className="flex items-center gap-3">
            <Trophy className="h-4 w-4 text-chart-3" />
            <span className="font-bold">{player?.score?.toLocaleString() || 0}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6 flex flex-col">
        {/* Timer */}
        {!hasAnswered && (
          <div className="flex justify-center mb-4">
            <div
              className={`w-16 h-16 rounded-full border-4 flex items-center justify-center ${
                timeLeft <= 5 ? "border-destructive animate-pulse" : "border-primary"
              }`}
            >
              <span className="font-display text-2xl font-bold">{timeLeft}</span>
            </div>
          </div>
        )}

        {/* Question */}
        <Card className="mb-6">
          <CardContent className="p-6 text-center">
            <p
              className="font-display text-xl md:text-2xl font-bold"
              data-testid="text-question"
            >
              {currentQuestion.questionText}
            </p>
          </CardContent>
        </Card>

        {/* Answer Options or Result */}
        {hasAnswered ? (
          <div className="flex-1 flex items-center justify-center">
            <Card className="w-full max-w-md">
              <CardContent className="p-8 text-center">
                {lastResult ? (
                  <>
                    {lastResult.correct ? (
                      <div className="animate-score-pop">
                        <CheckCircle2 className="h-20 w-20 text-chart-2 mx-auto mb-4" />
                        <h2 className="font-display text-3xl font-bold text-chart-2 mb-2">
                          Correct!
                        </h2>
                        <p className="text-4xl font-bold mb-2">
                          +{lastResult.points.toLocaleString()}
                        </p>
                        {lastResult.streak > 1 && (
                          <div className="flex items-center justify-center gap-2 text-chart-3">
                            <Zap className="h-5 w-5" />
                            <span className="font-bold">{lastResult.streak} streak!</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="animate-score-pop">
                        <XCircle className="h-20 w-20 text-destructive mx-auto mb-4" />
                        <h2 className="font-display text-3xl font-bold text-destructive mb-2">
                          Wrong
                        </h2>
                        <p className="text-muted-foreground">
                          Better luck next time!
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="animate-pulse">
                    <Loader2 className="h-12 w-12 text-muted-foreground mx-auto animate-spin" />
                    <p className="text-muted-foreground mt-4">Checking answer...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:gap-4 flex-1">
            {(currentQuestion.options as string[]).map((option, index) => (
              <button
                key={index}
                onClick={() => handleSelectAnswer(index)}
                disabled={hasAnswered || timeLeft === 0}
                className={`relative h-24 md:h-32 rounded-2xl ${ANSWER_COLORS[index]} flex flex-col items-center justify-center p-4 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100`}
                data-testid={`answer-option-${index}`}
              >
                <div className="absolute top-2 left-2 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-white font-bold">{ANSWER_LETTERS[index]}</span>
                </div>
                <span className="text-white font-semibold text-sm md:text-base text-center line-clamp-3">
                  {option}
                </span>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
