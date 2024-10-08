import { Response } from "express";
import { PaginationInfo, MetaData, ResponseBody } from "./interface";

export const response = <T>(
  res: Response,
  statusCode: number,
  message: string,
  data?: T,
  paginationInfo?: PaginationInfo,
) => {
  const metadata: MetaData = {
    prev: null,
    next: null,
    current: "",
  };

  if (paginationInfo) {
    const { page, limit, totalItems } = paginationInfo;
    let baseUrl = paginationInfo.baseUrl;

    const totalPages = Math.ceil(totalItems / limit);

    if (!baseUrl.endsWith("&")) {
      baseUrl += "?";
    }
    metadata.current = `${baseUrl}page=${page}&limit=${limit}`;

    if (page > 1) {
      metadata.prev = `${baseUrl}page=${page - 1}&limit=${limit}`;
    }

    if (page < totalPages) {
      metadata.next = `${baseUrl}page=${page + 1}&limit=${limit}`;
    }
  }

  console.log(paginationInfo);

  res.status(statusCode).json([
    {
      payload: data,
      message,
      metadata,
    } as ResponseBody<T>,
  ]);
};
