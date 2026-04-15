import { beforeAll, describe, expect, it } from 'vitest';
import { execa } from 'execa';
import path from 'path';
import { fileURLToPath } from 'url';
import { createTempFile } from './helpers.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

describe('ghostwriter CLI', () => {
  beforeAll(async () => {
    await execa('npm', ['run', 'build'], { cwd: projectRoot });
  });

  it('prints pruned output to stdout when given a valid line', async () => {
    const filePath = createTempFile(
      'cli-sample.ts',
      [
        'function first() {',
        '  return 1;',
        '}',
        '',
        'function second() {',
        '  return 2;',
        '}',
        '',
      ].join('\n'),
    );

    const result = await execa('node', ['dist/index.js', 'prune', filePath, '--line', '5', '--stdout', '--silent'], {
      cwd: projectRoot,
    });

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('function first() {\n  // [Ghosted]\n}');
    expect(result.stdout).toContain('function second() {\n  return 2;\n}');
  });

  it('fails for invalid line values', async () => {
    const filePath = createTempFile('cli-invalid.ts', 'function sample() {\n  return 1;\n}\n');

    await expect(
      execa('node', ['dist/index.js', 'prune', filePath, '--line', 'nope', '--stdout', '--silent'], {
        cwd: projectRoot,
        reject: true,
      }),
    ).rejects.toMatchObject({ exitCode: 1 });
  });

  it('fails when no target line can be determined', async () => {
    const filePath = createTempFile('cli-missing-line.ts', 'function sample() {\n  return 1;\n}\n');

    await expect(
      execa('node', ['dist/index.js', 'prune', filePath, '--stdout', '--silent'], {
        cwd: projectRoot,
        reject: true,
      }),
    ).rejects.toMatchObject({ exitCode: 1 });
  });
});
