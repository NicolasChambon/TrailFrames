// Centralized application configuration

export const config = {
  // Environnement
  nodeEnv: process.env.NODE_ENV || "development",
  isProduction: process.env.NODE_ENV === "production",
  isDevelopment: process.env.NODE_ENV === "development",

  // Server port
  port: parseInt(process.env.PORT || "3000", 10),

  // Frontend URLs
  frontend: {
    devUrl: process.env.FRONTEND_DEV_URL,
    stagingUrl: process.env.FRONTEND_STAGING_URL,
    prodUrl: process.env.FRONTEND_PROD_URL,
  },

  // Authorized CORS origins
  allowedOrigins: [
    process.env.FRONTEND_DEV_URL,
    process.env.FRONTEND_STAGING_URL,
    process.env.FRONTEND_PROD_URL,
  ].filter(Boolean) as string[],
} as const;
