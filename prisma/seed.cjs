// prisma/seed.cjs
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // -----------------------
  // ADMIN USER
  // -----------------------
  const pwHash = await bcrypt.hash("admin123", 10);
  await prisma.pengguna.upsert({
    where: { Email: "admin@malibu.com" },
    update: {},
    create: {
      Email: "admin@malibu.com",
      Nama: "Admin Malibu",
      PasswordHash: pwHash,
      Role: "admin",
      Alamat: "Jl. Raya Malibu No.1",
      No_Telepon: "081234567890",
    },
  });
  console.log("✅ Admin user ready");

    // -----------------------
  // KATEGORI
  // -----------------------
  const kategoriList = [
    { Nama_Kategori: "Buket Bunga", Deskripsi: "Buket bunga segar" },
    { Nama_Kategori: "Buket Snack", Deskripsi: "Buket berisi snack & cemilan" },
    { Nama_Kategori: "Parcel Spesial", Deskripsi: "Parcel untuk acara spesial" },
  ];

  const kategoriCreated = {};

  for (const k of kategoriList) {
    let existing = await prisma.kategori.findFirst({
      where: { Nama_Kategori: k.Nama_Kategori }
    });

    if (!existing) {
      existing = await prisma.kategori.create({ data: k });
    }

    kategoriCreated[k.Nama_Kategori] = existing;
  }

  console.log("✅ Kategori seeded");

  // Ambil ID kategori
  const buket = kategoriCreated["Buket Bunga"];
  const snack = kategoriCreated["Buket Snack"];
  const parcel = kategoriCreated["Parcel Spesial"];


  // -----------------------
  // 30 PRODUK
  // -----------------------
  const produkList = [
    // --- BUKET BUNGA (15) ---
    { Nama_Produk: "Buket Mawar Merah", Slug: "buket-mawar-merah", Deskripsi: "Buket 12 mawar merah", Harga: "250000.00", Stok: 20, Gambar: "/images/mawar1.jpg", ID_Kategori: buket.ID_Kategori },
    { Nama_Produk: "Buket Mawar Putih", Slug: "buket-mawar-putih", Deskripsi: "Buket mawar putih elegan", Harga: "260000.00", Stok: 15, Gambar: "/images/mawar2.jpg", ID_Kategori: buket.ID_Kategori },
    { Nama_Produk: "Buket Mawar Pink", Slug: "buket-mawar-pink", Deskripsi: "Buket mawar pink manis", Harga: "240000.00", Stok: 18, Gambar: "/images/mawar3.jpg", ID_Kategori: buket.ID_Kategori },
    { Nama_Produk: "Buket Tulip Merah", Slug: "buket-tulip-merah", Deskripsi: "Buket tulip merah segar", Harga: "300000.00", Stok: 10, Gambar: "/images/tulip1.jpg", ID_Kategori: buket.ID_Kategori },
    { Nama_Produk: "Buket Tulip Ungu", Slug: "buket-tulip-ungu", Deskripsi: "Buket tulip ungu mewah", Harga: "320000.00", Stok: 10, Gambar: "/images/tulip2.jpg", ID_Kategori: buket.ID_Kategori },
    { Nama_Produk: "Buket Lily Putih", Slug: "buket-lily-putih", Deskripsi: "Buket lily putih anggun", Harga: "280000.00", Stok: 12, Gambar: "/images/lily1.jpg", ID_Kategori: buket.ID_Kategori },
    { Nama_Produk: "Buket Lily Pink", Slug: "buket-lily-pink", Deskripsi: "Buket lily pink elegan", Harga: "275000.00", Stok: 12, Gambar: "/images/lily2.jpg", ID_Kategori: buket.ID_Kategori },
    { Nama_Produk: "Buket Mix Flower A", Slug: "buket-mix-a", Deskripsi: "Mix bunga premium A", Harga: "350000.00", Stok: 8, Gambar: "/images/mix1.jpg", ID_Kategori: buket.ID_Kategori },
    { Nama_Produk: "Buket Mix Flower B", Slug: "buket-mix-b", Deskripsi: "Mix bunga premium B", Harga: "380000.00", Stok: 7, Gambar: "/images/mix2.jpg", ID_Kategori: buket.ID_Kategori },
    { Nama_Produk: "Buket Sunflower", Slug: "buket-sunflower", Deskripsi: "Buket bunga matahari cerah", Harga: "220000.00", Stok: 14, Gambar: "/images/sun1.jpg", ID_Kategori: buket.ID_Kategori },
    { Nama_Produk: "Buket Baby Breath", Slug: "buket-baby-breath", Deskripsi: "Buket baby breath putih", Harga: "210000.00", Stok: 16, Gambar: "/images/baby1.jpg", ID_Kategori: buket.ID_Kategori },
    { Nama_Produk: "Buket Lavender", Slug: "buket-lavender", Deskripsi: "Buket lavender wangi", Harga: "260000.00", Stok: 11, Gambar: "/images/lavender.jpg", ID_Kategori: buket.ID_Kategori },
    { Nama_Produk: "Buket Daisy", Slug: "buket-daisy", Deskripsi: "Buket daisy ceria", Harga: "200000.00", Stok: 13, Gambar: "/images/daisy.jpg", ID_Kategori: buket.ID_Kategori },
    { Nama_Produk: "Buket Orchid", Slug: "buket-orchid", Deskripsi: "Buket anggrek elegan", Harga: "420000.00", Stok: 6, Gambar: "/images/orchid.jpg", ID_Kategori: buket.ID_Kategori },
    { Nama_Produk: "Buket Premium Rose Box", Slug: "rose-box", Deskripsi: "Kotak bunga mawar premium", Harga: "500000.00", Stok: 5, Gambar: "/images/rosebox.jpg", ID_Kategori: buket.ID_Kategori },

    // --- BUKET SNACK (10) ---
    { Nama_Produk: "Buket Snack Mini", Slug: "buket-snack-mini", Deskripsi: "Snack favorit mini", Harga: "150000.00", Stok: 20, Gambar: "/images/snack1.jpg", ID_Kategori: snack.ID_Kategori },
    { Nama_Produk: "Buket Snack Jumbo", Slug: "buket-snack-jumbo", Deskripsi: "Snack jumbo lengkap", Harga: "250000.00", Stok: 15, Gambar: "/images/snack2.jpg", ID_Kategori: snack.ID_Kategori },
    { Nama_Produk: "Buket Snack Coklat", Slug: "buket-snack-coklat", Deskripsi: "Khusus snack coklat premium", Harga: "180000.00", Stok: 15, Gambar: "/images/snack3.jpg", ID_Kategori: snack.ID_Kategori },
    { Nama_Produk: "Buket Snack Valentine", Slug: "buket-snack-valentine", Deskripsi: "Snack valentine romantis", Harga: "230000.00", Stok: 10, Gambar: "/images/snack4.jpg", ID_Kategori: snack.ID_Kategori },
    { Nama_Produk: "Buket Snack Pedas", Slug: "buket-snack-pedas", Deskripsi: "Snack pedas pilihan", Harga: "160000.00", Stok: 18, Gambar: "/images/snack5.jpg", ID_Kategori: snack.ID_Kategori },
    { Nama_Produk: "Buket Snack Anak", Slug: "buket-snack-anak", Deskripsi: "Snack aman untuk anak", Harga: "140000.00", Stok: 22, Gambar: "/images/snack6.jpg", ID_Kategori: snack.ID_Kategori },
    { Nama_Produk: "Buket Snack Mix A", Slug: "buket-snack-mix-a", Deskripsi: "Campuran snack A", Harga: "170000.00", Stok: 17, Gambar: "/images/snack7.jpg", ID_Kategori: snack.ID_Kategori },
    { Nama_Produk: "Buket Snack Mix B", Slug: "buket-snack-mix-b", Deskripsi: "Campuran snack B", Harga: "190000.00", Stok: 16, Gambar: "/images/snack8.jpg", ID_Kategori: snack.ID_Kategori },
    { Nama_Produk: "Buket Snack Premium Box", Slug: "snack-premium-box", Deskripsi: "Kotak snack premium", Harga: "300000.00", Stok: 8, Gambar: "/images/snack9.jpg", ID_Kategori: snack.ID_Kategori },
    { Nama_Produk: "Buket Snack Custom", Slug: "buket-snack-custom", Deskripsi: "Snack custom pilihanmu", Harga: "200000.00", Stok: 12, Gambar: "/images/snack10.jpg", ID_Kategori: snack.ID_Kategori },

    // --- PARCEL (5) ---
    { Nama_Produk: "Parcel Lebaran Premium", Slug: "parcel-lebaran-premium", Deskripsi: "Parcel Lebaran mewah", Harga: "500000.00", Stok: 10, Gambar: "/images/parcel1.jpg", ID_Kategori: parcel.ID_Kategori },
    { Nama_Produk: "Parcel Natal", Slug: "parcel-natal", Deskripsi: "Parcel Natal eksklusif", Harga: "550000.00", Stok: 8, Gambar: "/images/parcel2.jpg", ID_Kategori: parcel.ID_Kategori },
    { Nama_Produk: "Parcel Imlek", Slug: "parcel-imlek", Deskripsi: "Parcel Imlek lengkap", Harga: "600000.00", Stok: 7, Gambar: "/images/parcel3.jpg", ID_Kategori: parcel.ID_Kategori },
    { Nama_Produk: "Parcel Anniversary", Slug: "parcel-anniversary", Deskripsi: "Parcel spesial anniversary", Harga: "450000.00", Stok: 10, Gambar: "/images/parcel4.jpg", ID_Kategori: parcel.ID_Kategori },
    { Nama_Produk: "Parcel Ulang Tahun", Slug: "parcel-ulangtahun", Deskripsi: "Parcel ulang tahun meriah", Harga: "400000.00", Stok: 12, Gambar: "/images/parcel5.jpg", ID_Kategori: parcel.ID_Kategori },
  ];

  for (const p of produkList) {
    await prisma.produk.upsert({
      where: { Slug: p.Slug },
      update: {},
      create: p,
    });
  }

  console.log("✅ 30 Produk berhasil di-seed");

  console.log("🌿 Seeding finished.");
}

main()
  .catch((err) => {
    console.error("Seed error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
