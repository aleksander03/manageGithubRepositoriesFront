/*
  Warnings:

  - A unique constraint covering the columns `[link]` on the table `organizations` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "organizations_link_key" ON "organizations"("link");
