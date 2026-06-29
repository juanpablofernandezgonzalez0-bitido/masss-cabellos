CREATE TABLE "SupplierDebt" (
    "id" SERIAL NOT NULL,
    "supplierName" TEXT NOT NULL,
    "concept" TEXT NOT NULL DEFAULT '',
    "total" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "paidAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'pendiente',
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupplierDebt_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SupplierDebt_createdAt_idx" ON "SupplierDebt"("createdAt");

CREATE TABLE "SupplierDebtPayment" (
    "id" SERIAL NOT NULL,
    "debtId" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "notes" TEXT NOT NULL DEFAULT '',
    "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupplierDebtPayment_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SupplierDebtPayment_debtId_idx" ON "SupplierDebtPayment"("debtId");

ALTER TABLE "SupplierDebtPayment" ADD CONSTRAINT "SupplierDebtPayment_debtId_fkey" FOREIGN KEY ("debtId") REFERENCES "SupplierDebt"("id") ON DELETE CASCADE ON UPDATE CASCADE;
