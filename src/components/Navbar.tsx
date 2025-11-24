// src/components/Navbar.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUserFromStorage, performLogout } from "@/lib/auth";

export default function Navbar() {
  const router = useRouter();
  const [cartCount, setCartCount] = useState<number>(0);
  const [user, setUser] = useState<any | null>(null);
  const [openMobile, setOpenMobile] = useState(false);

  function computeCountFromStorage() {
    try {
      const raw = localStorage.getItem("malibu_cart");
      const arr = raw ? JSON.parse(raw) : [];
      return arr.reduce((s: number, it: any) => s + Number(it.Jumlah ?? 0), 0);
    } catch {
      return 0;
    }
  }

  useEffect(() => {
    // initial read
    setCartCount(computeCountFromStorage());
    setUser(getUserFromStorage());

    // listeners: storage (other tabs) + custom events (app)
    const onStorage = () => {
      setCartCount(computeCountFromStorage());
      setUser(getUserFromStorage());
    };
    const onCustom = () => {
      setCartCount(computeCountFromStorage());
      setUser(getUserFromStorage());
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener("cart_updated", onCustom);
    window.addEventListener("auth_updated", onCustom);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("cart_updated", onCustom);
      window.removeEventListener("auth_updated", onCustom);
    };
  }, []);

  async function onLogout() {
    try {
      performLogout();
    } catch (e) {
      // ignore
    }
    // update UI immediately
    setUser(null);
    setCartCount(computeCountFromStorage());
    // notify other components
    window.dispatchEvent(new Event("cart_updated"));
    window.dispatchEvent(new Event("auth_updated"));
    router.push("/");
  }

  return (
    <header style={{ background: "var(--pink-primary)", color: "#fff" }}>
      <div style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "12px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            aria-label="menu"
            onClick={() => setOpenMobile((s) => !s)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              background: "transparent",
              border: "none",
              color: "white",
              fontSize: 20,
              cursor: "pointer",
              padding: 6
            }}
          >
            ☰
          </button>

          <Link href="/" style={{ textDecoration: "none", color: "white", fontWeight: 800, fontSize: 20 }}>
            Malibu Shop
          </Link>
        </div>

        {/* Desktop / wide nav */}
        <nav style={{
          display: openMobile ? "flex" : "flex",
          gap: 12,
          alignItems: "center",
          flexWrap: "wrap"
        }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <Link href="/produk" style={{ color: "white", textDecoration: "none" }}>Produk</Link>
            <Link href="/favorites" style={{ color: "white", textDecoration: "none" }}>Favorit</Link>
            <Link href="/history" style={{ color: "white", textDecoration: "none" }}>Riwayat Pesanan</Link>
            <Link href="/tracking" style={{ color: "white", textDecoration: "none" }}>Tracking</Link>

            <div style={{ position: "relative", display: "inline-block" }}>
              <Link href="/cart" style={{ color: "white", textDecoration: "none" }}>Keranjang</Link>
              {cartCount > 0 && (
                <span style={{
                  position: "absolute",
                  top: -10,
                  right: -28,
                  background: "#fff",
                  color: "var(--pink-primary)",
                  fontWeight: 800,
                  borderRadius: 999,
                  padding: "2px 8px",
                  fontSize: 12,
                  boxShadow: "0 2px 6px rgba(0,0,0,0.12)"
                }}>
                  {cartCount}
                </span>
              )}
            </div>

            <Link href="/profil" style={{ color: "white", textDecoration: "none" }}>Profil</Link>
          </div>

          {/* Auth actions */}
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginLeft: 8 }}>
            {user ? (
              <>
                <span style={{ color: "white", opacity: 0.95, fontWeight: 700 }}>
                  Hi, {user.Nama ?? user.name ?? user.email ?? "User"}
                </span>

                <button
                  onClick={onLogout}
                  style={{
                    marginLeft: 4,
                    background: "#fff",
                    color: "var(--pink-primary)",
                    borderRadius: 8,
                    padding: "6px 10px",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: 700
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <div style={{ display: "flex", gap: 8 }}>
                <Link
                  href="/auth/login"
                  style={{
                    color: "white",
                    border: "1px solid rgba(255,255,255,0.12)",
                    padding: "6px 10px",
                    borderRadius: 8,
                    textDecoration: "none"
                  }}
                >
                  Login
                </Link>

                <Link
                  href="/auth/signup"
                  style={{
                    color: "white",
                    border: "1px solid rgba(255,255,255,0.12)",
                    padding: "6px 10px",
                    borderRadius: 8,
                    textDecoration: "none",
                    fontWeight: 800
                  }}
                >
                  Daftar
                </Link>
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* Mobile extra: simple drawer (appears when openMobile true) */}
      {openMobile && (
        <div style={{ background: "rgba(0,0,0,0.03)", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
          <div style={{ maxWidth: 900, margin: "0 auto", padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            <Link href="/produk" onClick={() => setOpenMobile(false)} style={{ color: "white" }}>Produk</Link>
            <Link href="/favorites" onClick={() => setOpenMobile(false)} style={{ color: "white" }}>Favorit</Link>
            <Link href="/history" onClick={() => setOpenMobile(false)} style={{ color: "white" }}>Riwayat Pesanan</Link>
            <Link href="/tracking" onClick={() => setOpenMobile(false)} style={{ color: "white" }}>Tracking</Link>
            <Link href="/cart" onClick={() => setOpenMobile(false)} style={{ color: "white" }}>
              Keranjang {cartCount > 0 && (<span style={{ marginLeft: 8, background: "#fff", color: "var(--pink-primary)", padding: "2px 8px", borderRadius: 999, fontWeight: 800 }}>{cartCount}</span>)}
            </Link>
            <Link href="/profil" onClick={() => setOpenMobile(false)} style={{ color: "white" }}>Profil</Link>

            <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 8 }}>
              {user ? (
                <>
                  <div style={{ color: "white", fontWeight: 700 }}>Hi, {user.Nama ?? user.name ?? user.email}</div>
                  <button onClick={() => { onLogout(); setOpenMobile(false); }} style={{ marginTop: 8, background: "#fff", color: "var(--pink-primary)", padding: "8px 12px", borderRadius: 8, border: "none", fontWeight: 700 }}>
                    Logout
                  </button>
                </>
              ) : (
                <div style={{ display: "flex", gap: 8 }}>
                  <Link href="/auth/login" onClick={() => setOpenMobile(false)} style={{ color: "white" }}>Login</Link>
                  <Link href="/auth/signup" onClick={() => setOpenMobile(false)} style={{ color: "white", fontWeight: 700 }}>Daftar</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
