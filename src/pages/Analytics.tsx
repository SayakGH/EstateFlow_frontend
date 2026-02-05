import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { getCustomerAnalytics } from "@/api/analytics";

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
  const percentage = total === 0 ? 0 : Math.round((value / total) * 100);

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
  /* ================= BACKEND STATE ================= */

  const [totalKYCs, setTotalKYCs] = useState(0);
  const [approved, setApproved] = useState(0);
  const [pending, setPending] = useState(0);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH ANALYTICS ================= */

  useEffect(() => {
    const fetchCustomerAnalytics = async () => {
      try {
        setLoading(true);
        const res = await getCustomerAnalytics();

        if (res.success) {
          setTotalKYCs(res.data.totalCustomers);
          setApproved(res.data.approvedCustomers);
          setPending(res.data.pendingCustomers);
        }
      } catch (err) {
        console.error("Failed to fetch analytics", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerAnalytics();
  }, []);

  /* ================= DUMMY SALES DATA (UNCHANGED) ================= */

  const totalApartments = 151;
  const free = 100;
  const booked = 40;
  const sold = 11;

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
              <p className="text-3xl font-bold">
                {loading ? "—" : totalKYCs}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Approved</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <p className="text-3xl font-bold text-green-600">
                {loading ? "—" : approved}
              </p>
              {!loading && (
                <CircularProgress
                  value={approved}
                  total={totalKYCs}
                  color="#16a34a"
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pending</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <p className="text-3xl font-bold text-yellow-600">
                {loading ? "—" : pending}
              </p>
              {!loading && (
                <CircularProgress
                  value={pending}
                  total={totalKYCs}
                  color="#ca8a04"
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ================= SALES (DUMMY, UNTOUCHED) ================= */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Sales</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">2</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Apartments</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{totalApartments}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Free</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-between items-center">
              <p className="text-3xl font-bold text-green-600">{free}</p>
              <CircularProgress
                value={free}
                total={totalApartments}
                color="#16a34a"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Booked</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-between items-center">
              <p className="text-3xl font-bold text-yellow-600">{booked}</p>
              <CircularProgress
                value={booked}
                total={totalApartments}
                color="#ca8a04"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sold</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-between items-center">
              <p className="text-3xl font-bold text-red-600">{sold}</p>
              <CircularProgress
                value={sold}
                total={totalApartments}
                color="#dc2626"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
