import { describe, expect, it } from 'vitest';
import { Scout } from '../src/lib/scout.js';

describe('Scout.scout', () => {
  it('parses Unix stack traces', async () => {
    await expect(
      Scout.scout('Error: boom\n    at handler (/tmp/example.ts:42:9)'),
    ).resolves.toEqual({ file: '/tmp/example.ts', line: 42 });
  });

  it('parses Windows stack traces', async () => {
    await expect(
      Scout.scout('Error: boom\n    at handler (C:\\repo\\src\\app.ts:12:8)'),
    ).resolves.toEqual({ file: 'C:\\repo\\src\\app.ts', line: 12 });
  });

  it('parses framework-style stack traces', async () => {
    await expect(
      Scout.scout('TypeError: boom\n    at POST (/workspace/src/routes/api.ts:33:15)'),
    ).resolves.toEqual({ file: '/workspace/src/routes/api.ts', line: 33 });
  });

  it('returns null when no file and line are found', async () => {
    await expect(Scout.scout('plain text with no trace')).resolves.toBeNull();
  });
});
