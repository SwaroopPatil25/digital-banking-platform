import { Navigate } from "react-router-dom";
import { getToken } from "../services/authStorage"
import type { JSX } from "react";

export const ProtectedRoute = ({children}: {children: JSX.Element}) => {
    const token = getToken();

    if(!token) {
        return <Navigate to="/" replace/>
    }

    return children
}