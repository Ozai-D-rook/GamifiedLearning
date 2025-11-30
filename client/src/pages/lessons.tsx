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
import { BookOpen, Plus, MoreVertical, Trash2, Sparkles, Calendar } from "lucide-react";
import type { Lesson } from "@shared/schema";
import { format } from "date-fns";

export default function LessonsPage() {
  const { toast } = useToast();

  const { data: lessons, isLoading } = useQuery<Lesson[]>({
    queryKey: ["/api/lessons"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/lessons/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lessons"] });
      toast({ title: "Lesson deleted" });
    },
    onError: () => {
      toast({ title: "Failed to delete lesson", variant: "destructive" });
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold" data-testid="text-lessons-title">
            My Lessons
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your lesson content and generate quizzes
          </p>
        </div>
        <Link href="/lessons/new">
          <Button className="gap-2" data-testid="button-new-lesson">
            <Plus className="h-4 w-4" />
            New Lesson
          </Button>
        </Link>
      </div>

      {/* Lessons Grid */}
      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : lessons && lessons.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {lessons.map((lesson) => (
            <Card key={lesson.id} className="hover-elevate group" data-testid={`card-lesson-${lesson.id}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        data-testid={`button-lesson-menu-${lesson.id}`}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => deleteMutation.mutate(lesson.id)}
                        className="text-destructive"
                        data-testid={`button-delete-lesson-${lesson.id}`}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardTitle className="text-lg line-clamp-2 mt-3">{lesson.title}</CardTitle>
                {lesson.subject && (
                  <Badge variant="secondary" className="w-fit">
                    {lesson.subject}
                  </Badge>
                )}
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {lesson.content.slice(0, 150)}...
                </p>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {lesson.createdAt ? format(new Date(lesson.createdAt), "MMM d, yyyy") : "N/A"}
                  </div>
                  <Link href={`/lessons/${lesson.id}`}>
                    <Button size="sm" variant="outline" className="gap-1">
                      <Sparkles className="h-3 w-3" />
                      Generate Quiz
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
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display text-xl font-semibold mb-2">No lessons yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Create your first lesson by uploading or pasting your teaching content.
              Then generate AI-powered quizzes instantly.
            </p>
            <Link href="/lessons/new">
              <Button className="gap-2" data-testid="button-create-first-lesson">
                <Plus className="h-4 w-4" />
                Create Your First Lesson
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
