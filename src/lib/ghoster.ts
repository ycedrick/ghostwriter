import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const webTreeSitter = require('web-tree-sitter');

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class Ghoster {
  private parser: any | null = null;

  async init(filePath: string) {
    const vendorPath = path.resolve(__dirname, '../../vendor');
    
    const Parser = webTreeSitter.Parser || webTreeSitter;
    
    await Parser.init({
      locateFile: (scriptName: string) => path.join(vendorPath, scriptName)
    });
    
    this.parser = new Parser();
    
    const ext = path.extname(filePath);
    let langWasm: string;
    if (ext === '.ts' || ext === '.tsx') {
      langWasm = 'tree-sitter-typescript.wasm';
    } else {
      langWasm = 'tree-sitter-javascript.wasm';
    }

    const lang = await webTreeSitter.Language.load(path.join(vendorPath, langWasm));
    this.parser.setLanguage(lang);

  }

  async ghost(filePath: string, targetLine: number): Promise<string> {
    if (!this.parser) await this.init(filePath);
    
    const sourceCode = fs.readFileSync(filePath, 'utf8');
    const tree = this.parser!.parse(sourceCode);
    const newline = sourceCode.includes('\r\n') ? '\r\n' : '\n';
    
    let output = sourceCode;

    const ghostableNodes: any[] = [];
    
    const findGhostable = (node: any) => {
      if (this.isGhostableType(node.type)) {
        ghostableNodes.push(node);
      }
      for (let i = 0; i < node.childCount; i++) {
        const child = node.child(i);
        if (child) findGhostable(child);
      }
    };

    findGhostable(tree.rootNode);
    ghostableNodes.sort((a, b) => b.startIndex - a.startIndex);

    for (const node of ghostableNodes) {
      const startLine = node.startPosition.row + 1;
      const endLine = node.endPosition.row + 1;

      if (targetLine >= startLine && targetLine <= endLine) {
        continue;
      }

      if (this.hasGhostableAncestorOutsideTarget(node, targetLine)) {
        continue;
      }

      const bodyNode = node.children.find(
        (c: any) => c.type === 'statement_block' || c.type === 'class_body',
      );
      
      if (bodyNode) {
        const before = output.substring(0, bodyNode.startIndex + 1);
        const after = output.substring(bodyNode.endIndex - 1);
        const innerIndent = this.getBodyIndent(sourceCode, bodyNode) ?? this.getClosingIndent(sourceCode, bodyNode);
        const closingIndent = this.getClosingIndent(sourceCode, bodyNode);
        output = before + `${newline}${innerIndent}// [Ghosted]${newline}${closingIndent}` + after;
      }
    }

    return output;
  }

  private hasGhostableAncestorOutsideTarget(node: any, targetLine: number): boolean {
    let current = node.parent;

    while (current) {
      if (this.isGhostableType(current.type)) {
        const startLine = current.startPosition.row + 1;
        const endLine = current.endPosition.row + 1;
        if (targetLine < startLine || targetLine > endLine) {
          return true;
        }
      }
      current = current.parent;
    }

    return false;
  }

  private isGhostableType(type: string): boolean {
    return [
      'function_declaration',
      'method_definition',
      'arrow_function',
      'function_expression',
      'class_declaration',
    ].includes(type);
  }

  private getBodyIndent(sourceCode: string, bodyNode: any): string | null {
    const bodyContent = sourceCode.slice(bodyNode.startIndex + 1, bodyNode.endIndex - 1);
    const lines = bodyContent.split(/\r?\n/);

    for (const line of lines) {
      if (line.trim().length > 0) {
        const indentMatch = line.match(/^[\t ]*/);
        return indentMatch?.[0] ?? '';
      }
    }

    return null;
  }

  private getClosingIndent(sourceCode: string, bodyNode: any): string {
    const closingBraceIndex = bodyNode.endIndex - 1;
    const lineStart = sourceCode.lastIndexOf('\n', closingBraceIndex);
    const line = sourceCode.slice(lineStart + 1, closingBraceIndex);
    const indentMatch = line.match(/^[\t ]*/);
    return indentMatch?.[0] ?? '';
  }
}
