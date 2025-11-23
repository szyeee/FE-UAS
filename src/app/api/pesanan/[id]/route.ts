// src/app/api/pesanan/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

function sanitizePesanan(p: any) {
  return {
    ID_Pesanan: p.ID_Pesanan,
    ID_Pengguna: p.ID_Pengguna,
    Total: p.Total?.toString?.(),
    Status: p.Status,
    Alamat: p.Alamat,
    Metode_Bayar: p.Metode_Bayar,
    Tanggal_Pesan: p.Tanggal_Pesan ? new Date(p.Tanggal_Pesan).toISOString() : null,
    Items: (p.Items || []).map((i: any) => ({
      ID_Item: i.ID_Item,
      ID_Produk: i.ID_Produk,
      Kuantitas: i.Kuantitas,
      Harga_Unit: i.Harga_Unit?.toString?.(),
      Subtotal: i.Subtotal?.toString?.(),
      Produk: i.Produk ? {
        ID_Produk: i.Produk.ID_Produk,
        Nama_Produk: i.Produk.Nama_Produk,
        Gambar: i.Produk.Gambar ?? null
      } : null
    }))
  };
}

export async function GET(req: Request, context: any) {
  try {
    // Unwrap params (Next.js memberikan params sebagai Promise in some runtimes)
    const params = await Promise.resolve(context.params);
    const rawId = params?.id;
    const id = Number(rawId);

    if (!rawId || Number.isNaN(id) || id <= 0) {
      return NextResponse.json({ error: "ID pesanan invalid" }, { status: 400 });
    }

    const pesanan = await prisma.pesanan.findUnique({
      where: { ID_Pesanan: id },
      include: { Pengguna: true, Items: { include: { Produk: true } } }
    });

    if (!pesanan) {
      return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(sanitizePesanan(pesanan));
  } catch (err) {
    console.error("GET /api/pesanan/[id] error:", err);
    return NextResponse.json({ error: "Gagal mengambil detail pesanan" }, { status: 500 });
  }
}
