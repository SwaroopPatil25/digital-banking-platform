import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <p className="text-5xl mb-4">🔍</p>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">404 — Page Not Found</h2>
        <p className="text-sm text-gray-500 mb-6">The page you're looking for doesn't exist.</p>
        <button
          onClick={() => navigate("/dashboard")}
          className="px-5 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
};

export default NotFound;
