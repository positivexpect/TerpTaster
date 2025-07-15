require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const { body, validationResult } = require("express-validator");
const rateLimit = require("express-rate-limit");
const multer = require("multer");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const fs = require("fs");
const compression = require("compression");
const helmet = require("helmet");

const app = express();

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false, // Disable CSP for now to allow image uploads
  }),
);

// Performance middleware
app.use(compression());

// CORS configuration
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://your-domain.com", "https://your-domain.vercel.app"]
        : ["http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
  }),
);

app.use(express.json({ limit: "10mb" })); // Allows JSON requests with larger payload
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Add rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Increased for photo uploads
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Configure multer for photo uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
});

app.use(limiter);

// ✅ PostgreSQL Database Connection with Error Handling and SSL
const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT,
  ssl: { rejectUnauthorized: false },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
});

// Handle pool errors gracefully
pool.on("error", (err) => {
  console.error("❌ Database pool error:", err);
  // Don't exit the process - let the pool handle reconnection
});

pool
  .connect()
  .then((client) => {
    console.log("✅ Database connected successfully!");
    client.release();
  })
  .catch((err) => {
    console.error("❌ Database connection failed!", err.stack);
    // Don't exit immediately - allow for retry
    console.log("🔄 Will retry connection automatically...");
  });

// ✅ Root Route - API Welcome Message
app.get("/", (req, res) => {
  res.json({
    message: "🔥 TerpTaster API is running!",
    version: "2.0.0",
    features: ["Reviews", "Photo Upload", "Search", "Terpene Analysis"],
    endpoints: ["/reviews", "/upload", "/search", "/health"],
  });
});

// ✅ Health Check Endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    database: "connected",
  });
});

// ✅ Analytics and Stats Endpoints
app.get("/stats", async (req, res) => {
  try {
    const [totalReviews, avgScore, topStrains, topReviewers, reviewsByMonth] =
      await Promise.all([
        pool.query("SELECT COUNT(*) as total FROM weed_reviews"),
        pool.query(
          "SELECT ROUND(AVG(overall_score), 2) as avg_score FROM weed_reviews",
        ),
        pool.query(`
                SELECT strain, COUNT(*) as review_count, ROUND(AVG(overall_score), 2) as avg_score
                FROM weed_reviews
                GROUP BY strain
                ORDER BY review_count DESC, avg_score DESC
                LIMIT 10
            `),
        pool.query(`
                SELECT reviewed_by, COUNT(*) as review_count
                FROM weed_reviews
                GROUP BY reviewed_by
                ORDER BY review_count DESC
                LIMIT 10
            `),
        pool.query(`
                SELECT DATE_TRUNC('month', review_date) as month, COUNT(*) as reviews
                FROM weed_reviews
                WHERE review_date >= NOW() - INTERVAL '12 months'
                GROUP BY DATE_TRUNC('month', review_date)
                ORDER BY month DESC
            `),
      ]);

    res.set("Cache-Control", "public, max-age=3600"); // Cache for 1 hour
    res.json({
      totalReviews: parseInt(totalReviews.rows[0].total),
      averageScore: parseFloat(avgScore.rows[0].avg_score) || 0,
      topStrains: topStrains.rows,
      topReviewers: topReviewers.rows,
      reviewsByMonth: reviewsByMonth.rows,
    });
  } catch (error) {
    console.error("❌ Stats error:", error.stack);
    res.status(500).json({ error: error.message });
  }
});

