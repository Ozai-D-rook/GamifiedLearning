import { useAuth } from "@/lib/auth-context";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import {
  BookOpen,
  Gamepad2,
  Trophy,
  Users,
  Plus,
  Play,
  Award,
  TrendingUp,
  Clock,
  Target,
} from "lucide-react";
import type { Lesson, Quiz, GameSession } from "@shared/schema";

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  color,
}: {
  title: string;
  value: string | number;
  description?: string;
  icon: any;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center shrink-0`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TeacherDashboard() {
  const { data: lessons, isLoading: lessonsLoading } = useQuery<Lesson[]>({
    queryKey: ["/api/lessons"],
  });

  const { data: quizzes, isLoading: quizzesLoading } = useQuery<Quiz[]>({
    queryKey: ["/api/quizzes"],
  });

  const { data: sessions, isLoading: sessionsLoading } = useQuery<GameSession[]>({
    queryKey: ["/api/sessions/recent"],
  });

  const totalLessons = lessons?.length || 0;
  const totalQuizzes = quizzes?.length || 0;
  const activeSessions = sessions?.filter((s) => s.status === "playing").length || 0;
  const totalPlayers = sessions?.reduce((acc, s) => acc + (s as any).playerCount || 0, 0) || 0;

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold" data-testid="text-dashboard-title">
            Teacher Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Create lessons, generate quizzes, and engage your students
          </p>
        </div>
        <Link href="/lessons/new">
          <Button size="lg" className="gap-2" data-testid="button-create-lesson">
            <Plus className="h-5 w-5" />
            Create Lesson
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Lessons"
          value={lessonsLoading ? "-" : totalLessons}
          icon={BookOpen}
          color="bg-primary"
        />
        <StatCard
          title="Quizzes Created"
          value={quizzesLoading ? "-" : totalQuizzes}
          icon={Gamepad2}
          color="bg-chart-2"
        />
        <StatCard
          title="Active Games"
          value={sessionsLoading ? "-" : activeSessions}
          icon={Play}
          color="bg-chart-3"
        />
        <StatCard
          title="Total Players"
          value={sessionsLoading ? "-" : totalPlayers}
          icon={Users}
          color="bg-chart-4"
        />
      </div>

      {/* Recent Lessons & Quizzes */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Lessons */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg">Recent Lessons</CardTitle>
              <CardDescription>Your latest lesson content</CardDescription>
            </div>
            <Link href="/lessons">
              <Button variant="ghost" size="sm">View all</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {lessonsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : lessons && lessons.length > 0 ? (
              <div className="space-y-3">
                {lessons.slice(0, 3).map((lesson) => (
                  <Link key={lesson.id} href={`/lessons/${lesson.id}`}>
                    <div className="flex items-center gap-3 p-3 rounded-lg border hover-elevate cursor-pointer">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <BookOpen className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{lesson.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {lesson.subject || "No subject"}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-3">No lessons yet</p>
                <Link href="/lessons/new">
                  <Button size="sm">Create your first lesson</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Quizzes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg">Recent Quizzes</CardTitle>
              <CardDescription>Ready to play with your class</CardDescription>
            </div>
            <Link href="/quizzes">
              <Button variant="ghost" size="sm">View all</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {quizzesLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : quizzes && quizzes.length > 0 ? (
              <div className="space-y-3">
                {quizzes.slice(0, 3).map((quiz) => (
                  <Link key={quiz.id} href={`/quizzes/${quiz.id}`}>
                    <div className="flex items-center gap-3 p-3 rounded-lg border hover-elevate cursor-pointer">
                      <div className="w-10 h-10 rounded-lg bg-chart-2/10 flex items-center justify-center shrink-0">
                        <Gamepad2 className="h-5 w-5 text-chart-2" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{quiz.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {quiz.timePerQuestion}s per question
                        </p>
                      </div>
                      <Button size="sm" variant="outline" className="shrink-0">
                        <Play className="h-4 w-4 mr-1" />
                        Host
                      </Button>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Gamepad2 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-3">No quizzes yet</p>
                <p className="text-xs text-muted-foreground">
                  Create a lesson first, then generate a quiz
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StudentDashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold" data-testid="text-dashboard-title">
            Welcome, {user?.name?.split(" ")[0]}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Ready to learn? Join a game or check your achievements
          </p>
        </div>
        <Link href="/join">
          <Button size="lg" className="gap-2" data-testid="button-join-game">
            <Play className="h-5 w-5" />
            Join Game
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Score"
          value={user?.totalScore?.toLocaleString() || 0}
          icon={Trophy}
          color="bg-chart-3"
        />
        <StatCard
          title="Games Played"
          value={user?.gamesPlayed || 0}
          icon={Gamepad2}
          color="bg-primary"
        />
        <StatCard
          title="Games Won"
          value={user?.gamesWon || 0}
          icon={Award}
          color="bg-chart-4"
        />
        <StatCard
          title="Win Rate"
          value={
            user?.gamesPlayed
              ? `${Math.round(((user?.gamesWon || 0) / user.gamesPlayed) * 100)}%`
              : "0%"
          }
          icon={TrendingUp}
          color="bg-chart-2"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="hover-elevate cursor-pointer">
          <Link href="/join">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 rounded-2xl bg-primary mx-auto mb-4 flex items-center justify-center">
                <Play className="h-10 w-10 text-primary-foreground" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">Join a Game</h3>
              <p className="text-muted-foreground">
                Enter a game code to join a live quiz session
              </p>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover-elevate cursor-pointer">
          <Link href="/badges">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 rounded-2xl bg-chart-3 mx-auto mb-4 flex items-center justify-center">
                <Award className="h-10 w-10 text-white" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">My Badges</h3>
              <p className="text-muted-foreground">
                View your achievements and earned badges
              </p>
            </CardContent>
          </Link>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tips for Success</CardTitle>
          <CardDescription>Make the most of your learning</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-chart-5/10 flex items-center justify-center shrink-0">
                <Clock className="h-5 w-5 text-chart-5" />
              </div>
              <div>
                <p className="font-medium text-sm">Answer Fast</p>
                <p className="text-xs text-muted-foreground">
                  Quick correct answers earn more points
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-chart-2/10 flex items-center justify-center shrink-0">
                <Target className="h-5 w-5 text-chart-2" />
              </div>
              <div>
                <p className="font-medium text-sm">Stay Accurate</p>
                <p className="text-xs text-muted-foreground">
                  Build streaks for bonus points
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-chart-4/10 flex items-center justify-center shrink-0">
                <Trophy className="h-5 w-5 text-chart-4" />
              </div>
              <div>
                <p className="font-medium text-sm">Climb the Board</p>
                <p className="text-xs text-muted-foreground">
                  Compete to reach the top of leaderboards
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function DashboardPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return user?.role === "teacher" ? <TeacherDashboard /> : <StudentDashboard />;
}
