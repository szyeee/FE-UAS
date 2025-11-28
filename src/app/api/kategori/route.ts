// src/app/api/kategori/route.ts
import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

type AnyObj = any;

function sanitizeKategori(k: AnyObj) {
  return {
    ID_Kategori: k.ID_Kategori,
    Nama_Kategori: k.Nama_Kategori,
    Deskripsi: k.Deskripsi ?? null,
    Created_At: k.Created_At ? new Date(k.Created_At).toISOString() : null,
  };
}

export async function GET(_: Request) {
  try {
    const kategori = await prisma.kategori.findMany();
    return NextResponse.json(kategori.map(sanitizeKategori));
  } catch (error) {
    console.error("GET /api/kategori error:", error);
    return NextResponse.json({ error: "Gagal mengambil kategori" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const kategoriBaru = await prisma.kategori.create({
      data: {
        Nama_Kategori: body.Nama_Kategori,
        Deskripsi: body.Deskripsi ?? null,
      },
    });
    return NextResponse.json(sanitizeKategori(kategoriBaru), { status: 201 });
  } catch (error) {
    console.error("POST /api/kategori error:", error);
    return NextResponse.json({ error: "Gagal menambahkan kategori" }, { status: 500 });
  }
}
