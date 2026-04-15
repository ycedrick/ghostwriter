import { describe, expect, it } from 'vitest';
import { Ghoster } from '../src/lib/ghoster.js';
import { createTempFile } from './helpers.js';

describe('Ghoster.ghost', () => {
  it('keeps the target function body and ghosts unrelated functions', async () => {
    const filePath = createTempFile(
      'functions.ts',
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

    const output = await new Ghoster().ghost(filePath, 5);

    expect(output).toContain('function first() {\n  // [Ghosted]\n}');
    expect(output).toContain('function second() {\n  return 2;\n}');
  });

  it('ghosts unrelated class methods while preserving the target method', async () => {
    const filePath = createTempFile(
      'class.ts',
      [
        'class Service {',
        '  first() {',
        '    return 1;',
        '  }',
        '',
        '  second() {',
        '    return 2;',
        '  }',
        '}',
        '',
      ].join('\n'),
    );

    const output = await new Ghoster().ghost(filePath, 6);

    expect(output).toContain('first() {\n    // [Ghosted]\n  }');
    expect(output).toContain('second() {\n    return 2;\n  }');
  });

  it('ghosts class bodies when the target is outside the class', async () => {
    const filePath = createTempFile(
      'class-body.ts',
      [
        'class Helper {',
        '  method() {',
        '    return 1;',
        '  }',
        '}',
        '',
        'function target() {',
        '  return 2;',
        '}',
        '',
      ].join('\n'),
    );

    const output = await new Ghoster().ghost(filePath, 7);

    expect(output).toContain('class Helper {\n  // [Ghosted]\n}');
    expect(output).toContain('function target() {\n  return 2;\n}');
  });

  it('ghosts nested arrow functions while preserving tab indentation', async () => {
    const filePath = createTempFile(
      'tabs.ts',
      [
        'function outer() {',
        '\tconst value = () => {',
        '\t\treturn 1;',
        '\t};',
        '',
        '\treturn value();',
        '}',
        '',
      ].join('\n'),
    );

    const output = await new Ghoster().ghost(filePath, 1);

    expect(output).toContain('\tconst value = () => {\n\t\t// [Ghosted]\n\t};');
    expect(output).toContain('function outer() {\n\tconst value = () => {');
  });

  it('preserves space indentation for ghosted methods', async () => {
    const filePath = createTempFile(
      'spaces.ts',
      [
        'class Example {',
        '  alpha() {',
        '    return 1;',
        '  }',
        '',
        '  beta() {',
        '    return 2;',
        '  }',
        '}',
        '',
      ].join('\n'),
    );

    const output = await new Ghoster().ghost(filePath, 6);

    expect(output).toContain('alpha() {\n    // [Ghosted]\n  }');
  });
});
