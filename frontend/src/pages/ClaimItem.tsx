import { Layout } from "@/components/layout/Layout";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Check, ArrowLeft, ArrowRight, ShieldCheck, HelpCircle, Image, FileCheck, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { API_BASE } from "../../config";
import { useAuth } from "@/components/auth/AuthProvider";

const claimSteps = [
  { label: "Select Item", icon: FileCheck },
  { label: "Verify Ownership", icon: HelpCircle },
  { label: "Upload Proof", icon: Image },
  { label: "Confirm", icon: Check },
];

export default function ClaimItem() {
  const [step, setStep] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [answers, setAnswers] = useState(["", "", ""]);
  const [images, setImages] = useState<File[]>([]);
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: claimsData, isLoading: claimsLoading } = useQuery({
    queryKey: ["my-claims"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/claims/my`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: !!token
  });

  const { data: itemsData, isLoading: itemsLoading } = useQuery({
    queryKey: ["items-found"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/items`);
      const data = await res.json();
      return data.data.filter((i: any) => i.status === "found");
    }
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append("item", selectedItem._id);
      formData.append("dateLost", new Date().toISOString());
      formData.append("verificationAnswers", JSON.stringify(answers));
      images.forEach(img => formData.append("proofImages", img));

      const res = await fetch(`${API_BASE}/claims`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      if (!res.ok) throw new Error("Failed to submit claim");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Claim submitted successfully! 🛡️");
      queryClient.invalidateQueries({ queryKey: ["my-claims"] });
      setShowForm(false);
      setStep(0);
      setSelectedItem(null);
      setAnswers(["", "", ""]);
      setImages([]);
    },
    onError: () => toast.error("Failed to submit claim")
  });

  const myClaims = claimsData?.data || [];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setImages(Array.from(e.target.files));
  };

  const next = () => step < claimSteps.length - 1 && setStep(step + 1);
  const prev = () => step > 0 && setStep(step - 1);
  const submit = () => submitMutation.mutate();

  return (
    <Layout>
      <div className="container py-8 space-y-8 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold">My Claims</h1>
            <p className="text-muted-foreground mt-1">Track your ownership claims</p>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button onClick={() => setShowForm(true)} className="gradient-primary text-primary-foreground rounded-full">New Claim</Button>
          </motion.div>
        </motion.div>

        {/* Existing Claims */}
        <div className="space-y-3">
          {claimsLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : myClaims.length > 0 ? myClaims.map((c: any, idx: number) => (
            <motion.div key={c._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className="glass rounded-xl p-5 hover-lift card-press cursor-pointer"
            >
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-4">
                  <motion.div whileHover={{ rotate: 12, scale: 1.1 }} className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center overflow-hidden">
                    {c.item?.images?.[0] ? <img src={`http://localhost:5000${c.item.images[0]}`} className="w-full h-full object-cover" alt="" /> : <ShieldCheck className="w-5 h-5 text-muted-foreground" />}
                  </motion.div>
                  <div>
                    <h3 className="font-semibold">{c.item?.title || "Unknown Item"}</h3>
                    <p className="text-xs text-muted-foreground">Submitted {new Date(c.createdAt).toLocaleDateString()} · {c.proofImages?.length > 0 ? "Proof uploaded" : "No proof"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={c.status} />
                  <Button variant="outline" size="sm" className="rounded-full btn-glow">Details</Button>
                </div>
              </div>
            </motion.div>
          )) : (
            <div className="text-center py-12 text-muted-foreground">No claims submitted yet.</div>
          )}
        </div>

        {/* New Claim Form Modal */}
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
                <div className="p-6 space-y-6">
                  <h2 className="font-display text-xl font-bold">Claim an Item</h2>

                  {/* Stepper */}
                  <div className="flex items-center gap-2">
                    {claimSteps.map((s, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <motion.div
                          animate={i === step ? { scale: [1, 1.1, 1] } : {}}
                          transition={{ repeat: i === step ? Infinity : 0, duration: 2 }}
                          className={cn("w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300",
                            i === step ? "gradient-primary text-primary-foreground step-active" : i < step ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"
                          )}>{i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}</motion.div>
                        {i < claimSteps.length - 1 && <div className={cn("w-6 h-px transition-colors duration-500", i < step ? "bg-success" : "bg-border")} />}
                      </div>
                    ))}
                  </div>

                  {/* Steps */}
                  <AnimatePresence mode="wait">
                    <motion.div key={step}
                      initial={{ opacity: 0, x: 15, scale: 0.98 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: -15, scale: 0.98 }}
                      transition={{ duration: 0.2 }}>
                      {step === 0 && (
                        <div className="space-y-3">
                          <p className="text-sm text-muted-foreground">Select the item you want to claim:</p>
                          {itemsLoading ? (
                             <div className="flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                          ) : (itemsData || []).map((it: any) => (
                            <motion.div key={it._id}
                              whileHover={{ scale: 1.02, borderColor: "hsl(var(--primary))" }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => setSelectedItem(it)}
                              className={cn("p-3 rounded-xl border cursor-pointer transition-all duration-200",
                                selectedItem?._id === it._id ? "border-primary bg-primary/5 shadow-[0_0_0_2px_hsl(var(--primary)/0.2)]" : "border-border hover:border-primary/50"
                              )}>
                              <p className="font-medium text-sm">{it.title}</p>
                              <p className="text-xs text-muted-foreground">{it.location}</p>
                            </motion.div>
                          ))}
                        </div>
                      )}
                      {step === 1 && (
                        <div className="space-y-4">
                          <p className="text-sm text-muted-foreground">Answer these questions to verify ownership:</p>
                          <div className="space-y-3">
                            {[
                              { label: "Describe any unique features", placeholder: "e.g. scratch on the top left corner" },
                              { label: "What was inside?", placeholder: "e.g. charger, notebook, pens" },
                              { label: "Exact color/brand?", placeholder: "e.g. Space Gray Apple MacBook" },
                            ].map((q, i) => (
                              <div key={q.label}>
                                <label className="text-sm font-medium">{q.label}</label>
                                <Textarea value={answers[i]} onChange={(e) => {
                                  const newAnswers = [...answers];
                                  newAnswers[i] = e.target.value;
                                  setAnswers(newAnswers);
                                }} placeholder={q.placeholder} className="mt-1.5 transition-shadow duration-200 focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.15)]" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {step === 2 && (
                        <div className="space-y-4">
                          <p className="text-sm text-muted-foreground">Upload proof of ownership:</p>
                          <motion.div onClick={() => fileInputRef.current?.click()} whileHover={{ borderColor: "hsl(var(--primary))", scale: 1.01 }}
                            className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer transition-colors">
                            <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2 icon-hover-rotate" />
                            <p className="text-sm font-medium">Image Proof</p>
                            <p className="text-xs text-muted-foreground">Required for verification</p>
                            <input type="file" hidden ref={fileInputRef} onChange={handleFileChange} multiple accept="image/*" />
                            <Button variant="outline" size="sm" type="button" className="mt-2 rounded-full btn-glow">Browse Files</Button>
                            {images.length > 0 && <p className="text-sm text-primary mt-2">{images.length} file(s) selected</p>}
                          </motion.div>
                        </div>
                      )}
                      {step === 3 && (
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="text-center space-y-4 py-4">
                          <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto">
                            <ShieldCheck className="w-8 h-8 text-success" />
                          </motion.div>
                          <h3 className="font-display font-semibold text-lg">Ready to Submit</h3>
                          <p className="text-sm text-muted-foreground">Your claim will be reviewed by an admin. You'll be notified of the outcome.</p>
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm">
                            <ShieldCheck className="w-3.5 h-3.5" /> Verified Student
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  </AnimatePresence>

                  <div className="flex justify-between pt-2">
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                      <Button variant="outline" onClick={step === 0 ? () => setShowForm(false) : prev} className="rounded-full btn-glow">
                        {step === 0 ? "Cancel" : <><ArrowLeft className="w-4 h-4 mr-1" /> Back</>}
                      </Button>
                    </motion.div>
                    {step < claimSteps.length - 1 ? (
                      <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                        <Button onClick={next} className="gradient-primary text-primary-foreground rounded-full">Next <ArrowRight className="w-4 h-4 ml-1" /></Button>
                      </motion.div>
                    ) : (
                      <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                        <Button onClick={submit} disabled={submitMutation.isPending} className="gradient-primary text-primary-foreground rounded-full">
                          {submitMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Claim"}
                        </Button>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}
