import type { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import SessionExpiredModal from "../components/modals/SessionExpiredModal";
import { useAppSelector } from "../../store/hooks";

interface AppLayoutProps {
  isAuthenticated: boolean;
  children: ReactNode;
}

const AppLayout = ({ isAuthenticated, children }: AppLayoutProps) => {
  const sessionTimeoutModal = useAppSelector((state) => state.app.sessionTimeoutModal);
  const sessionExpired = useAppSelector((state) => state.auth.sessionExpired);

  return (
    <div className="min-h-screen flex flex-col">
      <Header isAuthenticated={isAuthenticated} />
      <main className="flex-1">{children}</main>
      <Footer />
      {(sessionTimeoutModal || sessionExpired) && <SessionExpiredModal />}
    </div>
  );
};

export default AppLayout;
