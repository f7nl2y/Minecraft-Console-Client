import fs from "fs";
import path from "path";
import chalk from "chalk";
import { MinecraftBot } from "./minecraft";
import "dotenv/config";

const successColor = chalk.hex("#00ffa1");
const accountsPath = path.join(__dirname, "../accounts.txt");

const accounts = fs.readFileSync(accountsPath, "utf-8")
  .split("\n")
  .map(line => line.trim())
  .filter(Boolean)
  .map(line => {
    const [username, password] = line.split(":");
    if (!username || !password) console.error(`[ERROR] Invalid account format: ${line}`);
    return { username, password };
  })
  .filter(acc => acc.username && acc.password);

if (!accounts.length) {
  console.error("[ERROR] No valid accounts found.");
  process.exit(1);
}

const requiredEnvs = ["SERVER", "SERVER_COMMAND"];
const missingEnvs = requiredEnvs.filter(env => !process.env[env]);
if (missingEnvs.length) {
  console.error(`[ERROR] Missing required envs: ${missingEnvs.join(", ")}`);
  process.exit(1);
}

// Start bots
console.log(`[${successColor("INFO")}] Starting ${accounts.length} bots...`);
accounts.forEach(acc => new MinecraftBot(acc.username, acc.password));