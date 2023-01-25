import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { v4 as uuidv4 } from "uuid";

export const isAdmin = async (userId) => {
  const isAdmin = await prisma.users.findFirst({
    where: {
      id: userId,
      usersToRoles: { some: { role: { role: "Administrator" } } },
    },
  });

  return isAdmin;
};

export const sectionsIdsForUser = async (userId) => {
  const sectionsIds = await prisma.sections.findMany({
    select: { id: true },
    where: { sectionsToUsers: { some: { user: { id: userId } } } },
  });

  return sectionsIds;
};

export const findUserBygithubLogin = async (githubLogin) => {
  const user = await prisma.users.findUnique({
    where: { githubLogin: githubLogin },
  });

  return user;
};

export const changeUserData = async (userData) => {
  await prisma.users.update({
    where: { githubLogin: userData.githubLogin },
    data: {
      name: userData.name,
      surname: userData.surname,
      studentEmail: userData.studentEmail,
    },
  });

  return true;
};

export const createNewUserFromGit = async (githubLogin, name, surname) => {
  const id = uuidv4().slice(0, 8);
  const isIdExist = await prisma.users.findUnique({ where: { id: id } });

  if (isIdExist) return false;

  const user = await prisma.users.create({
    data: {
      id: id,
      githubLogin: githubLogin,
      name: name,
      surname: surname,
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
          organizationsToUsers: {
            where: {
              user: { usersToRoles: { some: { role: { role: "Student" } } } },
            },
          },
        },
      },
    },
    where: {
      [orderBy]: {
        contains: filter,
      },
      ...(isAdmin
        ? {}
        : { organizationsToUsers: { some: { user: { id: userId } } } }),
    },
    orderBy: {
      [orderBy]: order,
    },
  });

  const count = await prisma.organizations.count({
    select: {
      _all: true,
    },
    where: {
      [orderBy]: {
        contains: filter,
      },
      ...(isAdmin
        ? {}
        : { organizationsToUsers: { some: { user: { id: userId } } } }),
    },
  });

  return [organizations, count];
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
      githubLogin: true,
      studentEmail: true,
    },
    where: {
      OR: [
        { name: { contains: filter, mode: "insensitive" } },
        { surname: { contains: filter, mode: "insensitive" } },
        { githubLogin: { contains: filter, mode: "insensitive" } },
        { studentEmail: { contains: filter, mode: "insensitive" } },
      ],
      usersToRoles: { some: { role: { role: "Student" } } },
      ...(isAdmin
        ? {}
        : {
            sectionsToUsers: { some: { organization: { OR: orgsIds } } },
          }),
    },
    orderBy: {
      [orderBy]: order,
    },
  });

  const studentsCount = await prisma.users.count({
    select: {
      _all: true,
    },
    where: {
      [orderBy]: {
        contains: filter,
      },
      usersToRoles: { some: { role: { role: "Student" } } },
      ...(isAdmin
        ? {}
        : {
            organizationsToUsers: { some: { organization: { OR: orgsIds } } },
          }),
    },
  });

  return [students, studentsCount];
};

export const checkIfOrgExist = async (githubName) => {
  const organization = await prisma.organizations.findUnique({
    where: { githubName: githubName },
  });

  return organization;
};

export const addExistingOrganization = async (name, githubName, link) => {
  const organization = await prisma.organizations.create({
    data: { githubName: githubName, name: name, link: link },
  });

  return organization;
};

export const getOrganization = async (id, userId, isAdmin) => {
  const sectionsIsAdmin = isAdmin
    ? true
    : {
        where: { sectionsToUsers: { some: { user: { id: userId } } } },
      };

  const organization = await prisma.organizations.findMany({
    where: {
      id: id,
      ...(isAdmin
        ? {}
        : { organizationsToUsers: { some: { user: { id: userId } } } }),
    },
    include: {
      sections: sectionsIsAdmin,
    },
  });

  const professors = await prisma.users.findMany({
    where: {
      usersToRoles: { some: { role: { role: { not: "Student" } } } },
      organizationsToUsers: { some: { organization: { id: id } } },
    },
  });

  const response = [organization, professors];
  return response;
};

export const getAvailableProfessors = async (orgId, filter) => {
  const professors = await prisma.users.findMany({
    take: 20,
    where: {
      usersToRoles: { some: { role: { role: { not: "Student" } } } },
      organizationsToUsers: { every: { organization: { id: { not: orgId } } } },
      OR: [
        { name: { contains: filter, mode: "insensitive" } },
        { surname: { contains: filter, mode: "insensitive" } },
        { githubLogin: { contains: filter, mode: "insensitive" } },
      ],
    },
  });

  return professors;
};

