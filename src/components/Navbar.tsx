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
    setCartCount(computeCountFromStorage());
    setUser(getUserFromStorage());

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
    } catch (e) {}

    setUser(null);
    setCartCount(computeCountFromStorage());
    window.dispatchEvent(new Event("cart_updated"));
    window.dispatchEvent(new Event("auth_updated"));
    router.push("/");
  }

  return (
    <header
      style={{
        background: "var(--pink-primary)",
        padding: 12,
        color: "#fff",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link
          href="/"
          style={{
            textDecoration: "none",
            color: "white",
            fontWeight: 700,
            fontSize: 20,
          }}
        >
          Malibu Shop
        </Link>

        <nav style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <Link href="/produk" style={{ color: "white" }}>Produk</Link>
          <Link href="/favorites" style={{ color: "white" }}>Favorit</Link>

          {/* === Tambahan Menu Baru === */}
          <Link href="/history" style={{ color: "white" }}>Riwayat Pesanan</Link>
          <Link href="/tracking" style={{ color: "white" }}>Tracking</Link>

          {/* Keranjang dengan badge */}
          <div style={{ position: "relative" }}>
            <Link href="/cart" style={{ color: "white", position: "relative" }}>
              Keranjang
            </Link>
            {cartCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: -10,
                  right: -40,
                  background: "#fff",
                  color: "var(--pink-primary)",
                  fontWeight: 700,
                  borderRadius: 999,
                  padding: "2px 8px",
                  fontSize: 12,
                  boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
                }}
              >
                {cartCount}
              </span>
            )}
          </div>

          <Link href="/profil" style={{ color: "white" }}>Profil</Link>

          {user ? (
            <>
              <span style={{ color: "white", opacity: 0.95, marginLeft: 8 }}>
                Hi, {user.Nama ?? user.name ?? user.email ?? "User"}
              </span>
              <button
                onClick={onLogout}
                style={{
                  marginLeft: 8,
                  background: "white",
                  color: "var(--pink-primary)",
                  borderRadius: 8,
                  padding: "6px 10px",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/auth/login"
              style={{
                color: "white",
                border: "1px solid rgba(255,255,255,0.12)",
                padding: "6px 10px",
                borderRadius: 8,
              }}
            >
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
