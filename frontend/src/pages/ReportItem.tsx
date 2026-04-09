import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Upload, MapPin, Calendar, Tag, FileText, Check, ArrowLeft, ArrowRight, Image, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";
import { API_BASE } from "../../config";

const steps = [
  { label: "Details", icon: FileText },
  { label: "Images", icon: Image },
  { label: "Description", icon: Tag },
  { label: "Location", icon: MapPin },
  { label: "Date & Time", icon: Calendar },
  { label: "Identifiers", icon: Tag },
];

export default function ReportItem() {
  const [step, setStep] = useState(0);
  const [type, setType] = useState<"lost" | "found">("lost");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [brand, setBrand] = useState("");
  const [marks, setMarks] = useState("");
  const [color, setColor] = useState("");
  const [loading, setLoading] = useState(false);

  const { token } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const next = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    }
  };
  const prev = () => step > 0 && setStep(step - 1);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  const submit = async () => {
    if (!token) {
      toast.error("Please login to report an item");
      return;
    }
    
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("type", type);
      formData.append("title", title);
      formData.append("category", category);
      formData.append("description", description);
      formData.append("location", location);
      formData.append("date", date ? new Date(`${date}T${time || '00:00'}`).toISOString() : new Date().toISOString());
      if (brand) formData.append("brand", brand);
      if (marks) formData.append("distinguishingMarks", marks);
      if (color) formData.append("color", color);
      
      images.forEach(img => {
        formData.append("images", img);
      });

      const res = await fetch(`${API_BASE}/items`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to submit report");
      }

      toast.success("Item reported successfully! 🎉", {
        description: "We'll scan for matches and notify you instantly.",
        duration: 5000,
      });
      navigate("/feed");
    } catch (err: any) {
      toast.error(err.message || "An error occurred during submission");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container max-w-2xl py-8 space-y-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold">Report an Item</h1>
          <p className="text-muted-foreground mt-1">Help reunite items with their owners</p>
        </motion.div>

        {/* Type Toggle */}
        <div className="flex gap-2 p-1 bg-muted rounded-full w-fit">
          <button onClick={() => { setType("lost"); toast("Reporting a lost item", { icon: "🔍" }); }}
            className={cn("px-5 py-2 rounded-full text-sm font-medium transition-all duration-300",
              type === "lost" ? "gradient-primary text-primary-foreground shadow-md scale-105" : "text-muted-foreground hover:text-foreground")}>
            I lost something
          </button>
          <button onClick={() => { setType("found"); toast("Reporting a found item", { icon: "✅" }); }}
            className={cn("px-5 py-2 rounded-full text-sm font-medium transition-all duration-300",
              type === "found" ? "gradient-primary text-primary-foreground shadow-md scale-105" : "text-muted-foreground hover:text-foreground")}>
            I found something
          </button>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-1 overflow-x-auto pb-2">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-1">
              <button onClick={() => setStep(i)} className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 whitespace-nowrap",
                i === step ? "bg-primary text-primary-foreground step-active" : i < step ? "bg-success/10 text-success" : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}>
                {i < step ? <Check className="w-3 h-3" /> : <s.icon className="w-3 h-3" />}
                <span className="hidden sm:inline">{s.label}</span>
                <span className="sm:hidden">{i + 1}</span>
              </button>
              {i < steps.length - 1 && (
                <motion.div
                  className={cn("w-4 h-px", i < step ? "bg-success" : "bg-border")}
                  animate={{ backgroundColor: i < step ? "hsl(var(--success))" : "hsl(var(--border))" }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Form Steps */}
        <div className="glass rounded-xl p-6 min-h-[280px]">
          <AnimatePresence mode="wait">
            <motion.div key={step}
              initial={{ opacity: 0, x: 20, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -20, scale: 0.98 }}
              transition={{ duration: 0.25, ease: "easeOut" }}>
              {step === 0 && (
                <div className="space-y-4">
                  <h2 className="font-display font-semibold text-lg">Basic Details</h2>
                  <div className="space-y-3">
                    <div>
                      <Label>Item Name</Label>
                      <Input placeholder="e.g. MacBook Pro 14 inch" className="mt-1.5 transition-shadow duration-200 focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.15)]" value={title} onChange={e => setTitle(e.target.value)} />
                    </div>
                    <div>
                      <Label>Category</Label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select category" /></SelectTrigger>
                        <SelectContent>
                          {["Electronics", "Bottles", "Bags", "Keys", "Documents", "Accessories", "Clothing", "Other"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
              {step === 1 && (
                <div className="space-y-4">
                  <h2 className="font-display font-semibold text-lg">Upload Images</h2>
                  <motion.div
                    onClick={() => fileInputRef.current?.click()}
                    whileHover={{ borderColor: "hsl(var(--primary))", scale: 1.01 }}
                    className="border-2 border-dashed border-border rounded-xl p-10 text-center cursor-pointer transition-colors"
                  >
                    <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3 icon-hover-rotate" />
                    <p className="text-sm font-medium">Drag & drop images here</p>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</p>
                    <Button type="button" variant="outline" size="sm" className="mt-3 rounded-full btn-glow">Browse Files</Button>
                    <input type="file" ref={fileInputRef} hidden multiple accept="image/*" onChange={handleFileChange} />
                    {images.length > 0 && <p className="text-sm text-primary mt-3 font-medium">{images.length} file(s) selected</p>}
                  </motion.div>
                </div>
              )}
              {step === 2 && (
                <div className="space-y-4">
                  <h2 className="font-display font-semibold text-lg">Description</h2>
                  <Textarea placeholder="Describe the item in detail — color, brand, distinctive marks, contents..." className="min-h-[150px] transition-shadow duration-200 focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.15)]" value={description} onChange={e => setDescription(e.target.value)} />
                </div>
              )}
              {step === 3 && (
                <div className="space-y-4">
                  <h2 className="font-display font-semibold text-lg">Location</h2>
                  <div>
                    <Label>Where was it {type === "lost" ? "last seen" : "found"}?</Label>
                    <Input placeholder="e.g. Library 2nd Floor, near the printers" className="mt-1.5 transition-shadow duration-200 focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.15)]" value={location} onChange={e => setLocation(e.target.value)} />
                  </div>
                  <div className="h-48 rounded-xl bg-muted flex items-center justify-center text-muted-foreground text-sm">
                    <MapPin className="w-5 h-5 mr-2" /> Campus map placeholder
                  </div>
                </div>
              )}
              {step === 4 && (
                <div className="space-y-4">
                  <h2 className="font-display font-semibold text-lg">Date & Time</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Date</Label>
                      <Input type="date" className="mt-1.5" value={date} onChange={e => setDate(e.target.value)} />
                    </div>
                    <div>
                      <Label>Approximate Time</Label>
                      <Input type="time" className="mt-1.5" value={time} onChange={e => setTime(e.target.value)} />
                    </div>
                  </div>
                </div>
              )}
              {step === 5 && (
                <div className="space-y-4">
                  <h2 className="font-display font-semibold text-lg">Identifiers</h2>
                  <div className="space-y-3">
                    <div>
                      <Label>Brand</Label>
                      <Input placeholder="e.g. Apple, Nike, etc." className="mt-1.5" value={brand} onChange={e => setBrand(e.target.value)} />
                    </div>
                    <div>
                      <Label>Distinguishing Marks</Label>
                      <Input placeholder="e.g. scratch on back, stickers, engraving" className="mt-1.5" value={marks} onChange={e => setMarks(e.target.value)} />
                    </div>
                    <div>
                      <Label>Color</Label>
                      <Input placeholder="e.g. Space Gray, Red" className="mt-1.5" value={color} onChange={e => setColor(e.target.value)} />
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={prev} disabled={step === 0} className="rounded-full gap-1.5 btn-glow">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          {step < steps.length - 1 ? (
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button onClick={next} className="gradient-primary text-primary-foreground rounded-full gap-1.5">
                Next <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>
          ) : (
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button onClick={submit} disabled={loading} className="gradient-primary text-primary-foreground rounded-full gap-1.5">
                {loading ? <Check className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} 
                {loading ? "Submitting..." : "Submit Report"}
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  );
}
