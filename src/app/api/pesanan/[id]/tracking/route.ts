// src/app/api/pesanan/[id]/tracking/route.ts
// API untuk mendapatkan status tracking pesanan berdasarkan ID Pesanan
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request, context: any) {
  try {
    const params = await Promise.resolve(context.params);
    const rawId = params?.id;
    const id = Number(rawId);

    if (!rawId || Number.isNaN(id) || id <= 0) {
      return NextResponse.json({ error: "ID invalid" }, { status: 400 });
    }

    const pesanan = await prisma.pesanan.findUnique({
      where: { ID_Pesanan: id },
      select: { ID_Pesanan: true, Status: true, Tanggal_Pesan: true }
    });

    if (!pesanan) return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });

    const timeline = [
      { step: "Dibuat", done: true, at: pesanan.Tanggal_Pesan },
      { step: "Diproses", done: ["Diproses","Dikirim","Selesai"].includes(pesanan.Status), at: null },
      { step: "Dikirim", done: ["Dikirim","Selesai"].includes(pesanan.Status), at: null },
      { step: "Selesai", done: pesanan.Status === "Selesai", at: null }
    ];

    return NextResponse.json({ ID_Pesanan: pesanan.ID_Pesanan, Status: pesanan.Status, timeline });
  } catch (err) {
    console.error("GET /api/pesanan/[id]/tracking error:", err);
    return NextResponse.json({ error: "Gagal mengambil tracking" }, { status: 500 });
  }
}
