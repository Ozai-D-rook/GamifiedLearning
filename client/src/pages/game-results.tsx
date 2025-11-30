import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Trophy,
  Medal,
  Crown,
  Home,
  Gamepad2,
  Target,
  Zap,
} from "lucide-react";
import type { GamePlayer, GameSession } from "@shared/schema";

const PODIUM_HEIGHTS = ["h-32", "h-40", "h-28"];
const PODIUM_COLORS = ["bg-chart-4", "bg-chart-3", "bg-chart-5"];
const MEDAL_ICONS = [Medal, Crown, Medal];

export default function GameResultsPage() {
  const { id } = useParams<{ id: string }>();
  const params = new URLSearchParams(window.location.search);
  const playerId = params.get("playerId");
  const isHost = !playerId;

  const { data: session, isLoading: sessionLoading } = useQuery<GameSession>({
    queryKey: ["/api/sessions", id],
  });

  const { data: players, isLoading: playersLoading } = useQuery<GamePlayer[]>({
    queryKey: ["/api/sessions", id, "players"],
  });

  const sortedPlayers = players
    ? [...players].sort((a, b) => b.score - a.score)
    : [];

  const currentPlayer = playerId
    ? sortedPlayers.find((p) => p.id === playerId)
    : null;

  const currentRank = currentPlayer
    ? sortedPlayers.findIndex((p) => p.id === playerId) + 1
    : null;

  if (sessionLoading || playersLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Skeleton className="h-96 w-full max-w-2xl" />
      </div>
    );
  }

  const top3 = sortedPlayers.slice(0, 3);
  const rest = sortedPlayers.slice(3);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 h-16 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-chart-3" />
            <span className="font-display text-xl font-bold">Final Results</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Player's Result (for students) */}
        {currentPlayer && currentRank && (
          <Card className="mb-8 max-w-md mx-auto">
            <CardContent className="p-6 text-center">
              <div className="animate-score-pop">
                {currentRank === 1 && (
                  <Crown className="h-16 w-16 text-chart-3 mx-auto mb-4" />
                )}
                {currentRank === 2 && (
                  <Medal className="h-16 w-16 text-chart-4 mx-auto mb-4" />
                )}
                {currentRank === 3 && (
                  <Medal className="h-16 w-16 text-chart-5 mx-auto mb-4" />
                )}
                {currentRank > 3 && (
                  <Target className="h-16 w-16 text-primary mx-auto mb-4" />
                )}
                <h2 className="font-display text-3xl font-bold mb-1">
                  #{currentRank} Place
                </h2>
                <p className="text-muted-foreground mb-4">{currentPlayer.nickname}</p>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-primary">
                      {currentPlayer.score.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">Points</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-chart-2">
                      {currentPlayer.correctAnswers}
                    </p>
                    <p className="text-xs text-muted-foreground">Correct</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-chart-3">
                      {currentPlayer.streak}
                    </p>
                    <p className="text-xs text-muted-foreground">Best Streak</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Podium */}
        {top3.length > 0 && (
          <div className="mb-8">
            <h3 className="font-display text-xl font-semibold text-center mb-6 flex items-center justify-center gap-2">
              <Crown className="h-5 w-5 text-chart-3" />
              Top Players
            </h3>
            <div className="flex items-end justify-center gap-4 max-w-lg mx-auto">
              {/* 2nd Place */}
              {top3[1] && (
                <div className="flex flex-col items-center w-28">
                  <Avatar className="h-16 w-16 mb-2 ring-4 ring-chart-4">
                    <AvatarFallback className="bg-chart-4 text-white font-bold text-lg">
                      {top3[1].nickname.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <p className="font-medium text-sm truncate w-full text-center mb-2">
                    {top3[1].nickname}
                  </p>
                  <div className={`w-full ${PODIUM_HEIGHTS[0]} ${PODIUM_COLORS[0]} rounded-t-lg flex flex-col items-center justify-center`}>
                    <span className="text-white font-bold text-2xl">2</span>
                    <span className="text-white/80 text-xs">
                      {top3[1].score.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              {/* 1st Place */}
              {top3[0] && (
                <div className="flex flex-col items-center w-32">
                  <Crown className="h-8 w-8 text-chart-3 mb-1" />
                  <Avatar className="h-20 w-20 mb-2 ring-4 ring-chart-3">
                    <AvatarFallback className="bg-chart-3 text-white font-bold text-xl">
                      {top3[0].nickname.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <p className="font-medium truncate w-full text-center mb-2">
                    {top3[0].nickname}
                  </p>
                  <div className={`w-full ${PODIUM_HEIGHTS[1]} ${PODIUM_COLORS[1]} rounded-t-lg flex flex-col items-center justify-center`}>
                    <span className="text-white font-bold text-3xl">1</span>
                    <span className="text-white/80 text-sm">
                      {top3[0].score.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              {/* 3rd Place */}
              {top3[2] && (
                <div className="flex flex-col items-center w-28">
                  <Avatar className="h-16 w-16 mb-2 ring-4 ring-chart-5">
                    <AvatarFallback className="bg-chart-5 text-white font-bold text-lg">
                      {top3[2].nickname.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <p className="font-medium text-sm truncate w-full text-center mb-2">
                    {top3[2].nickname}
                  </p>
                  <div className={`w-full ${PODIUM_HEIGHTS[2]} ${PODIUM_COLORS[2]} rounded-t-lg flex flex-col items-center justify-center`}>
                    <span className="text-white font-bold text-2xl">3</span>
                    <span className="text-white/80 text-xs">
                      {top3[2].score.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Rest of Leaderboard */}
        {rest.length > 0 && (
          <Card className="max-w-lg mx-auto mb-8">
            <CardContent className="p-4">
              <div className="space-y-2">
                {rest.map((player, index) => (
                  <div
                    key={player.id}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      player.id === playerId ? "bg-accent" : ""
                    }`}
                  >
                    <span className="w-6 text-center font-bold text-muted-foreground">
                      {index + 4}
                    </span>
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {player.nickname.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="flex-1 font-medium truncate">
                      {player.nickname}
                    </span>
                    <div className="flex items-center gap-2">
                      {player.streak > 0 && (
                        <span className="text-xs text-chart-3 flex items-center gap-1">
                          <Zap className="h-3 w-3" />
                          {player.streak}
                        </span>
                      )}
                      <span className="font-bold">
                        {player.score.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {isHost ? (
            <>
              <Link href="/quizzes">
                <Button variant="outline" className="gap-2">
                  <Gamepad2 className="h-4 w-4" />
                  Host Another Game
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button className="gap-2">
                  <Home className="h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/join">
                <Button variant="outline" className="gap-2">
                  <Gamepad2 className="h-4 w-4" />
                  Play Again
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button className="gap-2">
                  <Home className="h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
