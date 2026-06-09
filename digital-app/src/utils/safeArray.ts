/**
 * Returns a safe array — never undefined or null.
 * Use wherever array data comes from API responses.
 */
export const safeArray = <T>(data: T[] | undefined | null): T[] => {
  if (Array.isArray(data)) return data;
  return [];
};
