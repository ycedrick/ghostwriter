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
    
    let output = sourceCode;

    const ghostableNodes: any[] = [];
    
    const findGhostable = (node: any) => {
      const types = [
        'function_declaration',
        'method_definition',
        'arrow_function',
        'function_expression',
        'class_declaration',
      ];
      if (types.includes(node.type)) {
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

      const bodyNode = node.children.find(
        (c: any) => c.type === 'statement_block' || c.type === 'class_body',
      );
      
      if (bodyNode) {
        const before = output.substring(0, bodyNode.startIndex + 1);
        const after = output.substring(bodyNode.endIndex - 1);
        output = before + '\n    // [Ghosted]\n  ' + after;
      }
    }

    return output;
  }
}
