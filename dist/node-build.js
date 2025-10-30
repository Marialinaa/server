"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const index_1 = __importDefault(require("./index"));
const express_1 = __importDefault(require("express"));
const port = process.env.PORT || 3000;
// In production, serve the built SPA files
const distPath = path_1.default.join(__dirname, "../spa");
// Serve static files
index_1.default.use(express_1.default.static(distPath));
// Handle React Router - serve index.html for all non-API routes
index_1.default.get("*", (req, res) => {
    // Don't serve index.html for API routes
    if (req.path.startsWith("/api/") || req.path.startsWith("/health")) {
        return res.status(404).json({ error: "API endpoint not found" });
    }
    res.sendFile(path_1.default.join(distPath, "index.html"));
});
index_1.default.listen(port, () => {
    console.log(`🚀 Fusion Starter server running on port ${port}`);
    console.log(`📱 Frontend: http://localhost:${port}`);
    console.log(`🔧 API: http://localhost:${port}/api`);
});
// Graceful shutdown
process.on("SIGTERM", () => {
    console.log("🛑 Received SIGTERM, shutting down gracefully");
    process.exit(0);
});
process.on("SIGINT", () => {
    console.log("🛑 Received SIGINT, shutting down gracefully");
    process.exit(0);
});
//# sourceMappingURL=node-build.js.map