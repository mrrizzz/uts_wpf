-- CreateEnum
CREATE TYPE "EnumStatusKaryawan" AS ENUM ('AKTIF', 'NONAKTIF');

-- CreateEnum
CREATE TYPE "EnumStatusAbsensi" AS ENUM ('HADIR', 'SAKIT', 'IZIN', 'ALPHA');

-- CreateTable
CREATE TABLE "Karyawan" (
    "id" SERIAL NOT NULL,
    "nama_lengkap" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "no_hp" TEXT NOT NULL,
    "tanggal_lahir" TIMESTAMP(3) NOT NULL,
    "alamat" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "tanggal_masuk" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "departemen_id" INTEGER NOT NULL,
    "jabatan_id" INTEGER NOT NULL,
    "status" "EnumStatusKaryawan" NOT NULL DEFAULT 'AKTIF',

    CONSTRAINT "Karyawan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Departemen" (
    "id" SERIAL NOT NULL,
    "nama_departemen" TEXT NOT NULL,

    CONSTRAINT "Departemen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Jabatan" (
    "id" SERIAL NOT NULL,
    "nama_jabatan" TEXT NOT NULL,

    CONSTRAINT "Jabatan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Absensi" (
    "id" SERIAL NOT NULL,
    "karyawan_id" INTEGER NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "waktu_masuk" TIMESTAMP(3) NOT NULL,
    "waktu_keluar" TIMESTAMP(3) NOT NULL,
    "status_absensi" "EnumStatusAbsensi" NOT NULL,

    CONSTRAINT "Absensi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Gaji" (
    "id" SERIAL NOT NULL,
    "karyawan_id" INTEGER NOT NULL,
    "gaji_pokok" INTEGER NOT NULL,
    "tunjangan" INTEGER NOT NULL,
    "potongan" INTEGER NOT NULL,
    "total_gaji" INTEGER NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Gaji_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Departemen_nama_departemen_key" ON "Departemen"("nama_departemen");

-- CreateIndex
CREATE UNIQUE INDEX "Jabatan_nama_jabatan_key" ON "Jabatan"("nama_jabatan");

-- AddForeignKey
ALTER TABLE "Karyawan" ADD CONSTRAINT "Karyawan_departemen_id_fkey" FOREIGN KEY ("departemen_id") REFERENCES "Departemen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Karyawan" ADD CONSTRAINT "Karyawan_jabatan_id_fkey" FOREIGN KEY ("jabatan_id") REFERENCES "Jabatan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Absensi" ADD CONSTRAINT "Absensi_karyawan_id_fkey" FOREIGN KEY ("karyawan_id") REFERENCES "Karyawan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gaji" ADD CONSTRAINT "Gaji_karyawan_id_fkey" FOREIGN KEY ("karyawan_id") REFERENCES "Karyawan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
