import prompts from "prompts";
import { spawn } from "child_process";
import { readdir } from "fs/promises";
import { join } from "path";

// Colors for terminal output
const colors = {
  reset: "\x1b[0m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
};

async function getTestFiles(testType) {
  const testDir = join(process.cwd(), "tests", testType);
  const files = [];

  async function scanDir(dir, prefix = "") {
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;

      if (entry.isDirectory()) {
        await scanDir(join(dir, entry.name), relativePath);
      } else if (entry.name.endsWith(".test.ts")) {
        files.push(relativePath);
      }
    }
  }

  await scanDir(testDir);
  return files.sort();
}

async function runTests() {
  console.log(`\n${colors.cyan}🧪 Test Runner${colors.reset}\n`);

  const mainChoice = await prompts({
    type: "select",
    name: "testType",
    message: "Which tests do you want to run?",
    choices: [
      { title: "All tests", value: "all" },
      {
        title: "One specific test file",
        value: "specific",
      },
    ],
  });

  if (!mainChoice.testType) {
    console.log("Cancelled.");
    process.exit(0);
  }

  let command = "npm";
  let args = ["run"];

  switch (mainChoice.testType) {
    case "all":
      args.push("test:all");
      break;

    case "specific": {
      const files = await getTestFiles("");
      const fileChoice = await prompts({
        type: "autocomplete",
        name: "file",
        message: "Choose a test file:",
        choices: files.map((file) => ({
          title: file,
          value: file,
        })),
        suggest: (input, choices) => {
          const inputLower = input.toLowerCase();
          return choices.filter((choice) =>
            choice.title.toLowerCase().includes(inputLower)
          );
        },
      });

      if (!fileChoice.file) {
        console.log("Cancelled.");
        process.exit(0);
      }

      command = "npx";
      args = ["vitest", `tests/${fileChoice.file}`];
      break;
    }
  }

  console.log(
    `\n${colors.green}→ Launching: ${command} ${args.join(" ")}${
      colors.reset
    }\n`
  );

  // Run vitest with the constructed arguments
  const vitestProcess = spawn(command, args, {
    stdio: "inherit",
    env: { ...process.env },
  });

  vitestProcess.on("exit", (code) => {
    process.exit(code || 0);
  });
}

runTests().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
