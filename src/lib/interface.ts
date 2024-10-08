export interface MetaData {
  prev: string | null;
  next: string | null;
  current: string;
}

export interface ResponseBody<T> {
  payload: T;
  message: string;
  metadata: MetaData;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  totalItems: number;
  baseUrl: string;
}
