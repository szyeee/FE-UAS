// components/ProductCard.tsx
"use client";
import Link from "next/link";

export default function ProductCard({ produk }: { produk: any }) {
  return (
    <article className="card" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ height: 200, background: "#fff0f6", borderRadius: 8, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
        {produk.Gambar ? <img src={produk.Gambar} alt={produk.Nama_Produk} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ color: "#999" }}>No Image</div>}
      </div>

      <div style={{ flex: 1 }}>
        <h3 style={{ margin: 0, fontSize: 18 }}>{produk.Nama_Produk}</h3>
        <p style={{ margin: "6px 0", color: "#666" }}>{produk.Kategori?.Nama_Kategori ?? ""}</p>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
        <div>
          <div style={{ fontSize: 12, color: "#888" }}>Mulai dari</div>
          <div style={{ fontWeight: 700 }}>Rp {Number(produk.Harga ?? 0).toLocaleString("id-ID")}</div>
        </div>
        <Link href={`/products/${produk.Slug}`}>
          <button className="btn-pink">Lihat</button>
        </Link>
      </div>
    </article>
  );
}
