"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast"
import { Loader2, Info } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import storage from "@/lib/storage";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    apiToken: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate form
    if (!formData.username || !formData.apiToken) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all fields",
      });
      setIsLoading(false);
      return;
    }

    try {
      // Store API token in sessionStorage (will be cleared when tab is closed)
      sessionStorage.setItem("assemblyAiToken", formData.apiToken);
      
      // Store username and initialize user data in IndexedDB
      await storage.setItem("username", formData.username);
      
      // Initialize empty arrays for templates and processes if they don't exist
      const templates = await storage.getItem<any[]>(`${formData.username}_templates`);
      if (!templates) {
        await storage.setItem(`${formData.username}_templates`, []);
      }
      
      const processes = await storage.getItem<any[]>(`${formData.username}_processes`);
      if (!processes) {
        await storage.setItem(`${formData.username}_processes`, []);
      }
      
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
      console.error('Login error:', error);
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
            Sign in to continue to AudioNsight
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-[#919191]">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="johndoe"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="bg-[#0F0F0F] border-[#1F1F1F] text-white placeholder:text-[#919191]"
              autoComplete="off"
              spellCheck="false"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="apiToken" className="text-[#919191]">AssemblyAI API Token</Label>
            <Input
              id="apiToken"
              type="password"
              placeholder="••••••••"
              value={formData.apiToken}
              onChange={(e) => setFormData({ ...formData, apiToken: e.target.value })}
              className="bg-[#0F0F0F] border-[#1F1F1F] text-white placeholder:text-[#919191]"
              autoComplete="off"
              spellCheck="false"
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

        <div className="mt-6 space-y-4">
          <Separator className="bg-[#1F1F1F]" />
          
          <div className="space-y-4 text-sm text-[#919191]">
            <div className="flex gap-2">
              <Info className="h-4 w-4 flex-shrink-0 mt-1" />
              <p>
                Your API token is stored securely in your browser's session storage and is automatically cleared when you close your browser. It is never transmitted to any external servers.
              </p>
            </div>
            
            <div className="text-xs space-y-2">
              <p className="font-medium text-[#919191]">Terms and Conditions:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>This application is provided "as is" without any warranties of any kind.</li>
                <li>We are not responsible for any data loss or damages that may occur while using this application.</li>
                <li>Your data is stored locally in your browser and we do not maintain any backups.</li>
                <li>By using this application, you agree to these terms and conditions.</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
