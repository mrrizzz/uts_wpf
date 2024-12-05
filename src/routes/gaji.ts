import express, { Response } from "express";
import db from "../lib/db";
import { response } from "../lib/response";
import { GajiSchema, GajiUpdateInput } from "../lib/schema";
import { handleError } from "../lib/error-handling";

const router = express.Router();

const updateDataGaji = async (
  id: number,
  data: GajiUpdateInput,
  res: Response,
) => {
  const existingGaji = await db.gaji.findUnique({
    where: { id },
  });

  if (!existingGaji) {
    return response(res, 404, "Data gaji tidak ditemukan");
  }

  const updatedGaji = await db.gaji.update({
    where: { id },
    data,
  });

  return response(res, 200, "Data Gaji berhasil diupdate", updatedGaji);
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
    const totalItems = await db.gaji.count();
    const paginationInfo = {
      page: pageNumber,
      limit: limitNumber,
      totalItems,
      baseUrl,
    };

    const gaji = await db.gaji.findMany({
      skip,
      take,
      include: { karyawan: true },
    });
    return response(
      res,
      200,
      "Data Gaji berhasil diambil",
      gaji,
      paginationInfo,
    );
  } catch (error) {
    console.error("Error in gaji route:", error);
    handleError(error, res);
  }
});

router.get("/search", async (req, res) => {
  try {
    const { id, karyawan_id, bulan, page = "1", limit = "10" } = req.query;

    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);

    let whereClause: any = {};

    if (id) {
      whereClause.id = Number(id);
    }
    if (karyawan_id) {
      whereClause.karyawan_id = Number(karyawan_id);
    }
    if (bulan) {
      whereClause.bulan = String(bulan);
    }

    const queryString = new URLSearchParams({
      ...(id && { id: id.toString() }),
      ...(karyawan_id && { karyawan_id: karyawan_id.toString() }),
      ...(bulan && { bulan: bulan.toString() }),
    }).toString();

    const fullPath = req.baseUrl + req.path;
    const baseUrl = `${req.protocol}://${req.get("host")}${fullPath}`;

    const totalItems = await db.gaji.count({ where: whereClause });
    const skip = (pageNumber - 1) * limitNumber;
    const take = limitNumber;

    const gaji = await db.gaji.findMany({
      where: whereClause,
      include: { karyawan: true },
      skip,
      take,
    });

    if (!gaji.length) {
      return response(res, 404, "Data gaji tidak ditemukan");
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
      gaji,
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
    const gaji = await db.gaji.findUnique({
      where: { id: Number(req.params.id) },
      include: { karyawan: true },
    });
    if (!gaji) {
      return response(res, 404, "Data gaji tidak ditemukan");
    }
    return response(res, 200, "Cari detail gaji", gaji);
  } catch (error) {
    handleError(error, res);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const gaji = await db.gaji.delete({
      where: { id: Number(req.params.id) },
    });
    return response(res, 200, "Data Gaji berhasil dihapus", gaji);
  } catch (error) {
    handleError(error, res);
  }
});

router.post("/", async (req, res) => {
  try {
    const gajiData = GajiSchema.parse(req.body);

    const existingGaji = await db.gaji.findFirst({
      where: {
        karyawan_id: gajiData.karyawan_id,
        bulan: gajiData.bulan,
      },
    });

    if (existingGaji) {
      return response(
        res,
        409,
        "Karyawan sudah memiliki data gaji untuk bulan ini",
      );
    }

    const total_gaji =
      gajiData.gaji_pokok + gajiData.tunjangan - gajiData.potongan;

    const gaji = await db.gaji.create({
      data: {
        ...gajiData,
        total_gaji,
      },
      include: { karyawan: true },
    });
    return response(res, 201, "Data Gaji berhasil dibuat", gaji);
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message.includes(
          "Unique constraint failed on the fields: (`karyawan_id`,`bulan`)",
        )
      ) {
        return response(
          res,
          409,
          "Karyawan sudah memiliki data gaji untuk bulan ini",
        );
      }
    }
    handleError(error, res);
  }
});

router.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const updateData = GajiSchema.parse(req.body);

    const total_gaji =
      updateData.gaji_pokok + updateData.tunjangan - updateData.potongan;

    updateDataGaji(id, { ...updateData, total_gaji }, res);
  } catch (error) {
    handleError(error, res);
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const updateData = GajiSchema.partial().parse(req.body);

    if (
      updateData.gaji_pokok !== undefined ||
      updateData.tunjangan !== undefined ||
      updateData.potongan !== undefined
    ) {
      const currentGaji = await db.gaji.findUnique({ where: { id } });
      if (currentGaji) {
        const gaji_pokok = updateData.gaji_pokok ?? currentGaji.gaji_pokok;
        const tunjangan = updateData.tunjangan ?? currentGaji.tunjangan;
        const potongan = updateData.potongan ?? currentGaji.potongan;
        updateData.total_gaji =
          Number(gaji_pokok) + Number(tunjangan) - Number(potongan);
      }
    }

    updateDataGaji(id, updateData, res);
  } catch (error) {
    handleError(error, res);
  }
});

export default router;
