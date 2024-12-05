import express, { Response } from "express";
import db from "../lib/db";
import { response } from "../lib/response";
import { DepartemenSchema, DepartemenUpdateInput } from "../lib/schema";
import { handleError } from "../lib/error-handling";

const router = express.Router();

const updateDataDepartemen = async (
  id: number,
  data: DepartemenUpdateInput,
  res: Response,
) => {
  const existingDepartemen = await db.departemen.findUnique({
    where: { id },
  });

  if (!existingDepartemen) {
    return response(res, 404, "Departemen tidak ditemukan");
  }

  const updatedDepartemen = await db.departemen.update({
    where: { id },
    data,
  });

  return response(
    res,
    200,
    "Data Departemen berhasil diupdate",
    updatedDepartemen,
  );
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
    const totalItems = await db.departemen.count();
    const paginationInfo = {
      page: pageNumber,
      limit: limitNumber,
      totalItems,
      baseUrl,
    };

    const departemen = await db.departemen.findMany({ skip, take });
    return response(
      res,
      200,
      "Data Departemen berhasil diambil",
      departemen,
      paginationInfo,
    );
  } catch (error) {
    console.error("Error in departemen route:", error);
    handleError(error, res);
  }
});

router.get("/search", async (req, res) => {
  try {
    const { id, nama_departemen, page = "1", limit = "10" } = req.query;

    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);

    let whereClause: any = {};

    if (id) {
      whereClause.id = Number(id);
    }
    if (nama_departemen) {
      whereClause.nama_departemen = {
        contains: String(nama_departemen),
        mode: "insensitive",
      };
    }

    const queryString = new URLSearchParams({
      ...(id && { id: id.toString() }),
      ...(nama_departemen && { nama_departemen: nama_departemen.toString() }),
    }).toString();

    const fullPath = req.baseUrl + req.path;
    const baseUrl = `${req.protocol}://${req.get("host")}${fullPath}`;

    const totalItems = await db.departemen.count({ where: whereClause });
    const skip = (pageNumber - 1) * limitNumber;
    const take = limitNumber;

    const departemen = await db.departemen.findMany({
      where: whereClause,
      skip,
      take,
    });

    if (!departemen.length) {
      return response(res, 404, "Data departemen tidak ditemukan");
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
      departemen,
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
    const departemen = await db.departemen.findUnique({
      where: { id: Number(req.params.id) },
    });
    if (!departemen) {
      return response(res, 404, "Data departemen tidak ditemukan");
    }
    return response(res, 200, "Cari detail departemen", departemen);
  } catch (error) {
    handleError(error, res);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const departemen = await db.departemen.delete({
      where: { id: Number(req.params.id) },
    });
    return response(res, 200, "Data Departemen berhasil dihapus", departemen);
  } catch (error) {
    handleError(error, res);
  }
});

router.post("/", async (req, res) => {
  try {
    const departemenData = DepartemenSchema.parse(req.body);
    const departemen = await db.departemen.create({ data: departemenData });
    return response(res, 201, "Data Departemen berhasil dibuat", departemen);
  } catch (error) {
    handleError(error, res);
  }
});

router.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const updateData = DepartemenSchema.parse(req.body);
    updateDataDepartemen(id, updateData, res);
  } catch (error) {
    handleError(error, res);
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const updateData = DepartemenSchema.partial().parse(req.body);
    updateDataDepartemen(id, updateData, res);
  } catch (error) {
    handleError(error, res);
  }
});

export default router;
