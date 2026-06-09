import { useEffect, useRef, useState } from "react";
import { getDashboardData } from "../services/dashboardService";
type userData = {
    name: string,
    balance: string
}
const dashboardHook = () => {
    const [data, setData] = useState<userData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const fetchDataController = useRef<AbortController | null>(null);

    const fetchData = async () => {
        fetchDataController?.current?.abort();
        const controller = new AbortController();
        fetchDataController.current = controller;
        setLoading(true);
        try {
            const user = await getDashboardData(controller.signal);
            setData(user);
        } catch (error: any) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchData();
        }, 1000);
        return (() => {
            clearTimeout(timer);
            fetchDataController.current?.abort();
        })
    }, []);

    return (
        { loading, data, error, fetchData }
    );
}

export default dashboardHook;