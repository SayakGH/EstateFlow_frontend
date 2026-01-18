import { useState } from "react";
import * as XLSX from "xlsx";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import ProjectInventory from "./ProjectInventory";
import { Plus, Upload, Eye } from "lucide-react";
import { useEffect } from "react";
import { getAllProjects, createProject } from "@/api/projects";
import type { FlatPayload, IProject } from "@/types/projectTypes";

export default function Projects() {
  const [open, setOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [selectedProject, setSelectedProject] = useState<IProject | null>(null);

  const [projects, setProjects] = useState<IProject[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await getAllProjects();

        setProjects(res.projects);
      } catch (err) {
        console.error("Failed to fetch projects", err);
      }
    };

    fetchProjects();
  }, []);

  if (selectedProject) {
    return (
      <ProjectInventory
        projectId={selectedProject.projectId}
        projectName={selectedProject.name}
        onBack={() => setSelectedProject(null)}
      />
    );
  }

  const handleSubmit = async () => {
    if (!projectName || !file) {
      alert("Project name and Excel file are required");
      return;
    }

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    const rows = XLSX.utils.sheet_to_json(sheet) as {
      block: string;
      floor: number;
      flatno: string;
      sqft: number;
      bhk: number;
    }[];

    // ✅ Flat JSON (each row = one entry)
    const flats = rows.map((row) => ({
      projectName,
      block: row.block,
      floor: row.floor,
      flatno: row.flatno,
      sqft: row.sqft,
      bhk: row.bhk,
      status: "free", // 👈 required flag
    }));

    setLoading(true);

    try {
      await createProject({
        name: projectName,
        flats: flats as FlatPayload[],
      });

      // refresh projects list
      const res = await getAllProjects();

      setProjects(res.projects);

      setProjectName("");
      setFile(null);
      setOpen(false);
    } catch (err) {
      console.error("Create project failed", err);
      alert("Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  // const soldPercentage =
  //   project.totalApartments > 0
  //     ? Math.round((project.soldApartments / project.totalApartments) * 100)
  //     : 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Projects</h2>
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Project
        </Button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {projects.map((project) => {
          const soldPercentage =
            project.totalApartments > 0
              ? Math.round(
                  (project.soldApartments / project.totalApartments) * 100,
                )
              : 0;

          return (
            <Card
              key={project.projectId}
              className="hover:shadow-lg transition border-l-4 border-l-indigo-500"
            >
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between">
                  <span>{project.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {project.totalApartments} Flats
                  </span>
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Inventory Stats */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-lg bg-emerald-50 p-2">
                    <p className="text-xs text-muted-foreground">Free</p>
                    <p className="font-semibold text-emerald-700">
                      {project.freeApartments}
                    </p>
                  </div>

                  <div className="rounded-lg bg-yellow-50 p-2">
                    <p className="text-xs text-muted-foreground">Booked</p>
                    <p className="font-semibold text-yellow-700">
                      {project.bookedApartments}
                    </p>
                  </div>

                  <div className="rounded-lg bg-red-50 p-2">
                    <p className="text-xs text-muted-foreground">Sold</p>
                    <p className="font-semibold text-red-700">
                      {project.soldApartments}
                    </p>
                  </div>
                </div>

                {/* Sales Progress */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Sales Progress</span>
                    <span>{soldPercentage}%</span>
                  </div>
                  <Progress value={soldPercentage} />
                </div>

                {/* Action */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setSelectedProject(project)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Project
                </Button>
              </CardContent>
            </Card>
          );
        })}

        {projects.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No projects created yet.
          </div>
        )}
      </div>

      {/* Add Project Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1">
              <Label>Project Name</Label>
              <Input
                placeholder="e.g. Green Heights"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <Label>Upload Excel Sheet</Label>
              <Input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <p className="text-xs text-muted-foreground">
                Required columns: block, floor, flatno, sqft, bhk
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="gap-2" disabled={loading}>
              <Upload className="h-4 w-4" />
              {loading ? "Processing..." : "Process Excel"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
