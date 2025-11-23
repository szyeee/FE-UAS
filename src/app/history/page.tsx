// src/app/history/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getUserFromStorage, getTokenFromStorage } from "@/lib/auth";

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = getUserFromStorage();
    const token = getTokenFromStorage();

    if (!user) {
      setLoading(false);
      setOrders([]);
      return;
    }

    // Adjust endpoint if backend berbeda
    fetch(`/api/pesanan?user=${user.ID_Pengguna}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
      .then((res) => {
        if (!res.ok) return [];
        return res.json();
      })
      .then((d) => setOrders(Array.isArray(d) ? d : []))
      .catch((err) => { console.error(err); setOrders([]); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 24 }}>Memuat riwayat pesanan…</div>;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
      <h2>Riwayat Pesanan</h2>

      {orders.length === 0 ? (
        <div className="card" style={{ padding: 16 }}>
          <p>Belum ada pesanan.</p>
          <Link href="/produk"><button className="btn-pink">Lihat Produk</button></Link>
        </div>
      ) : (
        <div className="card" style={{ padding: 16 }}>
          {orders.map((o) => (
            <div key={o.ID_Pesanan} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #eee" }}>
              <div>
                <div style={{ fontWeight: 700 }}># {o.ID_Pesanan}</div>
                <div style={{ fontSize: 13, color: "#666" }}>{new Date(o.Tanggal_Pesan ?? o.Tanggal ?? Date.now()).toLocaleString("id-ID")}</div>
                <div>Status: <b>{o.Status}</b></div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{ fontWeight: 700 }}>Rp{Number(o.Total ?? 0).toLocaleString("id-ID")}</div>
                <Link href={`/pesanan/${o.ID_Pesanan}`}><button className="btn-pink">Detail</button></Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
