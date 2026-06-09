import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../../shared/layout/AppLayout";
import { registerService } from "../../services/auth.service";
import toast from "react-hot-toast";
import axios from "axios";

const Registration = () => {
    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        mobileNo: "",
        birthDate: "",
        gender: "",
        employmentStatus: "salaried",
        accountType: "savings",
        annualIncome: "5",
        panNo: "",
        city: "",
        state: "",
        pincode: "",
        address: "",
        contactMethod: "",
        role: "user",
        alerts: [] as string[]
    })

    const [error, setError] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        mobileNo: ""
    })

    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === "checkbox") {
            setForm((prev) => ({
                ...prev,
                alerts: prev.alerts.includes(value)
                    ? prev.alerts.filter(
                        (alert) => alert !== value
                    )
                    : [...prev.alerts, value]
            }));

            return;
        }
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!validate()) {
            return;
        }

        setLoading(true);
        try {
            const response = await registerService(form);
            toast.success(response.message || "Registration Successful");
            setForm({
                username: "", email: "", password: "", confirmPassword: "",
                mobileNo: "", birthDate: "", gender: "", employmentStatus: "",
                accountType: "", annualIncome: "", panNo: "", city: "",
                state: "", pincode: "", address: "", contactMethod: "",
                role: "", alerts: []
            });
            setError({ username: "", email: "", password: "", confirmPassword: "", mobileNo: "" });
            setTimeout(() => navigate("/"), 1000);
        } catch (err) {
            if (axios.isAxiosError(err)) {
                toast.error(err.response?.data?.message || "Registration failed");
            } else {
                toast.error("Something went wrong");
            }
        } finally {
            setLoading(false);
        }
    }

    const validate = () => {
        const formError = {
            username: "",
            email: "",
            password: "",
            confirmPassword: "",
            mobileNo: ""
        }

        let isValid = true;
        if (!form.username.trim()) {
            formError.username = "Full Name is Required";
            isValid = false;
        }

        if (!form.email.trim()) {
            formError.email = "Email is Required";
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(form.email)) {
            formError.email = "Invalid Email format";
            isValid = false;
        }

        if (!form.password) {
            formError.password = "Password is Required";
            isValid = false;
        } else if (form.password.length < 8) {
            formError.password = "Minimum 8 Characters Required";
            isValid = false;
        }

        if (!form.confirmPassword) {
            formError.confirmPassword = "Confirm Password is Required";
            isValid = false;
        } else if (form.confirmPassword !== form.password) {
            formError.confirmPassword = "Password do not match";
            isValid = false;
        }

        if (!/^\d{10}$/.test(form.mobileNo)) {
            formError.mobileNo = "Invalid Mobile Number";
            isValid = false;
        }

        setError(formError);
        return isValid;
    }

    const goToLogin = () => {
        navigate("/");
    }
    return (
        <AppLayout isAuthenticated={false}>
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="w-full max-w-4xl bg-white p-8 rounded-2xl shadow-md">
                <h2 className="text-2xl font-bold text-center mb-6">Register</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex gap-4">
                        <div className="w-1/2">
                            <label style={{ textAlign: "left" }} className="block text-sm font-medium mb-1"><span className="text-red-500">* </span>Full Name:</label>
                            <input placeholder="Enter your Full Name" type="text" name="username" value={form.username}
                                onChange={handleChange} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 
                                focus:${error.username ? "ring-red-500" : "ring-blue-500"}`} />
                            {error.username && (
                                <p className="text-red-500 text-sm mt-1" style={{ textAlign: "left" }}>
                                    {error.username}
                                </p>
                            )}
                        </div>
                        <div className="w-1/2">
                            <label style={{ textAlign: "left" }} className="block text-sm font-medium mb-1"><span className="text-red-500">* </span>Email ID:</label>
                            <input placeholder="Enter your Email ID" type="email" name="email" value={form.email} onChange={handleChange}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            {error.email && (
                                <p className="text-red-500 text-sm mt-1" style={{ textAlign: "left" }}>
                                    {error.email}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="w-1/2">
                            <label style={{ textAlign: "left" }} className="block text-sm font-medium mb-1"><span className="text-red-500">* </span>Password:</label>
                            <input placeholder="Enter password" type="password" name="password" value={form.password} onChange={handleChange}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            {error.password && (
                                <p className="text-red-500 text-sm mt-1" style={{ textAlign: "left" }}>
                                    {error.password}
                                </p>
                            )}
                        </div>
                        <div className="w-1/2">
                            <label style={{ textAlign: "left" }} className="block text-sm font-medium mb-1"><span className="text-red-500">* </span>Confirm Password:</label>
                            <input placeholder="Enter password again" type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            {error.confirmPassword && (
                                <p className="text-red-500 text-sm mt-1" style={{ textAlign: "left" }}>
                                    {error.confirmPassword}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="w-1/2">
                            <label style={{ textAlign: "left" }} className="block text-sm font-medium mb-1">Mobile Number:</label>
                            <input placeholder="Enter Mobile Number" type="tel" name="mobileNo" value={form.mobileNo} onChange={handleChange}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            {error.mobileNo && (
                                <p className="text-red-500 text-sm mt-1" style={{ textAlign: "left" }}>
                                    {error.mobileNo}
                                </p>
                            )}
                        </div>
                        <div className="w-1/2">
                            <label style={{ textAlign: "left" }} className="block text-sm font-medium mb-1"><span className="text-red-500">* </span>Date of Birth:</label>
                            <input placeholder="Enter Date of Birth" type="date" name="birthDate" value={form.birthDate} onChange={handleChange}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <label className="block text-sm font-medium mb-2 text-left"><span className="text-red-500">* </span>Gender:</label>
                        <label className="flex items-center gap-1">
                            <input type="radio" name="gender" value="Male" checked={form.gender === "Male"}
                                onChange={handleChange} /> Male
                        </label>

                        <label className="flex items-center gap-1">
                            <input type="radio" name="gender" value="Female" checked={form.gender === "Female"}
                                onChange={handleChange} /> Female
                        </label>

                        <label className="flex items-center gap-1">
                            <input type="radio" name="gender" value="Other" checked={form.gender === "Other"}
                                onChange={handleChange} />  Other
                        </label>
                    </div>

                    <div className="flex gap-4">
                        <div className="w-1/2">
                            <label style={{ textAlign: "left" }} className="block text-sm font-medium mb-1"><span className="text-red-500">* </span>Account Type:</label>
                            <select name="accountType" value={form.accountType} onChange={handleChange}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="savings">Savings</option>
                                <option value="current">Current</option>
                                <option value="salary">Salary</option>
                            </select>
                        </div>
                        <div className="w-1/2">
                            <label style={{ textAlign: "left" }} className="block text-sm font-medium mb-1"><span className="text-red-500">* </span>Employment Status:</label>
                            <select name="employmentStatus" value={form.employmentStatus} onChange={handleChange}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="salaried">Salaried</option>
                                <option value="selfEmployed">Self-Employed</option>
                                <option value="student">Student</option>
                                <option value="retired">Retired</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="w-1/2">
                            <label style={{ textAlign: "left" }} className="block text-sm font-medium mb-1"><span className="text-red-500">* </span>Annual Income Range:</label>
                            <select name="annualIncome" value={form.annualIncome} onChange={handleChange}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="5"> less than 5 LPA</option>
                                <option value="5-10">5-10 LPA</option>
                                <option value="10-20">10-20 LPA</option>
                                <option value="20+">20+ LPA</option>
                            </select>
                        </div>
                        <div className="w-1/2">
                            <label style={{ textAlign: "left" }} className="block text-sm font-medium mb-1"><span className="text-red-500">* </span>PAN Number:</label>
                            <input placeholder="Enter your PAN Number" type="text" name="panNo" value={form.panNo}
                                onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                    </div>

                    <div>
                        <label style={{ textAlign: "left" }} className="block text-sm font-medium mb-1"><span className="text-red-500">* </span>Address:</label>
                        <textarea placeholder="Enter your Address" name="address" value={form.address} onChange={handleChange}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"> </textarea>
                    </div>

                    <div className="flex gap-4">
                        <div className="w-1/2">
                            <label style={{ textAlign: "left" }} className="block text-sm font-medium mb-1"><span className="text-red-500">* </span>City:</label>
                            <input placeholder="Enter your City" type="text" name="city" value={form.city}
                                onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div className="w-1/2">
                            <label style={{ textAlign: "left" }} className="block text-sm font-medium mb-1"><span className="text-red-500">* </span>State:</label>
                            <input placeholder="Enter your State" type="text" name="state" value={form.state}
                                onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="w-1/2">
                            <label style={{ textAlign: "left" }} className="block text-sm font-medium mb-1"><span className="text-red-500">* </span>Pincode:</label>
                            <input placeholder="Enter your Pincode" type="text" name="pincode" value={form.pincode}
                                onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div className="w-1/2">
                            <label style={{ textAlign: "left" }} className="block text-sm font-medium mb-1"><span className="text-red-500">* </span>Role:</label>
                            <select name="role" value={form.role} onChange={handleChange}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <label className="block text-sm font-medium mb-2 text-left"><span className="text-red-500">* </span>Preferred Contact Method:</label>
                        <label className="flex items-center gap-1">
                            <input type="radio" name="contactMethod" value="Email" checked={form.contactMethod === "Email"}
                                onChange={handleChange} /> Email
                        </label>

                        <label className="flex items-center gap-1">
                            <input type="radio" name="contactMethod" value="SMS" checked={form.contactMethod === "SMS"}
                                onChange={handleChange} /> SMS
                        </label>

                        <label className="flex items-center gap-1">
                            <input type="radio" name="contactMethod" value="Phone Call" checked={form.contactMethod === "Phone Call"}
                                onChange={handleChange} />  Phone Call
                        </label>
                    </div>

                    <div className="flex items-center gap-4">
                        <label className="block text-sm font-medium mb-2 text-left"> Enable Transaction Alerts:</label>
                        <label className="flex items-center gap-1">
                            <input type="checkbox" name="alerts" value="Email" checked={form.alerts.includes("Email")}
                                onChange={handleChange} /> Email Alerts
                        </label>

                        <label className="flex items-center gap-1">
                            <input type="checkbox" name="alerts" value="SMS" checked={form.alerts.includes("SMS")}
                                onChange={handleChange} /> SMS Alerts
                        </label>
                    </div>
                    <div>
                        <button type="submit" disabled={loading} style={{ width: '120px', margin: '5px' }}
                            className={`w-full py-2 rounded-lg text-white font-semibold transition 
                        ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"}`}>{loading ? "Registering..." : "Submit"}</button>
                        <button type="button" onClick={goToLogin} style={{ width: '90px', margin: '5px' }}
                            className={`w-full py-2 rounded-lg text-white font-semibold transition 
                        bg-blue-500 hover:bg-blue-600`}>Log In</button>
                    </div>
                </form>
            </div>
        </div>
        </AppLayout>
    )
}

export default Registration;