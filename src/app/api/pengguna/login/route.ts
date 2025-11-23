// src/app/api/pengguna/login/route.ts
import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma"; // dari src/app/api/pengguna/login -> naik 4 -> src/lib
import bcrypt from "bcryptjs";
import crypto from "crypto";

type AnyObj = any;

function sanitizePengguna(u: AnyObj) {
  return {
    ID_Pengguna: u.ID_Pengguna,
    Email: u.Email,
    Nama: u.Nama,
    Alamat: u.Alamat ?? null,
    No_Telepon: u.No_Telepon ?? null,
    Role: u.Role,
    Created_At: u.Created_At ? new Date(u.Created_At).toISOString() : null,
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = (body.Email || "").toString().trim();
    const kataSandi = (body.Kata_Sandi || body.Password || "").toString();

    if (!email || !kataSandi) {
      return NextResponse.json({ error: "Email dan Kata_Sandi wajib diisi" }, { status: 400 });
    }

    const pengguna = await prisma.pengguna.findUnique({
      where: { Email: email },
    });

    if (!pengguna) {
      return NextResponse.json({ error: "Pengguna tidak ditemukan" }, { status: 401 });
    }

    // jika PasswordHash tidak ada (misalnya user dibuat tanpa password), tolak
    if (!pengguna.PasswordHash) {
      return NextResponse.json({ error: "Akun belum memiliki password" }, { status: 401 });
    }

    const match = await bcrypt.compare(kataSandi, pengguna.PasswordHash);
    if (!match) {
      return NextResponse.json({ error: "Kata sandi salah" }, { status: 401 });
    }

    // buat token sederhana (untuk development). 
    // Untuk produksi gunakan JWT/signing dengan secret.
    const token = crypto.randomUUID();

    // Opsional: simpan token di database / Redis jika ingin session stateful
    // await prisma.session.create({ data: { token, userId: pengguna.ID_Pengguna, ... }});

    return NextResponse.json({
      success: true,
      token,
      user: sanitizePengguna(pengguna),
    });
  } catch (err) {
    console.error("POST /api/pengguna/login error:", err);
    return NextResponse.json({ error: "Server error saat login" }, { status: 500 });
  }
}
