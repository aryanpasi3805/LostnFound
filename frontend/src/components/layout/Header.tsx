import { Link, useLocation } from "react-router-dom";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Shield, Plus, X, Menu, LogOut } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth/AuthProvider";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { label: "Dashboard", path: "/" },
  { label: "Lost & Found", path: "/feed" },
  { label: "Report Item", path: "/report" },
  { label: "My Claims", path: "/claims" },
];

export function Header() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 glass border-b border-border/50">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <motion.div whileHover={{ rotate: 12, scale: 1.1 }} transition={{ type: "spring", stiffness: 300 }}
            className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <Shield className="w-4 h-4 text-primary-foreground" />
          </motion.div>
          <span className="font-display font-bold text-lg tracking-tight group-hover:text-primary transition-colors duration-200">FindIt</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path} className={cn(
              "relative px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200",
              location.pathname === item.path ? "text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}>
              {item.label}
              {location.pathname === item.path && (
                <motion.div layoutId="nav-active" className="absolute inset-0 bg-primary/10 rounded-lg -z-10"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }} />
              )}
            </Link>
          ))}
          {user?.role === "admin" && (
            <Link to="/admin" className={cn(
              "relative px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200",
              location.pathname === "/admin" ? "text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}>
              Admin Panel
              {location.pathname === "/admin" && (
                <motion.div layoutId="nav-active" className="absolute inset-0 bg-primary/10 rounded-lg -z-10"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }} />
              )}
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <Link to="/report" className="hidden sm:inline-flex">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button size="sm" className="gradient-primary text-primary-foreground gap-1.5 rounded-full shadow-md">
                <Plus className="w-3.5 h-3.5" /> Report
              </Button>
            </motion.div>
          </Link>
          <ThemeToggle />
          {user ? (
            <div className="flex items-center gap-2">
              <span className="hidden lg:inline text-sm font-medium text-muted-foreground mr-1">
                Hi, {user.name?.split(' ')[0]}
              </span>
              <Button variant="ghost" size="sm" onClick={logout} className="rounded-full gap-2 text-muted-foreground hover:text-foreground">
                <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          ) : (
            <Link to="/login">
              <Button variant="outline" size="sm" className="rounded-full btn-glow">Sign In</Button>
            </Link>
          )}
          <Button variant="ghost" size="icon" className="md:hidden rounded-full" onClick={() => setMobileOpen(!mobileOpen)}>
            <AnimatePresence mode="wait">
              <motion.div key={mobileOpen ? "close" : "open"} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </motion.div>
            </AnimatePresence>
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-border/50 bg-card overflow-hidden">
            <div className="p-4 space-y-1">
              {navItems.map((item, idx) => (
                <motion.div key={item.path}
                  initial={{ x: -12, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}>
                  <Link to={item.path} onClick={() => setMobileOpen(false)} className={cn(
                    "block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    location.pathname === item.path ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                  )}>
                    {item.label}
                  </Link>
                </motion.div>
              ))}
              {user?.role === "admin" && (
                <motion.div
                  initial={{ x: -12, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: navItems.length * 0.05 }}>
                  <Link to="/admin" onClick={() => setMobileOpen(false)} className={cn(
                    "block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors decoration-wavy",
                    location.pathname === "/admin" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                  )}>
                    Admin Panel
                  </Link>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}