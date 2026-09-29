import type { z } from 'zod';
import { Errors } from '../lib/errors.js';
import type { FieldErrors } from '../lib/errors.js';

/** Key used when the whole input is wrong (for example a body that is not an object). */
export const ROOT_FIELD = '_root';

/** First message per field; nested paths are joined with dots (history.3.content). */
export function zodFieldErrors(error: z.ZodError): FieldErrors {
  const fields: FieldErrors = {};
  for (const issue of error.issues) {
    const key =
      issue.path.length > 0 ? issue.path.map((part) => String(part)).join('.') : ROOT_FIELD;
    if (!(key in fields)) fields[key] = issue.message;
  }
  return fields;
}

/**
 * Parses `data` with `schema` and returns the typed result. Unknown keys are stripped by
 * the object schemas. On failure throws VALIDATION_ERROR (400) with `fields`.
 */
export function parseInput<S extends z.ZodType>(schema: S, data: unknown): z.output<S> {
  const result = schema.safeParse(data);
  if (!result.success) throw Errors.validation(zodFieldErrors(result.error));
  return result.data;
}
