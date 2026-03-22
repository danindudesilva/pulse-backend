export function getIntegrationDatabaseUrl(suffix: string): string {
  const baseUrl = process.env.DATABASE_URL;

  if (!baseUrl) {
    throw new Error(
      'DATABASE_URL is not set for integration tests. Expected a base URL ending in pulse_backend_test_.'
    );
  }

  return `${baseUrl}${suffix}`;
}
