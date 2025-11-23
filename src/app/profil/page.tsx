// src/app/profil/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUserFromStorage, performLogout, saveAuth } from "@/lib/auth";

type User = {
  ID_Pengguna?: number;
  Email?: string;
  Nama?: string;
  Role?: string;
  Alamat?: string;
  No_Telepon?: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ Nama: "", Alamat: "", No_Telepon: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const u = getUserFromStorage();
    setUser(u);
    setForm({ Nama: u?.Nama ?? "", Alamat: u?.Alamat ?? "", No_Telepon: u?.No_Telepon ?? "" });
    setLoading(false);
  }, []);

  async function saveProfile(e?: any) {
    if (e) e.preventDefault();
    if (!user?.ID_Pengguna) return alert("Login dulu.");
    setSaving(true);

    const payload = { Nama: form.Nama, Alamat: form.Alamat, No_Telepon: form.No_Telepon };

    try {
      // coba PATCH endpoint; kalau tidak ada, simpan lokal
      const res = await fetch(`/api/pengguna/${user.ID_Pengguna}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const updated = await res.json().catch(() => null);
        const newUser = { ...user, ...(updated ?? payload) };
        saveAuth(localStorage.getItem("malibu_auth") ?? localStorage.getItem("malibu_token"), newUser);
        setUser(newUser);
        alert("Profil diperbarui (server).");
      } else {
        // fallback lokal
        const newUser = { ...user, ...payload };
        saveAuth(localStorage.getItem("malibu_auth") ?? localStorage.getItem("malibu_token"), newUser);
        setUser(newUser);
        alert("Profil diperbarui (disimpan lokal).");
      }
      window.dispatchEvent(new Event("auth_updated"));
    } catch (err) {
      console.error("saveProfile error", err);
      alert("Gagal menyimpan profil.");
    } finally {
      setSaving(false);
    }
  }

  function onLogout() {
    performLogout();
    setUser(null);
    router.push("/");
  }

  if (loading) return <div style={{ padding: 24 }}>Memuat profil…</div>;

  if (!user) {
    return (
      <div style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
        <div className="card">
          <h2>Profil</h2>
          <p>Kamu belum login. Silakan <a href="/auth/login">login</a> terlebih dahulu.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
      <div className="card" style={{ display: "flex", gap: 16, alignItems: "center" }}>
        <div style={{ width: 96, height: 96, borderRadius: 12, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(0,0,0,0.06)" }}>
          <span style={{ fontSize: 28, color: "var(--pink-primary)", fontWeight: 700 }}>
            {user.Nama ? user.Nama.charAt(0).toUpperCase() : user.Email?.charAt(0).toUpperCase() ?? "U"}
          </span>
        </div>

        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0 }}>{user.Nama ?? user.Email}</h2>
          <div style={{ color: "#6b7280" }}>{user.Email}</div>
          <div style={{ marginTop: 8 }}>
            <button className="btn-pink" onClick={() => { /* Bisa pindah ke edit page jika ingin */ }} style={{ marginRight: 8 }}>Edit Profil</button>
            <button onClick={onLogout} style={{ background: "white", border: "1px solid var(--pink-soft)", color: "var(--pink-primary)", padding: "8px 12px", borderRadius: 8 }}>
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <h3>Informasi Akun</h3>
        <form onSubmit={saveProfile} style={{ display: "grid", gap: 8 }}>
          <label>Email (tidak dapat diubah)
            <input value={user.Email ?? ""} disabled style={{ width: "100%", padding: 8, borderRadius: 8, background: "#f8fafc" }} />
          </label>

          <label>Nama
            <input value={form.Nama} onChange={(e) => setForm(p => ({ ...p, Nama: e.target.value }))} style={{ width: "100%", padding: 8, borderRadius: 8 }} />
          </label>

          <label>Alamat
            <input value={form.Alamat} onChange={(e) => setForm(p => ({ ...p, Alamat: e.target.value }))} style={{ width: "100%", padding: 8, borderRadius: 8 }} />
          </label>

          <label>No. Telepon
            <input value={form.No_Telepon} onChange={(e) => setForm(p => ({ ...p, No_Telepon: e.target.value }))} style={{ width: "100%", padding: 8, borderRadius: 8 }} />
          </label>

          <div style={{ display: "flex", gap: 8 }}>
            <button type="submit" className="btn-pink" disabled={saving}>{saving ? "Menyimpan..." : "Simpan"}</button>
            <button type="button" onClick={() => setForm({ Nama: user.Nama ?? "", Alamat: user.Alamat ?? "", No_Telepon: user.No_Telepon ?? "" })} style={{ background: "white", border: "1px solid var(--pink-soft)", color: "var(--pink-primary)", padding: "8px 12px", borderRadius: 8 }}>
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
