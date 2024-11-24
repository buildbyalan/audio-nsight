'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  Bell, 
  Settings, 
  ChevronDown, 
  LayoutDashboard, 
  FileText,
  Wand2,
  User
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from 'react';
import storage from '@/lib/storage';

const navigation = [
  { 
    name: 'Dashboard', 
    href: '/dashboard',
    icon: LayoutDashboard
  },
  { 
    name: 'Templates', 
    href: '/templates',
    icon: FileText
  },
  { 
    name: 'AI Lab', 
    href: '/ai-lab',
    icon: Wand2,
    badge: 'Beta'
  },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [username, setUsername] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadUsername = async () => {
      try {
        // Initialize storage first
        await storage.init()
        
        const storedUsername = await storage.getItem<string>('username')
        if (storedUsername) {
          setUsername(storedUsername)
        }
      } catch (error) {
        console.error('Error loading username:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadUsername()
  }, [])

  const handleLogout = async () => {
    try {
      await storage.init()
      sessionStorage.removeItem('assemblyAiToken')
      await storage.removeItem('username')
      router.push('/login')
    } catch (error) {
      console.error('Error during logout:', error)
    }
  }
  
  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-900/95 backdrop-blur supports-[backdrop-filter]:bg-zinc-900/80">
      <div className="container px-4 h-16 max-w-screen-2xl mx-auto">
        <div className="flex h-full items-center justify-between">
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="relative w-8 h-8">
                <div className="absolute inset-0 bg-gradient-to-br from-[#FF8A3C] to-[#FF5F3C] rounded-lg transform rotate-3"></div>
                <div className="absolute inset-0 bg-black rounded-lg flex items-center justify-center">
                  <span className="text-[#FF8A3C] font-bold text-xl">P</span>
                </div>
              </div>
              <span className="text-lg font-semibold bg-gradient-to-r from-[#FF8A3C] to-[#FF5F3C] text-transparent bg-clip-text">
                PitchPerfect
              </span>
            </Link>

            {/* Main Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                      isActive
                        ? "bg-[#FF8A3C]/10 text-[#FF8A3C]"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                    {item.badge && (
                      <span className="px-1.5 py-0.5 text-xs font-medium bg-[#FF8A3C]/20 text-[#FF8A3C] rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="hidden lg:flex items-center">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                <Search className="h-5 w-5" />
              </Button>
            </div>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[#FF8A3C]"></span>
            </Button>

            {/* Settings */}
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <Settings className="h-5 w-5" />
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="pl-2 pr-3 gap-2">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#FF8A3C] to-[#FF5F3C] flex items-center justify-center">
                    {isLoading ? (
                      <div className="h-4 w-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                    ) : (
                      <span className="text-white font-medium">
                        {username ? username[0].toUpperCase() : 'U'}
                      </span>
                    )}
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="truncate">
                  {isLoading ? 'Loading...' : (username || 'User')}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Billing</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
