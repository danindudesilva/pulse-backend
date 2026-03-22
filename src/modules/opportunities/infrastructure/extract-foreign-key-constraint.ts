type ForeignKeyConstraintSource = {
  meta?: {
    field_name?: unknown;
    driverAdapterError?: {
      cause?: {
        constraint?: {
          index?: unknown;
        };
      };
    };
  };
};

export function extractForeignKeyConstraintName(
  error: ForeignKeyConstraintSource
): string | null {
  const fieldName = error.meta?.field_name;

  if (typeof fieldName === 'string' && fieldName.length > 0) {
    return fieldName;
  }

  const indexName = error.meta?.driverAdapterError?.cause?.constraint?.index;

  if (typeof indexName === 'string' && indexName.length > 0) {
    return indexName;
  }

  return null;
}
