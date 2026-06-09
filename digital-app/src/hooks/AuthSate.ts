import { useState } from "react"
import { LoginService } from "../services/loginService";
import { setToken } from "../services/authStorage";


export const AuthState = () => {
    const [loading, setLoading] = useState<boolean>(false);

    const [authError, setError] = useState("");

    const login = async (email: string, password: string) => {
        setLoading(true);
        try {
            const result = await LoginService(email, password);
            setToken(result.token);
            return true;
        } catch (error: any) {
            setError(error.message);
            return false;
        } finally {
            setLoading(false);
        }
    }

    return {loading, login, authError};
}