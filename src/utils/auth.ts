import bcrypt = require('bcrypt');

// hash password
export const hashPassword = async (password: string) => await bcrypt.hash(password, 10);

// compare password
export const comparePassword = async (password: string, hashedPassword: string) => await bcrypt.compare(password, hashedPassword);

export const hashRefreshToken = async (token: string) => await bcrypt.hash(token, 10);

// compare password
export const compareRefreshToken = async (token: string, hashedToken: string) => await bcrypt.compare(token, hashedToken);