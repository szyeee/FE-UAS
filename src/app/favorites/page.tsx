"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type FavItem = {
  ID_Produk: number;
  Nama?: string;
  Nama_Produk?: string;
  Harga?: number | string;
  Gambar?: string | null;
};

export default function FavoritesPage() {
  const [favs, setFavs] = useState<number[]>([]);
  const [items, setItems] = useState<FavItem[]>([]);
  const router = useRouter();

  useEffect(() => {
    try {
      const raw = localStorage.getItem("malibu_favorites");
      const arr: number[] = raw ? JSON.parse(raw) : [];
      setFavs(arr);
    } catch {
      setFavs([]);
    }
  }, []);

  // if you want to show product details in favorites, fetch from /api/produk
  useEffect(() => {
    async function load() {
      if (!favs || favs.length === 0) {
        setItems([]);
        return;
      }
      try {
        const res = await fetch("/api/produk");
        if (!res.ok) throw new Error("Gagal ambil produk");
        const all = await res.json();
        const found = (Array.isArray(all) ? all : []).filter((p: any) =>
          favs.includes(Number(p.ID_Produk))
        ).map((p: any) => ({ ...p }));
        setItems(found);
      } catch (err) {
        console.error(err);
        setItems([]);
      }
    }
    load();
  }, [favs]);

  function removeFav(id: number) {
    const next = favs.filter((x) => x !== id);
    localStorage.setItem("malibu_favorites", JSON.stringify(next));
    setFavs(next);
    setItems((prev) => prev.filter((p) => Number(p.ID_Produk) !== id));
  }

  if (items.length === 0) {
    return (
      <div style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
        <h1 className="text-2xl font-bold">Favorit</h1>
        <div className="card" style={{ marginTop: 12 }}>
          <p>Belum ada produk favorit.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 16 }}>
      <h1 className="text-2xl font-bold">Favorit</h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 12, marginTop: 12 }}>
        {items.map((p) => (
          <div key={p.ID_Produk} className="card">
            <img src={p.Gambar ?? "/no-img.png"} alt={p.Nama_Produk ?? p.Nama} style={{ width: "100%", height: 160, objectFit: "cover", borderRadius: 8 }} />
            <h3 style={{ marginTop: 8 }}>{p.Nama_Produk ?? p.Nama}</h3>
            <p style={{ color: "#6b7280" }}>Rp{Number(String(p.Harga ?? 0)).toLocaleString("id-ID")}</p>

            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button className="btn-pink" style={{ flex: 1 }} onClick={() => router.push(`/produk/${p.ID_Produk}`)}>
                Lihat
              </button>
              <button onClick={() => removeFav(Number(p.ID_Produk))} style={{ background: "white", border: "1px solid var(--pink-soft)", color: "var(--pink-primary)", padding: "8px 12px", borderRadius: 8 }}>
                Hapus
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
