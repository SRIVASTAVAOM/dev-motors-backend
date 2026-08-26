import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

const locations = [
  ["LOC001", "Aligarh"],
  ["LOC002", "Agra"],
  ["LOC003", "Kanpur"],
  ["LOC004", "Lucknow"],
  ["LOC005", "Delhi"],
  ["LOC006", "Noida"],
  ["LOC007", "Ghaziabad"],
  ["LOC008", "Meerut"],
  ["LOC009", "Bareilly"],
  ["LOC010", "Moradabad"],
  ["LOC011", "Prayagraj"],
  ["LOC012", "Varanasi"],
  ["LOC013", "Gorakhpur"],
  ["LOC014", "Mathura"],
  ["LOC015", "Jhansi"],
  ["LOC016", "Firozabad"],
  ["LOC017", "Etawah"],
  ["LOC018", "Unnao"],
] as const;

async function main() {
  console.log("🌱 Seeding Dev Motors...");

  // --------------------------------------------------
  // 1. Create / update all 18 locations
  // --------------------------------------------------

  const locationMap = new Map<string, string>();

  for (const [locationCode, name] of locations) {
    const location = await prisma.location.upsert({
      where: { locationCode },
      update: {
        name,
        city: name,
        state: "Uttar Pradesh",
        isActive: true,
      },
      create: {
        locationCode,
        name,
        city: name,
        state: "Uttar Pradesh",
        isActive: true,
      },
    });

    locationMap.set(locationCode, location.id);
  }

  // --------------------------------------------------
  // 2. Passwords
  // --------------------------------------------------

  const ownerPassword = await bcrypt.hash("owner123", 10);
  const managerPassword = await bcrypt.hash("manager123", 10);
  const cashierPassword = await bcrypt.hash("cashier123", 10);
  const employeePassword = await bcrypt.hash("12345678", 10);

  // --------------------------------------------------
  // 3. OWNER
  // Owner is common across all locations.
  // --------------------------------------------------

  const owner = await prisma.user.upsert({
    where: {
      employeeId: "OWN001",
    },
    update: {
      name: "Dev Motors Owner",
      email: "owner@devmotors.com",
      passwordHash: ownerPassword,
      role: "OWNER",
      status: "ACTIVE",
      locationId: null,
      managerId: null,
    },
    create: {
      employeeId: "OWN001",
      name: "Dev Motors Owner",
      email: "owner@devmotors.com",
      passwordHash: ownerPassword,
      role: "OWNER",
      status: "ACTIVE",
      locationId: null,
      managerId: null,
    },
  });

  console.log(`✅ Owner: ${owner.employeeId}`);

  // --------------------------------------------------
  // 4. Create Manager + Cashier + Employee
  //    for every location
  // --------------------------------------------------

  for (const [locationCode, locationName] of locations) {
    const locationId = locationMap.get(locationCode);

    if (!locationId) {
      throw new Error(`Location not found: ${locationCode}`);
    }

    const suffix = locationCode.replace("LOC", "");

    // -----------------------------
    // Manager
    // -----------------------------

    const manager = await prisma.user.upsert({
      where: {
        employeeId: `MGR${suffix}`,
      },
      update: {
        name: `${locationName} Manager`,
        email: `manager${suffix}@devmotors.com`,
        passwordHash: managerPassword,
        role: "MANAGER",
        status: "ACTIVE",
        locationId,
        managerId: null,
      },
      create: {
        employeeId: `MGR${suffix}`,
        name: `${locationName} Manager`,
        email: `manager${suffix}@devmotors.com`,
        passwordHash: managerPassword,
        role: "MANAGER",
        status: "ACTIVE",
        locationId,
        managerId: null,
      },
    });

    // -----------------------------
    // Cashier
    // -----------------------------

    await prisma.user.upsert({
      where: {
        employeeId: `CASH${suffix}`,
      },
      update: {
        name: `${locationName} Cashier`,
        email: `cashier${suffix}@devmotors.com`,
        passwordHash: cashierPassword,
        role: "CASHIER",
        status: "ACTIVE",
        locationId,
        managerId: manager.id,
      },
      create: {
        employeeId: `CASH${suffix}`,
        name: `${locationName} Cashier`,
        email: `cashier${suffix}@devmotors.com`,
        passwordHash: cashierPassword,
        role: "CASHIER",
        status: "ACTIVE",
        locationId,
        managerId: manager.id,
      },
    });

  // -----------------------------
// Employees (5 per location)
// -----------------------------

for (let employeeNumber = 1; employeeNumber <= 5; employeeNumber++) {
  const employeeId = `EMP${suffix}_${employeeNumber}`;

  await prisma.user.upsert({
    where: {
      employeeId,
    },
    update: {
      name: `${locationName} Employee ${employeeNumber}`,
      email: `employee${suffix}_${employeeNumber}@devmotors.com`,
      passwordHash: employeePassword,
      role: "EMPLOYEE",
      status: "ACTIVE",
      locationId,
      managerId: manager.id,
    },
    create: {
      employeeId,
      name: `${locationName} Employee ${employeeNumber}`,
      email: `employee${suffix}_${employeeNumber}@devmotors.com`,
      passwordHash: employeePassword,
      role: "EMPLOYEE",
      status: "ACTIVE",
      locationId,
      managerId: manager.id,
    },
  });
}

console.log(
  `✅ ${locationCode} ${locationName}: Manager + Cashier + 5 Employees`
)
  }

  console.log("");
  console.log("=================================");
  console.log("   DEV MOTORS SEED COMPLETE");
  console.log("=================================");
  console.log("");
  console.log("OWNER");
  console.log("OWN001 / owner123");
  console.log("");
  console.log("Example Aligarh users");
  console.log("MGR001  / manager123");
  console.log("CASH001 / cashier123");
  console.log("EMP001  / 12345678");
  console.log("");
  console.log("18 locations configured.");
  console.log("4 business roles configured.");
  console.log("");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

