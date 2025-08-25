
'use client';

import * as React from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Sun, Moon, Laptop } from "lucide-react"

export default function ThemeToggle() {
  const { setTheme, theme } = useTheme()

  return (
    <div className="flex gap-2">
      <Button 
        variant={theme === 'light' ? 'default' : 'outline'} 
        size="lg" 
        onClick={() => setTheme("light")}
      >
        <Sun className="ml-2 h-5 w-5" />
        فاتح
      </Button>
      <Button 
        variant={theme === 'dark' ? 'default' : 'outline'} 
        size="lg" 
        onClick={() => setTheme("dark")}
      >
        <Moon className="ml-2 h-5 w-5" />
        داكن
      </Button>
      <Button 
        variant={theme === 'system' ? 'default' : 'outline'} 
        size="lg" 
        onClick={() => setTheme("system")}
      >
        <Laptop className="ml-2 h-5 w-5" />
        النظام
      </Button>
    </div>
  )
}
