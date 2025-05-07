
import React, { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ShieldCheck, ArrowLeft, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { authService } from "@/services/authService";

const checkInSchema = z.object({
  firstName: z.string().min(2, { message: "First name is required" }),
  lastName: z.string().min(2, { message: "Last name is required" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().min(10, { message: "Please enter a valid phone number" }),
  hostName: z.string().min(2, { message: "Host name is required" }),
  purpose: z.string().min(5, { message: "Please provide the purpose of your visit" }),
});

type CheckInFormValues = z.infer<typeof checkInSchema>;

const GuestCheckIn = () => {
  const navigate = useNavigate();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<CheckInFormValues>({
    resolver: zodResolver(checkInSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      hostName: "",
      purpose: "",
    },
  });

  const onSubmit = async (values: CheckInFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Format the data for the backend
      const guestData = {
        name: `${values.firstName} ${values.lastName}`,
        email: values.email,
        phone: values.phone,
        hostName: values.hostName,
        purpose: values.purpose,
        checkInTime: new Date().toISOString()
      };
      
      // Submit to backend
      await authService.guestCheckIn(guestData);
      
      // Show submission success
      toast.success("Check-in successful", {
        description: "Your host has been notified of your arrival",
      });
      
      // Show the success screen
      setIsSubmitted(true);
    } catch (error) {
      console.error("Check-in error:", error);
      toast.error("Check-in failed", {
        description: "There was a problem submitting your information. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const goBack = () => {
    navigate("/login");
  };

  const handleNewCheckIn = () => {
    form.reset();
    setIsSubmitted(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col animate-fade-in">
      {/* Header */}
      <header className="bg-white shadow-sm py-4 px-6">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <span className="text-xl font-semibold">SecureGuard</span>
          </div>
          <Button variant="ghost" size="sm" onClick={goBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </Button>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-1 container max-w-5xl py-8 px-4">
        {!isSubmitted ? (
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">Visitor Check-In</h1>
              <p className="text-muted-foreground">
                Please fill in your details to check in to the facility
              </p>
            </div>
            
            <Card>
              <CardContent className="pt-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your first name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your last name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="your.email@example.com" type="email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="Your phone number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="hostName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Host Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Who are you here to see?" {...field} />
                          </FormControl>
                          <FormDescription>
                            Enter the name of the person you are visiting
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="purpose"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Purpose of Visit</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Please describe the purpose of your visit" 
                              className="resize-none" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Complete Check-In"
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="max-w-md mx-auto text-center space-y-6 py-8">
            <div className="bg-green-50 p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
              <svg
                className="w-10 h-10 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold">Check-In Successful!</h2>
            <p className="text-muted-foreground">
              Your host has been notified of your arrival. Please wait in the designated area.
            </p>
            <Button onClick={handleNewCheckIn}>New Check-In</Button>
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="py-6 border-t">
        <div className="container text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} SecureGuard. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default GuestCheckIn;
