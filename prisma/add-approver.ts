import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const configuration =
    await prisma.approvalConfiguration.findUnique({
      where: {
        name: "Default Expense Approval",
      },
    });

  if (!configuration) {
    throw new Error("Approval configuration not found");
  }

  const manager = await prisma.user.findUnique({
    where: {
      employeeId: "MGR001",
    },
  });

  if (!manager) {
    throw new Error("MGR001 not found");
  }

  await prisma.approvalConfigurationUser.upsert({
    where: {
      configurationId_userId: {
        configurationId: configuration.id,
        userId: manager.id,
      },
    },
    update: {},
    create: {
      configurationId: configuration.id,
      userId: manager.id,
    },
  });

  console.log("✅ MGR001 added as expense approver");
  console.log("Manager ID:", manager.id);
  console.log("Configuration ID:", configuration.id);
}

main()
  .catch((error) => {
    console.error("❌ Failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
