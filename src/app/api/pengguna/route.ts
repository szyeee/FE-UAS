import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import bcrypt from "bcryptjs";

export const runtime = "nodejs"; // pastikan pakai runtime Node

type AnyObj = any;

function sanitizePengguna(u: AnyObj) {
  return {
    ID_Pengguna: u.ID_Pengguna,
    Email: u.Email,
    Nama: u.Nama,
    Alamat: u.Alamat ?? null,
    No_Telepon: u.No_Telepon ?? null,
    Role: u.Role,
    Created_At: u.Created_At ? new Date(u.Created_At).toISOString() : null
  };
}

export async function GET() {
  try {
    const dataPengguna = await prisma.pengguna.findMany();
    return NextResponse.json(dataPengguna.map(sanitizePengguna));
  } catch (error) {
    console.error("GET /api/pengguna error:", error);
    return NextResponse.json({ error: "Gagal mengambil data pengguna" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const rawPassword = body.Kata_Sandi ?? body.Password ?? null;
    const hashed = rawPassword ? await bcrypt.hash(String(rawPassword), 10) : null;

    const penggunaBaru = await prisma.pengguna.create({
      data: {
        Email: body.Email,
        Nama: body.Nama ?? null,
        PasswordHash: hashed,
        Alamat: body.Alamat ?? null,
        No_Telepon: body.No_Telepon ?? null,
        Role: body.Role ?? body.Peran ?? "customer",
      },
    });

    return NextResponse.json(sanitizePengguna(penggunaBaru), { status: 201 });
  } catch (error) {
    console.error("POST /api/pengguna error:", error);
    return NextResponse.json({ error: "Gagal menambahkan pengguna" }, { status: 500 });
  }
}
