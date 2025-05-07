import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AuthLayout from "@/components/AuthLayout";
import { useAuth } from "@/hooks/useAuthProvider";
import { Loader2 } from "lucide-react";

// Form validation schema
const loginSchema = z.object({
  code: z.string().min(1, { message: "Please enter your guard code" }),
  password: z.string().min(1, { message: "Password is required" }),
});

const Login = () => {
  const navigate = useNavigate();
  const { login, loginAsGuest, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<"staff" | "guest">("staff");

  // Staff login form
  const staffForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      code: "",
      password: "",
    },
  });

  // Guest login form
  const guestForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      code: "",
      password: "",
    },
  });

  const handleStaffLogin = async (values: z.infer<typeof loginSchema>) => {
    const success = await login(values.code, values.password);
    
    if (success) {
      toast.success("Login successful", {
        description: "Welcome to Security Portal",
      });
      navigate("/");
    }
  };

  const handleGuestLogin = (values: z.infer<typeof loginSchema>) => {
    // For mock purposes, we'll just log them in as guest
    loginAsGuest();
    toast.success("Login successful", {
      description: "Welcome to the guest portal",
    });
    navigate("/guest-check-in");
  };

  const handleGuestCheckIn = () => {
    loginAsGuest();
    navigate("/guest-check-in");
  };

  return (
    <AuthLayout 
      title="Welcome back" 
      subtitle="Login to access the security portal"
    >
      <Tabs 
        defaultValue="staff" 
        className="w-full"
        onValueChange={(value) => setActiveTab(value as "staff" | "guest")}
      >
        <TabsList className="grid w-full grid-cols-1 mb-8">
          <TabsTrigger value="staff">Security Staff Login</TabsTrigger>
          {/* <TabsTrigger value="guest">Visitors</TabsTrigger> */}
        </TabsList>
        
        {/* Staff Login Form */}
        <TabsContent value="staff" className="animate-fade-in">
          <Form {...staffForm}>
            <form onSubmit={staffForm.handleSubmit(handleStaffLogin)} className="space-y-4">
              <FormField
                control={staffForm.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Guard Code</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Guard Code" 
                        type="text" 
                        autoComplete="username"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={staffForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Password" 
                        type="password" 
                        autoComplete="current-password"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full mt-4" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </form>
          </Form>
          
        </TabsContent>
        
        {/* Guest Login Form */}
        <TabsContent value="guest" className="animate-fade-in">
          <Form {...guestForm}>
            <form onSubmit={guestForm.handleSubmit(handleGuestLogin)} className="space-y-4">
              <FormField
                control={guestForm.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Code</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter your code" 
                        type="text" 
                        autoComplete="username"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={guestForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="••••••••" 
                        type="password" 
                        autoComplete="current-password"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full mt-4" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </form>
          </Form>
          
          <div className="mt-6 text-center">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              className="w-full mt-4"
              onClick={handleGuestCheckIn}
              disabled={isLoading}
            >
              Continue as guest
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </AuthLayout>
  );
};

export default Login;