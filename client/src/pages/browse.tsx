import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { BookOpen, Gamepad2, Clock, Play, Search, BookMarked } from "lucide-react";
import { useState } from "react";
import type { Quiz } from "@shared/schema";

export default function BrowsePage() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: quizzes, isLoading } = useQuery<Quiz[]>({
    queryKey: ["/api/quizzes/available"],
  });

  const filteredQuizzes = quizzes?.filter(
    (q) =>
      q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.description?.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-bold flex items-center gap-3" data-testid="text-browse-title">
          <BookOpen className="h-8 w-8 text-primary" />
          Browse Lessons
        </h1>
        <p className="text-muted-foreground mt-1">
          Explore and join quizzes created by your teachers
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search quizzes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
          data-testid="input-search"
        />
      </div>

      {/* Quizzes Grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : filteredQuizzes.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredQuizzes.map((quiz) => (
            <Card key={quiz.id} className="flex flex-col hover-elevate" data-testid={`card-quiz-${quiz.id}`}>
              <CardHeader className="flex-1">
                <CardTitle className="line-clamp-2">{quiz.title}</CardTitle>
                <CardDescription className="line-clamp-2">{quiz.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Gamepad2 className="h-4 w-4" />
                    Quiz
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {(quiz.timePerQuestion || 30)} sec per question
                  </div>
                </div>
                <div className="space-y-2">
                  <Link href={`/browse/${quiz.id}/lesson`}>
                    <Button variant="default" className="w-full gap-2" data-testid={`button-read-lesson-${quiz.id}`}>
                      <BookMarked className="h-4 w-4" />
                      Read & Quiz
                    </Button>
                  </Link>
                  <Link href={`/quizzes/${quiz.id}`}>
                    <Button variant="outline" className="w-full gap-2" data-testid={`button-start-quiz-${quiz.id}`}>
                      <Play className="h-4 w-4" />
                      Quick Quiz
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
            <h3 className="font-display text-xl font-semibold mb-2">
              {searchTerm ? "No quizzes found" : "No quizzes available"}
            </h3>
            <p className="text-muted-foreground">
              {searchTerm
                ? "Try a different search term"
                : "Check back later for new quizzes from your teachers"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
