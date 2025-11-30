import { useState, useEffect } from "react";
import { useParams, useLocation, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Play,
  Loader2,
  Users,
  Copy,
  Check,
  X,
  Gamepad2,
} from "lucide-react";
import type { GameSession, GamePlayer, Quiz } from "@shared/schema";

export default function HostLobbyPage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const { data: session, isLoading: sessionLoading } = useQuery<GameSession>({
    queryKey: ["/api/sessions", id],
    refetchInterval: 2000,
  });

  const { data: players, isLoading: playersLoading } = useQuery<GamePlayer[]>({
    queryKey: ["/api/sessions", id, "players"],
    refetchInterval: 2000,
  });

  const { data: quiz } = useQuery<Quiz>({
    queryKey: ["/api/quizzes", session?.quizId],
    enabled: !!session?.quizId,
  });

  const startMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/sessions/${id}/start`);
      return response.json();
    },
    onSuccess: () => {
      setLocation(`/host/${id}/play`);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to start",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/sessions/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Game cancelled" });
      setLocation("/quizzes");
    },
  });

  const copyCode = () => {
    if (session?.gameCode) {
      navigator.clipboard.writeText(session.gameCode);
      setCopied(true);
      toast({ title: "Code copied!" });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  useEffect(() => {
    if (session?.status === "playing") {
      setLocation(`/host/${id}/play`);
    }
  }, [session?.status, id, setLocation]);

  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Skeleton className="h-96 w-full max-w-2xl" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Gamepad2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold mb-4">Game not found</h2>
          <Link href="/quizzes">
            <Button>Back to Quizzes</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Gamepad2 className="h-6 w-6 text-primary" />
            <span className="font-display text-lg font-bold truncate">
              {quiz?.title || "Loading..."}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => cancelMutation.mutate()}
            className="text-destructive"
            data-testid="button-cancel-game"
          >
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 flex flex-col items-center">
        {/* Game Code */}
        <Card className="w-full max-w-lg mb-8">
          <CardContent className="p-8 text-center">
            <p className="text-sm font-medium text-muted-foreground mb-2">
              Join at quizblitz.app or enter code:
            </p>
            <div className="flex items-center justify-center gap-4">
              <span
                className="font-display text-6xl md:text-8xl font-bold tracking-widest text-primary"
                data-testid="text-game-code"
              >
                {session.gameCode}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={copyCode}
                data-testid="button-copy-code"
              >
                {copied ? (
                  <Check className="h-5 w-5 text-chart-2" />
                ) : (
                  <Copy className="h-5 w-5" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Players */}
        <div className="w-full max-w-3xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-semibold flex items-center gap-2">
              <Users className="h-5 w-5" />
              Players ({players?.length || 0})
            </h2>
          </div>

          {playersLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
          ) : players && players.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {players.map((player, index) => (
                <Card
                  key={player.id}
                  className="animate-score-pop"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  data-testid={`player-card-${player.id}`}
                >
                  <CardContent className="p-4 text-center">
                    <Avatar className="h-12 w-12 mx-auto mb-2">
                      <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                        {player.nickname.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <p className="font-medium text-sm truncate">{player.nickname}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="py-12">
              <CardContent className="text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Waiting for players to join...</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Share the code above with your class
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Start Button */}
        <div className="mt-8">
          <Button
            size="lg"
            className="h-16 px-12 text-xl font-bold gap-3"
            disabled={!players || players.length === 0 || startMutation.isPending}
            onClick={() => startMutation.mutate()}
            data-testid="button-start-game"
          >
            {startMutation.isPending ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin" />
                Starting...
              </>
            ) : (
              <>
                <Play className="h-6 w-6" />
                Start Game
              </>
            )}
          </Button>
          {(!players || players.length === 0) && (
            <p className="text-sm text-muted-foreground text-center mt-2">
              At least 1 player required to start
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
