// src/app/api/review/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type Params = { params: { id: string } };

export async function GET(_: Request, { params }: Params) {
  try {
    const idRaw = params.id;
    const pid = Number(idRaw);
    if (Number.isNaN(pid)) {
      return NextResponse.json([], { status: 200 });
    }

    const ulasan = await prisma.ulasan.findMany({
      where: { ID_Produk: pid },
      orderBy: { Dibuat_Pada: "desc" },
    });
    const out = ulasan.map(u => ({
      ID_Ulasan: u.ID_Ulasan,
      ID_Produk: u.ID_Produk,
      ID_Pengguna: u.ID_Pengguna,
      Rating: u.Rating,
      Komentar: u.Komentar,
      Dibuat_Pada: u.Dibuat_Pada?.toISOString(),
    }));

    return NextResponse.json(out);
  } catch (err) {
    console.error("[GET /api/review/:id] error:", err);
    return NextResponse.json({ error: "Gagal mengambil ulasan" }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: Params) {
  try {
    const idRaw = params.id;
    const pid = Number(idRaw);
    if (Number.isNaN(pid)) {
      return NextResponse.json({ error: "ID produk invalid" }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const rating = Number(body.rating ?? body.Rating);
    const komentar = body.komentar ?? body.Komentar ?? null;
    const userId = body.ID_Pengguna ? Number(body.ID_Pengguna) : undefined;

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating tidak valid (1-5)" }, { status: 400 });
    }
    if (!komentar || String(komentar).trim().length === 0) {
      return NextResponse.json({ error: "Komentar harus diisi" }, { status: 400 });
    }
    const createData: any = {
      ID_Produk: pid,
      Rating: rating,
      Komentar: String(komentar),
    };
    if (userId && !Number.isNaN(userId)) createData.ID_Pengguna = userId;
    else createData.ID_Pengguna = 1;

    const created = await prisma.ulasan.create({
      data: createData,
    });

    const out = {
      ID_Ulasan: created.ID_Ulasan,
      ID_Produk: created.ID_Produk,
      ID_Pengguna: created.ID_Pengguna,
      Rating: created.Rating,
      Komentar: created.Komentar,
      Dibuat_Pada: created.Dibuat_Pada?.toISOString(),
    };

    return NextResponse.json(out, { status: 201 });
  } catch (err) {
    console.error("[POST /api/review/:id] error:", err);
    return NextResponse.json({ error: "Gagal membuat ulasan" }, { status: 500 });
  }
}
