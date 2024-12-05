import { Prisma } from "@prisma/client";
import { Response } from "express";
import { ZodError } from "zod";

export function handleError(error: unknown, res: Response) {
  console.error("Error occured : ", error);

  if (error instanceof ZodError) {
    const errorMessages = error.errors.map((err) => ({
      field: err.path.join(),
      message: err.message,
    }));

    return res.status(400).json({
      status: 400,
      message: "Data karyawan tidak valid",
      errors: errorMessages,
    });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002":
        return res.status(409).json({
          status: 409,
          message: "Email sudah digunakan",
          errors: error.meta?.target,
        });
      case "P2025":
        return res.status(404).json({
          status: 404,
          message: "Data tidak ditemukan",
        });
      case "P2003":
        return res.status(400).json({
          status: 400,
          message: "Gagal menghubungkan data terkait",
          errors: error.meta?.target,
        });
      case "P2014":
        return res.status(400).json({
          status: 400,
          message: "Pelanggaran pada batasan relasi",
        });
      default:
        return res.status(500).json({
          status: 500,
          message: "Terjadi kesalahan database (unexpeced error)",
          code: error.code,
        });
    }
  }

  if (error instanceof Error) {
    return res.status(500).json({
      status: 500,
      message: error.message || "Terjadi kesalahan internal server",
    });
  }

  return res.status(500).json({
    status: 500,
    message: "Unexpected error. Please contact administrator",
  });
}
