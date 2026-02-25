import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Trash2, CheckCircle, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getItems, getClaims, resolveItem, deleteItem } from "@/services/api";
import type { Item, Claim } from "@/types";

const Admin = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [i, c] = await Promise.all([getItems(), getClaims()]);
    setItems(i);
    setClaims(c);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleResolve = async (id: string) => {
    await resolveItem(id);
    toast.success("Marked as resolved");
    load();
  };

  const handleDelete = async (id: string) => {
    await deleteItem(id);
    toast.success("Item deleted");
    load();
  };

  const claimsForItem = (itemId: string) => claims.filter((c) => c.itemId === itemId);

  if (loading) return <p className="py-20 text-center text-muted-foreground">Loading…</p>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Admin Dashboard</h1>

      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Claims</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
              const ic = claimsForItem(item._id);
              return (
                <TableRow key={item._id}>
                  <TableCell className="font-medium">{item.itemName}</TableCell>
                  <TableCell>
                    <Badge variant={item.type === "lost" ? "destructive" : "default"} className="text-xs">
                      {item.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={item.status === "resolved" ? "bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))]" : ""}
                    >
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[140px] truncate">{item.location}</TableCell>
                  <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {ic.length > 0 ? (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="gap-1">
                            <Eye className="h-3.5 w-3.5" /> {ic.length}
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Claims for {item.itemName}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            {ic.map((c) => (
                              <div key={c._id} className="rounded-md border p-3 text-sm">
                                <p className="font-medium">{c.claimantName}</p>
                                <p className="text-muted-foreground">{c.contactInfo}</p>
                                <p className="mt-1">{c.message}</p>
                              </div>
                            ))}
                          </div>
                        </DialogContent>
                      </Dialog>
                    ) : (
                      <span className="text-xs text-muted-foreground">0</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {item.status === "active" && (
                        <Button variant="ghost" size="icon" onClick={() => handleResolve(item._id)} title="Resolve">
                          <CheckCircle className="h-4 w-4 text-[hsl(var(--success))]" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(item._id)} title="Delete">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Admin;
