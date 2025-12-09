import { Keranjang, Produk, Pengguna } from "@prisma/client";

export interface KeranjangSanitized {
  ID_Keranjang: number;
  ID_Pengguna: number;
  ID_Produk: number;
  Jumlah: number;
  Ditambahkan: string | null;
  Produk: {
    ID_Produk: number;
    Nama_Produk: string | null;
    Harga: string | null;
  } | null;
  Pengguna: {
    ID_Pengguna: number;
    Email: string | null;
    Nama: string | null;
  } | null;
}

export function sanitizeKeranjang(
  k: Keranjang & { Produk: Produk | null; Pengguna: Pengguna | null }
): KeranjangSanitized {
  return {
    ID_Keranjang: k.ID_Keranjang,
    ID_Pengguna: k.ID_Pengguna,
    ID_Produk: k.ID_Produk,
    Jumlah: k.Jumlah,
    Ditambahkan: k.Ditambahkan ? new Date(k.Ditambahkan).toISOString() : null,

    Produk: k.Produk
      ? {
          ID_Produk: k.Produk.ID_Produk,
          Nama_Produk: k.Produk.Nama_Produk ?? null,
          Harga: k.Produk.Harga?.toString() ?? null,
        }
      : null,

    Pengguna: k.Pengguna
      ? {
          ID_Pengguna: k.Pengguna.ID_Pengguna,
          Email: k.Pengguna.Email ?? null,
          Nama: k.Pengguna.Nama ?? null,
        }
      : null,
  };
}
