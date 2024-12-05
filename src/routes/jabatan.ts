import express, { Response } from "express";
import db from "../lib/db";
import { response } from "../lib/response";
import { JabatanSchema, JabatanUpdateInput } from "../lib/schema";
import { handleError } from "../lib/error-handling";

const router = express.Router();

const updateDataJabatan = async (
  id: number,
  data: JabatanUpdateInput,
  res: Response,
) => {
  const existingJabatan = await db.jabatan.findUnique({
    where: { id },
  });

  if (!existingJabatan) {
    return response(res, 404, "Jabatan tidak ditemukan");
  }

  const updatedJabatan = await db.jabatan.update({
    where: { id },
    data,
  });

  return response(res, 200, "Data Jabatan berhasil diupdate", updatedJabatan);
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
    const totalItems = await db.jabatan.count();
    const paginationInfo = {
      page: pageNumber,
      limit: limitNumber,
      totalItems,
      baseUrl,
    };

    const jabatan = await db.jabatan.findMany({ skip, take });
    return response(
      res,
      200,
      "Data Jabatan berhasil diambil",
      jabatan,
      paginationInfo,
    );
  } catch (error) {
    console.error("Error in jabatan route:", error);
    handleError(error, res);
  }
});

router.get("/search", async (req, res) => {
  try {
    const { id, nama_jabatan, page = "1", limit = "10" } = req.query;

    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);

    let whereClause: any = {};

    if (id) {
      whereClause.id = Number(id);
    }
    if (nama_jabatan) {
      whereClause.nama_jabatan = {
        contains: String(nama_jabatan),
        mode: "insensitive",
      };
    }

    const queryString = new URLSearchParams({
      ...(id && { id: id.toString() }),
      ...(nama_jabatan && { nama_jabatan: nama_jabatan.toString() }),
    }).toString();

    const fullPath = req.baseUrl + req.path;
    const baseUrl = `${req.protocol}://${req.get("host")}${fullPath}`;

    const totalItems = await db.jabatan.count({ where: whereClause });
    const skip = (pageNumber - 1) * limitNumber;
    const take = limitNumber;

    const jabatan = await db.jabatan.findMany({
      where: whereClause,
      skip,
      take,
    });

    if (!jabatan.length) {
      return response(res, 404, "Data jabatan tidak ditemukan");
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
      jabatan,
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
    const jabatan = await db.jabatan.findUnique({
      where: { id: Number(req.params.id) },
    });
    if (!jabatan) {
      return response(res, 404, "Data jabatan tidak ditemukan");
    }
    return response(res, 200, "Cari detail jabatan", jabatan);
  } catch (error) {
    handleError(error, res);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const jabatan = await db.jabatan.delete({
      where: { id: Number(req.params.id) },
    });
    return response(res, 200, "Data Jabatan berhasil dihapus", jabatan);
  } catch (error) {
    handleError(error, res);
  }
});

router.post("/", async (req, res) => {
  try {
    const jabatanData = JabatanSchema.parse(req.body);
    const jabatan = await db.jabatan.create({ data: jabatanData });
    return response(res, 201, "Data Jabatan berhasil dibuat", jabatan);
  } catch (error) {
    handleError(error, res);
  }
});

router.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const updateData = JabatanSchema.parse(req.body);
    updateDataJabatan(id, updateData, res);
  } catch (error) {
    handleError(error, res);
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const updateData = JabatanSchema.partial().parse(req.body);
    updateDataJabatan(id, updateData, res);
  } catch (error) {
    handleError(error, res);
  }
});

export default router;
