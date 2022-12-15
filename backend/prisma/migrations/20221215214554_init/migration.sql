/*
  Warnings:

  - You are about to drop the column `organisationId` on the `sections` table. All the data in the column will be lost.
  - You are about to drop the `organisationsToUsers` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[link]` on the table `repositories` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `organizationId` to the `sections` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "organisationsToUsers" DROP CONSTRAINT "organisationsToUsers_organisationId_fkey";

-- DropForeignKey
ALTER TABLE "organisationsToUsers" DROP CONSTRAINT "organisationsToUsers_userId_fkey";

-- DropForeignKey
ALTER TABLE "sections" DROP CONSTRAINT "sections_organisationId_fkey";

-- AlterTable
ALTER TABLE "sections" DROP COLUMN "organisationId",
ADD COLUMN     "organizationId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "organisationsToUsers";

-- CreateTable
CREATE TABLE "organizationsToUsers" (
    "id" SERIAL NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "organizationsToUsers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "repositories_link_key" ON "repositories"("link");

-- AddForeignKey
ALTER TABLE "sections" ADD CONSTRAINT "sections_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organizationsToUsers" ADD CONSTRAINT "organizationsToUsers_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organizationsToUsers" ADD CONSTRAINT "organizationsToUsers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
