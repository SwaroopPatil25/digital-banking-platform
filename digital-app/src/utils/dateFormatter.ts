export const formatDate = (date: string): string => {
    if (!date) return "";

    const formattedDate = new Date(date);

    const day = String(formattedDate.getDate()).padStart(2, "0");
    const month = String(formattedDate.getMonth() + 1).padStart(2, "0");
    const year = formattedDate.getFullYear();

    return `${day}/${month}/${year}`;
};

export const formatDateTime = (date: string): string => {
    if (!date) return "";
    return new Date(date).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
};