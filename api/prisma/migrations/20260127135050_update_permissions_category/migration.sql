-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'Outros';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "canManageAgenda" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "canViewFinancials" BOOLEAN NOT NULL DEFAULT false;
