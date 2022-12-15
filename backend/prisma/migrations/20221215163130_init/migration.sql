-- CreateTable
CREATE TABLE "repositories" (
    "id" SERIAL NOT NULL,
    "link" VARCHAR(255) NOT NULL,
    "sectionId" INTEGER NOT NULL,

    CONSTRAINT "repositories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sections" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "organisationId" INTEGER NOT NULL,

    CONSTRAINT "sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organisations" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,

    CONSTRAINT "organisations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "repositoriesToUsers" (
    "id" SERIAL NOT NULL,
    "repositoryId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "repositoriesToUsers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sectionsToUsers" (
    "id" SERIAL NOT NULL,
    "sectionId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "sectionsToUsers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organisationsToUsers" (
    "id" SERIAL NOT NULL,
    "organisationId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "organisationsToUsers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "isProfessor" BOOLEAN NOT NULL DEFAULT false,
    "name" VARCHAR(50),
    "surname" VARCHAR(50),
    "githubEmail" VARCHAR(255) NOT NULL,
    "studentEmail" VARCHAR(255),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_githubEmail_key" ON "users"("githubEmail");

-- CreateIndex
CREATE UNIQUE INDEX "users_studentEmail_key" ON "users"("studentEmail");

-- AddForeignKey
ALTER TABLE "repositories" ADD CONSTRAINT "repositories_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "sections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sections" ADD CONSTRAINT "sections_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "organisations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repositoriesToUsers" ADD CONSTRAINT "repositoriesToUsers_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "repositories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repositoriesToUsers" ADD CONSTRAINT "repositoriesToUsers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sectionsToUsers" ADD CONSTRAINT "sectionsToUsers_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "sections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sectionsToUsers" ADD CONSTRAINT "sectionsToUsers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organisationsToUsers" ADD CONSTRAINT "organisationsToUsers_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "organisations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organisationsToUsers" ADD CONSTRAINT "organisationsToUsers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
