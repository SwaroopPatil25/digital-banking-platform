import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchBeneficiaries, addBeneficiary, setBeneficiaryFilters, clearBeneficiaryFilters } from "../../store/slices/beneficiarySlice";
import BeneficiaryCard from "./components/BeneficiaryCard";
import BeneficiarySkeleton from "./components/BeneficiarySkeleton";
import AddBeneficiaryForm from "./components/AddBeneficiaryForm";
import AppLayout from "../../shared/layout/AppLayout";
import BeneficiarySidebar from "../../shared/widgets/BeneficiarySidebar";
import { useNavigate } from "react-router-dom";
import { useDebounce } from "../../hooks/useDebounce";
import type { AddBeneficiaryPayload } from "./beneficiary.types";

const Beneficiary = () => {
  const dispatch = useAppDispatch();
  const { beneficiaries, filters, loading, error } = useAppSelector((state) => state.beneficiaries);
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();
  const debouncedSearch = useDebounce(filters.search, 400);

  useEffect(() => {
    dispatch(fetchBeneficiaries());
  }, [dispatch]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const handleAddSuccess = async (payload: AddBeneficiaryPayload) => {
    const result = await dispatch(addBeneficiary(payload));
    if (addBeneficiary.fulfilled.match(result)) {
      toast.success("Beneficiary added successfully!");
      setShowForm(false);
      dispatch(fetchBeneficiaries(true));
    } else {
      toast.error(result.payload as string || "Failed to add beneficiary");
    }
  };

  const bankOptions = useMemo(() => {
    const banks = [...new Set(beneficiaries.map((b) => b.bankName))];
    return banks.sort();
  }, [beneficiaries]);

  const filtered = useMemo(() => {
    let result = beneficiaries;
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(
        (b) =>
          b.beneficiaryName.toLowerCase().includes(q) ||
          b.accountNumber.includes(q) ||
          b.ifscCode.toLowerCase().includes(q)
      );
    }
    if (filters.bank) {
      result = result.filter((b) => b.bankName === filters.bank);
    }
    if (filters.status) {
      result = result.filter((b) => (b.status || "ACTIVE") === filters.status);
    }
    return result;
  }, [beneficiaries, debouncedSearch, filters.bank, filters.status]);

  const pendingCount = beneficiaries.filter((b) => b.status === "PENDING_APPROVAL").length;

  return (
    <AppLayout isAuthenticated={true}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center justify-center w-9 h-9 text-lg text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition"
            >←</button>
            <h2 className="ml-2 text-xl font-semibold text-gray-900">Beneficiaries</h2>
            {pendingCount > 0 && (
              <span className="ml-3 text-xs px-2 py-0.5 bg-amber-100 text-amber-700 border border-amber-200 rounded-full font-medium">
                {pendingCount} pending
              </span>
            )}
          </div>
          {/* {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
            >
              + Add Beneficiary
            </button>
          )} */}
        </div>

        {/* Search & Filter Bar */}
        {!showForm && beneficiaries.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <input
              type="text"
              value={filters.search}
              onChange={(e) => dispatch(setBeneficiaryFilters({ search: e.target.value }))}
              placeholder="Search by name, account, or IFSC..."
              className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400"
            />
            <select
              value={filters.bank}
              onChange={(e) => dispatch(setBeneficiaryFilters({ bank: e.target.value }))}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400"
            >
              <option value="">All Banks</option>
              {bankOptions.map((bank) => (
                <option key={bank} value={bank}>{bank}</option>
              ))}
            </select>
            <select
              value={filters.status}
              onChange={(e) => dispatch(setBeneficiaryFilters({ status: e.target.value as "" | "ACTIVE" | "PENDING_APPROVAL" | "BLOCKED" }))}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400"
            >
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="PENDING_APPROVAL">Pending</option>
              <option value="BLOCKED">Blocked</option>
            </select>
            {(filters.search || filters.bank || filters.status) && (
              <button
                onClick={() => dispatch(clearBeneficiaryFilters())}
                className="px-3 py-2 text-xs font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition"
              >
                Clear
              </button>
            )}
          </div>
        )}

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
          <div>
            {showForm && (
              <div className="mb-5">
                <AddBeneficiaryForm
                  onSuccess={handleAddSuccess}
                  onCancel={() => setShowForm(false)}
                />
              </div>
            )}

            {loading && <BeneficiarySkeleton />}

            {!loading && filtered.length === 0 && !showForm && (
              <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
                <p className="text-4xl mb-3">👤</p>
                <p className="text-gray-500 text-sm font-medium">
                  {beneficiaries.length === 0 ? "No beneficiaries added yet" : "No beneficiaries found"}
                </p>
                {beneficiaries.length === 0 && (
                  <button
                    onClick={() => setShowForm(true)}
                    className="mt-4 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Add Your First Beneficiary
                  </button>
                )}
                {(filters.search || filters.bank || filters.status) && (
                  <p className="text-gray-400 text-xs mt-2">Try adjusting your search or filters</p>
                )}
              </div>
            )}

            {!loading && filtered.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filtered.map((b) => (
                  <BeneficiaryCard key={b._id} beneficiary={b} />
                ))}
              </div>
            )}
          </div>
          <BeneficiarySidebar beneficiaries={beneficiaries} />
        </div>
      </div>
    </AppLayout>
  );
};

export default Beneficiary;
