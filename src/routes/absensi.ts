import express, { Response } from "express";
import db from "../lib/db";
import { response } from "../lib/response";
import { AbsensiSchema, AbsensiUpdateInput } from "../lib/schema";
import { handleError } from "../lib/error-handling";
import { nullable } from "zod";

const router = express.Router();

const updateDataAbsensi = async (
  id: number,
  data: AbsensiUpdateInput,
  res: Response,
) => {
  const existingAbsensi = await db.absensi.findUnique({
    where: { id },
  });

  if (!existingAbsensi) {
    return response(res, 404, "Absensi tidak ditemukan");
  }

  const updatedAbsensi = await db.absensi.update({
    where: { id },
    data,
  });

  return response(res, 200, "Data Absensi berhasil diupdate", updatedAbsensi);
};

const isWithinWorkingHours = (waktu_masuk: Date) => {
  const startTime = new Date();
  startTime.setHours(8, 0, 0, 0);

  const endTime = new Date();
  endTime.setHours(17, 0, 0, 0);

  return waktu_masuk >= startTime && waktu_masuk <= endTime;
};

router.get("/list", async (req, res) => {
  try {
    const { page = "1", limit = "10" } = req.query;
    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);

    if (isNaN(pageNumber) || isNaN(limitNumber)) {
      return response(res, 400, "Invalid page or limit parameter");
    }

    const skip = (pageNumber - 1) * limitNumber;
    const take = limitNumber;
    const fullPath = req.baseUrl + req.path;
    const baseUrl = `${req.protocol}://${req.get("host")}${fullPath}`;
    const totalItems = await db.absensi.count();
    const paginationInfo = {
      page: pageNumber,
      limit: limitNumber,
      totalItems,
      baseUrl,
    };

    const absensi = await db.absensi.findMany({
      skip,
      take,
      include: { karyawan: true },
    });
    return response(
      res,
      200,
      "Data Absensi berhasil diambil",
      absensi,
      paginationInfo,
    );
  } catch (error) {
    console.error("Error in absensi route:", error);
    handleError(error, res);
  }
});

router.get("/search", async (req, res) => {
  try {
    const {
      id,
      karyawan_id,
      tanggal,
      status_absensi,
      page = "1",
      limit = "10",
    } = req.query;

    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);

    let whereClause: any = {};

    if (id) {
      whereClause.id = Number(id);
    }
    if (karyawan_id) {
      whereClause.karyawan_id = Number(karyawan_id);
    }
    if (tanggal) {
      whereClause.tanggal = new Date(tanggal as string);
    }
    if (status_absensi) {
      whereClause.status_absensi = status_absensi;
    }

    const queryString = new URLSearchParams({
      ...(id && { id: id.toString() }),
      ...(karyawan_id && { karyawan_id: karyawan_id.toString() }),
      ...(tanggal && { tanggal: tanggal.toString() }),
      ...(status_absensi && { status_absensi: status_absensi.toString() }),
    }).toString();

    const fullPath = req.baseUrl + req.path;
    const baseUrl = `${req.protocol}://${req.get("host")}${fullPath}`;

    const totalItems = await db.absensi.count({ where: whereClause });
    const skip = (pageNumber - 1) * limitNumber;
    const take = limitNumber;

    const absensi = await db.absensi.findMany({
      where: whereClause,
      include: { karyawan: true },
      skip,
      take,
    });

    if (!absensi.length) {
      return response(res, 404, "Data absensi tidak ditemukan");
    }

    const paginationInfo = {
      page: pageNumber,
      limit: limitNumber,
      totalItems,
      baseUrl: `${baseUrl}?${queryString}&`,
    };

    return response(
      res,
      200,
      `Data pencarian anda : ${totalItems} ditemukan`,
      absensi,
      paginationInfo,
    );
  } catch (error) {
    handleError(error, res);
  }
});

router.get("/:id", async (req, res) => {
  try {
    if (isNaN(Number(req.params.id))) {
      return response(res, 400, "Invalid ID format");
    }
    const absensi = await db.absensi.findUnique({
      where: { id: Number(req.params.id) },
      include: { karyawan: true },
    });
    if (!absensi) {
      return response(res, 404, "Data absensi tidak ditemukan");
    }
    return response(res, 200, "Cari detail absensi", absensi);
  } catch (error) {
    handleError(error, res);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const absensi = await db.absensi.delete({
      where: { id: Number(req.params.id) },
    });
    return response(res, 200, "Data Absensi berhasil dihapus", absensi);
  } catch (error) {
    handleError(error, res);
  }
});

router.post("/", async (req, res) => {
  try {
    const absensiData = AbsensiSchema.parse(req.body);
    const { tanggal, karyawan_id, status_absensi } = absensiData;
    let { waktu_masuk, waktu_keluar } = absensiData;
    console.log(tanggal);
    console.log(waktu_masuk);
    //
    // if (status_absensi === "hadir") {
    //   if (!waktu_masuk) {
    //     return response(res, 400, "waktu masuk harus diisi");
    //   }
    //   if (!isWithinWorkingHours(waktu_masuk)) {
    //     return response(res, 400, "waktu masuk diluar jam kerja");
    //   }
    // } else {
    //   console.log(status_absensi);
    //   waktu_masuk = null;
    //   waktu_keluar = null;
    // }

    const existingAbsensi = await db.absensi.findFirst({
      where: {
        karyawan_id,
        tanggal: new Date(),
      },
    });

    if (existingAbsensi) {
      return response(res, 409, "Karyawan sudah melakukan absensi hari ini");
    }
    console.log(waktu_masuk);

    const absensi = await db.absensi.create({
      data: {
        ...absensiData,
        tanggal: new Date(),
        waktu_masuk: new Date(),
      },
      include: { karyawan: true },
    });

    return response(res, 201, "Data Absensi berhasil dibuat", absensi);
  } catch (error) {
    handleError(error, res);
  }
});

router.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const updateData = AbsensiSchema.parse(req.body);
    updateDataAbsensi(id, updateData, res);
  } catch (error) {
    handleError(error, res);
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const updateData = AbsensiSchema.partial().parse(req.body);
    updateDataAbsensi(id, updateData, res);
  } catch (error) {
    handleError(error, res);
  }
});

export default router;
