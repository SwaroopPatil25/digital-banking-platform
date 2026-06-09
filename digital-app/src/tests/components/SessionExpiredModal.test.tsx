import "@testing-library/jest-dom/jest-globals";
import { describe, it, expect } from "@jest/globals";
import { screen } from "@testing-library/react";
import SessionExpiredModal from "../../shared/components/modals/SessionExpiredModal";
import { renderWithProviders } from "../setup/testUtils";

describe("SessionExpiredModal", () => {
  it("should render session expired message", () => {
    renderWithProviders(<SessionExpiredModal />);
    expect(screen.getByText("Session Expired")).toBeInTheDocument();
    expect(screen.getByText(/session has expired/i)).toBeInTheDocument();
  });

  it("should show login redirect button", () => {
    renderWithProviders(<SessionExpiredModal />);
    expect(screen.getByText("Go to Login")).toBeInTheDocument();
  });
});
