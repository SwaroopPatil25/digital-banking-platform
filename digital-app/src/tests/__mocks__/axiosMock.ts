import { jest } from "@jest/globals";

const mockAxiosInstance = {
  get: jest.fn(() => Promise.resolve({ data: {} })) as ReturnType<typeof jest.fn>,
  post: jest.fn(() => Promise.resolve({ data: {} })) as ReturnType<typeof jest.fn>,
  put: jest.fn(() => Promise.resolve({ data: {} })) as ReturnType<typeof jest.fn>,
  patch: jest.fn(() => Promise.resolve({ data: {} })) as ReturnType<typeof jest.fn>,
  delete: jest.fn(() => Promise.resolve({ data: {} })) as ReturnType<typeof jest.fn>,
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() },
  },
  defaults: { headers: { common: {} } },
};

export default mockAxiosInstance;
export const getBfsiErrorMessage = jest.fn(() => "Something went wrong");
export const BFSI_ERROR_MAP = {};
