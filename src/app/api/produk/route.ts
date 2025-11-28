// src/app/api/produk/route.ts

import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

type AnyObj = any;

function sanitizeProduk(p: AnyObj) {
  return {
    ID_Produk: p.ID_Produk,
    Nama_Produk: p.Nama_Produk,
    Slug: p.Slug,
    Deskripsi: p.Deskripsi ?? null,
    Harga: p.Harga?.toString?.(),
    Stok: p.Stok,
    Gambar: p.Gambar ?? null,
    ID_Kategori: p.ID_Kategori,
    Created_At: p.Created_At ? new Date(p.Created_At).toISOString() : null,
    Kategori: p.Kategori ? {
      ID_Kategori: p.Kategori.ID_Kategori,
      Nama_Kategori: p.Kategori.Nama_Kategori
    } : null
  };
}

export async function GET(_: Request) {
  try {
    const dataProduk = await prisma.produk.findMany({ include: { Kategori: true } });
    return NextResponse.json(dataProduk.map(sanitizeProduk));
  } catch (error) {
    console.error("GET /api/produk error:", error);
    return NextResponse.json({ error: "Gagal mengambil data produk" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const produkBaru = await prisma.produk.create({
      data: {
        Nama_Produk: body.Nama_Produk,
        Slug: body.Slug,
        Deskripsi: body.Deskripsi ?? null,
        Harga: body.Harga?.toString(),
        Stok: Number(body.Stok) || 0,
        Gambar: body.Gambar ?? null,
        ID_Kategori: Number(body.ID_Kategori),
      },
      include: { Kategori: true }
    });
    return NextResponse.json(sanitizeProduk(produkBaru), { status: 201 });
  } catch (error) {
    console.error("POST /api/produk error:", error);
    return NextResponse.json({ error: "Gagal menambahkan produk" }, { status: 500 });
  }
}
