require("dotenv").config();

const cors = require("cors");
const bcrypt = require("bcryptjs");
const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const { holdings, orders, positions } = require("./data/dummyData");
const { HoldingsModel } = require("./model/HoldingsModel");
const { OrdersModel } = require("./model/OrdersModel");
const { PositionsModel } = require("./model/PositionsModel");
const { UserModel } = require("./model/UserModel");

const app = express();

const PORT = process.env.PORT || 3002;
const MONGO_URL = process.env.MONGO_URL;
const isProduction = process.env.NODE_ENV === "production";
const JWT_SECRET =
  process.env.JWT_SECRET || (isProduction ? null : "zerodha_clone_dev_secret");
const defaultAllowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://stock-trading-platform-psi.vercel.app",
  "https://stock-trading-frontend-azerjoy5l-pankajsinghkarkis-projects.vercel.app",
];
const allowedOrigins = (process.env.CLIENT_URL || defaultAllowedOrigins.join(","))
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOriginPatterns = [/^https:\/\/stock-trading.*\.vercel\.app$/];

app.use(
  cors({
    origin(origin, callback) {
      const isAllowedOrigin =
        !origin ||
        allowedOrigins.length === 0 ||
        allowedOrigins.includes(origin) ||
        allowedOriginPatterns.some((pattern) => pattern.test(origin));

      if (isAllowedOrigin) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS."));
    },
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const sendResponse = (res, statusCode, message, data = null) => {
  res.status(statusCode).json({
    success: statusCode < 400,
    message,
    data,
  });
};

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const seedCollection = async (Model, data) => {
  await Model.deleteMany({});
  return Model.insertMany(data);
};

const seedCollectionIfEmpty = async (Model, data) => {
  const count = await Model.countDocuments();

  if (count > 0) {
    return null;
  }

  return Model.insertMany(data);
};

const seedStarterDataIfEmpty = async () => {
  await Promise.all([
    seedCollectionIfEmpty(HoldingsModel, holdings),
    seedCollectionIfEmpty(PositionsModel, positions),
    seedCollectionIfEmpty(OrdersModel, orders),
  ]);
};

const seedMiddleware = (req, res, next) => {
  if (isProduction) {
    return sendResponse(res, 403, "Seed routes are disabled in production.");
  }

  next();
};

const createToken = (userId) =>
  jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
});

const authMiddleware = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return sendResponse(res, 401, "Authentication token is required.");
  }

  const token = authHeader.split(" ")[1];
  const decoded = jwt.verify(token, JWT_SECRET);
  const user = await UserModel.findById(decoded.userId).select("-password");

  if (!user) {
    return sendResponse(res, 401, "Invalid authentication token.");
  }

  req.user = user;
  next();
});

app.get("/", (req, res) => {
  sendResponse(res, 200, "Zerodha clone backend is running.");
});

app.get("/health", (req, res) => {
  sendResponse(res, 200, "Server health checked.", {
    database:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

app.post(
  "/auth/signup",
  asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return sendResponse(res, 400, "Name, email, and password are required.");
    }

    if (password.length < 6) {
      return sendResponse(res, 400, "Password must be at least 6 characters.");
    }

    const existingUser = await UserModel.findOne({ email });

    if (existingUser) {
      return sendResponse(res, 409, "User already exists with this email.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await UserModel.create({
      name,
      email,
      password: hashedPassword,
    });
    const token = createToken(user._id);

    sendResponse(res, 201, "Signup successful.", {
      token,
      user: sanitizeUser(user),
    });
  })
);

app.post(
  "/auth/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendResponse(res, 400, "Email and password are required.");
    }

    const user = await UserModel.findOne({ email });

    if (!user) {
      return sendResponse(res, 401, "Invalid email or password.");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return sendResponse(res, 401, "Invalid email or password.");
    }

    const token = createToken(user._id);

    sendResponse(res, 200, "Login successful.", {
      token,
      user: sanitizeUser(user),
    });
  })
);

app.get(
  "/auth/me",
  authMiddleware,
  asyncHandler(async (req, res) => {
    sendResponse(res, 200, "User fetched successfully.", req.user);
  })
);

