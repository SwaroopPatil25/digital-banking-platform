import request from "supertest";
import express from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { generateTestToken, generateExpiredToken } from "../utils/helpers";

const app = express();
app.use(express.json());

// Protected test route
app.get("/api/protected", authMiddleware, (req: any, res) => {
  res.status(200).json({ success: true, userId: req.userId });
});

describe("Auth Middleware", () => {
  describe("Token Validation", () => {
    it("should pass with valid token", async () => {
      const token = generateTestToken();

      const res = await request(app)
        .get("/api/protected")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.userId).toBeDefined();
    });

    it("should reject request with no token", async () => {
      const res = await request(app).get("/api/protected");

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("No token provided");
    });

    it("should reject request with empty Bearer", async () => {
      const res = await request(app)
        .get("/api/protected")
        .set("Authorization", "Bearer ");

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("should reject request with invalid token format", async () => {
      const res = await request(app)
        .get("/api/protected")
        .set("Authorization", "Bearer null");

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("should reject request with malformed token", async () => {
      const res = await request(app)
        .get("/api/protected")
        .set("Authorization", "Bearer some.invalid.token");

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("Invalid token");
    });

    it("should reject expired token", async () => {
      const token = generateExpiredToken();

      const res = await request(app)
        .get("/api/protected")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(401);
      expect(res.body.message).toContain("expired");
    });

    it("should reject request without Bearer prefix", async () => {
      const token = generateTestToken();

      const res = await request(app)
        .get("/api/protected")
        .set("Authorization", token);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
