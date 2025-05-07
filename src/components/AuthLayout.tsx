
import React from "react";
import { ShieldCheck } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ 
  children, 
  title, 
  subtitle 
}) => {
  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-background animate-fade-in">
      {/* Left side - Branding */}
      <div className="w-full md:w-1/2 bg-blue-gradient flex flex-col justify-center items-center p-8 md:p-16">
        <div className="flex flex-col items-center text-white max-w-md">
          <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mb-8 shadow-glass animate-pulse-subtle">
            <ShieldCheck className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight text-center">Premier Security Portal</h1>
          <p className="text-lg md:text-xl opacity-90 text-center">
            Advanced security portal for visitor management and staff operations
          </p>
        </div>
      </div>
      
      {/* Right side - Authentication forms */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8 md:p-16 animate-fade-in" style={{ animationDelay: "0.2s" }}>
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-semibold mb-2 text-center">{title}</h2>
          {subtitle && <p className="text-muted-foreground mb-8 text-center">{subtitle}</p>}
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
