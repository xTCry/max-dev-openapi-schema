import { collectScriptUrls, extractSchemaJson } from './extract-schema.ts';
import { migrateSchema } from './schema-migrations.ts';
import { saveSchema, validateSchema } from './storage.ts';

const DEFAULT_DOCS_URL = 'https://dev.max.ru/docs-api';

/**
 * Downloads the developer portal and updates the OpenAPI schema files.
 */
async function main(): Promise<void> {
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    printHelp();
    return;
  }

  const docsUrl = readDocsUrl();
  const outputDirectory = readOutputDirectory();
  const schemaJson = await findSchemaJson(docsUrl);
  const schema = validateSchema(schemaJson);
  const migration = migrateSchema(schema);
  const result = await saveSchema(schema, outputDirectory);

  for (const message of migration.applied) {
    console.log(message);
  }

  if (!result.changed) {
    console.log(
      `Различий нет: OpenAPI ${schema.openapi}, API ${result.version}.`,
    );
    return;
  }

  console.log(
    `Схема обновлена: OpenAPI ${schema.openapi}, API ${result.version}.`,
  );
}

async function findSchemaJson(docsUrl: string): Promise<string> {
  const headMarkup = await downloadPage(docsUrl, 'head');
  const fromHead = await findSchemaInScripts(headMarkup, docsUrl);

  if (fromHead) {
    return fromHead;
  }

  console.log('В script-тегах head схема не найдена. Проверяю всю страницу.');

  const pageMarkup = await downloadPage(docsUrl, 'page');
  const fromPage = await findSchemaInScripts(pageMarkup, docsUrl);

  if (fromPage) {
    return fromPage;
  }

  throw new Error(
    'OpenAPI-схема не найдена ни в одном подключенном JavaScript-файле.',
  );
}

async function downloadPage(
  docsUrl: string,
  part: 'head' | 'page',
): Promise<string> {
  console.log(
    `Загружаю ${part === 'head' ? 'head страницы' : 'страницу'} ${docsUrl}`,
  );

  const response = await fetch(docsUrl, {
    headers: {
      accept: 'text/html',
    },
  });

  if (!response.ok) {
    throw new Error(`Страница документации ответила HTTP ${response.status}.`);
  }

  const markup = await response.text();

  if (part === 'page') {
    return markup;
  }

  const head = markup.match(/<head\b[^>]*>[\s\S]*?<\/head>/i);

  if (!head) {
    throw new Error('В странице документации не найден тег <head>.');
  }

  return head[0];
}

async function findSchemaInScripts(
  markup: string,
  docsUrl: string,
): Promise<string | null> {
  const scriptUrls = collectScriptUrls(markup, docsUrl).reverse();

  if (scriptUrls.length === 0) {
    return null;
  }

  console.log(`Проверяю JavaScript-файлы: ${scriptUrls.length}.`);

  for (const scriptUrl of scriptUrls) {
    const schemaJson = await findSchemaInScript(scriptUrl);

    if (schemaJson) {
      return schemaJson;
    }
  }

  return null;
}

async function findSchemaInScript(scriptUrl: string): Promise<string | null> {
  const response = await fetch(scriptUrl, {
    headers: {
      accept: 'application/javascript, text/javascript, */*;q=0.1',
    },
  });

  if (!response.ok) {
    console.warn(
      `[-] Не удалось загрузить ${scriptUrl}: HTTP ${response.status}.`,
    );
    return null;
  }

  let schemaJson: string | null;

  try {
    schemaJson = extractSchemaJson(await response.text());
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`[-] Не удалось разобрать ${scriptUrl}: ${message}`);
    return null;
  }

  if (schemaJson) {
    console.log(`[+] Схема найдена в ${scriptUrl}.`);
  }

  return schemaJson;
}

function printHelp(): void {
  console.log(`Использование:
  npm run dev -- [--url <адрес>] [--output-dir <путь>]
  npm run build && npm run start -- [--url <адрес>] [--output-dir <путь>]

Опции:
  -h, --help          показать эту справку
  --url <адрес>       страница документации
                     по умолчанию: ${DEFAULT_DOCS_URL}
  --output-dir <путь> каталог для openapi.json, openapi.yaml и schemas/
                     по умолчанию: корень репозитория`);
}

function readDocsUrl(): string {
  const argumentIndex = process.argv.indexOf('--url');

  if (argumentIndex === -1) {
    return DEFAULT_DOCS_URL;
  }

  const value = process.argv[argumentIndex + 1];

  if (!value) {
    throw new Error('После аргумента --url нужно указать адрес страницы.');
  }

  try {
    return new URL(value).toString();
  } catch {
    throw new Error(`Некорректный адрес страницы: ${value}.`);
  }
}

function readOutputDirectory(): string | undefined {
  const argumentIndex = process.argv.indexOf('--output-dir');

  if (argumentIndex === -1) {
    return undefined;
  }

  const value = process.argv[argumentIndex + 1];

  if (!value) {
    throw new Error('После аргумента --output-dir нужно указать путь.');
  }

  return value;
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);

  console.error(`Ошибка: ${message}`);
  process.exitCode = 1;
});
