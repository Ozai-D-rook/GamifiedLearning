import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Gamepad2,
  MoreVertical,
  Trash2,
  Play,
  Clock,
  HelpCircle,
  Calendar,
} from "lucide-react";
import type { Quiz } from "@shared/schema";
import { format } from "date-fns";

export default function QuizzesPage() {
  const { toast } = useToast();

  const { data: quizzes, isLoading } = useQuery<Quiz[]>({
    queryKey: ["/api/quizzes"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/quizzes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quizzes"] });
      toast({ title: "Quiz deleted" });
    },
    onError: () => {
      toast({ title: "Failed to delete quiz", variant: "destructive" });
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-bold" data-testid="text-quizzes-title">
          My Quizzes
        </h1>
        <p className="text-muted-foreground mt-1">
          Host live games or edit your AI-generated quizzes
        </p>
      </div>

      {/* Quizzes Grid */}
      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : quizzes && quizzes.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((quiz) => (
            <Card key={quiz.id} className="hover-elevate group" data-testid={`card-quiz-${quiz.id}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="w-12 h-12 rounded-lg bg-chart-2/10 flex items-center justify-center shrink-0">
                    <Gamepad2 className="h-6 w-6 text-chart-2" />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        data-testid={`button-quiz-menu-${quiz.id}`}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => deleteMutation.mutate(quiz.id)}
                        className="text-destructive"
                        data-testid={`button-delete-quiz-${quiz.id}`}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardTitle className="text-lg line-clamp-2 mt-3">{quiz.title}</CardTitle>
                {quiz.description && (
                  <CardDescription className="line-clamp-2">
                    {quiz.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {quiz.timePerQuestion}s
                  </span>
                  <span className="flex items-center gap-1">
                    <HelpCircle className="h-4 w-4" />
                    Questions
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {quiz.createdAt ? format(new Date(quiz.createdAt), "MMM d") : "N/A"}
                  </div>
                  <Link href={`/quizzes/${quiz.id}`}>
                    <Button size="sm" className="gap-1" data-testid={`button-host-quiz-${quiz.id}`}>
                      <Play className="h-4 w-4" />
                      Host Game
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="py-16">
          <CardContent className="text-center">
            <Gamepad2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display text-xl font-semibold mb-2">No quizzes yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Create a lesson first, then use AI to generate engaging quiz questions.
            </p>
            <Link href="/lessons/new">
              <Button className="gap-2" data-testid="button-create-lesson">
                Create a Lesson First
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
