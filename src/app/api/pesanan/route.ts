// src/app/api/pesanan/route.ts

import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

type AnyObj = any;

function sanitizePesanan(p: AnyObj) {
  return {
    ID_Pesanan: p.ID_Pesanan,
    ID_Pengguna: p.ID_Pengguna,
    Total: p.Total?.toString?.(),
    Status: p.Status,
    Alamat: p.Alamat,
    Metode_Bayar: p.Metode_Bayar,
    Tanggal_Pesan: p.Tanggal_Pesan ? new Date(p.Tanggal_Pesan).toISOString() : null,
    Items: p.Items?.map((i: AnyObj) => ({
      ID_Item: i.ID_Item,
      ID_Produk: i.ID_Produk,
      Kuantitas: i.Kuantitas,
      Harga_Unit: i.Harga_Unit?.toString?.(),
      Subtotal: i.Subtotal?.toString?.(),
      Produk: i.Produk ? {
        ID_Produk: i.Produk.ID_Produk,
        Nama_Produk: i.Produk.Nama_Produk
      } : null
    })) ?? []
  };
}

export async function GET(_: Request) {
  try {
    const pesanan = await prisma.pesanan.findMany({
      include: {
        Pengguna: true,
        Items: { include: { Produk: true } }
      },
      orderBy: { Tanggal_Pesan: "desc" }
    });
    return NextResponse.json(pesanan.map(sanitizePesanan));
  } catch (error) {
    console.error("GET /api/pesanan error:", error);
    return NextResponse.json({ error: "Gagal mengambil data pesanan" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const pesananBaru = await prisma.pesanan.create({
      data: {
        ID_Pengguna: Number(body.ID_Pengguna),
        Total: body.Total?.toString(),
        Status: body.Status ?? "pending",
        Alamat: body.Alamat,
        Metode_Bayar: body.Metode_Bayar ?? null,
        Items: {
          create: (body.Items || []).map((it: AnyObj) => ({
            ID_Produk: Number(it.ID_Produk),
            Kuantitas: Number(it.Kuantitas),
            Harga_Unit: it.Harga_Unit?.toString(),
            Subtotal: it.Subtotal?.toString()
          }))
        }
      },
      include: { Items: { include: { Produk: true } } }
    });
    return NextResponse.json(sanitizePesanan(pesananBaru), { status: 201 });
  } catch (error) {
    console.error("POST /api/pesanan error:", error);
    return NextResponse.json({ error: "Gagal menambahkan pesanan" }, { status: 500 });
  }
}
