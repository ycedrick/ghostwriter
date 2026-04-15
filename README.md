# GhostWriter

GhostWriter is an AST-based code reduction tool for AI coding agents. It streamlines error resolution by isolating buggy code from unrelated boilerplate, reducing context size while keeping the logic relevant to the failure. GhostWriter can be used from Gemini CLI and Codex workflows.

## Capabilities

1.  **Error Isolation:** Provides the AI with the specific code blocks needed to resolve a bug, omitting all unrelated function and class bodies.
2.  **Zero-File Debugging:** Resolves errors directly in existing source files without generating temporary reproduction scripts or debug files.
3.  **Automated Error Location:** Automatically identifies the target file and line number from terminal stack traces or the system clipboard.

## Agent Integrations

GhostWriter is designed to be used seamlessly within terminal-based coding agents:

- **Gemini CLI:** Install it as an extension so Gemini can use the tool automatically during debugging and large-file analysis.
- **Codex:** Use the included Codex plugin/skill so Codex can call `ghostwriter prune <file> --line <number> --stdout --silent` before analyzing or editing large files.

## Install

| Agent          | Install                                                                                          |
| :------------- | :----------------------------------------------------------------------------------------------- |
| **Gemini CLI** | `gemini extensions install https://github.com/ycedrick/ghostwriter`                              |
| **Codex**      | Use the repo-local plugin in `plugins/ghostwriter/` or the shared skill in `skills/ghostwriter/` |

Install once. Use in every session for that install target after that.

## Before and After

GhostWriter reduces large source files into high-density versions that maintain the necessary context while omitting irrelevant code.

### Original File (Before)

```typescript
export class DataProcessor {
  constructor(private api: ApiClient) {}

  public async fetchData(id: string) {
    const response = await this.api.get(`/data/${id}`);
    return response.data;
  }

  public validate(data: any): boolean {
    // 50 lines of validation logic
    if (!data.id) return false;
    if (data.status !== "active") return false;
    return true;
  }

  public async save(data: any) {
    console.log("Saving data...");
    await this.api.post("/data", data);
  }
}
```

### Reduced Version (After)

_Targeted: `validate` method (Line 10)_

```typescript
export class DataProcessor {
  constructor(private api: ApiClient) {
    // [Ghosted]
  }

  public async fetchData(id: string) {
    // [Ghosted]
  }

  public validate(data: any): boolean {
    // 50 lines of validation logic
    if (!data.id) return false;
    if (data.status !== "active") return false;
    return true;
  }

  public async save(data: any) {
    // [Ghosted]
  }
}
```

## Usage

GhostWriter is automatically useful whenever an agent needs high-signal context from a large file. Gemini CLI can use it through the extension metadata in this repo, and Codex can use it through the included Codex plugin/skill.

### Automatic Trigger Examples

- **Debugging from Stack Traces:**

  > "Find and fix the error from my last terminal crash in `src/service.ts`."
  > _(The agent can use GhostWriter to identify the line from your clipboard and prune the file.)_

- **Large File Analysis:**

  > "Analyze `src/large-module.js` and explain the validation logic."
  > _(The agent can utilize GhostWriter to minimize token usage before reading the file.)_

- **Pinpoint Code Fixes:**
  > "Fix the logic error at line 42 of `src/api.ts`."
  > _(The agent can prune the file around line 42 to ensure a high-signal context for the fix.)_

## Benchmarks

Typical results across different file sizes:

| File Type         | Original Size | Reduced Size | Code Reduction |
| :---------------- | :------------ | :----------- | :------------- |
| Component (TS)    | 2,500 chars   | 1,100 chars  | **~55%**       |
| Service (TS)      | 8,000 chars   | 1,200 chars  | **~85%**       |
| Large Module (JS) | 25,000 chars  | 2,000 chars  | **~92%**       |

## Performance & Evaluation

### 1. Token Efficiency

By focusing on the relevant logic, GhostWriter reduces code volume by **40% to 90%+**. This directly lowers API costs and enables the analysis of large files that would otherwise exceed context limits.

### 2. High-Signal Context

Omitting irrelevant code prevents the LLM from being distracted by boilerplate. This ensures higher accuracy and eliminates inaccurate results caused by unrelated functions in the same file.

## Show Your Support

If GhostWriter has helped you save tokens and ship code faster, please give the repository a ⭐️ on GitHub!

## License

This project is licensed under the [MIT License](LICENSE).
