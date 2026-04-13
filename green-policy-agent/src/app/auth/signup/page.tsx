"use client";

import Link from "next/link";
import { Leaf, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
      <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-cyan-900/30 via-background to-background pointer-events-none" />
      
      <Link href="/" className="absolute top-8 left-8 flex items-center text-muted-foreground hover:text-foreground transition-colors z-20">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back home
      </Link>

      <div className="glass-panel w-full max-w-md p-8 rounded-3xl z-10 mx-4 border-cyan-500/20">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-cyan-500/10 rounded-full flex items-center justify-center mb-4 border border-cyan-500/20">
            <Leaf className="w-6 h-6 text-cyan-400" />
          </div>
          <h1 className="text-2xl font-bold">Join the platform</h1>
          <p className="text-muted-foreground text-sm mt-2">Create an account to view and analyze land data</p>
        </div>

        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); window.location.href='/dashboard'; }}>
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" placeholder="John Doe" className="bg-background/50 border-white/10 focus-visible:ring-cyan-500" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="agent@example.com" className="bg-background/50 border-white/10 focus-visible:ring-cyan-500" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" className="bg-background/50 border-white/10 focus-visible:ring-cyan-500" required />
          </div>
          
          <Button type="submit" className="w-full h-11 bg-cyan-600 hover:bg-cyan-500 text-white mt-6 shadow-lg shadow-cyan-500/20">
            Create Account
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Already have an account? <Link href="/auth/login" className="text-cyan-400 hover:text-cyan-300 transition-colors">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
