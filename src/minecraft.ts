import mineflayer from "mineflayer";
import readline from "readline";
import chalk from "chalk";

const successColor = chalk.hex("#00ffa1");
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const sharedMessages = new Set();

export class MinecraftBot {
  public bot: any;
  private rl: readline.Interface;

  constructor(private username: string, private password: string) {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    this.connect();
    this.setupReadline();
  }

  private async connect() {
    await wait(2000);
    this.bot = mineflayer.createBot({
      host: process.env.SERVER,
      port: 25565,
      username: this.username,
      password: this.password,
      auth: "microsoft",
      version: "1.8.8",
    });
    this.setupMinecraftEvents();
  }

  private async reconnect() {
    for (let attempt = 1; attempt <= 5; attempt++) {
      await wait(attempt * 2000);
      console.log(`[${this.bot.username}] Reconnect attempt ${attempt}...`);
      try {
        await this.connect();
        console.log(
          `[${successColor("SUCCESS")}] [${this.bot.username}]: Reconnected.`
        );
        return;
      } catch (error) {
        console.error(`[${this.bot.username}]: Reconnection failed: ${error}`);
      }
    }
    console.error(
      `[${this.bot.username}]: Max reconnect attempts reached. Giving up.`
    );
  }

  private setupMinecraftEvents() {
    this.bot
      .on("login", () =>
        console.log(
          `[${successColor("SUCCESS")}] [${this.bot.username}]: Logged in.`
        )
      )
      .on("spawn", async () => {
        const startupCommand = process.env.SERVER_COMMAND;
        console.log(
          `[${this.bot.username}] Running startup command: ${startupCommand}`
        );
        await wait(3000);
        this.sendMessage(startupCommand);
      })
      .on("end", () => {
        console.log(`[${this.bot.username}]: Disconnected. Reconnecting...`);
        this.reconnect();
      })
      .on("message", (message) => {
        const msg = message.toAnsi();
        if (!sharedMessages.has(msg)) {
          sharedMessages.add(msg);
          console.log(msg);
        }
      });
  }

  private setupReadline() {
    this.rl.on("line", (input) => {
      if (input.trim() === "exit") {
        this.rl.close();
        process.exit(0);
      } else {
        this.sendMessage(input);
      }
    });
    console.log("Execute commands or type 'exit' to quit.");
  }

  public sendMessage(message: string) {
    this.bot?.chat?.(message);
  }
}
