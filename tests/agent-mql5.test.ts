import { expect, test } from "bun:test";
import { join } from "node:path";

async function startBot(environment: Record<string, string>) {
  const proc = Bun.spawn(
    ["bun", join(import.meta.dir, "..", "agent-mql5", "src", "index.ts")],
    {
      env: {
        PATH: process.env.PATH ?? "",
        MANAGED_AGENT_TOKEN: "",
        OPENAI_API_KEY: "",
        ...environment,
      },
      stdout: "pipe",
      stderr: "pipe",
    },
  );

  const killer = setTimeout(() => proc.kill(), 5_000);
  const exitCode = await proc.exited;
  clearTimeout(killer);
  const stderr = await new Response(proc.stderr).text();
  return { exitCode, stderr };
}

test("agent-mql5 refuses to start when the model key is empty", async () => {
  const { exitCode, stderr } = await startBot({
    MANAGED_AGENT_TOKEN: "test-token",
    OPENAI_API_KEY: "",
  });

  expect(exitCode).toBe(1);
  expect(stderr).toContain("OPENAI_API_KEY is not set");
});

test("agent-mql5 still refuses to start without its server token", async () => {
  const { exitCode, stderr } = await startBot({
    OPENAI_API_KEY: "sk-test",
  });

  expect(exitCode).toBe(1);
  expect(stderr).toContain("MANAGED_AGENT_TOKEN is not set");
});

test("agent-mql5 refuses a model it cannot drive however the name is spaced", async () => {
  for (const model of ["gpt-5.6-terra", " gpt-5.6-terra", "\tgpt-6 "]) {
    const { exitCode, stderr } = await startBot({
      MANAGED_AGENT_TOKEN: "test-token",
      OPENAI_API_KEY: "sk-test",
      BOT_MODEL: model,
    });

    expect(exitCode).toBe(1);
    expect(stderr).toContain("cannot be used by this Bot");
  }
});
