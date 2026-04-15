import fs from 'fs';
import os from 'os';
import path from 'path';

export function createTempFile(name: string, contents: string): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ghostwriter-test-'));
  const filePath = path.join(dir, name);
  fs.writeFileSync(filePath, contents, 'utf8');
  return filePath;
}
