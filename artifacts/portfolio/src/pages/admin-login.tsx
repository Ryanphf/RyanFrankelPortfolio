import { useAdminLogin, getGetAdminMeQueryKey, useGetAdminMe } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Lock } from "lucide-react";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { data: adminMe, isLoading: isMeLoading } = useGetAdminMe();
  const login = useAdminLogin();
  const { toast } = useToast();

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { password: "" },
  });

  useEffect(() => {
    if (!isMeLoading && adminMe?.isAdmin) {
      setLocation("/admin");
    }
  }, [adminMe, isMeLoading, setLocation]);

  const onSubmit = (data: LoginForm) => {
    login.mutate(
      { data: { password: data.password } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetAdminMeQueryKey() });
          toast({ title: "Logged in successfully" });
          setLocation("/admin");
        },
        onError: (err) => {
          toast({ 
            title: "Login failed", 
            description: "Invalid password", 
            variant: "destructive" 
          });
          form.reset({ password: "" });
        }
      }
    );
  };

  if (isMeLoading || adminMe?.isAdmin) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-pulse">Loading...</div></div>;
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-border/50">
        <CardHeader className="text-center pb-8">
          <div className="mx-auto w-12 h-12 bg-primary/10 flex items-center justify-center rounded-full mb-4">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-display">System Access</CardTitle>
          <CardDescription>Enter the administrative password to manage content.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} className="bg-muted/50" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={login.isPending}>
                {login.isPending ? "Authenticating..." : "Authenticate"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
