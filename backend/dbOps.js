import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getUser = async (email) => {
  const user = await prisma.users.findUnique({
    where: {
      githubEmail: email,
    },
  });

  return user;
};

export const createUser = async (email, name, surname) => {
  const user = await prisma.users.create({
    data: {
      githubEmail: email,
      name: name,
      surname: surname,
    },
  });
};
