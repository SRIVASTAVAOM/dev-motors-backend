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

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  await prisma.approvalConfigurationUser.deleteMany();
  await prisma.approvalConfiguration.deleteMany();

  const configuration =
    await prisma.approvalConfiguration.create({
      data: {
        name: "Default Expense Approval",
        isActive: true,
        requiredApprovals: 1,
      },
    });

  console.log("✅ Approval configuration created");
  console.log("ID:", configuration.id);
  console.log("Name:", configuration.name);
  console.log(
    "Required approvals:",
    configuration.requiredApprovals
  );
}

main()
  .catch((error) => {
    console.error("❌ Failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
