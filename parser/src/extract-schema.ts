import { parse as parseJavaScript } from 'acorn';
import * as walk from 'acorn-walk';
import { parseFragment } from 'parse5';

const OPENAPI_PREFIX = '{"openapi":';

/**
 * Finds JavaScript sources from script tags and resolves them against the page URL.
 */
export function collectScriptUrls(markup: string, pageUrl: string): string[] {
  const document = parseFragment(markup);
  const urls = new Set<string>();

  walkHtml(document.childNodes, urls, pageUrl);

  return [...urls];
}

/**
 * Extracts an OpenAPI JSON document from a JavaScript chunk.
 */
export function extractSchemaJson(source: string): string | null {
  const program = parseJavaScript(source, {
    ecmaVersion: 'latest',
    sourceType: 'script',
  });

  let schemaJson: string | null = null;

  walk.simple(program, {
    CallExpression(node) {
      if (schemaJson || !isJsonParseCall(node)) {
        return;
      }

      const [argument] = node.arguments;
      if (
        argument?.type === 'Literal' &&
        typeof argument.value === 'string' &&
        argument.value.startsWith(OPENAPI_PREFIX)
      ) {
        schemaJson = argument.value;
      }
    },
  });

  return schemaJson;
}

function walkHtml(
  nodes: import('parse5').DefaultTreeAdapterMap['childNode'][],
  urls: Set<string>,
  pageUrl: string,
): void {
  for (const node of nodes) {
    if ('tagName' in node && node.tagName === 'script') {
      const source = node.attrs.find((attribute) => attribute.name === 'src');

      if (source?.value) {
        urls.add(new URL(source.value, pageUrl).toString());
      }
    }

    if ('childNodes' in node && node.childNodes) {
      walkHtml(node.childNodes, urls, pageUrl);
    }
  }
}

function isJsonParseCall(node: import('acorn').Node): boolean {
  if (node.type !== 'CallExpression') {
    return false;
  }

  // Acorn's base Node type does not use a discriminated union.
  const call = node as import('acorn').CallExpression;

  return (
    call.callee.type === 'MemberExpression' &&
    call.callee.computed === false &&
    call.callee.object.type === 'Identifier' &&
    call.callee.object.name === 'JSON' &&
    call.callee.property.type === 'Identifier' &&
    call.callee.property.name === 'parse' &&
    call.arguments.length === 1
  );
}
