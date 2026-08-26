-- Dev Motors requirements v2
-- Adds OWNER/CASHIER roles and immutable expense audit records.

ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'CASHIER';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'OWNER';

CREATE TABLE IF NOT EXISTS "ExpenseAudit" (
  "id" TEXT NOT NULL,
  "expenseId" TEXT NOT NULL,
  "actorId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "oldAmount" DECIMAL(12,2),
  "newAmount" DECIMAL(12,2),
  "remarks" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ExpenseAudit_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ExpenseAudit_expenseId_idx" ON "ExpenseAudit"("expenseId");
CREATE INDEX IF NOT EXISTS "ExpenseAudit_actorId_idx" ON "ExpenseAudit"("actorId");
CREATE INDEX IF NOT EXISTS "ExpenseAudit_createdAt_idx" ON "ExpenseAudit"("createdAt");

DO $$ BEGIN
  ALTER TABLE "ExpenseAudit" ADD CONSTRAINT "ExpenseAudit_expenseId_fkey"
    FOREIGN KEY ("expenseId") REFERENCES "Expense"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "ExpenseAudit" ADD CONSTRAINT "ExpenseAudit_actorId_fkey"
    FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
