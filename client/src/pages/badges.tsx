import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth-context";
import {
  Award,
  Trophy,
  Zap,
  Target,
  Flame,
  Star,
  Crown,
  Medal,
  Rocket,
  Shield,
  Lock,
} from "lucide-react";
import type { Badge, UserBadge } from "@shared/schema";

const BADGE_ICONS: Record<string, any> = {
  trophy: Trophy,
  zap: Zap,
  target: Target,
  flame: Flame,
  star: Star,
  crown: Crown,
  medal: Medal,
  rocket: Rocket,
  shield: Shield,
  award: Award,
};

const CATEGORY_COLORS: Record<string, string> = {
  streak: "bg-chart-3/10 text-chart-3",
  score: "bg-chart-4/10 text-chart-4",
  games: "bg-primary/10 text-primary",
  accuracy: "bg-chart-2/10 text-chart-2",
};

function BadgeCard({
  badge,
  earned,
  earnedAt,
}: {
  badge: Badge;
  earned: boolean;
  earnedAt?: Date | null;
}) {
  const IconComponent = BADGE_ICONS[badge.icon] || Award;
  const colorClass = CATEGORY_COLORS[badge.category] || "bg-muted text-muted-foreground";

  return (
    <Card
      className={`relative ${earned ? "" : "opacity-50"}`}
      data-testid={`badge-${badge.id}`}
    >
      <CardContent className="p-6 text-center">
        {!earned && (
          <div className="absolute top-2 right-2">
            <Lock className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
        <div
          className={`w-16 h-16 rounded-2xl ${colorClass} flex items-center justify-center mx-auto mb-4`}
        >
          <IconComponent className="h-8 w-8" />
        </div>
        <h3 className="font-display font-semibold mb-1">{badge.name}</h3>
        <p className="text-sm text-muted-foreground">{badge.description}</p>
        {earned && earnedAt && (
          <p className="text-xs text-muted-foreground mt-2">
            Earned {new Date(earnedAt).toLocaleDateString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default function BadgesPage() {
  const { user } = useAuth();

  const { data: allBadges, isLoading: badgesLoading } = useQuery<Badge[]>({
    queryKey: ["/api/badges"],
  });

  const { data: userBadges, isLoading: userBadgesLoading } = useQuery<UserBadge[]>({
    queryKey: ["/api/badges/user"],
    enabled: !!user,
  });

  const earnedBadgeIds = new Set(userBadges?.map((ub) => ub.badgeId) || []);
  const earnedCount = earnedBadgeIds.size;
  const totalCount = allBadges?.length || 0;

  const groupedBadges = allBadges?.reduce((acc, badge) => {
    if (!acc[badge.category]) {
      acc[badge.category] = [];
    }
    acc[badge.category].push(badge);
    return acc;
  }, {} as Record<string, Badge[]>);

  const categoryLabels: Record<string, string> = {
    streak: "Streak Achievements",
    score: "Score Milestones",
    games: "Game Participation",
    accuracy: "Accuracy Awards",
  };

  if (badgesLoading || userBadgesLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-bold flex items-center gap-3" data-testid="text-badges-title">
          <Award className="h-8 w-8 text-chart-3" />
          My Badges
        </h1>
        <p className="text-muted-foreground mt-1">
          Collect badges by achieving milestones and showing off your skills
        </p>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-chart-3 to-chart-4 flex items-center justify-center">
              <Award className="h-10 w-10 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-display text-2xl font-bold">
                {earnedCount} / {totalCount}
              </h3>
              <p className="text-muted-foreground">Badges Collected</p>
              <div className="w-full h-2 bg-muted rounded-full mt-3">
                <div
                  className="h-full bg-gradient-to-r from-chart-3 to-chart-4 rounded-full transition-all"
                  style={{
                    width: totalCount > 0 ? `${(earnedCount / totalCount) * 100}%` : "0%",
                  }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Badge Categories */}
      {groupedBadges &&
        Object.entries(groupedBadges).map(([category, badges]) => (
          <div key={category}>
            <h2 className="font-display text-xl font-semibold mb-4">
              {categoryLabels[category] || category}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {badges.map((badge) => {
                const userBadge = userBadges?.find((ub) => ub.badgeId === badge.id);
                return (
                  <BadgeCard
                    key={badge.id}
                    badge={badge}
                    earned={earnedBadgeIds.has(badge.id)}
                    earnedAt={userBadge?.earnedAt}
                  />
                );
              })}
            </div>
          </div>
        ))}

      {/* Empty State */}
      {(!allBadges || allBadges.length === 0) && (
        <Card className="py-16">
          <CardContent className="text-center">
            <Award className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display text-xl font-semibold mb-2">No badges available</h3>
            <p className="text-muted-foreground">
              Check back later for new achievements to unlock!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
