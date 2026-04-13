import Ajv, { type ErrorObject } from "ajv";
import { voxDocumentSchema } from "./schema.js";

const ajv = new (Ajv as unknown as typeof Ajv.default)({ allErrors: true });
const validate = ajv.compile(voxDocumentSchema);

export interface ValidationResult {
  valid: boolean;
  errors?: Array<{ path: string; message: string }>;
}

export function validateDocument(doc: unknown): ValidationResult {
  const valid = validate(doc);
  if (valid) return { valid: true };
  return {
    valid: false,
    errors: (validate.errors ?? []).map((e: ErrorObject) => ({
      path: e.instancePath || "/",
      message: e.message ?? "Unknown error",
    })),
  };
}
