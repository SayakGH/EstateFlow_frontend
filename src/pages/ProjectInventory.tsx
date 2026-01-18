import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { getProjectFlats } from "@/api/projects";

type Flat = {
  block: string;
  floor: number;
  flatno: string;
  sqft: number;
  bhk: number;
  status: "free" | "booked" | "sold";
};

export default function ProjectInventory({
  projectId,
  projectName,
  onBack,
}: {
  projectId: string;
  projectName: string;
  onBack: () => void;
}) {
  const [flats, setFlats] = useState<Flat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFlats = async () => {
      try {
        const res = await getProjectFlats(projectId);
        setFlats(res.flats);
      } catch (err) {
        console.error("Failed to fetch flats", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFlats();
  }, [projectId]);

  // Group only for rendering
  const grouped = useMemo(() => {
    const map: Record<string, Record<number, Flat[]>> = {};

    if (!Array.isArray(flats)) return map;

    flats.forEach((f) => {
      map[f.block] ??= {};
      map[f.block][f.floor] ??= [];
      map[f.block][f.floor].push(f);
    });

    return map;
  }, [flats]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-12 text-center text-muted-foreground">
        Loading project inventory...
      </div>
    );
  }

  if (!flats || flats.length === 0) {
    return (
      <div className="max-w-7xl mx-auto py-12 text-center text-muted-foreground">
        No flats found for this project.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 px-2 sm:px-0">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        ← Back to Projects
      </Button>

      <h2 className="text-2xl font-semibold">Project Inventory</h2>

      {/* Blocks */}
      {Object.entries(grouped).map(([block, floors]) => (
        <Card key={block}>
          <CardHeader>
            <CardTitle className="text-lg">Block {block}</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Floors */}
            {Object.entries(floors)
              .sort(([a], [b]) => Number(a) - Number(b))
              .map(([floor, flats]) => (
                <div key={`${block}-${floor}`} className="space-y-3">
                  {/* Floor Header */}
                  <div className="sticky top-0 z-10 bg-background py-1">
                    <h4 className="text-sm font-semibold text-muted-foreground">
                      Floor {floor} • {flats.length} Flats
                    </h4>
                  </div>

                  {/* Flats Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                    {flats.map((flat) => (
                      <FlatCard key={flat.flatno} flat={flat} />
                    ))}
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/* ================= Flat Card ================= */

function FlatCard({ flat }: { flat: Flat }) {
  return (
    <div
      className={cn(
        "rounded-md border px-3 py-2 text-xs font-medium transition cursor-pointer",
        "hover:shadow-sm",
        flat.status === "free" &&
          "border-emerald-500 bg-emerald-50 text-emerald-700",
        flat.status === "booked" &&
          "border-yellow-500 bg-yellow-50 text-yellow-700",
        flat.status === "sold" && "border-red-500 bg-red-50 text-red-700",
      )}
    >
      <div className="flex justify-between items-center">
        <span>#{flat.flatno}</span>
        <Badge variant="outline" className="text-[10px]">
          {flat.bhk}BHK
        </Badge>
      </div>

      <div className="mt-1 text-[10px]">{flat.sqft} sqft</div>
    </div>
  );
}
