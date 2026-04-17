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

    const lines = text.split(/\r?\n/);

    for (const line of lines) {
      const trimmedLine = line.trim();
      const candidates = this.extractPathCandidates(trimmedLine);

      for (const candidate of candidates) {
        const location = this.parsePathLocation(candidate);
        if (!location) {
          continue;
        }

        return location;
      }
    }

    return null;
  }

  private static extractPathCandidates(line: string): string[] {
    const candidates = [line];
    const firstParenIndex = line.indexOf('(');

    if (firstParenIndex !== -1 && line.endsWith(')')) {
      candidates.unshift(line.slice(firstParenIndex + 1, -1));
    }

    const atPrefix = line.match(/^at\s+(?:.+?\s+\()?(.+)$/);
    if (atPrefix?.[1]) {
      candidates.push(atPrefix[1].replace(/\)$/, ''));
    }

    return candidates;
  }

  private static parsePathLocation(candidate: string): TraceTarget | null {
    const normalizedCandidate = this.normalizePathCandidate(candidate);
    const locationMatch = normalizedCandidate.match(/:(\d+)(?::(\d+))?$/);

    if (!locationMatch?.[1] || locationMatch.index === undefined) {
      return null;
    }

    const file = normalizedCandidate.slice(0, locationMatch.index);
    if (!this.looksLikeSourcePath(file)) {
      return null;
    }

    return {
      file,
      line: Number.parseInt(locationMatch[1], 10),
    };
  }

  private static normalizePathCandidate(candidate: string): string {
    return candidate
      .replace(/^file:\/\//, '')
      .replace(/^\((.*)\)$/, '$1')
      .trim();
  }

  private static looksLikeSourcePath(candidate: string): boolean {
    if (!candidate.includes('.')) {
      return false;
    }

    return /(?:^|[\\/])[^\\/]+\.[a-zA-Z0-9]+$/.test(candidate);
  }
}
