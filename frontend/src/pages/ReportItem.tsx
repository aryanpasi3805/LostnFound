import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createItem } from "@/services/api";

const categories = ["Electronics", "Bags", "Documents", "Accessories", "Clothing", "Keys", "Books", "Other"];

const schema = z.object({
  itemName: z.string().min(2, "Item name is required"),
  category: z.string().min(1, "Select a category"),
  description: z.string().optional().default(""),
  location: z.string().min(2, "Location is required"),
  date: z.string().min(1, "Date is required"),
  imageURL: z.string().optional().default(""),
  contactInfo: z.string().min(3, "Contact info is required"),
  type: z.enum(["lost", "found"]),
});

type FormValues = z.infer<typeof schema>;

const ReportItem = () => {
  const navigate = useNavigate();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      itemName: "",
      category: "",
      description: "",
      location: "",
      date: new Date().toISOString().split("T")[0],
      imageURL: "",
      contactInfo: "",
      type: "lost",
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      await createItem(data as Required<typeof data>);
      toast.success("Item reported successfully!");
      navigate("/");
    } catch {
      toast.error("Failed to report item.");
    }
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Report an Item</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {/* Type */}
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Lost or Found?" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="lost">Lost</SelectItem>
                    <SelectItem value="found">Found</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Item Name */}
          <FormField control={form.control} name="itemName" render={({ field }) => (
            <FormItem>
              <FormLabel>Item Name</FormLabel>
              <FormControl><Input placeholder="e.g. Blue Backpack" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          {/* Category */}
          <FormField control={form.control} name="category" render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger></FormControl>
                <SelectContent>
                  {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />

          {/* Description */}
          <FormField control={form.control} name="description" render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl><Textarea placeholder="Describe the item…" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          {/* Location */}
          <FormField control={form.control} name="location" render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl><Input placeholder="Where was it lost/found?" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          {/* Date */}
          <FormField control={form.control} name="date" render={({ field }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
              <FormControl><Input type="date" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          {/* Image URL */}
          <FormField control={form.control} name="imageURL" render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL (optional)</FormLabel>
              <FormControl><Input placeholder="https://…" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          {/* Contact */}
          <FormField control={form.control} name="contactInfo" render={({ field }) => (
            <FormItem>
              <FormLabel>Contact Info</FormLabel>
              <FormControl><Input placeholder="Email or phone" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Submitting…" : "Submit Report"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default ReportItem;
