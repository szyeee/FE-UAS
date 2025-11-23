// src/app/tracking/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function TrackingIndexPage() {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  function goTrack(e?: any) {
    e?.preventDefault();
    setError("");
    const id = input.trim();
    if (!id) {
      setError("Masukkan ID pesanan.");
      return;
    }
    // navigate to order detail (tracking handled there)
    router.push(`/tracking/${encodeURIComponent(id)}`);
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
      <h2>Tracking Pesanan</h2>

      <div className="card" style={{ padding: 16 }}>
        <p>Masukkan ID pesanan untuk melihat status pengiriman (fake demo).</p>

        <form onSubmit={goTrack} style={{ display: "flex", gap: 8 }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="ID Pesanan (contoh: 123)"
            style={{ flex: 1, padding: 8, borderRadius: 8 }}
          />
          <button type="submit" className="btn-pink">Lacak</button>
        </form>

        {error && <div style={{ color: "red", marginTop: 8 }}>{error}</div>}

        <hr style={{ margin: "12px 0" }} />

        <p>
          Atau buka <Link href="/history"><b>Riwayat Pesanan</b></Link> untuk melihat pesananmu.
        </p>
      </div>
    </div>
  );
}
