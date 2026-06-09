import request from "supertest";
import express from "express";
import { login, register, logout, getProfile, updateProfile } from "../../controllers/auth.controller";

const mockAuthMiddleware = (req: any, res: any, next: any) => {
  req.userId = "507f1f77bcf86cd799439011";
  next();
};

const app = express();
app.use(express.json());
app.post("/api/auth/login", login);
app.post("/api/auth/register", register);
app.post("/api/auth/logout", mockAuthMiddleware, logout);
app.get("/api/auth/profile", mockAuthMiddleware, getProfile);
app.put("/api/auth/profile", mockAuthMiddleware, updateProfile);

jest.mock("../../services/auth.service", () => ({
  loginUser: jest.fn(),
  registerUser: jest.fn(),
  logoutUser: jest.fn(),
  getUserProfile: jest.fn(),
  updateUserProfile: jest.fn(),
}));

import * as authService from "../../services/auth.service";

describe("Auth Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/auth/login", () => {
    it("should return 200 on successful login", async () => {
      (authService.loginUser as jest.Mock).mockResolvedValue({
        success: true, token: "mock-token", user: { id: "123", username: "testuser", email: "test@example.com" },
      });

      const res = await request(app).post("/api/auth/login").send({ email: "test@example.com", password: "Password123" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBe("mock-token");
    });

    it("should return 400 for missing email", async () => {
      const res = await request(app).post("/api/auth/login").send({ password: "Password123" });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 400 for invalid email format", async () => {
      const res = await request(app).post("/api/auth/login").send({ email: "invalid-email", password: "Password123" });
      expect(res.status).toBe(400);
    });

    it("should return 400 for missing password", async () => {
      const res = await request(app).post("/api/auth/login").send({ email: "test@example.com" });
      expect(res.status).toBe(400);
    });

    it("should return 401 for invalid credentials (BankingError)", async () => {
      const { BankingError } = jest.requireActual("../../utils/errors");
      (authService.loginUser as jest.Mock).mockRejectedValue(new BankingError("INVALID_CREDENTIALS", "Invalid email or password", 401));

      const res = await request(app).post("/api/auth/login").send({ email: "test@example.com", password: "wrongpassword" });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.errorCode).toBe("INVALID_CREDENTIALS");
    });

    it("should call next for non-BankingError exceptions", async () => {
      (authService.loginUser as jest.Mock).mockRejectedValue(new Error("DB connection failed"));

      const res = await request(app).post("/api/auth/login").send({ email: "test@example.com", password: "Password123" });

      expect(res.status).toBe(500);
    });
  });

  describe("POST /api/auth/register", () => {
    it("should return 201 on successful registration", async () => {
      (authService.registerUser as jest.Mock).mockResolvedValue({ success: true, message: "User registered successfully" });

      const res = await request(app).post("/api/auth/register").send({
        username: "newuser", email: "new@example.com", password: "StrongPass1!", confirmPassword: "StrongPass1!", mobileNo: "9876543210",
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it("should return 400 for password mismatch", async () => {
      const res = await request(app).post("/api/auth/register").send({
        username: "newuser", email: "new@example.com", password: "StrongPass1!", confirmPassword: "Different!", mobileNo: "9876543210",
      });
      expect(res.status).toBe(400);
    });

    it("should return 400 for invalid mobile number", async () => {
      const res = await request(app).post("/api/auth/register").send({
        username: "newuser", email: "new@example.com", password: "StrongPass1!", confirmPassword: "StrongPass1!", mobileNo: "123",
      });
      expect(res.status).toBe(400);
    });

    it("should handle BankingError from register service", async () => {
      const { BankingError } = jest.requireActual("../../utils/errors");
      (authService.registerUser as jest.Mock).mockRejectedValue(new BankingError("DUPLICATE", "Email already registered", 400));

      const res = await request(app).post("/api/auth/register").send({
        username: "newuser", email: "dup@example.com", password: "StrongPass1!", confirmPassword: "StrongPass1!", mobileNo: "9876543210",
      });

      expect(res.status).toBe(400);
      expect(res.body.errorCode).toBe("DUPLICATE");
    });

    it("should call next for generic errors in register", async () => {
      (authService.registerUser as jest.Mock).mockRejectedValue(new Error("Something broke"));

      const res = await request(app).post("/api/auth/register").send({
        username: "newuser", email: "new@example.com", password: "StrongPass1!", confirmPassword: "StrongPass1!", mobileNo: "9876543210",
      });

      expect(res.status).toBe(500);
    });
  });

  describe("POST /api/auth/logout", () => {
    it("should return 200 on successful logout", async () => {
      (authService.logoutUser as jest.Mock).mockResolvedValue({ success: true, message: "Logged out successfully" });

      const res = await request(app).post("/api/auth/logout");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should call next on logout error", async () => {
      (authService.logoutUser as jest.Mock).mockRejectedValue(new Error("Logout failed"));

      const res = await request(app).post("/api/auth/logout");

      expect(res.status).toBe(500);
    });
  });

  describe("GET /api/auth/profile", () => {
    it("should return 200 with user profile", async () => {
      (authService.getUserProfile as jest.Mock).mockResolvedValue({ username: "testuser", email: "test@example.com" });

      const res = await request(app).get("/api/auth/profile");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.username).toBe("testuser");
    });

    it("should call next on profile error", async () => {
      (authService.getUserProfile as jest.Mock).mockRejectedValue(new Error("User not found"));

      const res = await request(app).get("/api/auth/profile");

      expect(res.status).toBe(500);
    });
  });

  describe("PUT /api/auth/profile", () => {
    it("should return 200 on successful update", async () => {
      (authService.updateUserProfile as jest.Mock).mockResolvedValue({ success: true, message: "Profile updated successfully" });

      const res = await request(app).put("/api/auth/profile").send({ username: "updated" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should return 400 for invalid update data", async () => {
      const res = await request(app).put("/api/auth/profile").send({ mobileNo: "invalid" });

      expect(res.status).toBe(400);
      expect(res.body.errorCode).toBe("VALIDATION_FAILED");
    });

    it("should call next on update error", async () => {
      (authService.updateUserProfile as jest.Mock).mockRejectedValue(new Error("DB error"));

      const res = await request(app).put("/api/auth/profile").send({ username: "validname" });

      expect(res.status).toBe(500);
    });
  });
});
