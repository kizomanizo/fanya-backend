/*
  Warnings:

  - The primary key for the `todo_tags` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `tag_id` on the `todo_tags` table. All the data in the column will be lost.
  - You are about to drop the column `todo_id` on the `todo_tags` table. All the data in the column will be lost.
  - You are about to drop the column `category_id` on the `todos` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `todos` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[uuid]` on the table `categories` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `categories` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uuid]` on the table `tags` will be added. If there are existing duplicate values, this will fail.
  - The required column `uuid` was added to the `categories` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `uuid` was added to the `tags` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `tag_uuid` to the `todo_tags` table without a default value. This is not possible if the table is not empty.
  - Added the required column `todo_uuid` to the `todo_tags` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_uuid` to the `todos` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "todo_tags" DROP CONSTRAINT "todo_tags_tag_id_fkey";

-- DropForeignKey
ALTER TABLE "todo_tags" DROP CONSTRAINT "todo_tags_todo_id_fkey";

-- DropForeignKey
ALTER TABLE "todos" DROP CONSTRAINT "todos_category_id_fkey";

-- DropForeignKey
ALTER TABLE "todos" DROP CONSTRAINT "todos_user_id_fkey";

-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "uuid" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "tags" ADD COLUMN     "uuid" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "todo_tags" DROP CONSTRAINT "todo_tags_pkey",
DROP COLUMN "tag_id",
DROP COLUMN "todo_id",
ADD COLUMN     "tag_uuid" TEXT NOT NULL,
ADD COLUMN     "todo_uuid" TEXT NOT NULL,
ADD CONSTRAINT "todo_tags_pkey" PRIMARY KEY ("todo_uuid", "tag_uuid");

-- AlterTable
ALTER TABLE "todos" DROP COLUMN "category_id",
DROP COLUMN "user_id",
ADD COLUMN     "category_uuid" TEXT,
ADD COLUMN     "user_uuid" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "categories_uuid_key" ON "categories"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "tags_uuid_key" ON "tags"("uuid");

-- AddForeignKey
ALTER TABLE "todos" ADD CONSTRAINT "todos_user_uuid_fkey" FOREIGN KEY ("user_uuid") REFERENCES "users"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "todos" ADD CONSTRAINT "todos_category_uuid_fkey" FOREIGN KEY ("category_uuid") REFERENCES "categories"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "todo_tags" ADD CONSTRAINT "todo_tags_todo_uuid_fkey" FOREIGN KEY ("todo_uuid") REFERENCES "todos"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "todo_tags" ADD CONSTRAINT "todo_tags_tag_uuid_fkey" FOREIGN KEY ("tag_uuid") REFERENCES "tags"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;
