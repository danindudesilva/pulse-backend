export function getIntegrationDatabaseUrl(suffix: string): string {
  const baseUrl = process.env.DATABASE_URL;

  if (!baseUrl) {
    throw new Error(
      'DATABASE_URL is not set for integration tests. Expected a base URL ending in pulse_backend_test_.'
    );
  }

  if (!baseUrl.endsWith('pulse_backend_test_')) {
    throw new Error(
      `Integration test DATABASE_URL must end with "pulse_backend_test_". Received: ${baseUrl}`
    );
  }

  return `${baseUrl}${suffix}`;
}
