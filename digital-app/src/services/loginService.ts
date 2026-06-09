export const LoginService = async (email: string, password: string) => {
    return new Promise<{ Success: boolean, token: string }>((resolve, reject) => {
        setTimeout(() => {
            if (email === "admin@test.com" && password === "123456") {
                resolve({ Success: true, token:"user-token" });
            } else {
                reject(new Error("Invalid Credentials"));
            }
        }, 1000)
    })
}