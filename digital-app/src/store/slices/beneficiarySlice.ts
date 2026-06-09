import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { getBeneficiariesApi, addBeneficiaryApi } from "../../api/beneficiary.api";
import type { Beneficiary, AddBeneficiaryPayload, BeneficiaryStatus } from "../../features/beneficiary/beneficiary.types";
import type { RootState } from "../store";

interface BeneficiaryFilters {
  search: string;
  bank: string;
  status: BeneficiaryStatus | "";
}

interface BeneficiaryState {
  beneficiaries: Beneficiary[];
  selectedBeneficiary: Beneficiary | null;
  filters: BeneficiaryFilters;
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
}

const initialState: BeneficiaryState = {
  beneficiaries: [],
  selectedBeneficiary: null,
  filters: { search: "", bank: "", status: "" },
  loading: false,
  error: null,
  lastFetched: null,
};

export const fetchBeneficiaries = createAsyncThunk<
  Beneficiary[],
  boolean | void,
  { state: RootState; rejectValue: string }
>("beneficiaries/fetch", async (forceRefresh, { getState, rejectWithValue }) => {
  const { lastFetched, beneficiaries } = getState().beneficiaries;
  // Skip if fetched within last 30 seconds and not forced
  if (!forceRefresh && lastFetched && beneficiaries.length > 0 && Date.now() - lastFetched < 30000) {
    return beneficiaries;
  }
  try {
    const response = await getBeneficiariesApi();
    const data = response.data as any;
    const items = data?.beneficiaries || data?.data || [];
    return Array.isArray(items) ? items : [];
  } catch {
    return rejectWithValue("Failed to load beneficiaries");
  }
});

export const addBeneficiary = createAsyncThunk<
  void,
  AddBeneficiaryPayload,
  { rejectValue: string }
>("beneficiaries/add", async (payload, { rejectWithValue }) => {
  try {
    await addBeneficiaryApi(payload);
  } catch (err: unknown) {
    const error = err as { response?: { data?: { message?: string }; status?: number } };
    if (error.response?.status === 409) {
      return rejectWithValue("Beneficiary already exists");
    }
    return rejectWithValue(error.response?.data?.message || "Failed to add beneficiary");
  }
});

const beneficiarySlice = createSlice({
  name: "beneficiaries",
  initialState,
  reducers: {
    setSelectedBeneficiary(state, action: PayloadAction<Beneficiary | null>) {
      state.selectedBeneficiary = action.payload;
    },
    clearSelectedBeneficiary(state) {
      state.selectedBeneficiary = null;
    },
    setBeneficiaryFilters(state, action: PayloadAction<Partial<BeneficiaryFilters>>) {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearBeneficiaryFilters(state) {
      state.filters = { search: "", bank: "", status: "" };
    },
    clearBeneficiaryError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBeneficiaries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBeneficiaries.fulfilled, (state, action) => {
        state.loading = false;
        state.beneficiaries = action.payload;
        state.lastFetched = Date.now();
      })
      .addCase(fetchBeneficiaries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load beneficiaries";
      })
      .addCase(addBeneficiary.rejected, (state, action) => {
        state.error = action.payload || "Failed to add beneficiary";
      });
  },
});

export const {
  setSelectedBeneficiary,
  clearSelectedBeneficiary,
  setBeneficiaryFilters,
  clearBeneficiaryFilters,
  clearBeneficiaryError,
} = beneficiarySlice.actions;
export default beneficiarySlice.reducer;
