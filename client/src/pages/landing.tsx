import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { Zap, Users, Trophy, Brain, Gamepad2, Sparkles } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold" data-testid="text-logo">QuizBlitz</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost" data-testid="link-login">Log in</Button>
            </Link>
            <Link href="/register">
              <Button data-testid="link-register">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/10" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              AI-Powered Learning Games
            </div>
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6" data-testid="text-hero-title">
              Make Learning
              <span className="text-primary block">Unforgettable</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto" data-testid="text-hero-subtitle">
              Create engaging quizzes from any lesson content with AI. Host live Kahoot-style games that make students excited to learn.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="h-14 px-8 text-lg font-semibold" data-testid="button-get-started">
                  Start Teaching Free
                </Button>
              </Link>
              <Link href="/join">
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-semibold" data-testid="button-join-game">
                  <Gamepad2 className="mr-2 h-5 w-5" />
                  Join a Game
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4" data-testid="text-features-title">
              Everything you need for engaging lessons
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              From lesson upload to live gameplay, QuizBlitz handles it all
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover-elevate">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-2">AI Quiz Generation</h3>
                <p className="text-muted-foreground">
                  Paste your lesson content and let AI create engaging multiple-choice questions instantly.
                </p>
              </CardContent>
            </Card>
            <Card className="hover-elevate">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-chart-2/10 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-chart-2" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-2">Live Multiplayer</h3>
                <p className="text-muted-foreground">
                  Students join with a code and compete in real-time. Watch scores update live on the leaderboard.
                </p>
              </CardContent>
            </Card>
            <Card className="hover-elevate">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-chart-3/10 flex items-center justify-center mb-4">
                  <Trophy className="h-6 w-6 text-chart-3" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-2">Gamification</h3>
                <p className="text-muted-foreground">
                  Earn badges, climb leaderboards, and build streaks. Make every lesson an adventure.
                </p>
              </CardContent>
            </Card>
            <Card className="hover-elevate">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-chart-4/10 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-chart-4" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-2">Instant Results</h3>
                <p className="text-muted-foreground">
                  See who's winning, track progress, and celebrate victories with live animations.
                </p>
              </CardContent>
            </Card>
            <Card className="hover-elevate">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-chart-5/10 flex items-center justify-center mb-4">
                  <Gamepad2 className="h-6 w-6 text-chart-5" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-2">Mobile Ready</h3>
                <p className="text-muted-foreground">
                  Play on any device. Install as an app for the best experience on tablets and phones.
                </p>
              </CardContent>
            </Card>
            <Card className="hover-elevate">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-2">Easy to Use</h3>
                <p className="text-muted-foreground">
                  No training needed. Upload a lesson, generate a quiz, share the code. It's that simple.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4" data-testid="text-how-title">
              How QuizBlitz Works
            </h2>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  1
                </div>
                <h3 className="font-display text-xl font-semibold mb-2">Create</h3>
                <p className="text-muted-foreground">
                  Upload lesson content or paste text. AI generates questions in seconds.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-chart-2 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  2
                </div>
                <h3 className="font-display text-xl font-semibold mb-2">Host</h3>
                <p className="text-muted-foreground">
                  Start a live game session. Share the 6-digit code with your class.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-chart-3 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  3
                </div>
                <h3 className="font-display text-xl font-semibold mb-2">Play</h3>
                <p className="text-muted-foreground">
                  Students compete live. Fastest correct answers earn the most points!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Ready to transform your classroom?
          </h2>
          <p className="text-primary-foreground/80 text-lg mb-8 max-w-xl mx-auto">
            Join thousands of teachers making learning fun with QuizBlitz
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary" className="h-14 px-8 text-lg font-semibold" data-testid="button-cta-signup">
              Create Your Free Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Zap className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-display font-bold">QuizBlitz</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Made with AI-powered learning in mind
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
