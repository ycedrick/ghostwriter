import clipboardy from 'clipboardy';

export interface TraceTarget {
  file: string;
  line: number;
}

export class Scout {
  /**
   * Scrapes the clipboard or a provided string for a file and line number.
   * Looks for standard patterns like "path/to/file.ts:123:456" or "at ... (path:123:456)"
   */
  static async scout(input?: string): Promise<TraceTarget | null> {
    const text = input || await clipboardy.read();
    
    // Matches Unix and Windows file paths in stack traces, with an optional column number.
    const pattern1 = /((?:[a-zA-Z]:)?[^\s():]+\.[a-zA-Z0-9]+):(\d+)(?::\d+)?/;
    const match1 = text.match(pattern1);
    
    if (match1 && match1[1] && match1[2]) {
      return {
        file: match1[1],
        line: parseInt(match1[2], 10)
      };
    }

    return null;
  }
}
