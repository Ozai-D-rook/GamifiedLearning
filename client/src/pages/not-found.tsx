import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, HelpCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardContent className="p-8">
          <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-6 flex items-center justify-center">
            <HelpCircle className="h-10 w-10 text-muted-foreground" />
          </div>
          <h1 className="font-display text-3xl font-bold mb-2" data-testid="text-404-title">
            404
          </h1>
          <p className="text-muted-foreground mb-6">
            Oops! The page you're looking for doesn't exist.
          </p>
          <Link href="/">
            <Button className="gap-2" data-testid="button-go-home">
              <Home className="h-4 w-4" />
              Go Home
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
