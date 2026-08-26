/*
  Warnings:

  - The values [PENDING] on the enum `ExpenseStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ExpenseStatus_new" AS ENUM ('PENDING_MANAGER', 'PENDING_OWNER', 'PENDING_CASHIER', 'APPROVED', 'REJECTED');
ALTER TABLE "public"."Expense" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Expense" ALTER COLUMN "status" TYPE "ExpenseStatus_new" USING ("status"::text::"ExpenseStatus_new");
ALTER TYPE "ExpenseStatus" RENAME TO "ExpenseStatus_old";
ALTER TYPE "ExpenseStatus_new" RENAME TO "ExpenseStatus";
DROP TYPE "public"."ExpenseStatus_old";
ALTER TABLE "Expense" ALTER COLUMN "status" SET DEFAULT 'PENDING_MANAGER';
COMMIT;

-- AlterTable
ALTER TABLE "Expense" ALTER COLUMN "status" SET DEFAULT 'PENDING_MANAGER';
