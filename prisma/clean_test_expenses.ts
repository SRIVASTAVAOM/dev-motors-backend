import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('=== Cleaning Test Expenses & Activity History for Client Delivery ===');

  const countAudits = await prisma.expenseAudit.deleteMany({});
  console.log(`Deleted ${countAudits.count} expense audit records.`);

  const countApprovals = await prisma.expenseApproval.deleteMany({});
  console.log(`Deleted ${countApprovals.count} expense approval logs.`);

  const countNotifs = await prisma.notification.deleteMany({});
  console.log(`Deleted ${countNotifs.count} old test notifications.`);

  const countExpenses = await prisma.expense.deleteMany({});
  console.log(`Deleted ${countExpenses.count} test expenses.`);

  const activeUsers = await prisma.user.count({ where: { status: 'ACTIVE' } });
  const activeLocations = await prisma.location.count();
  const categories = await prisma.expenseCategory.count();

  console.log(`\nVerified Database State for Production:`);
  console.log(`- Active Staff Users: ${activeUsers}`);
  console.log(`- Dealership Locations: ${activeLocations}`);
  console.log(`- Expense Categories: ${categories}`);
  console.log(`- Active Claims: 0 (Fresh pristine system)`);
  console.log('=== Database Cleaned Successfully! ===');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
