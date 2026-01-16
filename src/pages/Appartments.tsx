export default function Apartments() {
  const flats = [
    { id: "A-101", status: "free" },
    { id: "A-102", status: "booked" },
    { id: "A-103", status: "sold" },
  ];

  const getColor = (s: string) => {
    if (s === "free") return "bg-green-100 text-green-700";
    if (s === "booked") return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Apartments</h2>

      <div className="grid grid-cols-6 gap-4">
        {flats.map((f) => (
          <div
            key={f.id}
            className={`p-4 rounded-xl border text-center font-semibold ${getColor(
              f.status
            )}`}
          >
            {f.id}
            <p className="text-xs mt-1">{f.status.toUpperCase()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
