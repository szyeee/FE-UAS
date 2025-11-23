"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

function safeNumber(value: any): number | null {
  const n = Number(value);
  return Number.isNaN(n) || n <= 0 ? null : n;
}

export default function ProdukDetailPage() {
  const router = useRouter();
  const params = useParams();
  const productId = safeNumber(
    Array.isArray(params?.id) ? params.id[0] : params?.id
  );

  const [produk, setProduk] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty] = useState(1);

  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, komentar: "" });
  const [hoverRating, setHoverRating] = useState(0);

  // =========================================================
  // LOAD DATA PRODUK
  // =========================================================
  useEffect(() => {
    if (!productId) return;

    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/produk/${productId}`);
        if (res.ok) {
          const d = await res.json();
          setProduk(d);
        } else {
          const all = await (await fetch("/api/produk")).json();
          const found = Array.isArray(all)
            ? all.find((p: any) => Number(p.ID_Produk) === productId)
            : null;
          setProduk(found || null);
        }
      } catch (err) {
        console.error(err);
        setProduk(null);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [productId]);

  // =========================================================
  // LOAD ULASAN
  // =========================================================
  useEffect(() => {
    if (!productId) return;
    fetch(`/api/review/${productId}`)
      .then((r) => r.json())
      .then((data) => setReviews(Array.isArray(data) ? data : []))
      .catch(() => setReviews([]));
  }, [productId]);

  // =========================================================
  // SUBMIT REVIEW
  // =========================================================
  async function submitReview(e: any) {
    e.preventDefault();
    if (!productId) return alert("ID produk tidak tersedia");
    if (!reviewForm.komentar) return alert("Isi komentar");

    try {
      const res = await fetch(`/api/review/${productId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: reviewForm.rating,
          komentar: reviewForm.komentar,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "Gagal mengirim review");
      }

      const newR = await res.json();
      setReviews((p) => [newR, ...p]);
      setReviewForm({ rating: 5, komentar: "" });
      setHoverRating(0);
      alert("Review berhasil dikirim");
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "Gagal");
    }
  }

  // =========================================================
  // CHECKOUT NOW (langsung checkout produk ini)
  // =========================================================
  function checkoutNow() {
    if (!produk) return;

    const item = {
      ID_Produk: produk.ID_Produk,
      Nama_Produk: produk.Nama_Produk ?? produk.Nama,
      Harga: produk.Harga,
      Gambar: produk.Gambar ?? "/no-img.png",
      Jumlah: qty,
    };

    // simpan 1 item untuk checkout
    localStorage.setItem("malibu_checkout", JSON.stringify([item]));

    router.push("/checkout");
  }

  // =========================================================

  if (loading)
    return <div style={{ padding: 24 }}>Loading…</div>;

  if (!produk)
    return (
      <div style={{ padding: 24 }}>
        Produk tidak ditemukan.
        <button
          onClick={() => router.push("/produk")}
          style={{ marginLeft: 8 }}
          className="btn-pink"
        >
          Kembali
        </button>
      </div>
    );

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: 16 }}>
      <div className="card" style={{ display: "flex", gap: 20 }}>
        <div style={{ flex: "0 0 360px" }}>
          <img
            src={produk.Gambar ?? "/no-img.png"}
            alt={produk.Nama_Produk}
            style={{ width: "100%", borderRadius: 8 }}
          />
        </div>

        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0 }}>{produk.Nama_Produk}</h1>
          <p style={{ color: "#6b7280" }}>{produk.Deskripsi}</p>

          <div style={{ marginTop: 8, fontWeight: 700 }}>
            Rp{Number(produk.Harga).toLocaleString("id-ID")}
          </div>

          <div style={{ marginTop: 8 }}>
            Kategori: {produk.Kategori?.Nama_Kategori ?? "-"}
          </div>

          {/* ===== BUTTON ACTIONS ===== */}
          <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
            {/* TAMBAH KE KERANJANG */}
            <button
              className="btn-pink"
              onClick={() => {
                const raw = localStorage.getItem("malibu_cart");
                const cart = raw ? JSON.parse(raw) : [];

                const exist = cart.find(
                  (c: any) => c.ID_Produk === produk.ID_Produk
                );
                if (exist) exist.Jumlah += 1;
                else
                  cart.push({
                    ID_Produk: produk.ID_Produk,
                    Nama: produk.Nama_Produk,
                    Harga: produk.Harga,
                    Jumlah: 1,
                  });

                localStorage.setItem("malibu_cart", JSON.stringify(cart));
                alert("Ditambahkan ke keranjang");
              }}
            >
              🛒 Tambah ke Keranjang
            </button>

            {/* CHECKOUT LANGSUNG */}
            <button
              onClick={checkoutNow}
              className="btn-pink"
              style={{ background: "#ff4fa5" }}
            >
              ⚡ Checkout Sekarang
            </button>

            {/* FAVORIT */}
            <button
              onClick={() => {
                const raw = localStorage.getItem("malibu_favorites");
                let favs = raw ? JSON.parse(raw) : [];

                if (favs.includes(produk.ID_Produk))
                  favs = favs.filter((x: any) => x !== produk.ID_Produk);
                else favs.push(produk.ID_Produk);

                localStorage.setItem("malibu_favorites", JSON.stringify(favs));
                alert("Favorit diperbarui");
              }}
              style={{
                background: "white",
                border: "1px solid var(--pink-soft)",
                color: "var(--pink-primary)",
                padding: "8px 12px",
                borderRadius: 8,
              }}
            >
              ♡ Favorit
            </button>
          </div>
        </div>
      </div>

      {/* ULASAN */}
      <hr style={{ margin: "20px 0" }} />

      <div className="card">
        <h2>Tulis Ulasan</h2>
        <form onSubmit={submitReview}>
          <label style={{ display: "block", marginBottom: 6 }}>Rating</label>

          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() =>
                  setReviewForm({ ...reviewForm, rating: n })
                }
                onMouseEnter={() => setHoverRating(n)}
                onMouseLeave={() => setHoverRating(0)}
                style={{
                  border: "none",
                  background: "none",
                  fontSize: 22,
                  cursor: "pointer",
                  color:
                    (hoverRating || reviewForm.rating) >= n
                      ? "#ff5fae"
                      : "#e5e7eb",
                }}
              >
                ★
              </button>
            ))}
          </div>

          <label>Komentar</label>
          <textarea
            value={reviewForm.komentar}
            onChange={(e) =>
              setReviewForm({ ...reviewForm, komentar: e.target.value })
            }
            rows={3}
            style={{ width: "100%", padding: 8, borderRadius: 8 }}
          />

          <div style={{ marginTop: 10 }}>
            <button type="submit" className="btn-pink">
              Kirim Ulasan
            </button>
          </div>
        </form>
      </div>

      <div style={{ marginTop: 20 }}>
        <h2>Ulasan Pembeli</h2>

        {reviews.length === 0 && <p>Belum ada ulasan.</p>}

        {reviews.map((r: any) => (
          <div
            key={r.ID_Ulasan ?? r.id ?? Math.random()}
            className="card"
            style={{ marginTop: 10 }}
          >
            <div style={{ fontWeight: 700 }}>
              {r.ID_Pengguna
                ? `Pengguna #${r.ID_Pengguna}`
                : "Pengguna"}
            </div>

            <div style={{ color: "#ffbfdd" }}>
              {"★".repeat(Number(r.Rating ?? r.rating ?? 0))}
            </div>

            <p>{r.Komentar ?? r.komentar ?? "-"}</p>

            <small style={{ color: "#6b7280" }}>
              {new Date(
                r.Dibuat_Pada ?? r.tanggal ?? Date.now()
              ).toLocaleString("id-ID")}
            </small>
          </div>
        ))}
      </div>
    </div>
  );
}
