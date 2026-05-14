import { cpSync, existsSync, mkdtempSync, mkdirSync, rmSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import { chromium } from "playwright";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const DEFAULT_PROFILE_DIR = resolve(homedir(), ".thinking-ide", "chrome-test-profile");
const DEFAULT_URL = "https://chatgpt.com/";

function getProfileDir() {
  return process.env.THINKING_IDE_TEST_CHROME_PROFILE_DIR
    ? resolve(process.env.THINKING_IDE_TEST_CHROME_PROFILE_DIR)
    : DEFAULT_PROFILE_DIR;
}

function getChromeExecutablePath() {
  if (process.platform === "darwin") {
    return "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  }

  if (process.platform === "win32") {
    return "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  }

  return "/usr/bin/google-chrome";
}

function ensureChromeInstalled(chromePath) {
  if (!existsSync(chromePath)) {
    throw new Error(`Google Chrome executable not found at ${chromePath}`);
  }
}

function parseCommandLine(argv) {
  const [command = "help", ...rest] = argv;
  const dryRun = rest.includes("--dry-run");
  const urlArg = rest.find((value) => !value.startsWith("--"));

  return {
    command,
    dryRun,
    url: urlArg ?? DEFAULT_URL
  };
}

function printHelp() {
  console.log(`Usage:
  node scripts/chrome-test-profile.mjs open [--dry-run] [url]
  node scripts/chrome-test-profile.mjs status

Environment:
  THINKING_IDE_TEST_CHROME_PROFILE_DIR  Override the fixed Chrome test profile directory.
`);
}

function openChromeProfile(url, dryRun) {
  const chromePath = getChromeExecutablePath();
  ensureChromeInstalled(chromePath);

  const profileDir = getProfileDir();
  mkdirSync(profileDir, { recursive: true });

  const args = [
    `--user-data-dir=${profileDir}`,
    "--no-first-run",
    "--no-default-browser-check",
    "--new-window",
    url
  ];

  if (dryRun) {
    console.log(
      JSON.stringify(
        {
          profileDir,
          chromePath,
          args
        },
        null,
        2
      )
    );
    return;
  }

  const child = spawn(chromePath, args, {
    cwd: repoRoot,
    detached: true,
    stdio: "ignore"
  });
  child.unref();

  console.log(
    JSON.stringify(
      {
        opened: true,
        profileDir,
        chromePath,
        url,
        nextStep:
          "Log in to ChatGPT once in this Chrome window, then reuse the same profile for future real-host tests."
      },
      null,
      2
    )
  );
}

async function checkChromeProfileStatus() {
  const chromePath = getChromeExecutablePath();
  ensureChromeInstalled(chromePath);

  const profileDir = getProfileDir();
  if (!existsSync(profileDir)) {
    console.log(
      JSON.stringify(
        {
          ready: false,
          profileDir,
          reason: "missing-profile",
          nextStep: "Run `npm run test:realhost:profile:open` and log in to ChatGPT once."
        },
        null,
        2
      )
    );
    return;
  }

  const probeDir = mkdtempSync(join(tmpdir(), "thinking-ide-chrome-profile-probe-"));
  const clonedProfileDir = join(probeDir, "profile");
  mkdirSync(clonedProfileDir, { recursive: true });
  cpSync(profileDir, clonedProfileDir, {
    recursive: true,
    force: true
  });

  const context = await chromium.launchPersistentContext(clonedProfileDir, {
    headless: true,
    executablePath: chromePath,
    viewport: {
      width: 1440,
      height: 960
    },
    args: ["--no-first-run", "--no-default-browser-check"]
  });

  try {
    const page = await context.newPage();
    await page.goto(DEFAULT_URL, {
      waitUntil: "domcontentloaded",
      timeout: 30000
    });
    await page.waitForTimeout(3000);

    const result = await page.evaluate(() => {
      const bodyText = document.body.innerText;
      const visibleAssistantMessages = document.querySelectorAll('[data-message-author-role="assistant"]').length;
      const visibleUserMessages = document.querySelectorAll('[data-message-author-role="user"]').length;
      const hasLoginPrompt = /登录|Log in|Sign up|免费注册/i.test(bodyText);
      const hasConversation = /\/c\//.test(location.pathname) || visibleAssistantMessages > 0 || visibleUserMessages > 0;

      return {
        ready: !hasLoginPrompt,
        profileState: hasLoginPrompt ? "login-required" : "logged-in",
        url: location.href,
        title: document.title,
        hasConversation,
        visibleAssistantMessages,
        visibleUserMessages,
        bodyPreview: bodyText.slice(0, 600),
        nextStep: hasLoginPrompt
          ? "Open the fixed test profile and complete ChatGPT login."
          : hasConversation
            ? "Profile is ready for real-host conversation testing."
            : "Profile is logged in. Open or create a ChatGPT conversation before running conversation-dependent tests."
      };
    });

    console.log(
      JSON.stringify(
        {
          profileDir,
          chromePath,
          ...result
        },
        null,
        2
      )
    );
  } finally {
    await context.close();
    rmSync(probeDir, { recursive: true, force: true });
  }
}

const { command, dryRun, url } = parseCommandLine(process.argv.slice(2));

if (command === "open") {
  openChromeProfile(url, dryRun);
} else if (command === "status") {
  await checkChromeProfileStatus();
} else {
  printHelp();
}