export const addProfessorsToOrganization = async (orgId, professorId) => {
  professorId.map(async (professor) => {
    await prisma.organizationsToUsers.create({
      data: {
        organization: { connect: { id: orgId } },
        user: { connect: { id: professor } },
      },
    });
  });

  return true;
};

export const deleteProfessorsFromOrganization = async (orgId, professorId) => {
  professorId.map(async (professor) => {
    await prisma.organizationsToUsers.deleteMany({
      where: { userId: professor, organizationId: orgId },
    });

    await prisma.sectionsToUsers.deleteMany({
      where: { userId: professor, section: { organization: { id: orgId } } },
    });
  });

  return true;
};

export const addSectionToOrg = async (orgId, professorId, name) => {
  const section = await prisma.sections.create({
    data: {
      name: name,
      sectionsToUsers: { create: { user: { connect: { id: professorId } } } },
      organization: { connect: { id: orgId } },
    },
  });

  const org = await prisma.organizationsToUsers.findFirst({
    where: { organization: { id: orgId }, user: { id: professorId } },
  });

  if (!org)
    await prisma.organizationsToUsers.create({
      data: {
        organization: { connect: { id: orgId } },
        user: { connect: { id: professorId } },
      },
    });

  return section;
};

export const deleteOrganization = async (orgId) => {
  try {
    const org = await prisma.organizations.delete({
      where: { id: orgId },
    });

    return org;
  } catch (error) {
    console.error(error);
  }
};

export const getSection = async (sectionId, userId, isAdmin) => {
  const section = await prisma.sections.findMany({
    select: {
      id: true,
      name: true,
      organization: { select: { id: true, name: true, githubName: true } },
      sectionsToUsers: {
        select: { user: true },
        where: {
          user: {
            usersToRoles: { some: { role: { role: { not: "Student" } } } },
          },
        },
      },
    },
    where: {
      id: sectionId,
      ...(isAdmin
        ? {}
        : { sectionsToUsers: { some: { user: { id: userId } } } }),
    },
  });

  const students = await prisma.users.findMany({
    where: {
      sectionsToUsers: { some: { section: { id: sectionId } } },
      usersToRoles: { some: { role: { role: "Student" } } },
      ...(isAdmin
        ? {}
        : {
            sectionsToUsers: {
              some: {
                section: {
                  sectionsToUsers: { some: { user: { id: userId } } },
                },
              },
            },
          }),
    },
    select: {
      id: true,
      name: true,
      surname: true,
      githubLogin: true,
      studentEmail: true,
      repositoriesToUsers: {
        select: { repository: { select: { link: true } } },
        where: { repository: { section: { id: sectionId } } },
      },
    },
  });

  const fullSection = [{ ...section }, { students }];

  return fullSection;
};

export const generateCode = async (userId, sectionId) => {
  const expireDate = new Date();
  expireDate.setHours(expireDate.getHours() + 1);

  const code = await prisma.urlCodes.create({
    data: {
      id: uuidv4(),
      expireDate: expireDate,
      section: { connect: { id: sectionId } },
      urlCodesToUsers: { create: { user: { connect: { id: userId } } } },
    },
  });

  return code.id;
};

export const checkIsCodeExpired = async (code) => {
  const isCodeExpired = await prisma.urlCodes.findUnique({
    where: { id: code },
  });

  return isCodeExpired;
};

export const checkIsUserExist = async (githubLogin, studentEmail) => {
  const user = await prisma.users.findFirst({
    where: {
      OR: [{ githubLogin: githubLogin }, { studentEmail: studentEmail }],
    },
  });

  return user;
};

export const addStudentToUrlCode = async (
  githubLogin,
  urlCode,
  studentEmail
) => {
  const isUserInCodeOrSection = await prisma.users.findFirst({
    where: {
      OR: [{ githubLogin: githubLogin }, { studentEmail: studentEmail }],
      urlCodesToUsers: {
        some: {
          urlCode: {
            AND: [
              { id: urlCode },
              {
                section: {
                  sectionsToUsers: {
                    some: {
                      user: {
                        OR: [
                          { githubLogin: githubLogin },
                          { studentEmail: studentEmail },
                        ],
                      },
                    },
                  },
                },
              },
            ],
          },
        },
      },
    },
  });

  if (isUserInCodeOrSection) {
    return;
  } else {
    const user = await prisma.users.update({
      where: { githubLogin: githubLogin },
      data: {
        urlCodesToUsers: { create: { urlCode: { connect: { id: urlCode } } } },
      },
    });

    return user;
  }
};

