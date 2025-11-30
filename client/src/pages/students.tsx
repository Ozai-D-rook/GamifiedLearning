import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  Search,
  Trash2,
  Mail,
  Trophy,
  Gamepad2,
} from "lucide-react";
import type { User } from "@shared/schema";

export default function StudentsPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: students, isLoading } = useQuery<User[]>({
    queryKey: ["/api/students"],
  });

  const deleteStudentMutation = useMutation({
    mutationFn: async (studentId: string) => {
      const response = await apiRequest("DELETE", `/api/students/${studentId}`, {});
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Student account deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete student account",
        variant: "destructive",
      });
    },
  });

  const filteredStudents = students?.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-bold flex items-center gap-3" data-testid="text-students-title">
          <Users className="h-8 w-8 text-primary" />
          Manage Students
        </h1>
        <p className="text-muted-foreground mt-1">
          View and manage student accounts in your platform
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
          data-testid="input-search-students"
        />
      </div>

      {/* Students Table */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : filteredStudents.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {filteredStudents.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
                  data-testid={`row-student-${student.id}`}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                      {getInitials(student.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{student.name}</p>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      {student.email}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-right">
                      <p className="font-semibold flex items-center gap-1">
                        <Trophy className="h-4 w-4" />
                        {student.totalScore || 0}
                      </p>
                      <p className="text-xs text-muted-foreground">points</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold flex items-center gap-1">
                        <Gamepad2 className="h-4 w-4" />
                        {student.gamesPlayed || 0}
                      </p>
                      <p className="text-xs text-muted-foreground">games</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this student account?")) {
                        deleteStudentMutation.mutate(student.id);
                      }
                    }}
                    data-testid={`button-delete-student-${student.id}`}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display text-xl font-semibold mb-2">
              {searchTerm ? "No students found" : "No students yet"}
            </h3>
            <p className="text-muted-foreground">
              {searchTerm
                ? "Try a different search term"
                : "Students will appear here once they create accounts"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
