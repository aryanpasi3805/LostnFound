import { Search } from "lucide-react";
import { motion } from "framer-motion";

export function EmptyState({ title = "Nothing here yet", description = "Items will appear here once they're reported.", icon: Icon = Search }: { title?: string; description?: string; icon?: React.ElementType }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-muted-foreground" />
      </div>
      <h3 className="font-display text-lg font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
    </motion.div>
  );
}
