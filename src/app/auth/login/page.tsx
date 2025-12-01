// src/app/auth/login/page.tsx
// Login Page Component
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveAuth } from "@/lib/auth";

export default function LoginPage() {
  const [form, setForm] = useState({ Email: "", Kata_Sandi: "" });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e:any) {
  e.preventDefault();
  setLoading(true);
  try {
    const res = await fetch("/api/pengguna/login", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.error || "Login gagal");
    }
    saveAuth(data.token, data.user);
    router.push("/");
  } catch (err:any) {
    alert(err.message || "Login gagal");
  } finally {
    setLoading(false);
  }
}


  return (
    <div style={{ maxWidth: 420, margin: "24px auto" }} className="card">
      <h2>Login</h2>
      <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
        <input required value={form.Email} onChange={(e)=>setForm({...form, Email:e.target.value})} placeholder="Email" />
        <input required type="password" value={form.Kata_Sandi} onChange={(e)=>setForm({...form, Kata_Sandi:e.target.value})} placeholder="Kata Sandi" />
        <button className="btn-pink" type="submit">{loading ? "Memproses..." : "Login"}</button>
      </form>
    </div>
  );
}
