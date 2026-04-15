import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import clipboardy from 'clipboardy';
import { Ghoster } from './lib/ghoster.js';
import { Scout } from './lib/scout.js';

const program = new Command();

program
  .name('ghostwriter')
  .description('AST-based code reducer for minimizing token usage')
  .version('1.0.0');

program
  .command('prune')
  .description('Prune a file by replacing unrelated function bodies with comments')
  .argument('<file>', 'Source file to prune')
  .option('-l, --line <number>', 'Line number of the failure (Target line)')
  .option('-s, --stdout', 'Output to stdout instead of clipboard')
  .option('--silent', 'Suppress all logging except the pruned code')
  .option('--stats', 'Report code reduction statistics')
  .action(async (file, options) => {
    try {
      const filePath = path.resolve(process.cwd(), file);
      if (!fs.existsSync(filePath)) {
        if (!options.silent) console.error(chalk.red(`Error: File ${file} not found.`));
        process.exit(1);
      }

      const originalSource = fs.readFileSync(filePath, 'utf8');
      const originalLength = originalSource.length;

      let line: number | undefined;

      if (options.line !== undefined) {
        const parsedLine = Number.parseInt(options.line, 10);
        if (!Number.isInteger(parsedLine) || parsedLine < 1) {
          throw new Error(`Invalid line number "${options.line}". Provide a positive integer.`);
        }
        line = parsedLine;
      }

      if (line === undefined && !options.stdout) {
        if (!options.silent) console.log(chalk.gray('Parsing clipboard for error trace...'));
        const target = await Scout.scout();
        if (target && path.resolve(process.cwd(), target.file) === filePath) {
          line = target.line;
          if (!options.silent) console.log(chalk.green(`Auto-detected target line: ${line}`));
        }
      }

      if (line === undefined) {
        throw new Error(
          'Unable to determine target line. Provide `--line <number>` or copy a matching stack trace to the clipboard.',
        );
      }

      const ghoster = new Ghoster();
      const output = await ghoster.ghost(filePath, line);
      const prunedLength = output.length;
      
      if (options.stdout) {
        process.stdout.write(output);
      } else {
        await clipboardy.write(output);
        if (!options.silent) {
          console.log(chalk.blue(`Pruning file: ${file}...`));
          console.log(chalk.green('Pruned code copied to clipboard!'));
        }
      }

      if (options.stats) {
        const reduction = ((originalLength - prunedLength) / originalLength * 100).toFixed(2);
        console.log(chalk.cyan(`\n--- Statistics ---`));
        console.log(`Original Size: ${originalLength} chars`);
        console.log(`Pruned Size:   ${prunedLength} chars`);
        console.log(`Reduction:     ${reduction}%`);
        console.log(`Estimated Token Savings: ~${Math.round((originalLength - prunedLength) / 4)} tokens`);
      }
    } catch (err: any) {
      if (!options.silent) console.error(chalk.red(`Error: ${err.message}`));
      process.exit(1);
    }
  });

program.parse();
