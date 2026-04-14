# GhostWriter

GhostWriter is an extension for the Gemini CLI that streamlines error resolution by isolating buggy code from unrelated boilerplate. It reduces API costs and improves AI debugging accuracy by ensuring the AI remains focused only on the logic relevant to the failure, even in files that exceed standard token limits.

## Capabilities

1.  **Error Isolation:** Provides the AI with the specific code blocks needed to resolve a bug, omitting all unrelated function and class bodies.
2.  **Zero-File Debugging:** Resolves errors directly in existing source files without generating temporary reproduction scripts or debug files.
3.  **Automated Error Location:** Automatically identifies the target file and line number from terminal stack traces or the system clipboard.

## Gemini CLI Integration

GhostWriter is designed to be used seamlessly within the Gemini CLI. Once installed as an extension, the AI agent will automatically utilize GhostWriter to read large files or analyze specific bugs.

## Install

| Agent          | Install                                                             |
| :------------- | :------------------------------------------------------------------ |
| **Gemini CLI** | `gemini extensions install https://github.com/ycedrick/ghostwriter` |

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

GhostWriter is automatically activated by the Gemini CLI agent when it detects tasks involving large source files or terminal error traces. You do not need to explicitly mention "GhostWriter" in your prompts.

### Automatic Trigger Examples

- **Debugging from Stack Traces:**
  > "Find and fix the error from my last terminal crash in `src/service.ts`."
  *(The agent will automatically use GhostWriter to identify the line from your clipboard and prune the file.)*

- **Large File Analysis:**
  > "Analyze `src/large-module.js` and explain the validation logic."
  *(The agent will utilize GhostWriter to minimize token usage before reading the file.)*

- **Pinpoint Code Fixes:**
  > "Fix the logic error at line 42 of `src/api.ts`."
  *(The agent will prune the file around line 42 to ensure a high-signal context for the fix.)*

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
