import { Link } from "react-router-dom";
import { MapPin, Calendar, Tag } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Item } from "@/types";

const ItemCard = ({ item }: { item: Item }) => {
  const isLost = item.type === "lost";
  const isResolved = item.status === "resolved";

  return (
    <Link to={`/items/${item._id}`}>
      <Card className="group h-full transition-shadow hover:shadow-lg">
        {item.imageURL ? (
          <div className="aspect-video overflow-hidden rounded-t-lg">
            <img
              src={item.imageURL}
              alt={item.itemName}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          </div>
        ) : (
          <div className="flex aspect-video items-center justify-center rounded-t-lg bg-muted">
            <Tag className="h-10 w-10 text-muted-foreground/40" />
          </div>
        )}

        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold leading-tight line-clamp-1">{item.itemName}</h3>
            <div className="flex shrink-0 gap-1.5">
              <Badge variant={isLost ? "destructive" : "default"} className="text-xs">
                {isLost ? "Lost" : "Found"}
              </Badge>
              {isResolved && (
                <Badge variant="secondary" className="bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))] text-xs">
                  Resolved
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-1 text-sm text-muted-foreground">
          <p className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="line-clamp-1">{item.location}</span>
          </p>
          <p className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            {new Date(item.date).toLocaleDateString()}
          </p>
          <Badge variant="outline" className="mt-1 text-xs">
            {item.category}
          </Badge>
        </CardContent>
      </Card>
    </Link>
  );
};

export default ItemCard;
