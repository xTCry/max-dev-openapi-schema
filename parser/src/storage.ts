import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { stringify as stringifyYaml } from 'yaml';

const DEFAULT_OUTPUT_DIRECTORY = fileURLToPath(
  new URL('../../', import.meta.url),
);

interface OpenApiInfo {
  version?: unknown;
}

export interface OpenApiSchema {
  openapi?: unknown;
  info?: OpenApiInfo;
  [key: string]: unknown;
}

export interface SaveSchemaResult {
  changed: boolean;
  version: string;
}

/**
 * Updates current schema files and saves a dated archive when their JSON changes.
 */
export async function saveSchema(
  schema: OpenApiSchema,
  outputDirectory = DEFAULT_OUTPUT_DIRECTORY,
): Promise<SaveSchemaResult> {
  const paths = getSchemaPaths(outputDirectory);
  const jsonWithNewline = `${JSON.stringify(schema, null, 2)}\n`;
  const version = getVersion(schema);
  const existingJson = await readOptionalFile(paths.currentJson);
  const yaml = stringifyYaml(schema, {
    indent: 2,
    blockQuote: 'literal',
    lineWidth: 80,
  });

  if (existingJson === jsonWithNewline) {
    await updateCurrentYaml(paths.currentYaml, yaml);
    return { changed: false, version };
  }

  const archivePath = await getArchivePath(
    paths.schemasDirectory,
    `schema-${formatDate(new Date())}-${version}`,
  );

  await mkdir(paths.schemasDirectory, { recursive: true });
  await writeFile(paths.currentJson, jsonWithNewline);
  await writeFile(paths.currentYaml, yaml);
  await writeFile(`${archivePath}.json`, jsonWithNewline);
  await writeFile(`${archivePath}.yaml`, yaml);

  return { changed: true, version };
}

/**
 * Validates the minimum fields required from the extracted OpenAPI document.
 */
export function validateSchema(schemaJson: string): OpenApiSchema {
  const parsed: unknown = JSON.parse(schemaJson);

  if (!isRecord(parsed) || typeof parsed.openapi !== 'string') {
    throw new Error('Извлеченный JSON не содержит строковое поле openapi.');
  }

  if (!isRecord(parsed.info) || typeof parsed.info.version !== 'string') {
    throw new Error(
      'Извлеченный JSON не содержит строковое поле info.version.',
    );
  }

  return parsed;
}

async function readOptionalFile(filePath: string): Promise<string | null> {
  try {
    const metadata = await stat(filePath);

    if (!metadata.isFile()) {
      return null;
    }

    return await readFile(filePath, 'utf8');
  } catch (error: unknown) {
    if (isNodeError(error) && error.code === 'ENOENT') {
      return null;
    }

    throw error;
  }
}

async function updateCurrentYaml(
  filePath: string,
  yaml: string,
): Promise<void> {
  if ((await readOptionalFile(filePath)) !== yaml) {
    await writeFile(filePath, yaml);
  }
}

function getVersion(schema: OpenApiSchema): string {
  return String(schema.info?.version).replaceAll(/[^0-9A-Za-z._-]+/g, '-');
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function getSchemaPaths(outputDirectory: string): {
  currentJson: string;
  currentYaml: string;
  schemasDirectory: string;
} {
  const directory = resolve(outputDirectory);

  return {
    currentJson: resolve(directory, 'openapi.json'),
    currentYaml: resolve(directory, 'openapi.yaml'),
    schemasDirectory: resolve(directory, 'schemas'),
  };
}

async function getArchivePath(
  schemasDirectory: string,
  baseName: string,
): Promise<string> {
  let suffix = 0;

  while (true) {
    const candidate = resolve(
      schemasDirectory,
      `${baseName}${suffix === 0 ? '' : `-${suffix}`}`,
    );

    if (
      !(await fileExists(`${candidate}.json`)) &&
      !(await fileExists(`${candidate}.yaml`))
    ) {
      return candidate;
    }

    suffix += 1;
  }
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    return (await stat(filePath)).isFile();
  } catch (error: unknown) {
    if (isNodeError(error) && error.code === 'ENOENT') {
      return false;
    }

    throw error;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error;
}
