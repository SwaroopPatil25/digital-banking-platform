import { useEffect, useState } from "react";
import ProfileField from "./components/ProfileField";
import BankingInfo from "./components/BankingInfo";
import NotificationPreferences from "./components/NotificationPreferences";
import SecuritySettings from "./components/SecuritySettings";
import type { BankingData, NotificationData, ProfileUser, SecurityData } from "./profile.types";
import AppLayout from "../../shared/layout/AppLayout";
import { getProfileService, updateProfileService } from "../../services/auth.service";
import toast from "react-hot-toast";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const GENDER_OPTIONS = [
  { label: "Male", value: "Male" },
  { label: "Female", value: "Female" },
  { label: "Other", value: "Other" },
];

const EMPLOYMENT_OPTIONS = [
  { label: "Salaried", value: "Salaried" },
  { label: "Self-Employed", value: "Self-Employed" },
  { label: "Business", value: "Business" },
  { label: "Student", value: "Student" },
  { label: "Retired", value: "Retired" },
];

const INCOME_OPTIONS = [
  { label: "Below ₹3,00,000", value: "Below 3,00,000" },
  { label: "₹3,00,000 - ₹6,00,000", value: "3,00,000 - 6,00,000" },
  { label: "₹6,00,000 - ₹10,00,000", value: "6,00,000 - 10,00,000" },
  { label: "₹10,00,000 - ₹20,00,000", value: "10,00,000 - 20,00,000" },
  { label: "Above ₹20,00,000", value: "Above 20,00,000" },
];

