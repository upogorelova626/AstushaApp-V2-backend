-- CreateTable
CREATE TABLE "project_repositories" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_repositories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "project_repositories_projectId_idx" ON "project_repositories"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "project_repositories_projectId_url_key" ON "project_repositories"("projectId", "url");

-- AddForeignKey
ALTER TABLE "project_repositories" ADD CONSTRAINT "project_repositories_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
