export interface PaginationParams {
  limit: number;
  offset: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

const MAX_LIMIT = 200;
const DEFAULT_LIMIT = 50;

export function normalizePagination(raw?: { limit?: number | string; offset?: number | string }): PaginationParams {
  const limit = Math.min(
    Math.max(1, Number(raw?.limit) || DEFAULT_LIMIT),
    MAX_LIMIT,
  );
  const offset = Math.max(0, Number(raw?.offset) || 0);
  return { limit, offset };
}

export function paginated<T>(data: T[], total: number, params: PaginationParams): PaginatedResult<T> {
  return {
    data,
    total,
    limit: params.limit,
    offset: params.offset,
    hasMore: params.offset + data.length < total,
  };
}
