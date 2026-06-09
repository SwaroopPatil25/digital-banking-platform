import { apiClient } from "./apiClients";

type RequestConfig = {
    params?: Record<string, string | number>,
    header?: Record<string, string>,
    signal?: AbortSignal 
}

export const get = (url: string, config: RequestConfig) => {
    const {params, ...rest} = config;

    const query = params ? "?" + new URLSearchParams(
        Object.entries(params).map(([k,v]) => [k, String(v)])).toString() : "";
    
    return (
        apiClient(url+query, {method: "GET",...rest})
    );
}

export const post = (url: string, body: any, config: RequestConfig) => {
    return (
        apiClient(url, {method: "POST", body, ...config})
    )
}

export const put = (url: string, body: any, config: RequestConfig) => {
    return (
        apiClient(url, {method: "PUT", body, ...config})
    )
}

export const del = (url: string, config: RequestConfig) => {
    return (
        apiClient(url, {method: "DELETE", ...config})
    )
}