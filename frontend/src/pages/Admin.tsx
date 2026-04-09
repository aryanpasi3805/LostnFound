import { StatusBadge } from "@/components/common/StatusBadge";
import { ConfidenceIndicator } from "@/components/common/ConfidenceIndicator";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Shield, LayoutDashboard, Package, ShieldCheck, ClipboardList, LogOut, Search, Check, X, Eye, ChevronRight, Menu, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/AuthProvider";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { API_BASE } from "../../config";

const sidebarItems = [
  { label: "Overview", icon: LayoutDashboard, id: "overview" },
  { label: "Manage Items", icon: Package, id: "items" },
  { label: "Review Claims", icon: ShieldCheck, id: "claims" },
  { label: "Activity Logs", icon: ClipboardList, id: "logs" },
];

export default function Admin() {
  const { user, token } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState("overview");
  const [selectedClaim, setSelectedClaim] = useState<any | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Queries
  const reqOpts = { headers: { Authorization: `Bearer ${token}` }};
  const { data: statsData } = useQuery({ queryKey: ["admin-stats"], queryFn: async () => (await fetch(`${API_BASE}/admin/stats`, reqOpts)).json(), enabled: !!token && user?.role === "admin" });
  const { data: claimsData } = useQuery({ queryKey: ["admin-claims"], queryFn: async () => (await fetch(`${API_BASE}/admin/claims`, reqOpts)).json(), enabled: !!token && user?.role === "admin" });
  const { data: itemsData } = useQuery({ queryKey: ["admin-items"], queryFn: async () => (await fetch(`${API_BASE}/admin/items`, reqOpts)).json(), enabled: !!token && user?.role === "admin" });
  const { data: logsData } = useQuery({ queryKey: ["admin-logs"], queryFn: async () => (await fetch(`${API_BASE}/admin/logs`, reqOpts)).json(), enabled: !!token && user?.role === "admin" });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_BASE}/admin/claims/${id}/approve`, { method: "PUT", ...reqOpts });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Claim approved! ✅", { description: "The claimant has been notified." });
      queryClient.invalidateQueries({ queryKey: ["admin-claims"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      setSelectedClaim(null);
    }
  });

  const rejectMutation = useMutation({
    mutationFn: async (args: { id: string, reason: string }) => {
      const res = await fetch(`${API_BASE}/admin/claims/${args.id}/reject`, { 
        method: "PUT", 
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ rejectionReason: args.reason })
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      toast.error("Claim rejected ❌", { description: "The claimant has been notified." });
      queryClient.invalidateQueries({ queryKey: ["admin-claims"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      setShowRejectModal(false);
      setSelectedClaim(null);
      setRejectReason("");
    }
  });

  const handleApprove = (id: string) => approveMutation.mutate(id);
  const handleReject = () => rejectMutation.mutate({ id: selectedClaim._id, reason: rejectReason });

  if (!user || user.role !== "admin") {
    return <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <div className="glass rounded-xl p-8 max-w-sm text-center">
        <Shield className="w-12 h-12 text-destructive mx-auto mb-4" />
        <h2 className="font-display font-semibold text-xl mb-2 text-destructive">Access Denied</h2>
        <p className="text-muted-foreground text-sm mb-6">You must be logged in as an administrator to view this page.</p>
        <Link to="/"><Button className="w-full">Return Home</Button></Link>
      </div>
    </div>;
  }

  const s = statsData?.data || { totalLost: 0, totalFound: 0, claimsPending: 0, claimsApproved: 0, claimsRejected: 0, totalUsers: 0 };
  const claims = claimsData?.data || [];
  const items = itemsData?.data || [];
  
  const recentCls = logsData?.data?.recentClaims || [];
  const recentIts = logsData?.data?.recentItems || [];
  const combinedLogs = [
    ...recentCls.map((c: any) => ({ text: `${c.claimant?.name || "Someone"} opened a claim for ${c.item?.title || 'an item'}`, time: new Date(c.createdAt).toLocaleDateString(), type: "claim", rawTime: new Date(c.createdAt).getTime() })),
    ...recentIts.map((i: any) => ({ text: `New item reported: ${i.title}`, time: new Date(i.createdAt).toLocaleDateString(), type: "report", rawTime: new Date(i.createdAt).getTime() }))
  ].sort((a,b) => b.rawTime - a.rawTime);

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border flex flex-col transition-transform duration-300 lg:relative lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-4 border-b border-border">
          <Link to="/" className="flex items-center gap-2.5 group">
            <motion.div whileHover={{ rotate: 12 }} className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary-foreground" />
            </motion.div>
            <div>
              <span className="font-display font-bold text-sm">FindIt</span>
              <span className="block text-xs text-muted-foreground">Admin Panel</span>
            </div>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {sidebarItems.map((s) => (
            <motion.button key={s.id} whileHover={{ x: 4 }} whileTap={{ scale: 0.97 }}
              onClick={() => { setPage(s.id); setSidebarOpen(false); }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200",
                page === s.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}>
              <s.icon className="w-4 h-4" />
              {s.label}
            </motion.button>
          ))}
        </nav>
        <div className="p-3 border-t border-border space-y-2">
          <ThemeToggle />
          <Link to="/">
            <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground">
              <LogOut className="w-4 h-4" /> Exit Admin
            </Button>
          </Link>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-30 bg-foreground/20 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 glass border-b border-border/50 h-14 flex items-center px-4 gap-3">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}><Menu className="w-5 h-5" /></Button>
          <h1 className="font-display font-semibold capitalize">{page}</h1>
        </header>

        <div className="flex-1 p-4 md:p-6 overflow-auto">
          <AnimatePresence mode="wait">
            {page === "overview" && (
              <motion.div key="overview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: "Total Items", value: s.totalLost + s.totalFound, color: "text-primary" },
                    { label: "Pending Claims", value: s.claimsPending, color: "text-warning" },
                    { label: "Resolved Claims", value: s.claimsApproved, color: "text-success" },
                    { label: "Active Users", value: s.totalUsers, color: "text-info" },
                  ].map((stat, idx) => (
                    <motion.div key={stat.label}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.08 }}
                      whileHover={{ y: -2, boxShadow: "0 12px 32px hsl(var(--glass-shadow))" }}
                      className="glass rounded-xl p-5 cursor-default">
                      <p className={cn("font-display text-2xl font-bold", stat.color)}>{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </motion.div>
                  ))}
                </div>
                <div className="glass rounded-xl p-5">
                  <h3 className="font-display font-semibold mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    {combinedLogs.slice(0, 5).map((l: any, i) => (
                      <motion.div key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="flex items-center gap-3 text-sm py-1 hover:bg-muted/30 rounded-lg px-2 transition-colors duration-200 cursor-default">
                        <div className={cn("w-2 h-2 rounded-full", l.type === "report" ? "bg-info" : "bg-warning")} />
                        <span className="flex-1">{l.text}</span>
                        <span className="text-xs text-muted-foreground shrink-0">{l.time}</span>
                      </motion.div>
                    ))}
                    {combinedLogs.length === 0 && <div className="text-sm text-muted-foreground">No recent activity</div>}
                  </div>
                </div>
              </motion.div>
            )}

            {page === "items" && (
              <motion.div key="items" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Search items..." className="pl-10 rounded-full transition-shadow duration-200 focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.15)]" />
                  </div>
                </div>
                <div className="glass rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left p-3 font-medium text-muted-foreground">Item</th>
                          <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                          <th className="text-left p-3 font-medium text-muted-foreground hidden sm:table-cell">Location</th>
                          <th className="text-left p-3 font-medium text-muted-foreground hidden md:table-cell">Date</th>
                          <th className="text-left p-3 font-medium text-muted-foreground">Claims</th>
                          <th className="p-3"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.length > 0 ? items.map((it: any) => (
                          <tr key={it._id} className="border-b border-border/50 row-highlight cursor-pointer">
                            <td className="p-3 font-medium">{it.title}</td>
                            <td className="p-3"><StatusBadge status={it.status} /></td>
                            <td className="p-3 text-muted-foreground hidden sm:table-cell">{it.location}</td>
                            <td className="p-3 text-muted-foreground hidden md:table-cell">{new Date(it.createdAt).toLocaleDateString()}</td>
                            <td className="p-3">—</td>
                            <td className="p-3">
                              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                <Button variant="ghost" size="sm"><Eye className="w-4 h-4" /></Button>
                              </motion.div>
                            </td>
                          </tr>
                        )) : <tr><td colSpan={6} className="p-4 text-center text-muted-foreground">No items currently</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {page === "claims" && (
              <motion.div key="claims" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                {!selectedClaim ? (
                  <div className="space-y-3">
                    {claims.length > 0 ? claims.map((c: any, idx: number) => (
                      <motion.div key={c._id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.08 }}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.99 }}
                        className="glass rounded-xl p-5 cursor-pointer transition-shadow duration-300 hover:shadow-[0_12px_40px_hsl(var(--glass-shadow))]"
                        onClick={() => setSelectedClaim(c)}>
                        <div className="flex items-center justify-between flex-wrap gap-3">
                          <div className="flex items-center gap-3">
                            <motion.div whileHover={{ scale: 1.1 }} className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary text-sm">{c.claimant?.name?.[0] || 'U'}</motion.div>
                            <div>
                              <p className="font-medium">{c.claimant?.name || 'Unknown'} → <span className="text-primary">{c.item?.title || 'Unknown Item'}</span></p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <StatusBadge status={c.status} />
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          </div>
                        </div>
                      </motion.div>
                    )) : <div className="text-center py-12 text-muted-foreground">No pending claims</div>}
                  </div>
                ) : (
                  /* Split View */
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid lg:grid-cols-2 gap-6">
                    {/* Left: Item Details */}
                    <div className="glass rounded-xl p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-display font-semibold">Item Details</h3>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedClaim(null)}>← Back</Button>
                      </div>
                      <div className="h-48 rounded-xl bg-muted flex items-center justify-center overflow-hidden">
                        {selectedClaim.item?.images?.[0] ? <img src={`http://localhost:5000${selectedClaim.item.images[0]}`} className="w-full h-full object-cover" alt=""/> : "💻"}
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg">{selectedClaim.item?.title || 'Unknown Item'}</h4>
                        <p className="text-sm text-muted-foreground mt-1">Reported at {selectedClaim.item?.location} on {new Date(selectedClaim.item?.createdAt).toLocaleDateString()}</p>
                      </div>
                      <StatusBadge status={selectedClaim.item?.status || "found"} />
                    </div>

                    {/* Right: Claimant Info */}
                    <div className="glass rounded-xl p-6 space-y-5">
                      <h3 className="font-display font-semibold">Claim by {selectedClaim.claimant?.name || 'Unknown'}</h3>

                      <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">{selectedClaim.claimant?.name?.[0] || 'U'}</div>
                        <div>
                          <p className="font-medium text-sm">{selectedClaim.claimant?.name || 'Unknown'}</p>
                          <div className="flex items-center gap-1 text-xs text-primary"><ShieldCheck className="w-3 h-3" /> Verified Student</div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <p className="text-sm font-medium">Verification Answers</p>
                        {["Unique features", "Contents", "Color/Brand"].map((q, i) => {
                          let ansArray = [];
                          try { ansArray = JSON.parse(selectedClaim.verificationAnswers || '[]'); } catch(e){}
                          return (
                          <motion.div key={q}
                            initial={{ opacity: 0, x: 8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="p-3 rounded-xl bg-muted/50 hover:bg-muted/70 transition-colors duration-200">
                            <p className="text-xs text-muted-foreground mb-1">{q}</p>
                            <p className="text-sm">{ansArray[i] || 'N/A'}</p>
                          </motion.div>
                        )})}
                      </div>

                      <div>
                        <p className="text-sm font-medium mb-2">Proof</p>
                        {selectedClaim.proofImages && selectedClaim.proofImages.length > 0 ? (
                          <div className="p-3 rounded-xl bg-success/5 border border-success/20 text-sm text-success flex items-center gap-2"><Check className="w-4 h-4" /> {selectedClaim.proofImages.length} images uploaded</div>
                        ) : (
                          <div className="p-3 rounded-xl bg-destructive/5 border border-destructive/20 text-sm text-destructive flex items-center gap-2"><X className="w-4 h-4" /> No proof uploaded</div>
                        )}
                      </div>
                      <div className="flex gap-3 pt-2">
                        <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button disabled={approveMutation.isPending} onClick={() => handleApprove(selectedClaim._id)} className="w-full bg-success hover:bg-success/90 text-success-foreground rounded-full gap-1.5">{approveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin"/> : <><Check className="w-4 h-4" /> Approve</>}</Button>
                        </motion.div>
                        <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button variant="outline" onClick={() => setShowRejectModal(true)} className="w-full border-destructive/30 text-destructive hover:bg-destructive/10 rounded-full gap-1.5"><X className="w-4 h-4" /> Reject</Button>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {page === "logs" && (
              <motion.div key="logs" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-xl p-6 space-y-4">
                <h3 className="font-display font-semibold">Activity Logs</h3>
                {combinedLogs.map((l: any, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-3 text-sm py-2 border-b border-border/50 last:border-0 hover:bg-muted/30 rounded-lg px-2 transition-colors duration-200 cursor-default">
                    <div className={cn("w-2 h-2 rounded-full shrink-0", l.type === "report" ? "bg-info" : "bg-warning")} />
                    <span className="flex-1">{l.text}</span>
                    <span className="text-xs text-muted-foreground shrink-0">{l.time}</span>
                  </motion.div>
                ))}
                {combinedLogs.length === 0 && <div className="text-sm text-muted-foreground py-4 text-center">No recent activity found.</div>}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Reject Modal */}
      <AnimatePresence>
        {showRejectModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowRejectModal(false)}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()} className="bg-card border border-border rounded-2xl p-6 w-full max-w-md space-y-4">
              <h3 className="font-display font-semibold text-lg">Reject Claim</h3>
              <p className="text-sm text-muted-foreground">Provide a reason for rejecting this claim:</p>
              <Textarea placeholder="e.g. Description doesn't match item details..." value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
                className="transition-shadow duration-200 focus:shadow-[0_0_0_3px_hsl(var(--destructive)/0.15)]" />
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setShowRejectModal(false)} className="rounded-full">Cancel</Button>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button disabled={rejectMutation.isPending} onClick={handleReject} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-full">
                    {rejectMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin"/> : "Reject Claim"}
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
