import express, { Response } from "express";
import db from "../lib/db";
import { response } from "../lib/response";
import { KaryawanSchema, KaryawanUpdateInput } from "../lib/schema";
import { handleError } from "../lib/error-handling";

const router = express.Router();

const updateDataKaryawan = async (
  id: number,
  data: KaryawanUpdateInput,
  res: Response,
) => {
  const existingKaryawan = await db.karyawan.findUnique({
    where: { id },
  });

  if (!existingKaryawan) {
    return response(res, 404, "Karyawan tidak ditemukan");
  }

  const updatedKaryawan = await db.karyawan.update({
    where: { id },
    data,
  });

  return response(res, 200, "Data Karyawan berhasil diupdate", updatedKaryawan);
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
    const totalItems = await db.karyawan.count();
    const paginationInfo = {
      page: pageNumber,
      limit: limitNumber,
      totalItems,
      baseUrl,
    };
    const karyawan = await db.karyawan.findMany({ skip, take });
    return response(
      res,
      200,
      "Data Karyawan berhasil diambil",
      karyawan,
      paginationInfo,
    );
  } catch (error) {
    console.error("Error in karyawan route:", error);
    handleError(error, res);
  }
});

router.get("/q", async (req, res) => {
  try {
    const {
      id,
      nama,
      alamat,
      no_telp,
      status,
      departemen,
      jabatan,
      dept_id,
      jabatan_id,
      page = "1",
      limit = "10",
    } = req.query;

    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);

    let whereClause: any = {};

    if (id) {
      whereClause.id = Number(id);
    }
    if (nama) {
      whereClause.nama_lengkap = {
        contains: String(nama),
        mode: "insensitive",
      };
    }
    if (alamat) {
      whereClause.alamat = {
        contains: String(alamat),
        mode: "insensitive",
      };
    }
    if (no_telp) {
      whereClause.nomor_telepon = {
        contains: String(no_telp),
        mode: "insensitive",
      };
    }
    if (status) {
      whereClause.status = {
        contains: String(status),
        mode: "insensitive",
      };
    }
    if (departemen) {
      whereClause.departemen = {
        nama_departemen: {
          contains: String(departemen),
          mode: "insensitive",
        },
      };
    }
    if (jabatan) {
      whereClause.jabatan = {
        nama_jabatan: {
          contains: String(jabatan),
          mode: "insensitive",
        },
      };
    }

    if (dept_id) {
      whereClause.departemen_id = Number(dept_id);
    }

    if (jabatan_id) {
      whereClause.jabatan_id = Number(jabatan_id);
    }

    const queryString = new URLSearchParams({
      ...(id && { id: id.toString() }),
      ...(nama && { nama: nama.toString() }),
      ...(alamat && { alamat: alamat.toString() }),
      ...(no_telp && { no_telp: no_telp.toString() }),
      ...(status && { status: status.toString() }),
      ...(departemen && { departemen: departemen.toString() }),
      ...(jabatan && { jabatan: jabatan.toString() }),
      ...(dept_id && { dept_id: dept_id.toString() }),
      ...(jabatan_id && { jabatan_id: jabatan_id.toString() }),
    }).toString();
    console.log(queryString);

    const fullPath = req.baseUrl + req.path;
    const baseUrl = `${req.protocol}://${req.get("host")}${fullPath}`;

    const totalItems = await db.karyawan.count({ where: whereClause });
    const skip = (pageNumber - 1) * limitNumber;
    const take = limitNumber;

    console.log(whereClause);
    const karyawan = await db.karyawan.findMany({
      where: whereClause,
      include: {
        departemen: true,
        jabatan: true,
      },
      skip,
      take,
    });

    if (!karyawan.length) {
      return response(res, 404, "Data karyawan tidak ditemukan");
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
      karyawan,
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
    const karyawan = await db.karyawan.findUnique({
      where: { id: Number(req.params.id) },
    });
    if (!karyawan) {
      return response(res, 404, "Data karyawan tidak ditemukan");
    }
    return response(res, 200, "Cari detail karyawan", karyawan);
  } catch (error) {
    handleError(error, res);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const karyawan = await db.karyawan.delete({
      where: { id: Number(req.params.id) },
    });
    return response(res, 200, "Data Karyawan berhasil dihapus", karyawan);
  } catch (error) {
    handleError(error, res);
  }
});

router.post("/", async (req, res) => {
  try {
    const karyawanData = KaryawanSchema.parse(req.body);
    const karyawan = await db.karyawan.create({ data: karyawanData });
    return response(res, 201, "Data Karyawan berhasil dibuat", karyawan);
  } catch (error) {
    handleError(error, res);
  }
});

router.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const updateData = KaryawanSchema.parse(req.body);

    updateDataKaryawan(id, updateData, res);
  } catch (error) {
    handleError(error, res);
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const updateData = KaryawanSchema.partial().parse(req.body);

    updateDataKaryawan(id, updateData, res);
  } catch (error) {
    handleError(error, res);
  }
});

export default router;
