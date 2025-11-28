// src/app/auth/signup/page.tsx

"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const [form, setForm] = useState({ Email: "", Nama: "", Kata_Sandi: "" });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e:any) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/pengguna", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify(form) });
      if (!res.ok) throw new Error("Registrasi gagal");
      alert("Registrasi berhasil. Silakan login.");
      router.push("/auth/login");
    } catch (err:any) {
      alert(err.message || "Registrasi gagal");
    } finally { setLoading(false); }
  }

  return (
    <div style={{ maxWidth: 420, margin: "24px auto" }} className="card">
      <h2>Daftar</h2>
      <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
        <input required value={form.Email} onChange={(e)=>setForm({...form, Email:e.target.value})} placeholder="Email" />
        <input required value={form.Nama} onChange={(e)=>setForm({...form, Nama:e.target.value})} placeholder="Nama" />
        <input required type="password" value={form.Kata_Sandi} onChange={(e)=>setForm({...form, Kata_Sandi:e.target.value})} placeholder="Kata Sandi" />
        <button className="btn-pink" type="submit">{loading ? "Memproses..." : "Daftar"}</button>
      </form>
    </div>
  );
}
