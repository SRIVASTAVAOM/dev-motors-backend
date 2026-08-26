/*
  Warnings:

  - You are about to drop the column `managerId` on the `ExpenseApproval` table. All the data in the column will be lost.
  - The `status` column on the `ExpenseApproval` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[expenseId,approverId]` on the table `ExpenseApproval` will be added. If there are existing duplicate values, this will fail.
  - Made the column `receiptUrl` on table `Expense` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `approverId` to the `ExpenseApproval` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'EXPENSE_CANCELLED';

-- DropForeignKey
ALTER TABLE "ExpenseApproval" DROP CONSTRAINT "ExpenseApproval_managerId_fkey";

-- DropIndex
DROP INDEX "ExpenseApproval_managerId_idx";

-- AlterTable
ALTER TABLE "Expense" ADD COLUMN     "receiptFileName" TEXT,
ADD COLUMN     "receiptMimeType" TEXT,
ADD COLUMN     "receiptSize" INTEGER,
ALTER COLUMN "receiptUrl" SET NOT NULL;

-- AlterTable
ALTER TABLE "ExpenseApproval" DROP COLUMN "managerId",
ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "approverId" TEXT NOT NULL,
ADD COLUMN     "rejectedAt" TIMESTAMP(3),
DROP COLUMN "status",
ADD COLUMN     "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING';

-- CreateTable
CREATE TABLE "ApprovalConfiguration" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "requiredApprovals" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApprovalConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApprovalConfigurationUser" (
    "id" TEXT NOT NULL,
    "configurationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApprovalConfigurationUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ApprovalConfiguration_name_key" ON "ApprovalConfiguration"("name");

-- CreateIndex
CREATE INDEX "ApprovalConfigurationUser_userId_idx" ON "ApprovalConfigurationUser"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ApprovalConfigurationUser_configurationId_userId_key" ON "ApprovalConfigurationUser"("configurationId", "userId");

-- CreateIndex
CREATE INDEX "ExpenseApproval_approverId_idx" ON "ExpenseApproval"("approverId");

-- CreateIndex
CREATE INDEX "ExpenseApproval_status_idx" ON "ExpenseApproval"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ExpenseApproval_expenseId_approverId_key" ON "ExpenseApproval"("expenseId", "approverId");

-- AddForeignKey
ALTER TABLE "ExpenseApproval" ADD CONSTRAINT "ExpenseApproval_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalConfigurationUser" ADD CONSTRAINT "ApprovalConfigurationUser_configurationId_fkey" FOREIGN KEY ("configurationId") REFERENCES "ApprovalConfiguration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalConfigurationUser" ADD CONSTRAINT "ApprovalConfigurationUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
