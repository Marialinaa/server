"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleDemo = void 0;
// Simple demo route
const handleDemo = (_req, res) => {
    res.json({ message: "Demo route works!" });
};
exports.handleDemo = handleDemo;
