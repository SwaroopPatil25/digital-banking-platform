import { createBrowserRouter } from "react-router-dom";
import Login from "../features/auth/Login";
import Dashboard from "../features/dashboard/Dashboard";
import Profile from "../features/profile/Profile";
import Beneficiary from "../features/beneficiary/Beneficiary";
import Transfer from "../features/transfer/Transfer";
import Statement from "../features/statement/Statement";
import Bills from "../features/bills/Bills";
import Transactions from "../features/transactions/Transactions";
import Activity from "../features/activity/Activity";
import NotFound from "../shared/NotFound";
import Navbar from "../shared/Navbar";
import Registration from "../features/registration/Registration";
import ProtectedRoute from "../shared/routes/ProtectedRoute";
import PublicRoute from "../shared/routes/PublicRoute";

export const router = createBrowserRouter([
  // Public Routes — accessible only when NOT logged in
  {
    path: "/",
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    ),
  },
  {
    path: "/registration",
    element: (
      <PublicRoute>
        <Registration />
      </PublicRoute>
    ),
  },

  // Protected Routes — accessible only when logged in
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/profile",
    element: (
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    ),
  },
  {
    path: "/beneficiaries",
    element: (
      <ProtectedRoute>
        <Beneficiary />
      </ProtectedRoute>
    ),
  },
  {
    path: "/transfer",
    element: (
      <ProtectedRoute>
        <Transfer />
      </ProtectedRoute>
    ),
  },
  {
    path: "/statement",
    element: (
      <ProtectedRoute>
        <Statement />
      </ProtectedRoute>
    ),
  },
  {
    path: "/pay-bills",
    element: (
      <ProtectedRoute>
        <Bills />
      </ProtectedRoute>
    ),
  },
  {
    path: "/transactions",
    element: (
      <ProtectedRoute>
        <Transactions />
      </ProtectedRoute>
    ),
  },
  {
    path: "/activity",
    element: (
      <ProtectedRoute>
        <Activity />
      </ProtectedRoute>
    ),
  },

  // Other
  {
    path: "/bankingapp",
    element: <Navbar />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);
