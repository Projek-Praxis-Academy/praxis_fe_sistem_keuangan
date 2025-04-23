"use client";

export default function Dashboard() {
  return (
    <div className="min-h-screen transition-all pl-72 p-8 bg-white text-gray-900">

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card title="PRAXIS ACADEMY" saldo="49.000.000" tagihan="12.000.000" />
        <Card title="TECHNO NATURE" saldo="66.000.510" tagihan="21.650.000" />
        <Card title="Ekstra" saldo="32.000.000" tagihan="8.500.000" />
        <Card title="Uang Saku" saldo="" tagihan="7.300.500" />
      </div>

      {/* Rekapitulasi Keseluruhan */}
      <div className="mt-8">
        <Card title="Rekapitulasi Keseluruhan" saldo="174.001.010" tagihan="49.450.500" fullWidth />
      </div>
    </div>
  );
}

// Komponen Card
function Card({ title, saldo, tagihan, fullWidth }: { title: string; saldo: string; tagihan: string; fullWidth?: boolean }) {
  return (
    <div className={`p-6 rounded-lg shadow-md bg-blue-900 text-white ${fullWidth ? "w-full" : ""}`}>
      <h2 className="font-bold text-lg">{title}</h2>
      {saldo && (
        <>
          <p className="text-sm mt-2">Saldo saat ini</p>
          <input type="text" readOnly value={saldo} className="w-full p-3 mt-1 bg-white text-black rounded-md" />
        </>
      )}
      <p className="text-sm mt-2">Tagihan saat ini</p>
      <input type="text" readOnly value={tagihan} className="w-full p-3 mt-1 bg-white text-black rounded-md" />
    </div>
  );
}
