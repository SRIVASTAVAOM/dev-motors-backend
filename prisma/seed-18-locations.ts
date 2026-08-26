import "dotenv/config";
import { prisma } from "../src/lib/prisma.js";

const locations = [
  ["LOC001", "Aligarh"], ["LOC002", "Agra"], ["LOC003", "Kanpur"], ["LOC004", "Lucknow"],
  ["LOC005", "Delhi"], ["LOC006", "Noida"], ["LOC007", "Ghaziabad"], ["LOC008", "Meerut"],
  ["LOC009", "Bareilly"], ["LOC010", "Moradabad"], ["LOC011", "Prayagraj"], ["LOC012", "Varanasi"],
  ["LOC013", "Gorakhpur"], ["LOC014", "Mathura"], ["LOC015", "Jhansi"], ["LOC016", "Firozabad"],
  ["LOC017", "Etawah"], ["LOC018", "Unnao"],
] as const;

async function main() {
  for (const [locationCode, name] of locations) {
    await prisma.location.upsert({
      where: { locationCode },
      update: { name, isActive: true },
      create: { locationCode, name, city: name, state: "Uttar Pradesh", isActive: true },
    });
  }
  console.log(`Ready: ${locations.length} locations`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
