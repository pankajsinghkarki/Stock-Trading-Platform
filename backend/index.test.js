const jwt = require("jsonwebtoken");

const {
  createToken,
  isValidObjectId,
  sanitizeUser,
  sendResponse,
} = require("./index");

describe("backend helpers", () => {
  describe("sendResponse", () => {
    it("sends a success response for 2xx status codes", () => {
      const json = jest.fn();
      const status = jest.fn(() => ({ json }));
      const res = { status };
      const data = { database: "connected" };

      sendResponse(res, 200, "Server health checked.", data);

      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith({
        success: true,
        message: "Server health checked.",
        data,
      });
    });

    it("sends a failure response for 4xx status codes", () => {
      const json = jest.fn();
      const status = jest.fn(() => ({ json }));
      const res = { status };

      sendResponse(res, 404, "Route not found.");

      expect(status).toHaveBeenCalledWith(404);
      expect(json).toHaveBeenCalledWith({
        success: false,
        message: "Route not found.",
        data: null,
      });
    });
  });

  describe("isValidObjectId", () => {
    it("returns true for valid MongoDB ObjectIds", () => {
      expect(isValidObjectId("507f1f77bcf86cd799439011")).toBe(true);
    });

    it("returns false for invalid MongoDB ObjectIds", () => {
      expect(isValidObjectId("not-an-id")).toBe(false);
    });
  });

  describe("createToken", () => {
    it("creates a JWT containing the user id", () => {
      const token = createToken("user-123");
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "zerodha_clone_dev_secret"
      );

      expect(decoded.userId).toBe("user-123");
      expect(decoded.exp).toBeGreaterThan(decoded.iat);
    });
  });

  describe("sanitizeUser", () => {
    it("returns only safe user fields", () => {
      const user = {
        _id: "user-123",
        name: "Ada Lovelace",
        email: "ada@example.com",
        password: "hashed-password",
      };

      expect(sanitizeUser(user)).toEqual({
        _id: "user-123",
        name: "Ada Lovelace",
        email: "ada@example.com",
      });
    });
  });
});
