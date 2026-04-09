import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ConfidenceIndicator } from "@/components/common/ConfidenceIndicator";
import { Search, Package, MapPin, Clock, TrendingUp, Users, ShieldCheck, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { API_BASE } from "../../config";
import { formatDistanceToNow } from "date-fns";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function Dashboard() {
  const { data: fetchResult, isLoading } = useQuery({
    queryKey: ["items-dashboard"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/items`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    }
  });

  const allItems: any[] = fetchResult?.data || [];

  const lostCount = allItems.filter(i => i.status === "lost").length;
  const foundCount = allItems.filter(i => i.status === "found").length;
  const claimedCount = allItems.filter(i => i.status === "claimed").length;
  const verifiedCount = allItems.filter(i => i.status === "verified").length;

  const stats = [
    { label: "Lost Items", value: lostCount.toString(), icon: Package, color: "text-destructive", bg: "bg-destructive/10" },
    { label: "Found Items", value: foundCount.toString(), icon: MapPin, color: "text-primary", bg: "bg-primary/10" },
    { label: "Claims Active", value: claimedCount.toString(), icon: TrendingUp, color: "text-warning", bg: "bg-warning/10" },
    { label: "Reunited", value: verifiedCount.toString(), icon: ShieldCheck, color: "text-success", bg: "bg-success/10" },
  ];

  const sortedItems = [...allItems].sort((a, b) => new Date(b.createdAt || b.date || 0).getTime() - new Date(a.createdAt || a.date || 0).getTime());
  const recentItems = sortedItems.slice(0, 4);

  const formatTime = (dateStr: string) => {
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
    } catch {
      return "recently";
    }
  };

  const timeline = sortedItems.slice(0, 4).map(item => ({
    text: `${item.title} reported ${item.status} near ${item.location}`,
    time: formatTime(item.createdAt || item.date),
    type: item.status
  }));

  const handleSearch = () => {
    toast("Searching campus database...", { icon: "🔍", description: "We'll show matching results in a moment." });
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="gradient-hero border-b border-border/50">
        <div className="container py-12 md:py-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-2xl mx-auto text-center space-y-6">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              Smart campus lost & found
            </motion.div>
            <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight leading-tight">
              Lost something?<br />
              <span className="text-gradient-primary">We'll help you find it.</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-lg mx-auto">
              Report, search, and recover lost items across campus with our smart matching system.
            </p>
            <div className="flex gap-2 max-w-md mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search for your item..." className="pl-10 rounded-full h-11 bg-card border-border transition-shadow duration-200 focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.15)]" />
              </div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button onClick={handleSearch} className="gradient-primary text-primary-foreground rounded-full h-11 px-6">Search</Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="container py-8 space-y-10">
        {/* Stats */}
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <motion.div key={s.label} variants={item}
              whileHover={{ y: -4, boxShadow: "0 16px 48px hsl(var(--glass-shadow))" }}
              className="glass rounded-xl p-5 cursor-default transition-all duration-300">
              <div className="flex items-center gap-3 mb-3">
                <motion.div whileHover={{ rotate: 12, scale: 1.1 }} className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                </motion.div>
              </div>
              <p className="font-display text-2xl font-bold">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Items */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold">Recent Items</h2>
              <Link to="/feed">
                <Button variant="ghost" size="sm" className="text-primary gap-1">View all <ArrowRight className="w-3.5 h-3.5" /></Button>
              </Link>
            </div>
            <motion.div variants={container} initial="hidden" animate="show" className="grid sm:grid-cols-2 gap-4">
              {isLoading ? (
                <div className="col-span-2 flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
              ) : recentItems.length > 0 ? recentItems.map((ri) => (
                <Link to="/feed" key={ri._id || ri.id}>
                  <motion.div variants={item}
                    whileHover={{ y: -4, boxShadow: "0 16px 48px hsl(var(--glass-shadow))" }}
                    whileTap={{ scale: 0.98 }}
                    className="glass rounded-xl p-4 cursor-pointer group transition-all duration-300 h-full">
                    <div className="flex items-start gap-3">
                      <motion.div whileHover={{ scale: 1.1, rotate: 6 }}
                        className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-2xl shrink-0 overflow-hidden transition-transform duration-200">
                        {ri.images && ri.images.length > 0 ? (
                          <img src={`http://localhost:5000${ri.images[0]}`} className="w-full h-full object-cover" alt="" />
                        ) : (
                          "📦"
                        )}
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors duration-200">{ri.title}</h3>
                          <StatusBadge status={ri.status} />
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{ri.location}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatTime(ri.createdAt || ri.date)}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              )) : (
                <div className="col-span-2 text-center text-muted-foreground py-8">No recent items found</div>
              )}
            </motion.div>
          </div>

          {/* Activity Timeline */}
          <div className="space-y-4">
            <h2 className="font-display text-xl font-semibold">Activity</h2>
            <div className="glass rounded-xl p-5 space-y-4">
              {timeline.map((t, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                  className="flex gap-3 text-sm hover:bg-muted/30 rounded-lg p-1 -m-1 transition-colors duration-200 cursor-default">
                  <div className="relative flex flex-col items-center">
                    <div className={`w-2 h-2 rounded-full mt-1.5 ${
                      t.type === "lost" ? "bg-destructive" : t.type === "found" ? "bg-primary" : t.type === "verified" ? "bg-success" : "bg-info"
                    }`} />
                    {i < timeline.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                  </div>
                  <div className="pb-4">
                    <p className="text-foreground">{t.text}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{t.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Smart Matches */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent" />
            <h2 className="font-display text-xl font-semibold">Possible Matches</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { lost: "MacBook Pro 14\"", found: "Silver Laptop", score: 92 },
              { lost: "Blue Water Bottle", found: "Blue Hydroflask", score: 85 },
              { lost: "TI-84 Calculator", found: "Scientific Calculator", score: 67 },
            ].map((m, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4, boxShadow: "0 16px 48px hsl(var(--glass-shadow))" }}
                whileTap={{ scale: 0.98 }}
                className={`glass rounded-xl p-5 cursor-pointer transition-all duration-300 ${m.score >= 80 ? "ring-2 ring-success/30" : ""}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-muted-foreground">Match #{i + 1}</span>
                  {m.score >= 80 && <span className="text-xs font-medium text-success flex items-center gap-1"><Sparkles className="w-3 h-3" />High</span>}
                </div>
                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-2">
                    <StatusBadge status="lost" />
                    <span className="text-sm font-medium truncate">{m.lost}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status="found" />
                    <span className="text-sm font-medium truncate">{m.found}</span>
                  </div>
                </div>
                <ConfidenceIndicator score={m.score} size="md" />
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button size="sm" variant="outline" className="w-full mt-3 rounded-full btn-glow">View Details</Button>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
