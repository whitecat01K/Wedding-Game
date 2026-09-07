var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_vite = require("vite");
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json({ limit: "5mb" }));
var DATA_DIR = import_path.default.join(process.cwd(), "data");
var LEADERBOARD_FILE = import_path.default.join(DATA_DIR, "leaderboard.json");
if (!import_fs.default.existsSync(DATA_DIR)) {
  try {
    import_fs.default.mkdirSync(DATA_DIR, { recursive: true });
  } catch (err) {
    console.error("Failed to create data dir:", err);
  }
}
var DEFAULT_LEADERBOARD = [];
function readLeaderboard() {
  try {
    if (import_fs.default.existsSync(LEADERBOARD_FILE)) {
      const content = import_fs.default.readFileSync(LEADERBOARD_FILE, "utf-8");
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error("Error reading leaderboard file:", err);
  }
  return DEFAULT_LEADERBOARD;
}
function writeLeaderboard(data) {
  try {
    import_fs.default.writeFileSync(LEADERBOARD_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing leaderboard file:", err);
  }
}
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: Date.now() });
});
app.get("/api/leaderboard", (req, res) => {
  const list = readLeaderboard();
  const sorted = [...list].sort((a, b) => b.finalScore - a.finalScore);
  res.json({
    success: true,
    totalCount: sorted.length,
    leaderboard: sorted
  });
});
app.post("/api/leaderboard", (req, res) => {
  const result = req.body;
  if (!result || !result.playerName || typeof result.finalScore !== "number") {
    return res.status(400).json({ error: "Invalid quiz result data" });
  }
  if (!result.tableNumber || !result.tableNumber.trim()) {
    result.tableNumber = "\u81EA\u7531\u5165\u5EA7 / \u73FE\u5834\u89AA\u53CB";
  }
  const current = readLeaderboard();
  const updated = [result, ...current.filter((item) => item.id !== result.id)].sort(
    (a, b) => b.finalScore - a.finalScore
  );
  const trimmed = updated.slice(0, 200);
  writeLeaderboard(trimmed);
  res.json({
    success: true,
    message: "Score submitted successfully",
    totalCount: trimmed.length
  });
});
app.delete("/api/leaderboard", (req, res) => {
  writeLeaderboard([]);
  res.json({ success: true, message: "Leaderboard cleared" });
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
