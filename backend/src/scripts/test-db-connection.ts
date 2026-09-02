import { buildDatabaseUrl, ensureDatabaseConnection } from "../lib/prisma.js";
import prisma from "../lib/prisma.js";

async function main() {
  const url = new URL(buildDatabaseUrl());
  console.log("Runtime DB host:", url.hostname);
  console.log("Runtime DB port:", url.port);
  console.log("Runtime DB params:", url.search);

  const started = Date.now();
  await ensureDatabaseConnection();
  console.log(`ensureDatabaseConnection OK in ${Date.now() - started}ms`);
}

main()
  .catch((error: Error) => {
    console.error("FAIL:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
