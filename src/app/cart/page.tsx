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

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selected, setSelected] = useState<Record<number, boolean>>({});
  const [selectAll, setSelectAll] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadCart();
    // also listen to cart_updates from other UI
    function onCustom() { loadCart(); }
    window.addEventListener("cart_updated", onCustom);
    return () => window.removeEventListener("cart_updated", onCustom);
  }, []);

  function loadCart() {
    try {
      const raw = localStorage.getItem("malibu_cart");
      const arr: any[] = raw ? JSON.parse(raw) : [];
      const normalized = arr.map(it => ({ ...it, Jumlah: Number(it.Jumlah ?? 1) }));
      setCart(normalized);
      // preselect all false
      const sel: Record<number, boolean> = {};
      normalized.forEach(it => sel[Number(it.ID_Produk)] = false);
      setSelected(sel);
      setSelectAll(false);
    } catch {
      setCart([]);
      setSelected({});
      setSelectAll(false);
    }
  }

  function saveCart(next: CartItem[]) {
    localStorage.setItem("malibu_cart", JSON.stringify(next));
    // notify other components (Navbar)
    window.dispatchEvent(new Event("cart_updated"));
    setCart(next);
  }

  function toggleSelect(id: number) {
    setSelected(prev => {
      const next = { ...prev, [id]: !prev[id] };
      // update selectAll
      const all = Object.keys(next).length > 0 && Object.values(next).every(Boolean);
      setSelectAll(all);
      return next;
    });
  }

  function handleSelectAll(val: boolean) {
    setSelectAll(val);
    const next: Record<number, boolean> = {};
    cart.forEach(c => next[Number(c.ID_Produk)] = val);
    setSelected(next);
  }

  function changeQty(id: number, qty: number) {
    const next = cart.map(c => c.ID_Produk === id ? { ...c, Jumlah: Math.max(1, qty) } : c);
    saveCart(next);
  }

  function removeItem(id: number) {
    const next = cart.filter(c => c.ID_Produk !== id);
    saveCart(next);
  }

  function checkoutSelected() {
    const chosen = cart.filter(c => selected[Number(c.ID_Produk)]);
    if (chosen.length === 0) {
      alert("Pilih produk yang ingin di-checkout");
      return;
    }
    // save chosen into malibu_checkout
    localStorage.setItem("malibu_checkout", JSON.stringify(chosen));
    // navigate to checkout
    router.push("/checkout");
  }

  function checkoutAll() {
    localStorage.setItem("malibu_checkout", JSON.stringify(cart));
    router.push("/checkout");
  }

  const subtotal = cart.reduce((s, it) => s + Number(it.Harga ?? 0) * Number(it.Jumlah ?? 1), 0);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 16 }}>
      <h1 className="text-2xl font-bold">Keranjang</h1>

      <div style={{ marginTop: 12 }}>
        {cart.length === 0 ? (
          <div className="card">Keranjang kosong.</div>
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <label>
                <input type="checkbox" checked={selectAll} onChange={(e) => handleSelectAll(e.target.checked)} /> Pilih semua
              </label>

              <button className="btn-pink" onClick={checkoutSelected}>Checkout Selected</button>
              <button onClick={checkoutAll} style={{ background: "white", border: "1px solid var(--pink-soft)", color: "var(--pink-primary)", padding: "8px 12px", borderRadius: 8 }}>
                Checkout Semua
              </button>
            </div>

            {cart.map(it => (
              <div key={it.ID_Produk} className="card" style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
                <input type="checkbox" checked={Boolean(selected[Number(it.ID_Produk)])} onChange={() => toggleSelect(Number(it.ID_Produk))} />
                <img src={it.Gambar ?? "/no-img.png"} alt={it.Nama_Produk ?? it.Nama} style={{ width: 96, height: 96, objectFit: "cover", borderRadius: 8 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700 }}>{it.Nama_Produk ?? it.Nama}</div>
                  <div style={{ color: "#6b7280" }}>Rp{Number(String(it.Harga)).toLocaleString("id-ID")}</div>
                  <div style={{ marginTop: 8, display: "flex", gap: 8, alignItems: "center" }}>
                    <button className="btn-pink" onClick={() => changeQty(Number(it.ID_Produk), Number(it.Jumlah) - 1)}>-</button>
                    <input value={it.Jumlah} onChange={(e) => changeQty(Number(it.ID_Produk), Number(e.target.value || 1))} style={{ width: 56, padding: 6, textAlign: "center" }} />
                    <button className="btn-pink" onClick={() => changeQty(Number(it.ID_Produk), Number(it.Jumlah) + 1)}>+</button>
                    <button onClick={() => removeItem(Number(it.ID_Produk))} style={{ marginLeft: 8, background: "white", border: "1px solid var(--pink-soft)", color: "var(--pink-primary)", padding: "6px 10px", borderRadius: 8 }}>Hapus</button>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div>Subtotal</div>
                  <div style={{ fontWeight: 700 }}>Rp{(Number(it.Harga) * Number(it.Jumlah)).toLocaleString("id-ID")}</div>
                </div>
              </div>
            ))}

            <div className="card" style={{ marginTop: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>Subtotal</div>
                <div>Rp{subtotal.toLocaleString("id-ID")}</div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
