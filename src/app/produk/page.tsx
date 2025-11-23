// src/app/produk/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Produk = {
  ID_Produk: number;
  Nama: string;
  Harga: number;
  Gambar: string | null;
};

export default function ProdukPage() {
  const [produk, setProduk] = useState<Produk[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const router = useRouter();

  useEffect(() => {
    // ambil produk dari API
    fetch("/api/produk")
      .then((res) => res.json())
      .then((data) => setProduk(data || []))
      .catch((err) => console.error(err));

    // load favorites dari localStorage (persist)
    try {
      const raw = localStorage.getItem("malibu_favorites");
      if (raw) setFavorites(JSON.parse(raw));
    } catch (e) {
      console.error("gagal load favorites", e);
    }
  }, []);

  function saveFavorites(newFavs: number[]) {
    setFavorites(newFavs);
    try {
      localStorage.setItem("malibu_favorites", JSON.stringify(newFavs));
    } catch (e) {
      console.error("gagal simpan favorites", e);
    }
  }

  function toggleFavorite(id: number) {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      try {
        localStorage.setItem("malibu_favorites", JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  }

  function addToCart(p: Produk) {
    try {
      const raw = localStorage.getItem("malibu_cart");
      let cart: any[] = raw ? JSON.parse(raw) : [];

      const existing = cart.find((c) => c.ID_Produk === p.ID_Produk);
      if (existing) {
        existing.Jumlah = Number(existing.Jumlah) + 1;
      } else {
        cart.push({
          ID_Produk: p.ID_Produk,
          Nama: p.Nama,
          Harga: p.Harga,
          Gambar: p.Gambar ?? "/no-img.png",
          Jumlah: 1,
        });
      }

      localStorage.setItem("malibu_cart", JSON.stringify(cart));
      // notifikasi sederhana
      alert(`${p.Nama} berhasil ditambahkan ke keranjang`);
    } catch (e) {
      console.error("gagal tambah ke cart", e);
      alert("Terjadi kesalahan saat menambahkan ke keranjang");
    }
  }

  return (
    <div>
      <h1 className="page-title">Daftar Produk</h1>

      <div className="produk-grid">
        {produk.map((p) => (
          <div key={p.ID_Produk} className="produk-card">
            <img
              src={p.Gambar || "/no-img.png"}
              alt={p.Nama}
              className="produk-img"
            />

            <h3>{p.Nama}</h3>
            <p className="harga">Rp {Number(p.Harga).toLocaleString("id-ID")}</p>

            {/* tombol aksi */}
            <div className="btn-group">
              <button
                className="btn-detail"
                onClick={() => router.push(`/produk/${p.ID_Produk}`)}
                type="button"
              >
                Lihat Detail
              </button>

              <button
                className="btn-keranjang"
                onClick={() => addToCart(p)}
                type="button"
              >
                🛒 Keranjang
              </button>

              <button
                className={favorites.includes(p.ID_Produk) ? "btn-fav fav-active" : "btn-fav"}
                onClick={() => toggleFavorite(p.ID_Produk)}
                type="button"
                aria-pressed={favorites.includes(p.ID_Produk)}
                title={favorites.includes(p.ID_Produk) ? "Hapus favorit" : "Tambah favorit"}
              >
                ♥
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
