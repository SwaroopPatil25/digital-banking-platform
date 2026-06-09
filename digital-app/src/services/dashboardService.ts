type userData = {
    name: string,
    balance: string
}

export const getDashboardData = (_signal: AbortSignal): Promise<userData> => {
    return new Promise((resolve, _reject) => {
        resolve({
            name: "Test User",
            balance: "1000000"
        })
        // reject({message: "Failed to load Data"})
    })
}

// import { get, post, put, del } from "./apiClient";

// export const getAccounts = (signal?: AbortSignal) =>
//   get("/api/accounts", signal);

// export const createAccount = (data: any) =>
//   post("/api/accounts", data);

// export const updateAccount = (id: string, data: any) =>
//   put(`/api/accounts/${id}`, data);

// export const deleteAccount = (id: string) =>
//   del(`/api/accounts/${id}`);