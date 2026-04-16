import type { VoxDocument } from "@voxdoc/schema";

const VOX_SCRIPT_REGEX = /<script\s+type="application\/vox\+json"\s*>([\s\S]*?)<\/script>/;

/**
 * Extract a VoxDocument from a Vox file's content.
 * Handles both formats:
 *   - Self-rendering HTML (.vox.html, extracts from <script type="application/vox+json">)
 *   - Legacy raw JSON (.vox)
 */
export function readVoxSource(content: string): VoxDocument {
  const trimmed = content.trimStart();

  // Legacy raw JSON format
  if (trimmed.startsWith("{")) {
    return JSON.parse(trimmed) as VoxDocument;
  }

  // Self-rendering HTML format
  const match = content.match(VOX_SCRIPT_REGEX);
  if (!match || !match[1]) {
    throw new Error(
      "Not a valid Vox file: no <script type=\"application/vox+json\"> found and content is not JSON",
    );
  }

  return JSON.parse(match[1]) as VoxDocument;
}
