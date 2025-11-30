import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme-provider";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { DashboardLayout } from "@/components/dashboard-layout";

import LandingPage from "@/pages/landing";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import DashboardPage from "@/pages/dashboard";
import LessonsPage from "@/pages/lessons";
import NewLessonPage from "@/pages/lesson-new";
import LessonDetailPage from "@/pages/lesson-detail";
import QuizzesPage from "@/pages/quizzes";
import QuizDetailPage from "@/pages/quiz-detail";
import BrowsePage from "@/pages/browse";
import StudentsPage from "@/pages/students";
import JoinGamePage from "@/pages/join";
import HostLobbyPage from "@/pages/host-lobby";
import HostGamePage from "@/pages/host-game";
import PlayGamePage from "@/pages/play-game";
import GameResultsPage from "@/pages/game-results";
import LeaderboardsPage from "@/pages/leaderboards";
import BadgesPage from "@/pages/badges";
import NotFound from "@/pages/not-found";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  return (
    <DashboardLayout>
      <Component />
    </DashboardLayout>
  );
}

function PublicOnlyRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (user) {
    return <Redirect to="/dashboard" />;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={LandingPage} />
      <Route path="/login">
        <PublicOnlyRoute component={LoginPage} />
      </Route>
      <Route path="/register">
        <PublicOnlyRoute component={RegisterPage} />
      </Route>
      <Route path="/join" component={JoinGamePage} />

      {/* Protected dashboard routes */}
      <Route path="/dashboard">
        <ProtectedRoute component={DashboardPage} />
      </Route>
      <Route path="/lessons">
        <ProtectedRoute component={LessonsPage} />
      </Route>
      <Route path="/lessons/new">
        <ProtectedRoute component={NewLessonPage} />
      </Route>
      <Route path="/lessons/:id">
        <ProtectedRoute component={LessonDetailPage} />
      </Route>
      <Route path="/quizzes">
        <ProtectedRoute component={QuizzesPage} />
      </Route>
      <Route path="/quizzes/:id">
        <ProtectedRoute component={QuizDetailPage} />
      </Route>
      <Route path="/browse">
        <ProtectedRoute component={BrowsePage} />
      </Route>
      <Route path="/students">
        <ProtectedRoute component={StudentsPage} />
      </Route>
      <Route path="/leaderboards">
        <ProtectedRoute component={LeaderboardsPage} />
      </Route>
      <Route path="/badges">
        <ProtectedRoute component={BadgesPage} />
      </Route>

      {/* Game routes (special handling) */}
      <Route path="/host/:id" component={HostLobbyPage} />
      <Route path="/host/:id/play" component={HostGamePage} />
      <Route path="/host/:id/results" component={GameResultsPage} />
      <Route path="/play/:id" component={PlayGamePage} />
      <Route path="/play/:id/results" component={GameResultsPage} />

      {/* 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="quizblitz-theme">
        <TooltipProvider>
          <AuthProvider>
            <Router />
            <Toaster />
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
