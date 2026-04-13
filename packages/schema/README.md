# @voxdoc/schema

TypeScript types, JSONSchema, and validation for the [Vox](https://github.com/RaiserSoftwareInc/voxdoc) document format.

## Install

```bash
npm install @voxdoc/schema
```

## Usage

```typescript
import { validateDocument, generateBlockId, type VoxDocument, type VoxBlock } from "@voxdoc/schema";

// Validate a document
const result = validateDocument(doc);
if (!result.valid) {
  console.error(result.errors);
}

// Generate a block ID
const id = generateBlockId(); // "blk_a1b2c3d4e5f6"
```

## What's included

- **TypeScript types** for all 18 block types, document metadata, and review model
- **JSONSchema** for validation (`voxDocumentSchema`)
- **`validateDocument()`** — schema validation with detailed error messages
- **`generateBlockId()`** — unique `blk_` prefixed IDs

## License

MIT — Raiser Software Inc.
