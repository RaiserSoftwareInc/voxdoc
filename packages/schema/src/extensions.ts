export const VOX_GLOB_PATTERNS = ["*.vox.html", "*.vox"];

export function isVoxFile(filename: string): boolean {
  return filename.endsWith(".vox.html") || filename.endsWith(".vox");
}

export function ensureVoxHtmlExtension(filename: string): string {
  if (filename.endsWith(".vox.html")) return filename;
  if (filename.endsWith(".vox")) return filename + ".html";
  return filename + ".vox.html";
}
