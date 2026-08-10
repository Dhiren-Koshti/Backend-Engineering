/**
 * Application Logger Utility
 * Standardizes log format and automatically redacts sensitive data
 * (passwords, password hashes, JWT tokens, and secrets).
 */
const getTimestamp = () => new Date().toISOString();

const SENSITIVE_PATTERN =
  /Bearer\s+[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_=]*/gi;
const SENSITIVE_KEYS = [
  "password",
  "token",
  "secret",
  "jwt",
  "authorization",
  "hash",
];

/**
 * Sanitizes input strings or objects to prevent logging sensitive information.
 * @param {any} data - Message or metadata object
 * @returns {any} Sanitized data with secrets redacted
 */
const sanitize = (data) => {
  if (typeof data === "string") {
    return data.replace(SENSITIVE_PATTERN, "Bearer [REDACTED]");
  }

  if (data && typeof data === "object") {
    if (data instanceof Error) {
      return {
        name: data.name,
        message: sanitize(data.message),
        stack: data.stack ? sanitize(data.stack) : undefined,
      };
    }

    const sanitized = Array.isArray(data) ? [] : {};
    for (const [key, val] of Object.entries(data)) {
      const isSensitiveKey = SENSITIVE_KEYS.some((sensitiveKey) =>
        key.toLowerCase().includes(sensitiveKey)
      );

      if (isSensitiveKey) {
        sanitized[key] = "[REDACTED]";
      } else if (typeof val === "object" && val !== null) {
        sanitized[key] = sanitize(val);
      } else if (typeof val === "string") {
        sanitized[key] = val.replace(SENSITIVE_PATTERN, "Bearer [REDACTED]");
      } else {
        sanitized[key] = val;
      }
    }
    return sanitized;
  }

  return data;
};

const logger = {
  info: (message, ...args) => {
    const sanitizedMsg = sanitize(message);
    const sanitizedArgs = args.map(sanitize);
    console.log(`[INFO] [${getTimestamp()}] ${sanitizedMsg}`, ...sanitizedArgs);
  },
  warn: (message, ...args) => {
    const sanitizedMsg = sanitize(message);
    const sanitizedArgs = args.map(sanitize);
    console.warn(
      `[WARN] [${getTimestamp()}] ${sanitizedMsg}`,
      ...sanitizedArgs
    );
  },
  error: (message, ...args) => {
    const sanitizedMsg = sanitize(message);
    const sanitizedArgs = args.map(sanitize);
    console.error(
      `[ERROR] [${getTimestamp()}] ${sanitizedMsg}`,
      ...sanitizedArgs
    );
  },
};

module.exports = logger;
