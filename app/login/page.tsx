"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    apiToken: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate form
    if (!formData.email || !formData.password || !formData.apiToken) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all fields",
      });
      setIsLoading(false);
      return;
    }

    // Check credentials
    if (formData.email !== "admin@example.com" || formData.password !== "password@123") {
      toast({
        variant: "destructive",
        title: "Invalid credentials",
        description: "Please check your email and password",
      });
      setIsLoading(false);
      return;
    }

    try {
      // Store API token in sessionStorage (will be cleared when tab is closed)
      sessionStorage.setItem("assemblyAiToken", formData.apiToken);
      
      toast({
        title: "Success",
        description: "Logged in successfully",
      });

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030303] flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 bg-[#0A0A0A] border-[#1F1F1F]">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">
            Welcome back<span className="text-[#FF8A3C]">.</span>
          </h1>
          <p className="text-[#919191]">
            Sign in to continue to DataVox
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-[#919191]">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="bg-[#0F0F0F] border-[#1F1F1F] text-white placeholder:text-[#919191]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-[#919191]">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="bg-[#0F0F0F] border-[#1F1F1F] text-white placeholder:text-[#919191]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="apiToken" className="text-[#919191]">AssemblyAI API Token</Label>
            <Input
              id="apiToken"
              type="password"
              placeholder="Enter your AssemblyAI API token"
              value={formData.apiToken}
              onChange={(e) => setFormData({ ...formData, apiToken: e.target.value })}
              className="bg-[#0F0F0F] border-[#1F1F1F] text-white placeholder:text-[#919191]"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-[#FF8A3C] text-black hover:bg-[#FF8A3C]/90"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
}
