// src/app/checkout/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type CartItem = {
  ID_Produk: number;
  Nama?: string;
  Nama_Produk?: string;
  Harga: number | string;
  Gambar?: string | null;
  Jumlah: number;
};

export default function CheckoutPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    ID_Pengguna: 1,
    Alamat: "",
    Metode_Bayar: "Transfer Bank",
  });

  useEffect(() => {
    // read malibu_checkout first; if missing, fallback to malibu_cart
    try {
      const raw = localStorage.getItem("malibu_checkout") ?? localStorage.getItem("malibu_cart");
      const arr = raw ? JSON.parse(raw) : [];
      const normalized = Array.isArray(arr)
        ? arr.map((it: any) => ({
            ID_Produk: Number(it.ID_Produk),
            Nama: it.Nama ?? it.Nama_Produk ?? it.nama ?? "",
            Nama_Produk: it.Nama_Produk ?? it.Nama ?? it.nama ?? "",
            Harga: Number(it.Harga ?? it.harga ?? 0),
            Gambar: it.Gambar ?? it.gambar ?? null,
            Jumlah: Number(it.Jumlah ?? it.qty ?? 1),
          }))
        : [];
      setItems(normalized);
    } catch (e) {
      console.error("gagal baca cart/checkout dari localStorage", e);
      setItems([]);
    }
  }, []);

  function saveToLocalStorageCheckout(next: CartItem[]) {
    try {
      localStorage.setItem("malibu_checkout", JSON.stringify(next));
    } catch (e) {
      console.warn("gagal simpan malibu_checkout", e);
    }
  }

  function changeQty(id: number, qty: number) {
    const next = items.map((it) =>
      it.ID_Produk === id ? { ...it, Jumlah: Math.max(1, Math.floor(qty)) } : it
    );
    setItems(next);
    saveToLocalStorageCheckout(next);
  }

  function removeItem(id: number) {
    const next = items.filter((it) => it.ID_Produk !== id);
    setItems(next);
    saveToLocalStorageCheckout(next);
  }

  const subtotal = items.reduce((s, it) => s + Number(it.Harga ?? 0) * Number(it.Jumlah ?? 1), 0);
  const shipping = subtotal > 0 ? 15000 : 0;
  const total = subtotal + shipping;

  async function submitOrder(e: any) {
    e?.preventDefault?.();
    if (items.length === 0) {
      alert("Tidak ada item untuk di-checkout");
      return;
    }
    if (!form.Alamat || form.Alamat.trim().length < 5) {
      alert("Isi alamat pengiriman yang valid");
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        ID_Pengguna: Number(form.ID_Pengguna),
        Total: total.toString(),
        Status: "pending",
        Alamat: form.Alamat,
        Metode_Bayar: form.Metode_Bayar,
        Items: items.map((it) => ({
          ID_Produk: Number(it.ID_Produk),
          Kuantitas: Number(it.Jumlah),
          Harga_Unit: Number(it.Harga),
          Subtotal: Number(it.Harga) * Number(it.Jumlah),
        })),
      };

      const res = await fetch("/api/pesanan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        console.error("POST /api/pesanan failed", data);
        throw new Error(data?.error || "Gagal membuat pesanan");
      }

      // Ambil ID_Pesanan dari response. Beberapa backend mungkin menggunakan property berbeda.
      const createdId =
        data?.ID_Pesanan ?? data?.id ?? data?.ID ?? (data && data.ID ? data.ID : null);

      // Hapus item yang dibeli dari malibu_cart (jika ada)
      try {
        const rawCart = localStorage.getItem("malibu_cart");
        if (rawCart) {
          let cart = JSON.parse(rawCart);
          const ids = new Set(items.map((i) => Number(i.ID_Produk)));
          cart = Array.isArray(cart) ? cart.filter((c: any) => !ids.has(Number(c.ID_Produk))) : cart;
          localStorage.setItem("malibu_cart", JSON.stringify(cart));
        }
      } catch (err) {
        console.warn("gagal update malibu_cart", err);
      }

      // clear checkout storage
      try {
        localStorage.removeItem("malibu_checkout");
      } catch {}

      // simpan last order id untuk konfirmasi quick link
      try {
        if (createdId) localStorage.setItem("malibu_last_order_id", String(createdId));
      } catch {}

      // notify navbar dan listeners
      try {
        window.dispatchEvent(new Event("cart_updated"));
        window.dispatchEvent(new Event("auth_updated"));
      } catch {}

      // redirect ke detail pesanan (jika ada id) atau ke history
      if (createdId) {
        router.push(`/pesanan/${createdId}`);
      } else {
        alert("Pesanan dibuat. Cek riwayat pesanan untuk detail.");
        router.push("/history");
      }
    } catch (err: any) {
      console.error("checkout error:", err);
      alert(err?.message || "Gagal checkout");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700 }}>Checkout</h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 16, marginTop: 12 }}>
        <div>
          <div className="card">
            <h3>Alamat Pengiriman</h3>
            <form onSubmit={submitOrder} style={{ marginTop: 8 }}>
              <div style={{ marginBottom: 8 }}>
                <label className="font-semibold">Alamat lengkap</label>
                <textarea
                  value={form.Alamat}
                  onChange={(e) => setForm({ ...form, Alamat: e.target.value })}
                  rows={3}
                  className="w-full border p-2 rounded"
                ></textarea>
              </div>

              <div style={{ marginBottom: 8 }}>
                <label className="font-semibold">Metode Pembayaran</label>
                <select
                  value={form.Metode_Bayar}
                  onChange={(e) => setForm({ ...form, Metode_Bayar: e.target.value })}
                  className="w-full border p-2 rounded"
                >
                  <option>Transfer Bank</option>
                  <option>COD</option>
                  <option>QRIS</option>
                </select>
              </div>

              <div style={{ marginTop: 12 }}>
                <button type="submit" className="btn-pink" disabled={loading}>
                  {loading ? "Memproses..." : `Bayar Rp${total.toLocaleString("id-ID")}`}
                </button>
              </div>
            </form>
          </div>
        </div>

        <aside>
          <div className="card">
            <h3>Ringkasan Pesanan</h3>
            <div style={{ marginTop: 8 }}>
              {items.length === 0 && <div style={{ color: "#666" }}>Tidak ada item.</div>}

              {items.map((it) => (
                <div key={it.ID_Produk} style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                  <div style={{ maxWidth: 250 }}>
                    <div style={{ fontWeight: 700 }}>{it.Nama_Produk ?? it.Nama}</div>
                    <div style={{ fontSize: 12, color: "#666" }}>Rp{Number(it.Harga).toLocaleString("id-ID")} / unit</div>
                    <div style={{ marginTop: 8, display: "flex", gap: 8, alignItems: "center" }}>
                      <button
                        className="btn-pink"
                        onClick={() => changeQty(Number(it.ID_Produk), Number(it.Jumlah) - 1)}
                        type="button"
                      >
                        -
                      </button>
                      <input
                        value={it.Jumlah}
                        onChange={(e) => changeQty(Number(it.ID_Produk), Number(e.target.value || 1))}
                        style={{ width: 56, textAlign: "center", margin: "0 8px" }}
                      />
                      <button
                        className="btn-pink"
                        onClick={() => changeQty(Number(it.ID_Produk), Number(it.Jumlah) + 1)}
                        type="button"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeItem(Number(it.ID_Produk))}
                        style={{
                          marginLeft: 8,
                          background: "white",
                          border: "1px solid var(--pink-soft)",
                          color: "var(--pink-primary)",
                          padding: "6px 10px",
                          borderRadius: 8,
                        }}
                        type="button"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>Rp{(Number(it.Harga) * Number(it.Jumlah)).toLocaleString("id-ID")}</div>
                </div>
              ))}
            </div>

            <hr style={{ margin: "10px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>Subtotal</div>
              <div>Rp{subtotal.toLocaleString("id-ID")}</div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>Ongkir</div>
              <div>Rp{shipping.toLocaleString("id-ID")}</div>
            </div>
            <hr style={{ margin: "10px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
              <div>Total</div>
              <div>Rp{total.toLocaleString("id-ID")}</div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
