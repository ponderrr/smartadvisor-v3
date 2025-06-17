export interface EnvValidationResult {
  isValid: boolean;
  missingKeys: string[];
  warnings: string[];
}

export const validateEnvironment = (): EnvValidationResult => {
  // Only validate client-side environment variables
  const requiredClientKeys = ["VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY"];

  const missingKeys = requiredClientKeys.filter((key) => !import.meta.env[key]);
  const warnings: string[] = [];

  if (missingKeys.length > 0) {
    warnings.push(
      `Missing required client environment variables: ${missingKeys.join(
        ", "
      )}. The application cannot function without these.`
    );
  }

  // Check for accidentally exposed service keys (SECURITY CRITICAL)
  const exposedKeys = [];

  if (import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY) {
    exposedKeys.push("VITE_SUPABASE_SERVICE_ROLE_KEY");
  }
  if (import.meta.env.VITE_OPENAI_API_KEY) {
    exposedKeys.push("VITE_OPENAI_API_KEY");
  }
  if (import.meta.env.VITE_TMDB_API_KEY) {
    exposedKeys.push("VITE_TMDB_API_KEY");
  }
  if (import.meta.env.VITE_GOOGLE_BOOKS_API_KEY) {
    exposedKeys.push("VITE_GOOGLE_BOOKS_API_KEY");
  }

  if (exposedKeys.length > 0) {
    warnings.push(
      `🚨 CRITICAL SECURITY VULNERABILITY: The following API keys are exposed in the client bundle: ${exposedKeys.join(
        ", "
      )}. Remove these immediately!`
    );
  }

  // Only log warnings in development mode
  if (import.meta.env.DEV && warnings.length > 0) {
    console.warn("Environment validation warnings:");
    warnings.forEach((warning) => console.warn(`- ${warning}`));
  }

  return {
    isValid: missingKeys.length === 0,
    missingKeys,
    warnings,
  };
};
