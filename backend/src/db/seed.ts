import dotenv from "dotenv";
import { prisma } from "@/lib/prisma";
import { SportType } from "../types/strava";

dotenv.config({ path: ".env.development.local" });

async function main() {
  const sportTypes = Object.values(SportType);
  for (const name of sportTypes) {
    await prisma.sportType.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.info("SportType table seeded.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