export const addStudentFromLink = async (
  name,
  surname,
  githubLogin,
  studentEmail,
  urlCode
) => {
  const id = uuidv4().slice(0, 8);
  const isIdExist = await prisma.users.findUnique({ where: { id: id } });

  if (isIdExist) return false;

  const student = await prisma.users.create({
    data: {
      id: id,
      name: name,
      surname: surname,
      githubLogin: githubLogin,
      studentEmail: studentEmail,
      urlCodesToUsers: { create: { urlCode: { connect: { id: urlCode } } } },
      usersToRoles: { create: { role: { connect: { role: "Student" } } } },
    },
  });

  return student;
};

export const getStudentsInQueue = async (sectionId) => {
  const students = await prisma.users.findMany({
    where: {
      urlCodesToUsers: { some: { urlCode: { section: { id: sectionId } } } },
      usersToRoles: { some: { role: { role: "Student" } } },
      sectionsToUsers: { every: { section: { id: { not: sectionId } } } },
    },
    select: {
      id: true,
      name: true,
      surname: true,
      githubLogin: true,
      studentEmail: true,
      urlCodesToUsers: {
        select: { urlCode: { select: { id: true } } },
        where: { urlCode: { section: { id: sectionId } } },
      },
    },
  });

  return students;
};

export const deleteStudentFromQueue = async (userId, urlCode) => {
  await prisma.urlCodesToUsers.deleteMany({
    where: { urlCode: { id: urlCode }, user: { id: userId } },
  });
};

export const addStudentsToSection = (students, sectionId) => {
  students.map(async (student) => {
    await prisma.sectionsToUsers.create({
      data: {
        user: { connect: { id: student.id } },
        section: { connect: { id: sectionId } },
      },
    });
  });

  return true;
};

export const addStudentFromCSV = async (student, sectionId) => {
  const id = uuidv4().slice(0, 8);
  const isIdExist = await prisma.users.findUnique({ where: { id: id } });

  if (isIdExist) return false;

  const user = await prisma.users.create({
    data: {
      id: id,
      name: student.name,
      surname: student.surname,
      githubLogin: student.githubLogin,
      studentEmail: student.studentEmail,
      sectionsToUsers: { create: { section: { connect: { id: sectionId } } } },
      usersToRoles: { create: { role: { connect: { role: "Student" } } } },
    },
  });

  return user;
};

export const addStudentToSectionFromCSV = async (student, sectionId) => {
  let user;

  const isStudentExistInSection = await prisma.users.findFirst({
    where: {
      githubLogin: student.githubLogin,
      sectionsToUsers: { some: { section: { id: sectionId } } },
    },
  });

  if (isStudentExistInSection) return;
  else
    user = await prisma.users.update({
      where: { githubLogin: student.githubLogin },
      data: {
        sectionsToUsers: {
          create: { section: { connect: { id: sectionId } } },
        },
        usersToRoles: { create: { role: { connect: { role: "Student" } } } },
      },
    });

  return user;
};

export const deleteUserToSectionRelation = async (githubLogin) => {
  const user = await prisma.sectionsToUsers.deleteMany({
    where: { user: { githubLogin: githubLogin } },
  });

  return user;
};

export const getAvailableProfessorsForSection = async (sectionId, filter) => {
  const professors = await prisma.users.findMany({
    take: 20,
    where: {
      usersToRoles: { some: { role: { role: { not: "Student" } } } },
      sectionsToUsers: { every: { section: { id: { not: sectionId } } } },
      OR: [
        { name: { contains: filter, mode: "insensitive" } },
        { surname: { contains: filter, mode: "insensitive" } },
        { githubLogin: { contains: filter, mode: "insensitive" } },
      ],
    },
  });

  return professors;
};

export const addProfessorsToSection = async (sectionId, professorId) => {
  professorId.map(async (professor) => {
    const isUserInOrg = await prisma.organizationsToUsers.findFirst({
      where: {
        user: { id: professor },
        organization: { sections: { some: { id: sectionId } } },
      },
    });

    if (!isUserInOrg) {
      const orgId = await prisma.organizations.findFirst({
        select: { id: true },
        where: { sections: { some: { id: sectionId } } },
      });

      await prisma.organizationsToUsers.create({
        data: {
          organization: { connect: { id: orgId.id } },
          user: { connect: { id: professor } },
        },
      });
    }

    await prisma.sectionsToUsers.create({
      data: {
        section: { connect: { id: sectionId } },
        user: { connect: { id: professor } },
      },
    });
  });

  return true;
};

