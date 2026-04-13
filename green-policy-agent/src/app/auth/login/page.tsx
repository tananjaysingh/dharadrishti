"use client";

import Link from "next/link";
import { Leaf, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/40 via-background to-background pointer-events-none" />
      
      <Link href="/" className="absolute top-8 left-8 flex items-center text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back home
      </Link>

      <div className="glass-panel w-full max-w-md p-8 rounded-3xl z-10 mx-4 border-emerald-500/20">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4 border border-emerald-500/20">
            <Leaf className="w-6 h-6 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-muted-foreground text-sm mt-2">Enter your details to access the dashboard</p>
        </div>

        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); window.location.href='/dashboard'; }}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="agent@example.com" className="bg-background/50 border-white/10 focus-visible:ring-emerald-500" required />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="password">Password</Label>
              <Link href="#" className="text-xs text-emerald-400 hover:text-emerald-300">Forgot password?</Link>
            </div>
            <Input id="password" type="password" className="bg-background/50 border-white/10 focus-visible:ring-emerald-500" required />
          </div>
          
          <Button type="submit" className="w-full h-11 bg-emerald-500 hover:bg-emerald-600 text-white mt-6">
            Sign In
          </Button>
        </form>

        <div className="mt-8 relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background/80 backdrop-blur px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <Button variant="outline" className="w-full mt-6 h-11 bg-white/5 border-white/10 hover:bg-white/10">
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Google
        </Button>

      <p className="text-center text-sm text-muted-foreground mt-8">
          Don&apos;t have an account? <Link href="/auth/signup" className="text-emerald-400 hover:text-emerald-300 transition-colors">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
