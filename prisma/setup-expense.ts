import { prisma } from "../src/lib/prisma.js";

const categories = [
  "Fuel",
  "Vehicle Repair",
  "Vehicle Maintenance",
  "Spare Parts",
  "Tyres",
  "Battery",
  "Engine Oil",
  "Insurance",
  "Parking",
  "Toll Charges",
  "Travel",
  "Hotel",
  "Food & Refreshments",
  "Office Supplies",
  "Stationery",
  "Electricity",
  "Internet",
  "Salary",
  "Marketing",
  "Medical",
  "Courier",
  "Training",
  "Miscellaneous",
];

async function main() {
  console.log("🌱 Setting up expense data...");

  // 1. Create default location
  const location = await prisma.location.upsert({
    where: {
      locationCode: "HQ001",
    },
    update: {
      name: "Dev Motors Head Office",
      isActive: true,
    },
    create: {
      locationCode: "HQ001",
      name: "Dev Motors Head Office",
      address: "Dev Motors Head Office",
      city: "Kanpur",
      state: "Uttar Pradesh",
      isActive: true,
    },
  });

  console.log(`✅ Location ready: ${location.name}`);

  // 2. Create expense categories
  for (const name of categories) {
    await prisma.expenseCategory.upsert({
      where: {
        name,
      },
      update: {
        isActive: true,
      },
      create: {
        name,
        isActive: true,
      },
    });
  }

  console.log(
    `✅ ${categories.length} expense categories ready`
  );

  // 3. Assign location to test users
  const users = await prisma.user.updateMany({
    where: {
      employeeId: {
        in: ["EMP001", "MGR001", "ADM001"],
      },
    },
    data: {
      locationId: location.id,
    },
  });

  console.log(
    `✅ ${users.count} test users assigned to location`
  );

  console.log("");
  console.log("🎉 Expense setup completed successfully!");
  console.log(`📍 Location ID: ${location.id}`);
}

main().catch((error) => {
  console.error("❌ Expense setup failed:", error);
  process.exit(1);
});