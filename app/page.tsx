"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { WaveBackground } from "@/components/ui/wave-background";
import { 
  Wand2,
  Mic2,
  Brain,
  FileJson,
  Zap,
  Shield,
  Github,
  Twitter,
  Menu
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#030303]">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-[#030303]/80 backdrop-blur-xl border-b border-[#1F1F1F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl font-bold text-white"
            >
              DataVox
              <span className="text-[#FF8A3C]">.</span>
            </motion.div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Button variant="ghost" className="text-[#919191] hover:text-white hover:bg-[#1F1F1F]">Features</Button>
              <Button variant="ghost" className="text-[#919191] hover:text-white hover:bg-[#1F1F1F]">Docs</Button>
              <Button variant="ghost" className="text-[#919191] hover:text-white hover:bg-[#1F1F1F]">Pricing</Button>
              <Link href="/login">
                <Button size="lg" className="bg-[#FF8A3C] text-black hover:bg-[#FF8A3C]/90">
                  Get Started
                </Button>
              </Link>
            </nav>

            {/* Mobile Navigation */}
            <div className="md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5 text-[#919191]" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-[#030303]/95 backdrop-blur-xl border-[#1F1F1F]">
                  <DropdownMenuItem className="text-[#919191] focus:text-white focus:bg-[#1F1F1F]">Features</DropdownMenuItem>
                  <DropdownMenuItem className="text-[#919191] focus:text-white focus:bg-[#1F1F1F]">Docs</DropdownMenuItem>
                  <DropdownMenuItem className="text-[#919191] focus:text-white focus:bg-[#1F1F1F]">Pricing</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        <WaveBackground />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-[#FF8A3C]/10 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-[#FFB224]/10 via-transparent to-transparent" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Transform Audio into<br />
              Structured Data<span className="text-[#FF8A3C]">.</span>
            </h1>
            <p className="text-xl md:text-2xl text-[#919191] mb-8 max-w-3xl mx-auto">
              Extract valuable insights from audio recordings using customizable templates powered by AI
            </p>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/login">
              <Button size="lg" className="bg-[#FF8A3C] text-black hover:bg-[#FF8A3C]/90">
                Get Started
              </Button>
            </Link>
            <Link href="https://www.assemblyai.com/docs" target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="border-[#1F1F1F] text-[#919191] hover:text-white hover:bg-[#1F1F1F]">
                View Documentation
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Section - Bento Box */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Powerful Features<span className="text-[#FF8A3C]">.</span>
            </h2>
            <p className="text-[#919191] text-lg">
              Everything you need to extract insights from audio data
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1, duration: 0.8 }}
                viewport={{ once: true }}
                className={`group relative ${index === 0 || index === 3 || index === 4 ? 'lg:col-span-2' : ''}`}
              >
                <Card className="h-full bg-[#0A0A0A] border-[#1F1F1F] hover:border-[#2F2F2F] transition-all overflow-hidden rounded-sm">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#FF8A3C]/5 to-[#FFB224]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative p-6">
                    <feature.icon className="h-10 w-10 mb-4 text-[#FF8A3C]" />
                    <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                    <p className="text-[#919191]">{feature.description}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1F1F1F] bg-[#030303]/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">DataVox<span className="text-[#FF8A3C]">.</span></h3>
              <p className="text-sm text-[#919191]">Transform audio recordings into structured data using AI</p>
            </div>
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-[#919191]">Product</h4>
              <ul className="space-y-2 text-sm text-[#919191]">
                <li className="hover:text-white cursor-pointer">Features</li>
                <li className="hover:text-white cursor-pointer">Documentation</li>
                <li className="hover:text-white cursor-pointer">Pricing</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-[#919191]">Company</h4>
              <ul className="space-y-2 text-sm text-[#919191]">
                <li className="hover:text-white cursor-pointer">About</li>
                <li className="hover:text-white cursor-pointer">Blog</li>
                <li className="hover:text-white cursor-pointer">Contact</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-[#919191]">Connect</h4>
              <div className="flex gap-4">
                <Github className="h-5 w-5 text-[#919191] hover:text-white cursor-pointer" />
                <Twitter className="h-5 w-5 text-[#919191] hover:text-white cursor-pointer" />
              </div>
            </div>
          </div>
          <Separator className="my-8 bg-[#1F1F1F]" />
          <div className="text-center text-sm text-[#919191]">
            2024 DataVox. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    title: "Custom Templates",
    description: "Create and customize templates for data extraction based on your specific needs. Perfect for research, interviews, and more.",
    icon: Wand2
  },
  {
    title: "High-Accuracy Transcription",
    description: "Powered by AssemblyAI's Universal-2 Speech-to-Text technology for industry-leading accuracy.",
    icon: Mic2
  },
  {
    title: "Intelligent Extraction",
    description: "Smart data extraction based on template fields using advanced LeMUR technology.",
    icon: Brain
  },
  {
    title: "Multiple Export Formats",
    description: "Export your structured data in various formats including CSV and JSON for seamless integration.",
    icon: FileJson
  },
  {
    title: "Real-time Processing",
    description: "Process your audio files quickly with live progress tracking and instant results.",
    icon: Zap
  },
  {
    title: "Enterprise Security",
    description: "Bank-grade security to keep your data safe and protected at all times.",
    icon: Shield
  }
];
