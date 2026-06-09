import { getToken } from "./authStorage";

type HttpMethods = "GET" | "PUT" | "POST" | "DELETE" | "PATCH";

type Options = {
    method?: HttpMethods,
    params?: any,
    body?:any,
    headers?: Record<string,string>,
    signal?: AbortSignal
}

export const apiClient = async (url:string, options: Options = {}) => {
    const {method = "GET", body, headers = {}, signal} = options;

    try {
        const result = await fetch(url,{method, signal, headers: {"Content-Type": "application/json", Authorization: getToken()? `Bearer ${getToken()}`: "", ...headers}, 
            body: body? JSON.stringify(body): undefined});
        
        let data;
        try {
            data = result.json();
        } catch {
            data = null;
        }

        if(!result.ok) {
            throw {
                status: result.status,
                message: "Failed to fetch data"
            }
        }
        return data;

    } catch(err: any) {
        if(err.name === "AbortError") throw err;

        throw{
            status: err.status || 404,
            message: err. message || "Not Found"
        }
    }
}