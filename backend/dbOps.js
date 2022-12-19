import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const isAdmin = async (userId) => {
  const isAdmin = await prisma.users.findFirst({
    where: {
      id: userId,
      usersToRoles: {
        some: {
          role: {
            role: "Administrator",
          },
        },
      },
    },
  });
  return isAdmin;
};

export const orgsIdsForUser = async (userId) => {
  const orgIds = await prisma.organizations.findMany({
    select: {
      id: true,
    },
    where: {
      organizationsToUsers: {
        some: {
          user: {
            id: userId,
          },
        },
      },
    },
  });
  return orgIds;
};

export const findUserByGitHubEmail = async (githubEmail) => {
  const user = await prisma.users.findUnique({
    where: { githubEmail: githubEmail },
  });
  return user;
};

export const createNewUserFromGit = async (githubEmail, name, surname) => {
  const user = await prisma.users.create({
    data: {
      githubEmail: githubEmail,
      name: name,
      surname: namesurname,
    },
  });
  return user;
};

export const getOrganizations = async (
  orderBy,
  order,
  filter,
  userId,
  perPage,
  toSkip,
  isAdmin
) => {
  const organizations = await prisma.organizations.findMany({
    skip: toSkip,
    take: perPage,
    select: {
      id: true,
      name: true,
      link: true,
      _count: {
        select: {
          sections: true,
          organizationsToUsers: true,
        },
      },
    },
    where: {
      [orderBy]: {
        contains: filter,
      },
      ...(isAdmin
        ? {}
        : {
            organizationsToUsers: {
              some: {
                user: {
                  id: userId,
                },
              },
            },
          }),
    },
    orderBy: {
      [orderBy]: order,
    },
  });
  return organizations;
};

export const getOrganizationsCount = async (
  orderBy,
  filter,
  userId,
  isAdmin
) => {
  const organizationsCount = await prisma.organizations.count({
    select: {
      _all: true,
    },
    where: {
      [orderBy]: {
        contains: filter,
      },
      ...(isAdmin
        ? {}
        : {
            organizationsToUsers: {
              some: {
                user: {
                  id: userId,
                },
              },
            },
          }),
    },
  });
  return organizationsCount;
};

export const getStudents = async (
  orderBy,
  order,
  filter,
  perPage,
  toSkip,
  isAdmin,
  orgsIds
) => {
  const students = await prisma.users.findMany({
    skip: toSkip,
    take: perPage,
    select: {
      id: true,
      name: true,
      surname: true,
      githubEmail: true,
      studentEmail: true,
    },
    where: {
      [orderBy]: {
        contains: filter,
      },
      usersToRoles: {
        some: {
          role: {
            role: "Student",
          },
        },
      },
      ...(isAdmin
        ? {}
        : {
            organizationsToUsers: {
              some: {
                organization: {
                  OR: orgsIds,
                },
              },
            },
          }),
    },
    orderBy: {
      [orderBy]: order,
    },
  });
  return students;
};

export const getStudentsCount = async (orderBy, filter, orgsIds, isAdmin) => {
  const studentsCount = await prisma.users.count({
    select: {
      _all: true,
    },
    where: {
      [orderBy]: {
        contains: filter,
      },
      usersToRoles: {
        some: {
          role: {
            role: "Student",
          },
        },
      },
      ...(isAdmin
        ? {}
        : {
            organizationsToUsers: {
              some: {
                organization: {
                  OR: orgsIds,
                },
              },
            },
          }),
    },
  });
  return studentsCount;
};

export const getSections = async (
  orderBy,
  order,
  filter,
  perPage,
  toSkip,
  isAdmin,
  userId
) => {
  const sections = await prisma.sections.findMany({
    skip: toSkip,
    take: perPage,
    select: {
      id: true,
      name: true,
      _count: {
        select: {
          sectionsToUsers: true,
        },
      },
    },
    where: {
      [orderBy]: {
        contains: filter,
      },
      ...(isAdmin
        ? {}
        : {
            sectionsToUsers: {
              some: {
                user: {
                  id: userId,
                },
              },
            },
          }),
    },
    orderBy: {
      [orderBy]: order,
    },
  });
  return sections;
};

export const getSectionsCount = async (orderBy, filter, userId, isAdmin) => {
  const sectionsCount = await prisma.sections.count({
    select: {
      _all: true,
    },
    where: {
      [orderBy]: {
        contains: filter,
      },
      ...(isAdmin
        ? {}
        : {
            sectionsToUsers: {
              some: {
                user: {
                  id: userId,
                },
              },
            },
          }),
    },
  });
  return sectionsCount;
};
