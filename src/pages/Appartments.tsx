import { useState } from "react";
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

// ----------------- DUMMY PROJECTS -----------------
const projects = [
  { id: "P1", name: "Green Valley Residency" },
  { id: "P2", name: "Sunshine Heights" },
  { id: "P3", name: "Urban Nest Apartments" },
];

// ----------------- DUMMY FLATS -----------------
const flatsData = [
  {
    projectId: "P1",
    block: "A",
    bhk: 2,
    status: "free",
    sqft: 950,
    flatno: "101",
    floor: 1,
    flatId: "P1-A-1-101",
  },
  {
    projectId: "P1",
    block: "A",
    bhk: 3,
    status: "booked",
    sqft: 1050,
    flatno: "102",
    floor: 1,
    flatId: "P1-A-1-102",
  },
  {
    projectId: "P1",
    block: "B",
    bhk: 2,
    status: "free",
    sqft: 900,
    flatno: "101",
    floor: 1,
    flatId: "P1-B-1-101",
  },

  {
    projectId: "P2",
    block: "A",
    bhk: 2,
    status: "free",
    sqft: 940,
    flatno: "101",
    floor: 1,
    flatId: "P2-A-1-101",
  },
  {
    projectId: "P2",
    block: "B",
    bhk: 3,
    status: "sold",
    sqft: 1120,
    flatno: "202",
    floor: 2,
    flatId: "P2-B-2-202",
  },

  {
    projectId: "P3",
    block: "C",
    bhk: 2,
    status: "free",
    sqft: 880,
    flatno: "101",
    floor: 1,
    flatId: "P3-C-1-101",
  },
];

export default function Apartments() {
  const [search, setSearch] = useState("");
  const [selectedProject, setSelectedProject] = useState("all");
  const [selectedFlat, setSelectedFlat] = useState<any | null>(null);

  const filteredFlats = flatsData.filter((flat) => {
    const matchesProject =
      selectedProject === "all" || flat.projectId === selectedProject;

    const matchesSearch =
      flat.flatno.includes(search) ||
      flat.flatId.toLowerCase().includes(search.toLowerCase());

    return matchesProject && matchesSearch;
  });

  const statusColor = (status: string) => {
    if (status === "free") return "bg-green-500";
    if (status === "booked") return "bg-yellow-500";
    return "bg-red-500";
  };

  const getProjectName = (id: string) =>
    projects.find((p) => p.id === id)?.name || id;

  if (selectedFlat) {
    return (
      <ApartmentDetailsPage
        flat={selectedFlat}
        projectName={getProjectName(selectedFlat.projectId)}
        onBack={() => setSelectedFlat(null)}
        onPay={() => alert(`Paying for ${selectedFlat.flatId}`)}
      />
    );
  }

  return (
    <div className="w-full px-4 md:px-8 py-4 md:py-6 space-y-6">
      <h2 className="text-xl md:text-2xl font-bold">🏢 Apartment Inventory</h2>

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
                <SelectItem value="all">All Projects</SelectItem>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
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
                  <span className="text-gray-500">Flat ID:</span>
                  <p className="font-mono">{flat.flatId}</p>
                </div>

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
                    <TableHead>Flat ID</TableHead>
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
                      <TableCell>{flat.flatId}</TableCell>
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
                          {/* <Eye className="h-4 w-4 mr-2" /> */}
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
