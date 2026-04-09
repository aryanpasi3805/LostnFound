import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";
import { API_BASE } from "../../config";

export default function Login() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [showPw, setShowPw] = useState(false);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const validateEmail = (v: string) => {
    setEmail(v);
    if (v && !v.endsWith("@college.edu")) {
      setEmailError("Only @college.edu emails are allowed");
    } else {
      setEmailError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.endsWith("@college.edu")) {
      setEmailError("Only @college.edu emails are allowed");
      return;
    }
    
    setLoading(true);
    try {
      const endpoint = mode === "login" ? "/auth/login" : "/auth/signup";
      const payload = mode === "login" ? { email, password } : { name, email, password };
      
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || "Authentication failed");
      }
      
      login(data.data.token, data.data.user);
      toast.success(mode === "login" ? "Welcome back!" : "Account created!", { description: "Redirecting to dashboard..." });
      navigate("/feed");
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container max-w-md py-16 space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mx-auto shadow-lg">
            <Shield className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="font-display text-3xl font-bold">{mode === "login" ? "Welcome back" : "Create account"}</h1>
          <p className="text-muted-foreground text-sm">Sign in with your college email to continue</p>
        </motion.div>

        <div className="flex gap-1 p-1 bg-muted rounded-full">
          <button onClick={() => setMode("login")} className={cn("flex-1 py-2 rounded-full text-sm font-medium transition-all", mode === "login" ? "bg-card shadow-sm" : "text-muted-foreground")}>Sign In</button>
          <button onClick={() => setMode("signup")} className={cn("flex-1 py-2 rounded-full text-sm font-medium transition-all", mode === "signup" ? "bg-card shadow-sm" : "text-muted-foreground")}>Sign Up</button>
        </div>

        <motion.form key={mode} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="glass rounded-2xl p-6 space-y-4" onSubmit={handleSubmit}>
          {mode === "signup" && (
            <div>
              <Label>Full Name</Label>
              <Input placeholder="John Doe" className="mt-1.5" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
          )}
          <div>
            <Label>College Email</Label>
            <div className="relative mt-1.5">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="you@college.edu" className="pl-10" value={email} onChange={(e) => validateEmail(e.target.value)} />
            </div>
            {emailError && <p className="text-xs text-destructive mt-1">{emailError}</p>}
          </div>
          <div>
            <Label>Password</Label>
            <div className="relative mt-1.5">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input type={showPw ? "text" : "password"} placeholder="••••••••" className="pl-10 pr-10" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          {mode === "signup" && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-primary/5 border border-primary/10">
              <Shield className="w-4 h-4 text-primary shrink-0" />
              <p className="text-xs text-muted-foreground">You'll receive a <span className="font-medium text-primary">Verified Student</span> badge after registration</p>
            </div>
          )}
          <Button type="submit" disabled={loading} className="w-full gradient-primary text-primary-foreground rounded-full h-11 gap-2">
            {loading ? "Please wait..." : (mode === "login" ? "Sign In" : "Create Account")} 
            {!loading && <ArrowRight className="w-4 h-4" />}
          </Button>
        </motion.form>
      </div>
    </Layout>
  );
}