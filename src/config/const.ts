export const API_PREFIX = 'api/v1';

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

export const originalUrl = 'http://localhost:3000';

export const MAX_FILE_SIZE = 1024 * 1024 * 25; // 5MB

export const TAX_API_ENDPOINT = 'https://my.soliq.uz/xdduk-api/';
