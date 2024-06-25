export const API_PREFIX = process.env.API_PREFIX;

export const DEFAULT_PASSWORD = process.env.DEFAULT_PASSWORD;
export const JWT_SECRET = process.env.JWT_SECRET;
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_TOKEN_SECRET;

export const TokenExpirationTimes = {
  access: '5m',
  refresh: '24h',
};

export const PaginationLimit = {
  min: 10,
  max: 60,
};

export const originalUrl = process.env.ORIGINAL_URL;

export const MAX_FILE_SIZE = 1024 * 1024 * 25; // 5MB

export const TAX_API_ENDPOINT = process.env.TAX_API_ENDPOINT;