const Profile = () => {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileUser, setProfileUser] = useState<ProfileUser | null>(null);

  const [form, setForm] = useState({
    username: "",
    mobileNo: "",
    birthDate: "",
    gender: "",
    employmentStatus: "",
    annualIncome: "",
    addressLine: "",
    city: "",
    state: "",
    pincode: "",
  });

  const fetchProfile = async () => {
    try {
      const response = await getProfileService();
      const user = response.user;
      setProfileUser(user);
      populateForm(user);
    } catch {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const populateForm = (user: ProfileUser) => {
    setForm({
      username: user.username,
      mobileNo: user.mobileNo,
      birthDate: user.birthDate,
      gender: user.gender,
      employmentStatus: user.employmentStatus,
      annualIncome: user.annualIncome,
      addressLine: user.address?.addressLine || "",
      city: user.address?.city || "",
      state: user.address?.state || "",
      pincode: user.address?.pincode || "",
    });
  };
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleFieldChange = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!profileUser) return;
    try {
      const payload = {
        username: form.username,
        mobileNo: form.mobileNo,
        birthDate: form.birthDate,
        gender: form.gender,
        employmentStatus: form.employmentStatus,
        annualIncome: form.annualIncome,
        mfaEnabled: profileUser.mfaEnabled,
        preferences: profileUser.preferences,
        address: {
          addressLine: form.addressLine,
          city: form.city,
          state: form.state,
          pincode: form.pincode,
        },
      };
      await updateProfileService(payload);
      toast.success("Profile updated successfully");
      setEditing(false);
      await fetchProfile();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || "Failed to update profile");
      } else {
        toast.error("Something went wrong");
      }
    }
  };

  const handleCancel = () => {
    if (profileUser) populateForm(profileUser);
    setEditing(false);
  };

  if (loading) {
    return (
      <AppLayout isAuthenticated={true}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-gray-500 text-lg">Loading profile...</p>
        </div>
      </AppLayout>
    );
  }

  if (!profileUser) {
    return (
      <AppLayout isAuthenticated={true}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-red-500 text-lg">Failed to load profile data.</p>
        </div>
      </AppLayout>
    );
  }

  const initials = profileUser.username
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const bankingData: BankingData = {
    customerId: profileUser.customerId,
    accountNumber: profileUser.account?.accountNumber || "N/A",
    accountType: profileUser.account?.accountType || "N/A",
    branch: profileUser.account?.branch || "N/A",
    kycStatus: profileUser.account?.kycStatus || "Pending",
  };

  const securityData: SecurityData = { mfaEnabled: profileUser.mfaEnabled };
  const notificationData: NotificationData = {
    emailAlerts: profileUser.preferences.emailAlerts,
    smsAlerts: profileUser.preferences.smsAlerts,
  };

  return (
    <AppLayout isAuthenticated={true}>
      <div className="bg-slate-50 min-h-full">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8 space-y-6">
        {/* Page Header */}
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center justify-center w-9 h-9 text-lg text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition"
          >←</button>
          <h2 className="ml-2 text-xl font-semibold text-gray-900">Profile</h2>
        </div>
          {/* ─── PROFILE HEADER CARD ─── */}
          <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold shrink-0">
                  {initials}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{profileUser.username}</h2>
                  <p className="text-sm text-gray-500">{profileUser.email}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-medium px-3 py-1 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                  {profileUser.customerId}
                </span>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {profileUser.account?.accountType || "Account"}
                </span>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                  profileUser.account?.kycStatus === "Verified"
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-yellow-50 text-yellow-700 border-yellow-200"
                }`}>
                  KYC {profileUser.account?.kycStatus || "Pending"}
                </span>
              </div>
            </div>
          </div>

          {/* ─── PERSONAL INFORMATION ─── */}
          <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Personal Information</h3>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Edit Profile
                </button>
              )}
            </div>

            {/* Identity */}
            {/* <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Identity</p> */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6 items-start text-left">
              <ProfileField label="Full Name:" name="username" value={form.username} editable={editing} onChange={handleFieldChange} />
              <ProfileField label="Mobile Number:" name="mobileNo" value={form.mobileNo} editable={editing} type="tel" onChange={handleFieldChange} />
              <ProfileField label="Email:" name="email" value={profileUser.email} editable={false} onChange={handleFieldChange} />
              <ProfileField label="Date of Birth:" name="birthDate" value={form.birthDate} editable={editing} type="date" onChange={handleFieldChange} />
              <ProfileField label="Gender:" name="gender" value={form.gender} editable={editing} type="select" options={GENDER_OPTIONS} onChange={handleFieldChange} />
              <ProfileField label="Employment Status:" name="employmentStatus" value={form.employmentStatus} editable={editing} type="select" options={EMPLOYMENT_OPTIONS} onChange={handleFieldChange} />
            </div>

            {/* Employment */}
            {/* <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Financial</p> */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6 items-start text-left">
              <ProfileField label="Annual Income:" name="annualIncome" value={form.annualIncome} editable={editing} type="select" options={INCOME_OPTIONS} onChange={handleFieldChange} />
              <ProfileField label="PAN Number:" name="panNo" value={profileUser.panNo} editable={false} onChange={handleFieldChange} />
            </div>

            {/* Address */}
            {/* <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Address</p> */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start text-left">
              <ProfileField label="City:" name="city" value={form.city} editable={editing} onChange={handleFieldChange} />
              <ProfileField label="State:" name="state" value={form.state} editable={editing} onChange={handleFieldChange} />
              <ProfileField label="Pincode:" name="pincode" value={form.pincode} editable={editing} type="tel" onChange={handleFieldChange} />
              <ProfileField label="Address:" name="addressLine" value={form.addressLine} editable={editing} type="textarea" fullWidth onChange={handleFieldChange} />
            </div>

            {editing && (
              <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
                <button
                  onClick={handleSave}
                  className="px-5 py-2.5 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  Save Changes
                </button>
                <button
                  onClick={handleCancel}
                  className="px-5 py-2.5 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* ─── BANKING RELATIONSHIP ─── */}
          <BankingInfo data={bankingData} />

          {/* ─── SETTINGS GRID (2 columns) ─── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <NotificationPreferences data={notificationData} />
            <SecuritySettings data={securityData} />
          </div>

        </div>
      </div>
    </AppLayout>
  );
};

export default Profile;