app.get(
  "/addHoldings",
  seedMiddleware,
  asyncHandler(async (req, res) => {
    const insertedHoldings = await seedCollection(HoldingsModel, holdings);
    sendResponse(res, 201, "Holdings seeded successfully.", insertedHoldings);
  })
);

app.get(
  "/addPositions",
  seedMiddleware,
  asyncHandler(async (req, res) => {
    const insertedPositions = await seedCollection(PositionsModel, positions);
    sendResponse(res, 201, "Positions seeded successfully.", insertedPositions);
  })
);

app.get(
  "/addOrders",
  seedMiddleware,
  asyncHandler(async (req, res) => {
    const insertedOrders = await seedCollection(OrdersModel, orders);
    sendResponse(res, 201, "Orders seeded successfully.", insertedOrders);
  })
);

app.get(
  "/allHoldings",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const allHoldings = await HoldingsModel.find({});
    sendResponse(res, 200, "Holdings fetched successfully.", allHoldings);
  })
);

app.get(
  "/allPositions",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const allPositions = await PositionsModel.find({});
    sendResponse(res, 200, "Positions fetched successfully.", allPositions);
  })
);

app.get(
  "/allOrders",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const allOrders = await OrdersModel.find({}).sort({ createdAt: -1 });
    sendResponse(res, 200, "Orders fetched successfully.", allOrders);
  })
);

app.post(
  "/newOrder",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { name, qty, price, mode } = req.body;
    const newOrder = await OrdersModel.create({ name, qty, price, mode });
    sendResponse(res, 201, "Order created successfully.", newOrder);
  })
);

app.get(
  "/orders",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const allOrders = await OrdersModel.find({}).sort({ createdAt: -1 });
    sendResponse(res, 200, "Orders fetched successfully.", allOrders);
  })
);

app.get(
  "/orders/:id",
  authMiddleware,
  asyncHandler(async (req, res) => {
    if (!isValidObjectId(req.params.id)) {
      return sendResponse(res, 400, "Invalid order id.");
    }

    const order = await OrdersModel.findById(req.params.id);

    if (!order) {
      return sendResponse(res, 404, "Order not found.");
    }

    sendResponse(res, 200, "Order fetched successfully.", order);
  })
);

app.put(
  "/orders/:id",
  authMiddleware,
  asyncHandler(async (req, res) => {
    if (!isValidObjectId(req.params.id)) {
      return sendResponse(res, 400, "Invalid order id.");
    }

    const updatedOrder = await OrdersModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedOrder) {
      return sendResponse(res, 404, "Order not found.");
    }

    sendResponse(res, 200, "Order updated successfully.", updatedOrder);
  })
);

app.delete(
  "/orders/:id",
  authMiddleware,
  asyncHandler(async (req, res) => {
    if (!isValidObjectId(req.params.id)) {
      return sendResponse(res, 400, "Invalid order id.");
    }

    const deletedOrder = await OrdersModel.findByIdAndDelete(req.params.id);

    if (!deletedOrder) {
      return sendResponse(res, 404, "Order not found.");
    }

    sendResponse(res, 200, "Order deleted successfully.", deletedOrder);
  })
);

app.use((req, res) => {
  sendResponse(res, 404, `Route not found: ${req.method} ${req.originalUrl}`);
});

app.use((err, req, res, next) => {
  let statusCode = 500;

  if (err.name === "ValidationError") {
    statusCode = 400;
  }

  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    statusCode = 401;
  }

  if (err.code === 11000) {
    statusCode = 409;
  }

  sendResponse(res, statusCode, err.message || "Internal server error.");
});

async function startServer() {
  try {
    if (!MONGO_URL) {
      throw new Error("MONGO_URL is missing in .env file.");
    }

    if (!JWT_SECRET) {
      throw new Error("JWT_SECRET is required in production.");
    }

    await mongoose.connect(MONGO_URL);
    console.log("DB connected!");
    await seedStarterDataIfEmpty();

    app.listen(PORT, () => {
      console.log(`App started on port ${PORT}!`);
    });
  } catch (err) {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = {
  app,
  asyncHandler,
  sendResponse,
  isValidObjectId,
  createToken,
  sanitizeUser,
  startServer,
};
