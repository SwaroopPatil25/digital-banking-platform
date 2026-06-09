/**
 * Safely extracts array data from standardized backend responses.
 * Handles: { data: [] }, { data: { items: [] } }, { transactions: [] }, { beneficiaries: [] }, etc.
 */
export const extractArray = <T>(response: unknown, key?: string): T[] => {
  if (!response || typeof response !== "object") return [];
  const res = response as Record<string, unknown>;

  // Direct key access: response.transactions, response.beneficiaries, etc.
  if (key && Array.isArray(res[key])) return res[key] as T[];

  // Standardized: response.data (array)
  if (Array.isArray(res.data)) return res.data as T[];

  // Standardized: response.data.items (array)
  if (res.data && typeof res.data === "object") {
    const data = res.data as Record<string, unknown>;
    if (Array.isArray(data.items)) return data.items as T[];
  }

  return [];
};

/**
 * Extracts pagination metadata from standardized response.
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  total: number;
}

export const extractPagination = (response: unknown): PaginationMeta => {
  const defaults: PaginationMeta = { page: 1, limit: 10, totalPages: 1, hasNext: false, hasPrevious: false, total: 0 };
  if (!response || typeof response !== "object") return defaults;
  const res = response as Record<string, unknown>;
  const pagination = (res.pagination || res.meta) as Partial<PaginationMeta> | undefined;
  if (!pagination) return defaults;
  return { ...defaults, ...pagination };
};
