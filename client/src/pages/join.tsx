import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { joinGameSchema, type JoinGameInput } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ThemeToggle } from "@/components/theme-toggle";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { apiRequest } from "@/lib/queryClient";
import { Zap, Loader2, Gamepad2 } from "lucide-react";

export default function JoinGamePage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isJoining, setIsJoining] = useState(false);

  const form = useForm<JoinGameInput>({
    resolver: zodResolver(joinGameSchema),
    defaultValues: {
      gameCode: "",
      nickname: user?.name || "",
    },
  });

  const joinMutation = useMutation({
    mutationFn: async (data: JoinGameInput) => {
      setIsJoining(true);
      const response = await apiRequest("POST", "/api/sessions/join", data);
      return response.json();
    },
    onSuccess: (result) => {
      toast({
        title: "Joined game!",
        description: "Waiting for the host to start...",
      });
      setLocation(`/play/${result.sessionId}?playerId=${result.playerId}`);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to join",
        description: error.message || "Invalid game code or game already started",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsJoining(false);
    },
  });

  const onSubmit = (data: JoinGameInput) => {
    joinMutation.mutate({
      ...data,
      gameCode: data.gameCode.toUpperCase(),
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Zap className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="font-display text-xl font-bold">QuizBlitz</span>
            </div>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* Join Form */}
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-20 h-20 rounded-2xl bg-primary mx-auto mb-4 flex items-center justify-center">
              <Gamepad2 className="h-10 w-10 text-primary-foreground" />
            </div>
            <CardTitle className="font-display text-2xl" data-testid="text-join-title">
              Join a Game
            </CardTitle>
            <CardDescription>
              Enter the game code shown on the host's screen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="gameCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Game Code</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter 6-digit code"
                          className="h-16 text-center text-3xl font-bold tracking-widest uppercase"
                          maxLength={6}
                          data-testid="input-game-code"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="nickname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Nickname</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter a fun nickname"
                          className="h-12"
                          maxLength={20}
                          data-testid="input-nickname"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full h-14 text-lg font-semibold"
                  disabled={isJoining}
                  data-testid="button-join"
                >
                  {isJoining ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    "Join Game"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
