// src/app/api/keranjang/route.ts
import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

type AnyObj = any;

function sanitizeKeranjang(k: AnyObj) {
  return {
    ID_Keranjang: k.ID_Keranjang,
    ID_Pengguna: k.ID_Pengguna,
    ID_Produk: k.ID_Produk,
    Jumlah: k.Jumlah,
    Ditambahkan: k.Ditambahkan ? new Date(k.Ditambahkan).toISOString() : null,
    Produk: k.Produk ? {
      ID_Produk: k.Produk.ID_Produk,
      Nama_Produk: k.Produk.Nama_Produk,
      Harga: k.Produk.Harga?.toString?.()
    } : null,
    Pengguna: k.Pengguna ? {
      ID_Pengguna: k.Pengguna.ID_Pengguna,
      Email: k.Pengguna.Email,
      Nama: k.Pengguna.Nama
    } : null
  };
}

export async function GET(_: Request) {
  try {
    const keranjang = await prisma.keranjang.findMany({
      include: { Pengguna: true, Produk: true },
    });
    return NextResponse.json(keranjang.map(sanitizeKeranjang));
  } catch (error) {
    console.error("GET /api/keranjang error:", error);
    return NextResponse.json({ error: "Gagal mengambil data keranjang" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const itemBaru = await prisma.keranjang.create({
      data: {
        ID_Pengguna: Number(body.ID_Pengguna),
        ID_Produk: Number(body.ID_Produk),
        Jumlah: Number(body.Jumlah) || 1,
      },
      include: { Produk: true, Pengguna: true }
    });
    return NextResponse.json(sanitizeKeranjang(itemBaru), { status: 201 });
  } catch (error) {
    console.error("POST /api/keranjang error:", error);
    return NextResponse.json({ error: "Gagal menambahkan ke keranjang" }, { status: 500 });
  }
}
