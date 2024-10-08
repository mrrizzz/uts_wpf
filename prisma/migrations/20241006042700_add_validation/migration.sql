/*
  Warnings:

  - You are about to alter the column `nama_departemen` on the `Departemen` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to drop the column `tanggal` on the `Gaji` table. All the data in the column will be lost.
  - You are about to alter the column `gaji_pokok` on the `Gaji` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(10,2)`.
  - You are about to alter the column `tunjangan` on the `Gaji` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(10,2)`.
  - You are about to alter the column `potongan` on the `Gaji` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(10,2)`.
  - You are about to alter the column `total_gaji` on the `Gaji` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(10,2)`.
  - You are about to alter the column `nama_jabatan` on the `Jabatan` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to drop the column `no_hp` on the `Karyawan` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `Karyawan` table. All the data in the column will be lost.
  - You are about to alter the column `nama_lengkap` on the `Karyawan` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `email` on the `Karyawan` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - A unique constraint covering the columns `[email]` on the table `Karyawan` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `status_absensi` on the `Absensi` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `bulan` to the `Gaji` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nomor_telepon` to the `Karyawan` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `status` on the `Karyawan` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Status" AS ENUM ('aktif', 'nonaktif');

-- CreateEnum
CREATE TYPE "StatusAbsensi" AS ENUM ('hadir', 'izin', 'sakit', 'alpha');

-- DropIndex
DROP INDEX "Departemen_nama_departemen_key";

-- DropIndex
DROP INDEX "Jabatan_nama_jabatan_key";

-- AlterTable
ALTER TABLE "Absensi" ALTER COLUMN "tanggal" SET DATA TYPE DATE,
ALTER COLUMN "waktu_masuk" SET DATA TYPE TIME,
ALTER COLUMN "waktu_keluar" SET DATA TYPE TIME,
DROP COLUMN "status_absensi",
ADD COLUMN     "status_absensi" "StatusAbsensi" NOT NULL;

-- AlterTable
ALTER TABLE "Departemen" ALTER COLUMN "nama_departemen" SET DATA TYPE VARCHAR(100);

-- AlterTable
ALTER TABLE "Gaji" DROP COLUMN "tanggal",
ADD COLUMN     "bulan" VARCHAR(10) NOT NULL,
ALTER COLUMN "gaji_pokok" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "tunjangan" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "potongan" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "total_gaji" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "Jabatan" ALTER COLUMN "nama_jabatan" SET DATA TYPE VARCHAR(100);

-- AlterTable
ALTER TABLE "Karyawan" DROP COLUMN "no_hp",
DROP COLUMN "password",
ADD COLUMN     "nomor_telepon" VARCHAR(15) NOT NULL,
ALTER COLUMN "nama_lengkap" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "email" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "tanggal_lahir" SET DATA TYPE DATE,
ALTER COLUMN "tanggal_masuk" DROP DEFAULT,
ALTER COLUMN "tanggal_masuk" SET DATA TYPE DATE,
DROP COLUMN "status",
ADD COLUMN     "status" "Status" NOT NULL;

-- DropEnum
DROP TYPE "EnumStatusAbsensi";

-- DropEnum
DROP TYPE "EnumStatusKaryawan";

-- CreateIndex
CREATE UNIQUE INDEX "Karyawan_email_key" ON "Karyawan"("email");
