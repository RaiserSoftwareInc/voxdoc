import { platform } from "node:os";
import { execSync } from "node:child_process";

function registerWindows(): boolean {
  try {
    execSync('reg add "HKCU\\Software\\Classes\\.vox" /ve /d "VoxDocument" /f', { stdio: "pipe" });
    execSync('reg add "HKCU\\Software\\Classes\\.vox" /v "Content Type" /d "text/html" /f', { stdio: "pipe" });
    execSync('reg add "HKCU\\Software\\Classes\\.vox" /v "PerceivedType" /d "text" /f', { stdio: "pipe" });
    execSync('reg add "HKCU\\Software\\Classes\\VoxDocument" /ve /d "Vox Document" /f', { stdio: "pipe" });
    // Use the system's default browser via shell open
    execSync('reg add "HKCU\\Software\\Classes\\VoxDocument\\shell\\open\\command" /ve /d "\\"rundll32.exe\\" url.dll,FileProtocolHandler \\"%1\\"" /f', { stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}

function registerMac(): boolean {
  try {
    // Create a minimal handler plist for .vox files
    execSync(`defaults write com.apple.LaunchServices/com.apple.launchservices.secure LSHandlers -array-add '{LSHandlerContentType = "public.html"; LSHandlerRoleAll = "com.apple.Safari";}'`, { stdio: "pipe" });
    // Associate .vox UTI with html content type
    execSync(`/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister -lint -r -f -domain local -domain system -domain user 2>/dev/null || true`, { stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}

function registerLinux(): boolean {
  try {
    // Register MIME type
    execSync('xdg-mime default "$(xdg-settings get default-web-browser)" text/html', { stdio: "pipe" });
    // Associate .vox extension with text/html
    const mimeXml = `<?xml version="1.0"?>
<mime-info xmlns="http://www.freedesktop.org/standards/shared-mime-info">
  <mime-type type="text/x-vox">
    <comment>Vox Document</comment>
    <glob pattern="*.vox"/>
    <sub-class-of type="text/html"/>
  </mime-type>
</mime-info>`;
    const { writeFileSync, mkdirSync } = require("node:fs");
    const { homedir } = require("node:os");
    const path = require("node:path");
    const mimeDir = path.join(homedir(), ".local", "share", "mime", "packages");
    mkdirSync(mimeDir, { recursive: true });
    writeFileSync(path.join(mimeDir, "vox.xml"), mimeXml);
    execSync("update-mime-database ~/.local/share/mime 2>/dev/null || true", { stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}

export function setupCommand(): void {
  const os = platform();
  console.log("Registering .vox file type...\n");

  let success = false;

  switch (os) {
    case "win32":
      success = registerWindows();
      break;
    case "darwin":
      success = registerMac();
      break;
    case "linux":
      success = registerLinux();
      break;
    default:
      console.log(`Unsupported platform: ${os}`);
      console.log("Manually associate .vox files with your browser as text/html.");
      return;
  }

  if (success) {
    console.log("Done! .vox files will now open in your browser.");
    console.log("Try: vox init test.vox --title \"Hello\" && open test.vox");
  } else {
    console.log("Registration failed. Try running with elevated permissions:");
    if (os === "win32") {
      console.log("  Run your terminal as Administrator, then: vox setup");
    } else {
      console.log("  sudo vox setup");
    }
  }
}

/**
 * Check if .vox is registered and prompt if not.
 * Call this from `vox init` on first run.
 */
export function checkRegistration(): void {
  const os = platform();
  let registered = false;

  try {
    if (os === "win32") {
      const result = execSync('reg query "HKCU\\Software\\Classes\\.vox" /ve 2>nul', { stdio: "pipe" }).toString();
      registered = result.includes("VoxDocument");
    } else if (os === "darwin") {
      // Check if .vox has a handler via mdls or file association
      registered = false; // Conservative — prompt on first run
    } else if (os === "linux") {
      const result = execSync("xdg-mime query filetype /dev/null 2>/dev/null || echo ''", { stdio: "pipe" }).toString();
      registered = false; // Conservative
    }
  } catch {
    registered = false;
  }

  if (!registered) {
    console.log("\n.vox files aren't registered on your system.");
    console.log("Run 'vox setup' to open .vox files directly in your browser.\n");
  }
}
