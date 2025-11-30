import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Zap,
  LayoutDashboard,
  BookOpen,
  Gamepad2,
  Trophy,
  Award,
  LogOut,
  ChevronUp,
  Plus,
  Play,
  Users,
} from "lucide-react";

const teacherMenuItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "My Lessons", url: "/lessons", icon: BookOpen },
  { title: "My Quizzes", url: "/quizzes", icon: Gamepad2 },
  { title: "Students", url: "/students", icon: Users },
  { title: "Leaderboards", url: "/leaderboards", icon: Trophy },
];

const studentMenuItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Browse", url: "/browse", icon: BookOpen },
  { title: "Join Game", url: "/join", icon: Play },
  { title: "My Badges", url: "/badges", icon: Award },
  { title: "Leaderboards", url: "/leaderboards", icon: Trophy },
];

export function AppSidebar() {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const isTeacher = user?.role === "teacher";
  const menuItems = isTeacher ? teacherMenuItems : studentMenuItems;

  const handleLogout = async () => {
    await logout();
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Link href="/dashboard">
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold">QuizBlitz</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {/* Quick Actions */}
        {isTeacher && (
          <SidebarGroup>
            <SidebarGroupContent className="p-2">
              <Link href="/lessons/new">
                <Button className="w-full justify-start gap-2" data-testid="button-new-lesson">
                  <Plus className="h-4 w-4" />
                  New Lesson
                </Button>
              </Link>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                  >
                    <Link href={item.url} data-testid={`link-${item.title.toLowerCase().replace(" ", "-")}`}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-2">
        <div className="flex items-center justify-between mb-2 px-2">
          <ThemeToggle />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 h-auto py-2"
              data-testid="button-user-menu"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {user?.name ? getInitials(user.name) : "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
              </div>
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              <span>Score: {user?.totalScore?.toLocaleString() || 0}</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-2">
              <Gamepad2 className="h-4 w-4" />
              <span>Games: {user?.gamesPlayed || 0}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="flex items-center gap-2 text-destructive"
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
