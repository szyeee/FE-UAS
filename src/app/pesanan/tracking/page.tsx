"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

const getTokenFromStorage = (): string | null => {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem("token");
  } catch {
    return null;
  }
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getTokenFromStorage();

    fetch(`/api/pesanan/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((d) => setOrder(d))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ padding: 24 }}>Memuat data…</div>;
  if (!order) return <div style={{ padding: 24 }}>Pesanan tidak ditemukan.</div>;

  const steps = ["Dibuat", "Diproses", "Dikirim", "Selesai"];
  const currentStep = steps.indexOf(order.Status);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
      <h2>Pesanan #{order.ID_Pesanan}</h2>

      {/* TRACKING PENGIRIMAN */}
      <div style={{ marginTop: 16 }} className="card">
        <h3>Status Pengiriman</h3>

        <div style={{ display: "flex", gap: 16, marginTop: 16 }}>
          {steps.map((s, i) => (
            <div key={i} style={{ textAlign: "center", flex: 1 }}>
              <div
                style={{
                  height: 14,
                  borderRadius: 999,
                  background: i <= currentStep ? "var(--pink-primary)" : "#e5e7eb",
                }}
              ></div>
              <div style={{ marginTop: 8, fontSize: 14 }}>{s}</div>
            </div>
          ))}
        </div>
      </div>

      {/* PRODUK */}
      <div className="card" style={{ marginTop: 16 }}>
        <h3>Produk</h3>
        {order.Produk?.map((p: any) => (
          <div key={p.ID_Produk} style={{ padding: "8px 0", borderBottom: "1px solid #eee" }}>
            <b>{p.Nama}</b> — {p.Jumlah} x Rp{p.Harga}
          </div>
        ))}
      </div>

      {/* INFORMASI */}
      <div className="card" style={{ marginTop: 16 }}>
        <h3>Informasi Pengiriman</h3>
        <p><b>Alamat:</b> {order.Alamat}</p>
        <p><b>Metode Pembayaran:</b> {order.Metode}</p>
        <p><b>Total:</b> Rp{order.Total}</p>
      </div>
    </div>
  );
}
