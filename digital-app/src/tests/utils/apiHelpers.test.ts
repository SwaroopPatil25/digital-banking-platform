import { describe, it, expect } from "@jest/globals";
import { extractArray, extractPagination } from "../../utils/apiHelpers";

describe("extractArray", () => {
  it("returns empty array for null/undefined input", () => {
    expect(extractArray(null)).toEqual([]);
    expect(extractArray(undefined)).toEqual([]);
  });

  it("returns empty array for non-object input", () => {
    expect(extractArray("string")).toEqual([]);
    expect(extractArray(123)).toEqual([]);
  });

  it("extracts array by direct key", () => {
    const response = { transactions: [{ id: 1 }, { id: 2 }] };
    expect(extractArray(response, "transactions")).toHaveLength(2);
  });

  it("returns empty when key exists but is not array", () => {
    const response = { transactions: "not an array" };
    expect(extractArray(response, "transactions")).toEqual([]);
  });

  it("extracts from response.data when it is array", () => {
    const response = { data: [{ id: 1 }] };
    expect(extractArray(response)).toHaveLength(1);
  });

  it("extracts from response.data.items", () => {
    const response = { data: { items: [{ id: 1 }, { id: 2 }, { id: 3 }] } };
    expect(extractArray(response)).toHaveLength(3);
  });

  it("returns empty when data is object without items", () => {
    const response = { data: { something: "else" } };
    expect(extractArray(response)).toEqual([]);
  });

  it("returns empty array when no matching structure", () => {
    const response = { success: true };
    expect(extractArray(response)).toEqual([]);
  });
});

describe("extractPagination", () => {
  it("returns defaults for null/undefined", () => {
    const result = extractPagination(null);
    expect(result.page).toBe(1);
    expect(result.totalPages).toBe(1);
    expect(result.hasNext).toBe(false);
  });

  it("returns defaults for non-object", () => {
    expect(extractPagination("string").page).toBe(1);
  });

  it("returns defaults when no pagination key", () => {
    expect(extractPagination({ data: [] }).page).toBe(1);
  });

  it("extracts pagination from response.pagination", () => {
    const response = { pagination: { page: 3, totalPages: 10, hasNext: true, hasPrevious: true, total: 100 } };
    const result = extractPagination(response);
    expect(result.page).toBe(3);
    expect(result.totalPages).toBe(10);
    expect(result.hasNext).toBe(true);
    expect(result.total).toBe(100);
  });

  it("extracts pagination from response.meta", () => {
    const response = { meta: { page: 2, limit: 20 } };
    const result = extractPagination(response);
    expect(result.page).toBe(2);
    expect(result.limit).toBe(20);
  });

  it("fills missing fields with defaults", () => {
    const response = { pagination: { page: 5 } };
    const result = extractPagination(response);
    expect(result.page).toBe(5);
    expect(result.limit).toBe(10);
    expect(result.hasNext).toBe(false);
  });
});
