import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@shared/schema";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme-toggle";
import { useToast } from "@/hooks/use-toast";
import { Zap, Loader2, GraduationCap, Users } from "lucide-react";

export default function RegisterPage() {
  const [, setLocation] = useLocation();
  const { register } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
      role: "student",
    },
  });

  async function onSubmit(data: RegisterInput) {
    setIsLoading(true);
    try {
      await register(data.email, data.password, data.name, data.role);
      toast({
        title: "Account created!",
        description: "Welcome to QuizBlitz. Let's get started!",
      });
      setLocation("/dashboard");
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

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

      {/* Register Form */}
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="font-display text-2xl" data-testid="text-register-title">Create your account</CardTitle>
            <CardDescription>Join QuizBlitz and start learning today</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Your full name"
                          className="h-12"
                          data-testid="input-name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          className="h-12"
                          data-testid="input-email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="At least 6 characters"
                          className="h-12"
                          data-testid="input-password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>I am a...</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid grid-cols-2 gap-4"
                        >
                          <div>
                            <RadioGroupItem
                              value="teacher"
                              id="teacher"
                              className="peer sr-only"
                            />
                            <Label
                              htmlFor="teacher"
                              className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-card p-4 hover-elevate cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-accent"
                              data-testid="radio-teacher"
                            >
                              <GraduationCap className="mb-2 h-6 w-6" />
                              <span className="font-medium">Teacher</span>
                            </Label>
                          </div>
                          <div>
                            <RadioGroupItem
                              value="student"
                              id="student"
                              className="peer sr-only"
                            />
                            <Label
                              htmlFor="student"
                              className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-card p-4 hover-elevate cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-accent"
                              data-testid="radio-student"
                            >
                              <Users className="mb-2 h-6 w-6" />
                              <span className="font-medium">Student</span>
                            </Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold"
                  disabled={isLoading}
                  data-testid="button-register"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create account"
                  )}
                </Button>
              </form>
            </Form>
            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link href="/login">
                <span className="text-primary hover:underline cursor-pointer" data-testid="link-login">
                  Sign in
                </span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
