/**
 * 后端统一响应结构。
 * 约定 `code === 0` 或 `code === 200` 表示业务成功，其余视为业务错误。
 */
export interface ApiResponse<T> {
  code: number | string;
  message: string;
  data: T;
  timestamp?: string;
}

/** 分页查询参数。 */
export interface PageParams {
  page?: number;
  limit?: number;
}

/** 分页信息。 */
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** 分页结果，所有列表接口统一使用该结构。 */
export interface PageResult<T> {
  items: T[];
  pagination: Pagination;
}
