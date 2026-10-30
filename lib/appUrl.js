export function getAppUrl(req) {
  // Explicit URL (recommended for production)
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL;
  }

  // Fallback for localhost / development
  return new URL(req.url).origin;
}