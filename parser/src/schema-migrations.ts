interface OpenApiSchema {
  [key: string]: unknown;
}

export interface SchemaMigrationResult {
  applied: string[];
}

/**
 * Applies known corrections to malformed fragments from the source schema.
 */
export function migrateSchema(schema: OpenApiSchema): SchemaMigrationResult {
  const applied: string[] = [];
  const messageIdsParameter = getMessageIdsParameter(schema);

  if (!messageIdsParameter || !isRecord(messageIdsParameter.schema)) {
    return { applied };
  }

  const malformedSchema = messageIdsParameter.schema;

  if (!isMalformedMessageIdsSchema(malformedSchema)) {
    return { applied };
  }

  const recoveredParameter = getMessageIdsParameter({
    paths: {
      '/messages': malformedSchema['/messages'],
    },
  });

  if (
    !recoveredParameter ||
    !isRecord(recoveredParameter.schema) ||
    !isArrayOfStringsSchema(recoveredParameter.schema)
  ) {
    throw new Error(
      'Не удалось восстановить схему параметра message_ids из поврежденной выгрузки.',
    );
  }

  messageIdsParameter.schema = recoveredParameter.schema;
  delete messageIdsParameter.components;
  applied.push('Исправлен параметр message_ids метода GET /messages.');

  return { applied };
}

function getMessageIdsParameter(
  schema: Record<string, unknown>,
): Record<string, unknown> | null {
  const paths = schema.paths;

  if (!isRecord(paths)) {
    return null;
  }

  const messages = paths['/messages'];

  if (!isRecord(messages) || !isRecord(messages.get)) {
    return null;
  }

  const parameters = messages.get.parameters;

  if (!Array.isArray(parameters)) {
    return null;
  }

  return (
    parameters.find(
      (parameter): parameter is Record<string, unknown> =>
        isRecord(parameter) && parameter.name === 'message_ids',
    ) ?? null
  );
}

function isMalformedMessageIdsSchema(schema: Record<string, unknown>): boolean {
  return isRecord(schema['/messages']) && isRecord(schema['/chats']);
}

function isArrayOfStringsSchema(schema: Record<string, unknown>): boolean {
  return schema.type === 'array' && schema.format === 'string';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
