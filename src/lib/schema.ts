import { z } from "zod";

const StatusEnum = z.enum(["aktif", "nonaktif"]);

const StatusAbsensiEnum = z.enum(["hadir", "izin", "sakit", "alpha"]);

const stringToDate = z
  .string()
  .refine(
    (date) => {
      const parsed = new Date(date);
      return !isNaN(parsed.getTime());
    },
    {
      message: "Invalid date format. Use YYYY-MM-DD",
    },
  )
  .transform((date) => new Date(date));

const stringToHours = z.string().transform((time) => {
  const [hours, minutes, seconds] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, seconds, 0); // Set hours, minutes, and seconds
  return date; // Return the date object with the time set
});

export const KaryawanSchema = z.object({
  nama_lengkap: z.string().max(100),
  email: z.string().email().max(100),
  nomor_telepon: z.string().max(15),
  tanggal_lahir: stringToDate,
  alamat: z.string(),
  tanggal_masuk: stringToDate,
  departemen_id: z.number().int().positive(),
  jabatan_id: z.number().int().positive(),
  status: StatusEnum,
});

export type KaryawanUpdateInput = Partial<z.infer<typeof KaryawanSchema>>;

export const DepartemenSchema = z.object({
  id: z.number().int().positive().optional(),
  nama_departemen: z.string().max(100),
});

export type DepartemenUpdateInput = Partial<z.infer<typeof DepartemenSchema>>;

export const JabatanSchema = z.object({
  id: z.number().int().positive().optional(),
  nama_jabatan: z.string().max(100),
});

export type JabatanUpdateInput = Partial<z.infer<typeof JabatanSchema>>;

export const AbsensiSchema = z.object({
  id: z.number().int().positive().optional(),
  karyawan_id: z.number().int().positive(),
  tanggal: z.any().optional(),
  waktu_masuk: z.any().nullable().optional(),
  waktu_keluar: z.any().nullable().optional(),
  status_absensi: StatusAbsensiEnum,
});

export type AbsensiUpdateInput = Partial<z.infer<typeof AbsensiSchema>>;

export const GajiSchema = z.object({
  id: z.number().int().positive().optional(),
  karyawan_id: z.number().int().positive(),
  bulan: z.string().max(10),
  gaji_pokok: z.number().positive().multipleOf(0.01),
  tunjangan: z.number().nonnegative().multipleOf(0.01),
  potongan: z.number().nonnegative().multipleOf(0.01),
  total_gaji: z.number().positive().multipleOf(0.01),
});

export type GajiUpdateInput = Partial<z.infer<typeof GajiSchema>>;
