-- CreateEnum
CREATE TYPE "Permission" AS ENUM ('EXCAVATION_READ', 'EXCAVATION_WRITE', 'USER_READ', 'USER_WRITE');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('NOT_SENT', 'SUCCESS', 'ERROR');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "permissions" "Permission"[],
    "isSuperAdmin" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMPTZ,
    "refreshToken" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Excavation" (
    "id" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "address" TEXT NOT NULL,
    "organizationName" TEXT NOT NULL,
    "viloyatName" TEXT NOT NULL,
    "tumanAndRiverName" TEXT NOT NULL,
    "areaName" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "dsiCode" TEXT NOT NULL,
    "ns10" INTEGER NOT NULL,
    "ns11" INTEGER NOT NULL,
    "tin" INTEGER NOT NULL,
    "count" DOUBLE PRECISION NOT NULL,
    "createdById" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'NOT_SENT',
    "excelFileName" TEXT NOT NULL,
    "taxSystemError" TEXT,

    CONSTRAINT "Excavation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_phoneNumber_key" ON "User"("phoneNumber");

-- AddForeignKey
ALTER TABLE "Excavation" ADD CONSTRAINT "Excavation_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
