import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ApartmentDetailsPage from "./ApartmentDetails";
import type { IProjectName } from "@/types/projectTypes";
import { getProjectFlats, getProjectNames } from "@/api/projects";

export default function Apartments() {
  const [search, setSearch] = useState("");
  const [selectedProject, setSelectedProject] = useState<string | undefined>(
    undefined,
  );

  const [selectedFlat, setSelectedFlat] = useState<any | null>(null);
  const [projects, setProjects] = useState<IProjectName[]>([]);
  const [flats, setFlats] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const filteredFlats = flats.filter((flat) => {
    const matchesSearch =
      flat.flatno.includes(search) ||
      flat.flatId.toLowerCase().includes(search.toLowerCase());

    return matchesSearch;
  });

  const fetchProjects = async () => {
    const data = await getProjectNames();
    setProjects(data.projects);

    if (data.projects.length > 0) {
      setSelectedProject(data.projects[0].id);
    }
  };

  const fetchFlatsByProject = async (projectId: string | undefined) => {
    if (!projectId) return;

    try {
      setLoading(true);
      const data = await getProjectFlats(projectId);
      setFlats(data.flats);
    } catch (err) {
      console.error("Error fetching flats:", err);
    } finally {
      setLoading(false);
    }
  };

  const statusColor = (status: string) => {
    if (status === "free") return "bg-green-500";
    if (status === "booked") return "bg-yellow-500";
    return "bg-red-500";
  };

  const getProjectName = (id: string) =>
    projects.find((p) => p.id === id)?.name || id;

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetchFlatsByProject(selectedProject);
    }
  }, [selectedProject]);

  if (selectedFlat) {
    return (
      <ApartmentDetailsPage
        flat={selectedFlat}
        projectName={getProjectName(selectedFlat.projectId)}
        onBack={() => {
          setSelectedFlat(null);
          fetchFlatsByProject(selectedProject);
        }}
        onPay={() => alert(`Paying for ${selectedFlat.flatId}`)}
      />
    );
  }
  if (!loading && selectedProject && flats.length === 0) {
    return (
      <div className="text-center mt-10 text-gray-500">
        No flats found for this project.
      </div>
    );
  }

  return (
    <div className="w-full px-4 md:px-8 py-4 md:py-6 space-y-6">
      <h2 className="text-xl md:text-2xl font-bold">Apartment Inventory</h2>

      {/* -------- FILTERS -------- */}
      <Card>
        <CardContent className="pt-4 md:pt-6">
          <div className="flex flex-col md:flex-row gap-3 md:gap-4">
            <Input
              placeholder="Search flat no or flat ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-1/2 h-11"
            />

            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="w-full md:w-56 h-11">
                <SelectValue placeholder="Select Project" />
              </SelectTrigger>
              <SelectContent>
                {projects.length === 0 ? (
                  <SelectItem value="none" disabled>
                    No projects found
                  </SelectItem>
                ) : (
                  projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* ========== MOBILE VIEW ========== */}
      <div className="block md:hidden space-y-4">
        {filteredFlats.map((flat) => (
          <Card key={flat.flatId} className="shadow-sm">
            <CardContent className="pt-4 space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-lg">
                  {flat.block}-{flat.flatno}
                </h3>
                <Badge className={`${statusColor(flat.status)} px-3 py-1`}>
                  {flat.status.toUpperCase()}
                </Badge>
              </div>

              <p className="text-sm text-gray-600">
                {getProjectName(flat.projectId)}
              </p>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">Floor:</span>
                  <p>{flat.floor}</p>
                </div>

                <div>
                  <span className="text-gray-500">BHK:</span>
                  <p>{flat.bhk} BHK</p>
                </div>

                <div>
                  <span className="text-gray-500">Area:</span>
                  <p>{flat.sqft} sq.ft</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ========== DESKTOP VIEW ========== */}
      <div className="hidden md:block">
        <Card>
          <CardContent className="pt-4">
            <div className="overflow-x-auto rounded-md border">
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead>Block</TableHead>
                    <TableHead>Flat No</TableHead>
                    <TableHead>Floor</TableHead>
                    <TableHead>BHK</TableHead>
                    <TableHead>Sqft</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredFlats.map((flat) => (
                    <TableRow key={flat.flatId} className="hover:bg-gray-50">
                      <TableCell className="font-semibold">
                        {getProjectName(flat.projectId)}
                      </TableCell>
                      <TableCell>{flat.block}</TableCell>
                      <TableCell>{flat.flatno}</TableCell>
                      <TableCell>{flat.floor}</TableCell>
                      <TableCell>{flat.bhk} BHK</TableCell>
                      <TableCell>{flat.sqft} sq.ft</TableCell>
                      <TableCell>
                        <Badge
                          className={`${statusColor(flat.status)} px-3 py-1`}
                        >
                          {flat.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {/* Action */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedFlat(flat)}
                        >
                          Manage
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
