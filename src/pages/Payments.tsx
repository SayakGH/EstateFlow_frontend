import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Payments() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payments</CardTitle>
      </CardHeader>

      <CardContent>
        <table className="w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Customer</th>
              <th className="p-2 border">Flat</th>
              <th className="p-2 border">Amount</th>
              <th className="p-2 border">Date</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2 border">Rahul Sen</td>
              <td className="p-2 border">A-101</td>
              <td className="p-2 border">₹5,00,000</td>
              <td className="p-2 border">12 Jan 2026</td>
            </tr>
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
