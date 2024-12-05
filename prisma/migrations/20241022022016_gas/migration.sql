/*
  Warnings:

  - The `waktu_masuk` column on the `Absensi` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `waktu_keluar` column on the `Absensi` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Absensi" DROP COLUMN "waktu_masuk",
ADD COLUMN     "waktu_masuk" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "waktu_keluar",
ADD COLUMN     "waktu_keluar" TIMESTAMP(3);
