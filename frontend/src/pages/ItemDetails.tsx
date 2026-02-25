import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft, MapPin, Calendar, Mail, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { getItem, createClaim } from "@/services/api";
import type { Item } from "@/types";

const claimSchema = z.object({
  claimantName: z.string().min(2, "Name is required"),
  contactInfo: z.string().min(3, "Contact info is required"),
  message: z.string().min(5, "Please describe why you believe this is yours"),
});

const ItemDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);

  const form = useForm<z.infer<typeof claimSchema>>({
    resolver: zodResolver(claimSchema),
    defaultValues: { claimantName: "", contactInfo: "", message: "" },
  });

  useEffect(() => {
    if (!id) return;
    getItem(id)
      .then(setItem)
      .catch(() => toast.error("Item not found"))
      .finally(() => setLoading(false));
  }, [id]);

  const onSubmitClaim = async (data: z.infer<typeof claimSchema>) => {
    if (!id) return;
    try {
      await createClaim({ claimantName: data.claimantName!, contactInfo: data.contactInfo!, message: data.message!, itemId: id });
      toast.success("Claim submitted!");
      form.reset();
    } catch {
      toast.error("Failed to submit claim.");
    }
  };

  if (loading) return <p className="py-20 text-center text-muted-foreground">Loading…</p>;
  if (!item) return <p className="py-20 text-center text-muted-foreground">Item not found.</p>;

  const isLost = item.type === "lost";
  const isResolved = item.status === "resolved";

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <Link to="/" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to listings
      </Link>

      <Card>
        {item.imageURL && (
          <div className="aspect-video overflow-hidden rounded-t-lg">
            <img src={item.imageURL} alt={item.itemName} className="h-full w-full object-cover" />
          </div>
        )}
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <CardTitle className="text-2xl">{item.itemName}</CardTitle>
            <div className="flex gap-2">
              <Badge variant={isLost ? "destructive" : "default"}>{isLost ? "Lost" : "Found"}</Badge>
              {isResolved && (
                <Badge className="bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))]">Resolved</Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <p>{item.description}</p>

          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <span className="flex items-center gap-2 text-muted-foreground"><Tag className="h-4 w-4" /> {item.category}</span>
            <span className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-4 w-4" /> {item.location}</span>
            <span className="flex items-center gap-2 text-muted-foreground"><Calendar className="h-4 w-4" /> {new Date(item.date).toLocaleDateString()}</span>
            <span className="flex items-center gap-2 text-muted-foreground"><Mail className="h-4 w-4" /> {item.contactInfo}</span>
          </div>
        </CardContent>
      </Card>

      {/* Claim form */}
      {!isResolved && (
        <>
          <Separator className="my-8" />
          <h2 className="mb-4 text-xl font-bold">Submit a Claim</h2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitClaim)} className="space-y-4">
              <FormField control={form.control} name="claimantName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Name</FormLabel>
                  <FormControl><Input placeholder="Full name" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="contactInfo" render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Info</FormLabel>
                  <FormControl><Input placeholder="Email or phone" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="message" render={({ field }) => (
                <FormItem>
                  <FormLabel>Why is this yours?</FormLabel>
                  <FormControl><Textarea placeholder="Describe identifying details…" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Submitting…" : "Submit Claim"}
              </Button>
            </form>
          </Form>
        </>
      )}
    </div>
  );
};

export default ItemDetails;