app.get("/terpenes/popular", async (req, res) => {
  try {
    const result = await pool.query(`
            SELECT
                terpene,
                COUNT(*) as frequency,
                ROUND(AVG(overall_score), 2) as avg_score
            FROM (
                SELECT unnest(known_terps) as terpene, overall_score
                FROM weed_reviews
                WHERE known_terps IS NOT NULL
                UNION ALL
                SELECT unnest(terpenes) as terpene, overall_score
                FROM weed_reviews
                WHERE terpenes IS NOT NULL
            ) as terpene_data
            WHERE terpene IS NOT NULL AND terpene != ''
            GROUP BY terpene
            ORDER BY frequency DESC, avg_score DESC
            LIMIT 20
        `);

    res.set("Cache-Control", "public, max-age=3600");
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Terpenes stats error:", error.stack);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Photo Upload Endpoint
app.post("/upload", upload.array("photos", 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const processedFiles = [];

    for (const file of req.files) {
      const fileName = `${uuidv4()}.webp`;
      const filePath = path.join(uploadsDir, fileName);

      // Process and compress image using Sharp
      await sharp(file.buffer)
        .resize(800, 600, { fit: "inside", withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(filePath);

      processedFiles.push({
        filename: fileName,
        originalName: file.originalname,
        url: `/uploads/${fileName}`,
        size: file.size,
      });
    }

    res.json({
      message: "Photos uploaded successfully!",
      files: processedFiles,
    });
  } catch (error) {
    console.error("❌ Photo upload error:", error);
    res.status(500).json({ error: "Failed to upload photos" });
  }
});

// ✅ GET all reviews
app.get("/reviews", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM weed_reviews ORDER BY review_date DESC",
    );
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error fetching reviews:", error.stack);
    res.status(500).json({ error: error.message });
  }
});

// ✅ GET a single review by ID
app.get("/reviews/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "SELECT * FROM weed_reviews WHERE id = $1",
      [id],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Review not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("❌ Error fetching review:", error.stack);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Enhanced Search reviews (by strain, location, reviewer, terpenes, etc.)
app.get("/search", async (req, res) => {
  try {
    const {
      strain,
      location,
      reviewer,
      terpene,
      minScore,
      maxScore,
      limit = 50,
    } = req.query;

    if (!strain && !location && !reviewer && !terpene) {
      return res.status(400).json({
        error:
          "At least one search parameter is required (strain, location, reviewer, or terpene)",
      });
    }

    console.log("🔍 Enhanced search query:", {
      strain,
      location,
      reviewer,
      terpene,
      minScore,
      maxScore,
    });

    let whereConditions = [];
    let queryParams = [];
    let paramCount = 1;

    // Build dynamic WHERE clause based on provided parameters
    if (strain) {
      whereConditions.push(`LOWER(strain) LIKE LOWER($${paramCount})`);
      queryParams.push(`%${strain}%`);
      paramCount++;
    }

    if (location) {
      whereConditions.push(`LOWER(location) LIKE LOWER($${paramCount})`);
      queryParams.push(`%${location}%`);
      paramCount++;
    }

    if (reviewer) {
      whereConditions.push(`LOWER(reviewed_by) LIKE LOWER($${paramCount})`);
      queryParams.push(`%${reviewer}%`);
      paramCount++;
    }

    if (terpene) {
      whereConditions.push(`(
                LOWER(array_to_string(known_terps, ' ')) LIKE LOWER($${paramCount}) OR
                LOWER(array_to_string(terpenes, ' ')) LIKE LOWER($${paramCount}) OR
                LOWER(array_to_string(inhale_terps, ' ')) LIKE LOWER($${paramCount}) OR
                LOWER(array_to_string(exhale_terps, ' ')) LIKE LOWER($${paramCount})
            )`);
      queryParams.push(`%${terpene}%`);
      paramCount++;
    }

    if (minScore) {
      whereConditions.push(`overall_score >= $${paramCount}`);
      queryParams.push(parseFloat(minScore));
      paramCount++;
    }

    if (maxScore) {
      whereConditions.push(`overall_score <= $${paramCount}`);
      queryParams.push(parseFloat(maxScore));
      paramCount++;
    }

    const query = `
            SELECT * FROM weed_reviews
            WHERE ${whereConditions.join(" AND ")}
            ORDER BY review_date DESC, overall_score DESC
            LIMIT $${paramCount}
        `;
    queryParams.push(parseInt(limit));

    const result = await pool.query(query, queryParams);

    console.log(`🔎 Found ${result.rows.length} results`);

    // Add cache headers for performance
    res.set("Cache-Control", "public, max-age=300"); // Cache for 5 minutes
    res.json({
      results: result.rows,
      total: result.rows.length,
      searchParams: { strain, location, reviewer, terpene, minScore, maxScore },
    });
  } catch (error) {
    console.error("❌ Search error:", error.stack);
    res.status(500).json({ error: error.message });
  }
});

// Add validation to POST endpoints
app.post("/reviews", async (req, res) => {
  try {
    console.log("📩 Received Review Data:", req.body);
    console.log("Required fields check:", {
      strain: !!req.body.strain,
      location: !!req.body.location,
      overall_score: !!req.body.overall_score,
      reviewed_by: !!req.body.reviewed_by,
    });

    const { strain, location, overall_score, notes, reviewed_by } = req.body;

    // Ensure required fields are present
    if (!strain || !location || !reviewed_by || !overall_score) {
      console.log("Missing fields:", {
        strain: !strain,
        location: !location,
        reviewed_by: !reviewed_by,
        overall_score: !overall_score,
      });
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Build query dynamically based on what fields are actually present
    const fields = [];
    const values = [];
    const placeholders = [];
    let paramCount = 1;

    // Helper function to add a field if it exists
    const addField = (fieldName, columnName, value, type = "") => {
      if (value !== undefined && value !== null) {
        fields.push(columnName);
        values.push(value);
        placeholders.push(`$${paramCount}${type}`);
        paramCount++;
      }
    };

    // Add all fields matching your database columns
    addField("type", "type", req.body.type);
    addField("grower", "grower", req.body.grower);
    addField("location", "location", location);
    addField("strain", "strain", strain);
    addField(
      "smokingInstrument",
      "smoking_instrument",
      req.body.smokingInstrument,
    );
    addField("tasteRating", "taste_rating", req.body.tasteRating);
    addField("smell", "smell", req.body.smell);
    addField("smellRating", "smell_rating", req.body.smellRating);
    addField("bagAppeal", "bag_appeal", req.body.bagAppeal);
    addField("bagAppealRating", "bag_appeal_rating", req.body.bagAppealRating);
    addField("breakStyle", "break_style", req.body.breakStyle);
    addField("thc", "thc", req.body.thc);
    addField("knownTerps", "known_terps", req.body.knownTerps, "::text[]");
    addField("notes", "notes", notes);
    addField("reviewedBy", "reviewed_by", reviewed_by);
    addField("terpsPercent", "terps_percent", req.body.terpsPercent);
    addField("reviewDate", "review_date", req.body.reviewDate);
    addField(
      "secondTimeConsistency",
      "second_time_consistency",
      req.body.secondTimeConsistency,
    );
    addField("grandChamp", "grand_champ", req.body.grandChamp);
    addField("high", "high", req.body.high);
    addField("highRating", "high_rating", req.body.highRating);
    addField("overallScore", "overall_score", overall_score);
    addField("chestPunch", "chest_punch", req.body.chestPunch);
    addField("throatHitter", "throat_hitter", req.body.throatHitter);
    addField("headFeel", "head_feel", req.body.headFeel);
    addField("bodyFeel", "body_feel", req.body.bodyFeel);
    addField("exhaleTerps", "exhale_terps", req.body.exhaleTerps, "::text[]");
    addField("flowerColor", "flower_color", req.body.flowerColor, "::text[]");
    addField("growStyle", "grow_style", req.body.growStyle, "::text[]");
    addField("inhaleTerps", "inhale_terps", req.body.inhaleTerps, "::text[]");
    addField("weedType", "weed_type", req.body.weedType);
    addField("smokingDevice", "smoking_device", req.body.smokingDevice);
    addField("terpenes", "terpenes", req.body.terpenes, "::text[]");
    addField("terpenePercent", "terpene_percent", req.body.terpenePercent);
    addField("looks", "looks", req.body.looks);
    addField("taste", "taste", req.body.taste);
    addField("previousRating", "previous_rating", req.body.previousRating);
    addField("photos", "photos", req.body.photos, "::text[]");

    // Build and execute query
    const insertQuery = `
      INSERT INTO weed_reviews (${fields.join(", ")})
      VALUES (${placeholders.join(", ")})
      RETURNING *;
    `;

    console.log("Executing query:", insertQuery);
    console.log("With values:", values);

    const result = await pool.query(insertQuery, values);
    res
      .status(201)
      .json({ message: "✅ Master Review submitted!", review: result.rows[0] });
  } catch (err) {
    console.error("❌ Master Review Insert Error:", err.stack);
    res.status(500).json({ error: err.message });
  }
});

// ✅ POST a Basic Review (New Endpoint)
app.post("/basic-reviews", async (req, res) => {
  try {
    console.log("📩 Received Basic Review Data:", req.body);

    const { strain, location, overall_score, notes, reviewed_by, photos } =
      req.body;

    // Ensure required fields are present
    if (!strain || !location || !reviewed_by || !overall_score) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const insertQuery = `
            INSERT INTO weed_reviews (strain, location, overall_score, notes, reviewed_by, photos, review_date)
            VALUES ($1, $2, $3, $4, $5, $6, CURRENT_DATE) RETURNING *;
        `;

    const values = [
      strain,
      location,
      parseFloat(overall_score),
      notes,
      reviewed_by,
      photos || [],
    ];

    const result = await pool.query(insertQuery, values);
    res
      .status(201)
      .json({ message: "Basic Review submitted!", review: result.rows[0] });
  } catch (err) {
    console.error("🔥 Basic Review Insert Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ✅ DELETE a review
app.delete("/reviews/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleteResult = await pool.query(
      "DELETE FROM weed_reviews WHERE id = $1 RETURNING *",
      [id],
    );

    if (deleteResult.rowCount === 0) {
      return res.status(404).json({ error: "Review not found" });
    }

    res.json({
      message: "🗑️ Review deleted successfully",
      deletedReview: deleteResult.rows[0],
    });
  } catch (error) {
    console.error("❌ Error deleting review:", error.stack);
    res.status(500).json({ error: error.message });
  }
});

// Add this logging to see what's being received
app.post("/api/reviews", (req, res) => {
  console.log("Received data:", req.body);

  // Check required fields
  const requiredFields = [
    "strain",
    "type",
    "grower",
    "location",
    "reviewed_by",
    "review_date",
  ];

  const missingFields = requiredFields.filter((field) => !req.body[field]);

  if (missingFields.length > 0) {
    console.log("Missing fields:", missingFields);
    return res.status(400).json({
      error: "Missing required fields",
      missingFields,
    });
  }
  // ... rest of the handler
});

// ✅ Start the server on port 3001
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
