import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import {
  Trophy,
  Crown,
  Medal,
  Gamepad2,
  Target,
  TrendingUp,
} from "lucide-react";
import type { User } from "@shared/schema";

function LeaderboardRow({
  rank,
  user,
  value,
  label,
  isCurrentUser,
}: {
  rank: number;
  user: User;
  value: number;
  label: string;
  isCurrentUser: boolean;
}) {
  const getRankIcon = () => {
    if (rank === 1) return <Crown className="h-5 w-5 text-chart-3" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-chart-4" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-chart-5" />;
    return <span className="font-bold text-muted-foreground">{rank}</span>;
  };

  const getRankBg = () => {
    if (rank === 1) return "bg-chart-3/10";
    if (rank === 2) return "bg-chart-4/10";
    if (rank === 3) return "bg-chart-5/10";
    return "";
  };

  return (
    <div
      className={`flex items-center gap-4 p-4 rounded-lg ${getRankBg()} ${
        isCurrentUser ? "ring-2 ring-primary" : ""
      }`}
      data-testid={`leaderboard-row-${rank}`}
    >
      <div className="w-8 flex justify-center">{getRankIcon()}</div>
      <Avatar className="h-10 w-10">
        <AvatarFallback className="bg-primary text-primary-foreground font-bold">
          {user.name?.slice(0, 2).toUpperCase() || "U"}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">
          {user.name}
          {isCurrentUser && (
            <Badge variant="secondary" className="ml-2">You</Badge>
          )}
        </p>
        <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
      </div>
      <div className="text-right">
        <p className="font-bold text-lg">{value.toLocaleString()}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

export default function LeaderboardsPage() {
  const { user: currentUser } = useAuth();

  const { data: topScorers, isLoading: scorersLoading } = useQuery<User[]>({
    queryKey: ["/api/leaderboard/score"],
  });

  const { data: topPlayers, isLoading: playersLoading } = useQuery<User[]>({
    queryKey: ["/api/leaderboard/games"],
  });

  const { data: topWinners, isLoading: winnersLoading } = useQuery<User[]>({
    queryKey: ["/api/leaderboard/wins"],
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-bold flex items-center gap-3" data-testid="text-leaderboards-title">
          <Trophy className="h-8 w-8 text-chart-3" />
          Leaderboards
        </h1>
        <p className="text-muted-foreground mt-1">
          See how you stack up against other players
        </p>
      </div>

      {/* Stats Cards */}
      {currentUser && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-chart-3/10 flex items-center justify-center">
                <Trophy className="h-6 w-6 text-chart-3" />
              </div>
              <div>
                <p className="text-2xl font-bold">{currentUser.totalScore?.toLocaleString() || 0}</p>
                <p className="text-sm text-muted-foreground">Your Total Score</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Gamepad2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{currentUser.gamesPlayed || 0}</p>
                <p className="text-sm text-muted-foreground">Games Played</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-chart-2/10 flex items-center justify-center">
                <Target className="h-6 w-6 text-chart-2" />
              </div>
              <div>
                <p className="text-2xl font-bold">{currentUser.gamesWon || 0}</p>
                <p className="text-sm text-muted-foreground">Games Won</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Leaderboard Tabs */}
      <Tabs defaultValue="score" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="score" className="gap-2">
            <Trophy className="h-4 w-4" />
            Score
          </TabsTrigger>
          <TabsTrigger value="games" className="gap-2">
            <Gamepad2 className="h-4 w-4" />
            Games
          </TabsTrigger>
          <TabsTrigger value="wins" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Wins
          </TabsTrigger>
        </TabsList>

        <TabsContent value="score" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Top Scorers</CardTitle>
              <CardDescription>Players with the highest total scores</CardDescription>
            </CardHeader>
            <CardContent>
              {scorersLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-16" />
                  ))}
                </div>
              ) : topScorers && topScorers.length > 0 ? (
                <div className="space-y-2">
                  {topScorers.map((user, index) => (
                    <LeaderboardRow
                      key={user.id}
                      rank={index + 1}
                      user={user}
                      value={user.totalScore || 0}
                      label="points"
                      isCurrentUser={user.id === currentUser?.id}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No scores yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="games" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Most Active</CardTitle>
              <CardDescription>Players with the most games played</CardDescription>
            </CardHeader>
            <CardContent>
              {playersLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-16" />
                  ))}
                </div>
              ) : topPlayers && topPlayers.length > 0 ? (
                <div className="space-y-2">
                  {topPlayers.map((user, index) => (
                    <LeaderboardRow
                      key={user.id}
                      rank={index + 1}
                      user={user}
                      value={user.gamesPlayed || 0}
                      label="games"
                      isCurrentUser={user.id === currentUser?.id}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Gamepad2 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No games played yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wins" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Top Winners</CardTitle>
              <CardDescription>Players with the most victories</CardDescription>
            </CardHeader>
            <CardContent>
              {winnersLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-16" />
                  ))}
                </div>
              ) : topWinners && topWinners.length > 0 ? (
                <div className="space-y-2">
                  {topWinners.map((user, index) => (
                    <LeaderboardRow
                      key={user.id}
                      rank={index + 1}
                      user={user}
                      value={user.gamesWon || 0}
                      label="wins"
                      isCurrentUser={user.id === currentUser?.id}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Crown className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No winners yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
