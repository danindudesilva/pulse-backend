type UniqueConstraintFieldSource = {
  meta?: {
    target?: unknown;
    driverAdapterError?: {
      cause?: {
        constraint?: {
          fields?: unknown;
        };
      };
    };
  };
};

export function extractUniqueConstraintFields(
  error: UniqueConstraintFieldSource
): string[] {
  const meta = error.meta;

  if (Array.isArray(meta?.target)) {
    return meta.target.filter(
      (value): value is string => typeof value === 'string'
    );
  }

  if (typeof meta?.target === 'string') {
    return [meta.target];
  }

  const adapterFields = meta?.driverAdapterError?.cause?.constraint?.fields;

  if (Array.isArray(adapterFields)) {
    return adapterFields.filter(
      (value): value is string => typeof value === 'string'
    );
  }

  return [];
}
