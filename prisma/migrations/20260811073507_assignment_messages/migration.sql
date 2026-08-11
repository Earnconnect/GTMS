-- CreateTable
CREATE TABLE "AssignmentMessage" (
    "id" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "isStaff" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssignmentMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AssignmentMessage_assignmentId_createdAt_idx" ON "AssignmentMessage"("assignmentId", "createdAt");

-- AddForeignKey
ALTER TABLE "AssignmentMessage" ADD CONSTRAINT "AssignmentMessage_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "JobAssignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignmentMessage" ADD CONSTRAINT "AssignmentMessage_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