export const deleteUsersFromSection = async (sectionId, users) => {
  users.map(async (user) => {
    await prisma.sectionsToUsers.deleteMany({
      where: { section: { id: sectionId }, user: { id: user } },
    });
  });

  return true;
};

export const deleteSection = async (sectionId) => {
  await prisma.sections.delete({ where: { id: sectionId } });

  return true;
};

export const createRepositoryForStudent = async (userId, link, sectionId) => {
  await prisma.repositoriesToUsers.create({
    data: {
      repository: {
        create: { link: link, section: { connect: { id: sectionId } } },
      },
      user: { connect: { id: userId } },
    },
  });

  return true;
};

export const getTeachers = async (orderBy, order, filter, perPage, toSkip) => {
  const teachers = await prisma.users.findMany({
    skip: toSkip,
    take: perPage,
    select: {
      id: true,
      name: true,
      surname: true,
      githubLogin: true,
      studentEmail: true,
      usersToRoles: { select: { role: { select: { role: true } } } },
    },
    where: {
      AND: [
        {
          OR: [
            { name: { contains: filter, mode: "insensitive" } },
            { surname: { contains: filter, mode: "insensitive" } },
            { githubLogin: { contains: filter, mode: "insensitive" } },
            { studentEmail: { contains: filter, mode: "insensitive" } },
          ],
        },
        {
          OR: [
            { usersToRoles: { some: { role: { role: { not: "Student" } } } } },
            { usersToRoles: { none: {} } },
          ],
        },
      ],
    },
    orderBy: { [orderBy]: order },
  });

  const teachersCount = await prisma.users.count({
    where: {
      AND: [
        {
          OR: [
            { name: { contains: filter, mode: "insensitive" } },
            { surname: { contains: filter, mode: "insensitive" } },
            { githubLogin: { contains: filter, mode: "insensitive" } },
            { studentEmail: { contains: filter, mode: "insensitive" } },
          ],
        },
        {
          OR: [
            { usersToRoles: { some: { role: { role: { not: "Student" } } } } },
            { usersToRoles: { none: {} } },
          ],
        },
      ],
    },
  });

  const response = [teachers, teachersCount];

  return response;
};

export const giveRole = async (role, userId) => {
  await prisma.users.update({
    where: { id: userId },
    data: { usersToRoles: { create: { role: { connect: { role: role } } } } },
  });
};

export const deleteRole = async (role, userId) => {
  await prisma.usersToRoles.deleteMany({
    where: { user: { id: userId }, role: { role: role } },
  });
};

export const getUsersOrgs = async (userId) => {
  const orgs = await prisma.organizations.findMany({
    select: { id: true, name: true },
    where: { organizationsToUsers: { some: { user: { id: userId } } } },
  });

  return orgs;
};

export const deleteUser = async (userId) => {
  await prisma.users.delete({ where: { id: userId } });
};

export const getUsersRepositories = async (userId) => {
  const repositories = await prisma.repositories.findMany({
    where: { repositoriesToUsers: { some: { user: { id: userId } } } },
    include: {
      section: {
        select: {
          id: true,
          name: true,
          organization: { select: { id: true, name: true } },
        },
      },
    },
  });

  return repositories;
};

export const changeOrgLocalName = async (orgId, newOrgName) => {
  await prisma.organizations.update({
    where: { id: orgId },
    data: { name: newOrgName },
  });
};

export const getOrgForArchive = async (orgId) => {
  const orgTmp = await prisma.organizations.findFirst({
    where: { id: orgId },
    select: {
      sections: {
        select: {
          name: true,
          sectionsToUsers: {
            select: {
              user: {
                select: {
                  id: true,
                  name: true,
                  surname: true,
                },
              },
            },
            where: {
              user: { usersToRoles: { every: { role: { role: "Student" } } } },
            },
          },
        },
      },
    },
  });

  const repositories = await prisma.repositories.findMany({
    where: {
      section: { organization: { id: orgId } },
      repositoriesToUsers: {
        some: {
          user: { usersToRoles: { every: { role: { role: "Student" } } } },
        },
      },
    },
  });

  const combinedArray = [];

  orgTmp.sections.forEach((org) => {
    const sectionName = org.name;
    org.sectionsToUsers.forEach((section) => {
      const id = section.user.id;
      const name = section.user.name;
      const surname = section.user.surname;
      const repos = repositories.filter(
        (repository) =>
          repository.link.includes(id) && repository.link.includes(sectionName)
      );

      combinedArray.push({
        id: id,
        name: name,
        surname: surname,
        repository: repos[0].link,
        sectionName: sectionName,
      });
    });
  });

  return combinedArray;
};
