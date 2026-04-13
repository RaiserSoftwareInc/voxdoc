import { platform, homedir } from "node:os";
import { execSync } from "node:child_process";
import { existsSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";

const MARKER_DIR = path.join(homedir(), ".vox");
const MARKER_FILE = path.join(MARKER_DIR, ".setup-done");

function registerWindows(): boolean {
  try {
    execSync('reg add "HKCU\\Software\\Classes\\.vox" /ve /d "VoxDocument" /f', { stdio: "pipe" });
    execSync('reg add "HKCU\\Software\\Classes\\.vox" /v "Content Type" /d "text/html" /f', { stdio: "pipe" });
    execSync('reg add "HKCU\\Software\\Classes\\.vox" /v "PerceivedType" /d "text" /f', { stdio: "pipe" });
    execSync('reg add "HKCU\\Software\\Classes\\VoxDocument" /ve /d "Vox Document" /f', { stdio: "pipe" });
    execSync('reg add "HKCU\\Software\\Classes\\VoxDocument\\shell\\open\\command" /ve /d "\\"rundll32.exe\\" url.dll,FileProtocolHandler \\"%1\\"" /f', { stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}

function registerLinux(): boolean {
  try {
    const mimeXml = `<?xml version="1.0"?>
<mime-info xmlns="http://www.freedesktop.org/standards/shared-mime-info">
  <mime-type type="text/x-vox">
    <comment>Vox Document</comment>
    <glob pattern="*.vox"/>
    <sub-class-of type="text/html"/>
  </mime-type>
</mime-info>`;
    const mimeDir = path.join(homedir(), ".local", "share", "mime", "packages");
    mkdirSync(mimeDir, { recursive: true });
    writeFileSync(path.join(mimeDir, "vox.xml"), mimeXml);
    execSync("update-mime-database ~/.local/share/mime 2>/dev/null || true", { stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}

function markSetupDone(): void {
  try {
    mkdirSync(MARKER_DIR, { recursive: true });
    writeFileSync(MARKER_FILE, new Date().toISOString());
  } catch {
    // Non-critical — don't fail setup over a marker file
  }
}

export function setupCommand(): void {
  const os = platform();
  console.log("Setting up Vox...\n");

  if (os === "win32") {
    const success = registerWindows();
    if (success) {
      console.log("Registered .vox file type on Windows.");
      console.log("Double-click any .vox file to open in your browser.\n");
    } else {
      console.log("Registration failed. Try running your terminal as Administrator.\n");
    }
  } else if (os === "darwin") {
    console.log("macOS requires a one-time manual step to associate .vox files:\n");
    console.log("  1. Right-click any .vox file in Finder");
    console.log("  2. Click 'Get Info'");
    console.log("  3. Under 'Open with:', select your browser (Chrome, Safari, etc.)");
    console.log("  4. Click 'Change All...'\n");
    console.log("After that, all .vox files will open in your browser.\n");
    console.log("Or open directly from terminal:");
    console.log("  open -a 'Google Chrome' my-doc.vox\n");
  } else if (os === "linux") {
    const success = registerLinux();
    if (success) {
      console.log("Registered .vox MIME type on Linux.");
      console.log("Double-click any .vox file to open in your browser.\n");
    } else {
      console.log("Registration failed. Try: sudo vox setup\n");
    }
  } else {
    console.log(`Unsupported platform: ${os}`);
    console.log("Manually associate .vox files with your browser as text/html.\n");
  }

  console.log("You can always open .vox files with:");
  console.log("  vox view my-doc.vox\n");

  markSetupDone();
}

/**
 * Check if setup has been run. Prompt once if not.
 */
export function checkRegistration(): void {
  if (existsSync(MARKER_FILE)) {
    return; // Already set up — don't nag
  }

  console.log("\nTip: Run 'vox setup' to configure .vox files to open in your browser.\n");
}
