/*
  Warnings:

  - The primary key for the `todo_tags` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `tag_uuid` on the `todo_tags` table. All the data in the column will be lost.
  - You are about to drop the column `todo_uuid` on the `todo_tags` table. All the data in the column will be lost.
  - Added the required column `tag_id` to the `todo_tags` table without a default value. This is not possible if the table is not empty.
  - Added the required column `todo_id` to the `todo_tags` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "todo_tags" DROP CONSTRAINT "todo_tags_tag_uuid_fkey";

-- DropForeignKey
ALTER TABLE "todo_tags" DROP CONSTRAINT "todo_tags_todo_uuid_fkey";

-- AlterTable
ALTER TABLE "todo_tags" DROP CONSTRAINT "todo_tags_pkey",
DROP COLUMN "tag_uuid",
DROP COLUMN "todo_uuid",
ADD COLUMN     "tag_id" INTEGER NOT NULL,
ADD COLUMN     "todo_id" INTEGER NOT NULL,
ADD CONSTRAINT "todo_tags_pkey" PRIMARY KEY ("todo_id", "tag_id");

-- AddForeignKey
ALTER TABLE "todo_tags" ADD CONSTRAINT "todo_tags_todo_id_fkey" FOREIGN KEY ("todo_id") REFERENCES "todos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "todo_tags" ADD CONSTRAINT "todo_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
