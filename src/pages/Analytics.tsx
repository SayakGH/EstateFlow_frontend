import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

/* ===== Circular Percentage Component ===== */
function CircularProgress({
  value,
  total,
  color,
}: {
  value: number;
  total: number;
  color: string;
}) {
  const percentage = Math.round((value / total) * 100);

  const data = [
    { value: percentage },
    { value: 100 - percentage },
  ];

  return (
    <div className="relative h-[90px] w-[90px] flex-shrink-0">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            innerRadius={30}
            outerRadius={40}
            startAngle={90}
            endAngle={-270}
            dataKey="value"
          >
            <Cell fill={color} />
            <Cell fill="#e5e7eb" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm font-semibold">
        {percentage}%
      </div>
    </div>
  );
}

export default function Analytics() {
  const [selectedType, setSelectedType] = useState<"booked" | "sold">("booked");

  const totalKYCs = 40;
  const approved = 21;
  const pending = 19;

  const totalApartments = 151;
  const free = 100;
  const booked = 40;
  const sold = 11;

  const bookedData = [
    { date: "Aug 01", count: 2 },
    { date: "Aug 04", count: 1 },
    { date: "Aug 07", count: 3 },
    { date: "Aug 10", count: 4 },
    { date: "Aug 14", count: 2 },
    { date: "Aug 18", count: 5 },
    { date: "Aug 22", count: 3 },
    { date: "Aug 26", count: 4 },
    { date: "Aug 30", count: 6 },
  ];

  const soldData = [
    { date: "Aug 02", count: 1 },
    { date: "Aug 06", count: 1 },
    { date: "Aug 09", count: 2 },
    { date: "Aug 13", count: 1 },
    { date: "Aug 17", count: 3 },
    { date: "Aug 21", count: 2 },
    { date: "Aug 25", count: 1 },
    { date: "Aug 29", count: 2 },
  ];

  const chartData = selectedType === "booked" ? bookedData : soldData;

  return (
    <div className="space-y-10">
      {/* ================= CUSTOMERS ================= */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Customers</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Total KYCs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{totalKYCs}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Approved</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <p className="text-3xl font-bold text-green-600">{approved}</p>
              <CircularProgress value={approved} total={totalKYCs} color="#16a34a" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pending</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <p className="text-3xl font-bold text-yellow-600">{pending}</p>
              <CircularProgress value={pending} total={totalKYCs} color="#ca8a04" />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ================= SALES ================= */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Sales</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card>
            <CardHeader><CardTitle>Projects</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-bold">2</p></CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Apartments</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-bold">{totalApartments}</p></CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Free</CardTitle></CardHeader>
            <CardContent className="flex justify-between items-center">
              <p className="text-3xl font-bold text-green-600">{free}</p>
              <CircularProgress value={free} total={totalApartments} color="#16a34a" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Booked</CardTitle></CardHeader>
            <CardContent className="flex justify-between items-center">
              <p className="text-3xl font-bold text-yellow-600">{booked}</p>
              <CircularProgress value={booked} total={totalApartments} color="#ca8a04" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Sold</CardTitle></CardHeader>
            <CardContent className="flex justify-between items-center">
              <p className="text-3xl font-bold text-red-600">{sold}</p>
              <CircularProgress value={sold} total={totalApartments} color="#dc2626" />
            </CardContent>
          </Card>
        </div>

        {/* ================= GRAPH ================= */}
        <Card>
          <CardHeader className="flex justify-between items-center">
            <CardTitle>
              Apartments {selectedType === "booked" ? "Booked" : "Sold"} (Last Month)
            </CardTitle>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as "booked" | "sold")}
              className="border rounded-md px-3 py-1 text-sm"
            >
              <option value="booked">Booked</option>
              <option value="sold">Sold</option>
            </select>
          </CardHeader>

          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="count" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
