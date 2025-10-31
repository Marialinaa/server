import { RequestHandler } from "express";

// Simple demo route
export const handleDemo: RequestHandler = (_req, res) => {
  res.json({ message: "Demo route works!" });
};
