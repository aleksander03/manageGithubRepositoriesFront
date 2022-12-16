/*
  Warnings:

  - You are about to drop the column `isProfessor` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "isProfessor",
DROP COLUMN "role";
