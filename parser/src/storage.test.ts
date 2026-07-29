import assert from 'node:assert/strict';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { saveSchema } from './storage.ts';

test('saveSchema writes current files and archive to the output directory', async () => {
  const outputDirectory = await mkdtemp(join(tmpdir(), 'max-openapi-schema-'));

  await saveSchema(
    {
      openapi: '3.0.0',
      info: {
        version: '0.0.32',
      },
    },
    outputDirectory,
  );

  assert.equal(
    await readFile(join(outputDirectory, 'openapi.json'), 'utf8'),
    '{\n  "openapi": "3.0.0",\n  "info": {\n    "version": "0.0.32"\n  }\n}\n',
  );
  assert.match(
    await readFile(join(outputDirectory, 'openapi.yaml'), 'utf8'),
    /^openapi: 3\.0\.0\ninfo:\n {2}version: 0\.0\.32\n$/,
  );
  assert.match(
    await readFile(
      join(outputDirectory, 'schemas', 'schema-2026-07-29-0.0.32.json'),
      'utf8',
    ),
    /"version": "0\.0\.32"/,
  );
});
