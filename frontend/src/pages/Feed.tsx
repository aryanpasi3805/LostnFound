import { Layout } from "@/components/layout/Layout";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ConfidenceIndicator } from "@/components/common/ConfidenceIndicator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Clock, Grid3X3, List, SlidersHorizontal, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { API_BASE } from "../../config";
import { cn } from "@/lib/utils";

type ItemStatus = "lost" | "found" | "claimed" | "verified";

interface FeedItem {
  _id: string; title: string; category: string; location: string; date: string;
  status: ItemStatus; images: string[]; description: string; confidence?: number;
}

const categories = ["All", "Electronics", "Bottles", "Documents", "Bags", "Keys", "Accessories"];

export default function Feed() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const { data: fetchResult, isLoading } = useQuery({
    queryKey: ["items"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/items`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    }
  });

  const items: FeedItem[] = fetchResult?.data || [];

  const filtered = items.filter((i) => {
    if (search && !(i.title?.toLowerCase().includes(search.toLowerCase()))) return false;
    if (category !== "All" && i.category !== category) return false;
    if (statusFilter !== "all" && i.status !== statusFilter) return false;
    return true;
  });

  return (
    <Layout>
      <div className="container py-8 space-y-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold">Lost & Found Feed</h1>
          <p className="text-muted-foreground mt-1">Browse all reported items across campus</p>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search items..." className="pl-10 rounded-full transition-shadow duration-200 focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.15)]" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" className="rounded-full sm:hidden" onClick={() => setShowFilters(!showFilters)}>
              <SlidersHorizontal className="w-4 h-4" />
            </Button>
            <div className={cn("gap-2 sm:flex", showFilters ? "flex flex-wrap" : "hidden")}>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-[140px] rounded-full"><SelectValue /></SelectTrigger>
                <SelectContent>{categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px] rounded-full"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                  <SelectItem value="found">Found</SelectItem>
                  <SelectItem value="claimed">Claimed</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex border rounded-full overflow-hidden">
              <Button variant={view === "grid" ? "secondary" : "ghost"} size="icon" className="rounded-none transition-all duration-200" onClick={() => setView("grid")}><Grid3X3 className="w-4 h-4" /></Button>
              <Button variant={view === "list" ? "secondary" : "ghost"} size="icon" className="rounded-none transition-all duration-200" onClick={() => setView("list")}><List className="w-4 h-4" /></Button>
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">{filtered.length} items found</p>

        {/* Feed */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div key={view} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className={view === "grid" ? "grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" : "space-y-3"}>
              {filtered.map((fi, idx) => (
                <motion.div key={fi._id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  whileHover={{ y: -4, boxShadow: "0 16px 48px hsl(var(--glass-shadow))" }}
                  whileTap={{ scale: 0.98 }}
                  className={cn("glass rounded-xl cursor-pointer group transition-all duration-300", view === "list" && "flex items-center gap-4 p-4", view === "grid" && "p-4")}>
                  <div className={cn("rounded-xl bg-muted flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105 overflow-hidden", view === "grid" ? "h-36 mb-3 text-4xl" : "w-14 h-14 text-2xl")}>
                    {fi.images && fi.images.length > 0 ? (
                      <img src={`http://localhost:5000${fi.images[0]}`} className="w-full h-full object-cover" alt={fi.title} />
                    ) : (
                      "📦"
                    )}
                  </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors duration-200">{fi.title}</h3>
                    <StatusBadge status={fi.status} />
                  </div>
                  <p className="text-xs text-muted-foreground truncate mb-2">{fi.description}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{fi.location}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{fi.date}</span>
                  </div>
                  {fi.confidence && <div className="mt-2"><ConfidenceIndicator score={fi.confidence} /></div>}
                </div>
                {view === "list" && (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="outline" size="sm" className="rounded-full shrink-0 btn-glow">View</Button>
                  </motion.div>
                )}
              </motion.div>
            ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </Layout>
  );
}
