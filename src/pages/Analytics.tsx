import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import {
  getCustomerAnalytics,
  getSalesAnalytics,
  getAnalyticsProjects as getProjectList,
  getProjectSalesAnalytics,
} from "@/api/analytics";
import type { AnalyticsProject } from "@/types/analyticsTypes";

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

  const data = [{ value: percentage }, { value: 100 - percentage }];

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
  /* ================= CUSTOMER STATE ================= */

  const [totalKYCs, setTotalKYCs] = useState(0);
  const [approved, setApproved] = useState(0);
  const [pending, setPending] = useState(0);

  /* ================= SALES STATE ================= */

  const [totalProjects, setTotalProjects] = useState(0);
  const [totalApartments, setTotalApartments] = useState(0);
  const [free, setFree] = useState(0);
  const [booked, setBooked] = useState(0);
  const [sold, setSold] = useState(0);

  const [loading, setLoading] = useState(true);

  /* ================= PROJECT DETAIL STATE ================= */

  const [showProjects, setShowProjects] = useState(false);

  // 🔥 FIXED HERE → use id instead of projectId
  const [projects, setProjects] = useState<AnalyticsProject[]>([]);

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  );

  const [projectDetails, setProjectDetails] = useState<{
    totalApartments: number;
    freeApartments: number;
    bookedApartments: number;
    soldApartments: number;
  } | null>(null);

  /* ================= FETCH INITIAL ANALYTICS ================= */

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);

        const [customerRes, salesRes] = await Promise.all([
          getCustomerAnalytics(),
          getSalesAnalytics(),
        ]);

        if (customerRes.success) {
          setTotalKYCs(customerRes.data.totalCustomers);
          setApproved(customerRes.data.approvedCustomers);
          setPending(customerRes.data.pendingCustomers);
        }

        if (salesRes.success) {
          setTotalProjects(salesRes.data.totalProjects);
          setTotalApartments(salesRes.data.totalApartments);
          setFree(salesRes.data.freeApartments);
          setBooked(salesRes.data.bookedApartments);
          setSold(salesRes.data.soldApartments);
        }
      } catch (err) {
        console.error("Failed to fetch analytics", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  /* ================= LOAD PROJECT LIST ================= */

  const handleToggleProjects = async () => {
    setShowProjects(!showProjects);

    if (!showProjects) {
      try {
        const res = await getProjectList();
        if (res.success) {
          setProjects(res.projects);
        }
      } catch (err) {
        console.error("Failed to fetch project list", err);
      }
    }
  };

  /* ================= LOAD SELECTED PROJECT DETAILS ================= */

  const handleSelectProject = async (projectId: string) => {
    setSelectedProjectId(projectId);

    try {
      const res = await getProjectSalesAnalytics(projectId);
      if (res.success) {
        setProjectDetails(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch project analytics", err);
    }
  };

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
              <p className="text-3xl font-bold">{loading ? "—" : totalKYCs}</p>
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

      {/* ================= SALES ================= */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Sales</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {loading ? "—" : totalProjects}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Apartments</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {loading ? "—" : totalApartments}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Free</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-between items-center">
              <p className="text-3xl font-bold text-green-600">
                {loading ? "—" : free}
              </p>
              {!loading && (
                <CircularProgress
                  value={free}
                  total={totalApartments}
                  color="#16a34a"
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Booked</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-between items-center">
              <p className="text-3xl font-bold text-yellow-600">
                {loading ? "—" : booked}
              </p>
              {!loading && (
                <CircularProgress
                  value={booked}
                  total={totalApartments}
                  color="#ca8a04"
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sold</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-between items-center">
              <p className="text-3xl font-bold text-red-600">
                {loading ? "—" : sold}
              </p>
              {!loading && (
                <CircularProgress
                  value={sold}
                  total={totalApartments}
                  color="#dc2626"
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* ================= PROJECT DETAILS ================= */}
        <div className="pt-6">
          <button
            onClick={handleToggleProjects}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm"
          >
            {showProjects ? "Hide Project Details" : "View Project Details"}
          </button>

          {showProjects && (
            <div className="mt-4 space-y-4">
              <select
                value={selectedProjectId || ""}
                onChange={(e) => handleSelectProject(e.target.value)}
                className="border rounded-md px-3 py-2"
              >
                <option value="">Select Project</option>

                {/* 🔥 FIXED HERE → p.id */}
                {projects.map((p) => (
                  <option key={p.projectId} value={p.projectId}>
                    {p.name}
                  </option>
                ))}
              </select>

              {projectDetails && (
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Total Flats</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">
                        {projectDetails.totalApartments}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Free</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-green-600">
                        {projectDetails.freeApartments}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Booked</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-yellow-600">
                        {projectDetails.bookedApartments}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Sold</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-red-600">
                        {projectDetails.soldApartments}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
