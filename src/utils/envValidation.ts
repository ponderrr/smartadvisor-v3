
export interface EnvValidationResult {
  isValid: boolean;
  missingKeys: string[];
  warnings: string[];
}

export const validateEnvironment = (): EnvValidationResult => {
  const requiredKeys = [
    'VITE_OPENAI_API_KEY',
    'VITE_TMDB_API_KEY', 
    'VITE_GOOGLE_BOOKS_API_KEY'
  ];

  const missingKeys = requiredKeys.filter(key => !import.meta.env[key]);
  const warnings: string[] = [];

  if (missingKeys.length > 0) {
    warnings.push(
      `Missing environment variables: ${missingKeys.join(', ')}. Some features may not work properly.`
    );
  }

  // Log warnings to console in development
  if (import.meta.env.DEV && warnings.length > 0) {
    console.warn('Environment validation warnings:');
    warnings.forEach(warning => console.warn(`- ${warning}`));
    console.warn('Please check your .env.local file and ensure all API keys are set.');
  }

  return {
    isValid: missingKeys.length === 0,
    missingKeys,
    warnings
  };
};
