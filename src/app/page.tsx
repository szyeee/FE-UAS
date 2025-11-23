// src/app/page.tsx
"use client";

import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="home-container">
      {/* HERO */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="title">Welcome to Malibu Shop 💗</h1>
          <p className="subtitle">
            Pretty things made with love — specially for you.
          </p>

          <button
            className="btn-primary"
            onClick={() => router.push("/produk")}
          >
            Lihat Produk
          </button>
        </div>
      </section>

      {/* FEATURE BOXES */}
      <section className="features">
        {/* PROMO BOX */}
          <section className="promo-box">
            <h2>🎀 Promo Spesial Bulan Ini</h2>
            <p>Dapatkan diskon hingga 30% untuk produk pilihan!</p>
            <button className="btn-promo">Lihat Promo</button>
          </section>
          
        <div className="feature-box">
          <h3>✨ Produk Berkualitas</h3>
          <p>Dibuat dengan detail dan cinta.</p>
        </div>

        <div className="feature-box">
          <h3>🚚 Pengiriman Cepat</h3>
          <p>Barang langsung diproses hari itu juga.</p>
        </div>

        <div className="feature-box">
          <h3>💗 Custom Gift</h3>
          <p>Bisa request warna, ukuran, dan kemasan.</p>
        </div>
      </section>
    </div>
  );
}
