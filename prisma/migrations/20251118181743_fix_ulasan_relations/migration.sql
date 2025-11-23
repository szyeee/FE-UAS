-- DropForeignKey
ALTER TABLE "Ulasan" DROP CONSTRAINT "Ulasan_ID_Pengguna_fkey";

-- AlterTable
ALTER TABLE "Ulasan" ALTER COLUMN "ID_Pengguna" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Ulasan" ADD CONSTRAINT "Ulasan_ID_Pengguna_fkey" FOREIGN KEY ("ID_Pengguna") REFERENCES "Pengguna"("ID_Pengguna") ON DELETE SET NULL ON UPDATE CASCADE;
