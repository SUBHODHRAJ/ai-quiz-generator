import { NextFunction, Request, Response } from "express";

export interface AppError extends Error {
  statusCode?: number;
  status?: number;
  code?: string | number;
  errorCode?: string;
  errors?: Record<string, any>;
}

export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const isDev = process.env.NODE_ENV !== "production";
  
  // Safe logging
  console.error(`[API ERROR] ${req.method} ${req.originalUrl}:`, error.message || error);

  // Mongoose validation error
  if (error.name === "ValidationError" || error.errors) {
    const errorDetails = error.errors
      ? Object.values(error.errors).map((e: any) => e.message || String(e))
      : [error.message];

    res.status(400).json({
      success: false,
      message: errorDetails.join(", ") || "Validation failed.",
      errorCode: "VALIDATION_ERROR",
      ...(isDev && { stack: error.stack })
    });
    return;
  }

  // Mongoose invalid ObjectId
  if (error.name === "CastError") {
    res.status(400).json({
      success: false,
      message: "Invalid resource identifier format.",
      errorCode: "INVALID_ID"
    });
    return;
  }

  // Duplicate key error in MongoDB (E11000)
  if (error.code === 11000 || (error.message && error.message.includes("E11000"))) {
    res.status(400).json({
      success: false,
      message: "A resource with these unique details already exists.",
      errorCode: "DUPLICATE_KEY"
    });
    return;
  }

  // JWT errors
  if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
    res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token.",
      errorCode: "AUTH_EXPIRED"
    });
    return;
  }

  // Multer errors (file too large, invalid format, etc.)
  if (error.name === "MulterError" || error.message?.includes("supported")) {
    res.status(400).json({
      success: false,
      message: error.message || "File upload error.",
      errorCode: "UPLOAD_ERROR"
    });
    return;
  }

  // Custom status code if assigned
  const statusCode = error.statusCode || error.status || 500;
  const message = statusCode === 500 && !isDev
    ? "An unexpected internal server error occurred. Please try again later."
    : (error.message || "An unexpected error occurred.");

  res.status(statusCode).json({
    success: false,
    message,
    errorCode: error.errorCode || "INTERNAL_ERROR",
    ...(isDev && { stack: error.stack })
  });
};
