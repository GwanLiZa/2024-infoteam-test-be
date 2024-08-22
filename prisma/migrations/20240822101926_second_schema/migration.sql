/*
  Warnings:

  - A unique constraint covering the columns `[tag]` on the table `Tag` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE INDEX "Post_title_text_idx" ON "Post"("title", "text");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_tag_key" ON "Tag"("tag");

-- CreateIndex
CREATE INDEX "Tag_tag_idx" ON "Tag"("tag");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");
