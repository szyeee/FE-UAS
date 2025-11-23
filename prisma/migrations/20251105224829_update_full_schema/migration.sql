-- CreateTable
CREATE TABLE "Kategori" (
    "ID_Kategori" SERIAL NOT NULL,
    "Nama_Kategori" TEXT NOT NULL,
    "Deskripsi" TEXT,
    "Created_At" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Kategori_pkey" PRIMARY KEY ("ID_Kategori")
);

-- CreateTable
CREATE TABLE "Produk" (
    "ID_Produk" SERIAL NOT NULL,
    "Nama_Produk" TEXT NOT NULL,
    "Slug" TEXT NOT NULL,
    "Deskripsi" TEXT,
    "Harga" DECIMAL(12,2) NOT NULL,
    "Stok" INTEGER NOT NULL,
    "Gambar" TEXT,
    "ID_Kategori" INTEGER NOT NULL,
    "Created_At" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Produk_pkey" PRIMARY KEY ("ID_Produk")
);

-- CreateTable
CREATE TABLE "Pengguna" (
    "ID_Pengguna" SERIAL NOT NULL,
    "Email" TEXT NOT NULL,
    "Nama" TEXT,
    "PasswordHash" TEXT,
    "Role" TEXT NOT NULL DEFAULT 'customer',
    "Alamat" TEXT,
    "No_Telepon" TEXT,
    "Created_At" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pengguna_pkey" PRIMARY KEY ("ID_Pengguna")
);

-- CreateTable
CREATE TABLE "Pesanan" (
    "ID_Pesanan" SERIAL NOT NULL,
    "ID_Pengguna" INTEGER NOT NULL,
    "Total" DECIMAL(12,2) NOT NULL,
    "Status" TEXT NOT NULL DEFAULT 'pending',
    "Alamat" TEXT NOT NULL,
    "Metode_Bayar" TEXT,
    "Tanggal_Pesan" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pesanan_pkey" PRIMARY KEY ("ID_Pesanan")
);

-- CreateTable
CREATE TABLE "PesananItem" (
    "ID_Item" SERIAL NOT NULL,
    "ID_Pesanan" INTEGER NOT NULL,
    "ID_Produk" INTEGER NOT NULL,
    "Kuantitas" INTEGER NOT NULL,
    "Harga_Unit" DECIMAL(12,2) NOT NULL,
    "Subtotal" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "PesananItem_pkey" PRIMARY KEY ("ID_Item")
);

-- CreateTable
CREATE TABLE "Ulasan" (
    "ID_Ulasan" SERIAL NOT NULL,
    "ID_Produk" INTEGER NOT NULL,
    "ID_Pengguna" INTEGER NOT NULL,
    "Rating" INTEGER NOT NULL,
    "Komentar" TEXT,
    "Dibuat_Pada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Ulasan_pkey" PRIMARY KEY ("ID_Ulasan")
);

-- CreateTable
CREATE TABLE "Promo" (
    "ID_Promo" SERIAL NOT NULL,
    "Judul_Promo" TEXT NOT NULL,
    "Deskripsi" TEXT,
    "Gambar" TEXT,
    "Diskon" INTEGER,
    "Tanggal_Mulai" TIMESTAMP(3) NOT NULL,
    "Tanggal_Akhir" TIMESTAMP(3) NOT NULL,
    "ID_Produk" INTEGER,

    CONSTRAINT "Promo_pkey" PRIMARY KEY ("ID_Promo")
);

-- CreateTable
CREATE TABLE "Keranjang" (
    "ID_Keranjang" SERIAL NOT NULL,
    "ID_Pengguna" INTEGER NOT NULL,
    "ID_Produk" INTEGER NOT NULL,
    "Jumlah" INTEGER NOT NULL,
    "Ditambahkan" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Keranjang_pkey" PRIMARY KEY ("ID_Keranjang")
);

-- CreateIndex
CREATE UNIQUE INDEX "Produk_Slug_key" ON "Produk"("Slug");

-- CreateIndex
CREATE UNIQUE INDEX "Pengguna_Email_key" ON "Pengguna"("Email");

-- AddForeignKey
ALTER TABLE "Produk" ADD CONSTRAINT "Produk_ID_Kategori_fkey" FOREIGN KEY ("ID_Kategori") REFERENCES "Kategori"("ID_Kategori") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pesanan" ADD CONSTRAINT "Pesanan_ID_Pengguna_fkey" FOREIGN KEY ("ID_Pengguna") REFERENCES "Pengguna"("ID_Pengguna") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PesananItem" ADD CONSTRAINT "PesananItem_ID_Produk_fkey" FOREIGN KEY ("ID_Produk") REFERENCES "Produk"("ID_Produk") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PesananItem" ADD CONSTRAINT "PesananItem_ID_Pesanan_fkey" FOREIGN KEY ("ID_Pesanan") REFERENCES "Pesanan"("ID_Pesanan") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ulasan" ADD CONSTRAINT "Ulasan_ID_Produk_fkey" FOREIGN KEY ("ID_Produk") REFERENCES "Produk"("ID_Produk") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ulasan" ADD CONSTRAINT "Ulasan_ID_Pengguna_fkey" FOREIGN KEY ("ID_Pengguna") REFERENCES "Pengguna"("ID_Pengguna") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Promo" ADD CONSTRAINT "Promo_ID_Produk_fkey" FOREIGN KEY ("ID_Produk") REFERENCES "Produk"("ID_Produk") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Keranjang" ADD CONSTRAINT "Keranjang_ID_Pengguna_fkey" FOREIGN KEY ("ID_Pengguna") REFERENCES "Pengguna"("ID_Pengguna") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Keranjang" ADD CONSTRAINT "Keranjang_ID_Produk_fkey" FOREIGN KEY ("ID_Produk") REFERENCES "Produk"("ID_Produk") ON DELETE RESTRICT ON UPDATE CASCADE;
