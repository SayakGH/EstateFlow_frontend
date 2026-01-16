import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Projects() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Projects</h2>
        <Button>
          <Plus className="w-4 h-4 mr-2" /> Add Project
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {["Green Heights", "Skyline Towers", "River View"].map((p) => (
              <div key={p} className="p-4 border rounded-xl bg-white shadow-sm">
                <p className="font-semibold">{p}</p>
                <p className="text-sm text-muted-foreground">
                  4 Blocks • 120 Apartments
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
