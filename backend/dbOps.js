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

export const orgsIdsForUser = async (userId) => {
  const orgIds = await prisma.organizations.findMany({
    select: { id: true },
    where: { organizationsToUsers: { some: { user: { id: userId } } } },
  });
  return orgIds;
};

export const findUserBygithubLogin = async (githubLogin) => {
  const user = await prisma.users.findUnique({
    where: { githubLogin: githubLogin },
  });
  return user;
};

export const createNewUserFromGit = async (githubLogin, name, surname) => {
  const user = await prisma.users.create({
    data: {
      githubLogin: githubLogin,
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
        : { organizationsToUsers: { some: { user: { id: userId } } } }),
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
      githubLogin: true,
      studentEmail: true,
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
      usersToRoles: { some: { role: { role: "Student" } } },
      ...(isAdmin
        ? {}
        : {
            organizationsToUsers: { some: { organization: { OR: orgsIds } } },
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
          sectionsToUsers: {
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
        : { sectionsToUsers: { some: { user: { id: userId } } } }),
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
        : { sectionsToUsers: { some: { user: { id: userId } } } }),
    },
  });
  return sectionsCount;
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
  const organization = await prisma.organizations.findUnique({
    where: {
      id: id,
      ...(isAdmin
        ? {}
        : { organizationsToUsers: { some: { user: { userId: userId } } } }),
    },
    include: { sections: true },
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
  const section = await prisma.sections.findUnique({
    select: {
      id: true,
      name: true,
      organization: { select: { id: true, name: true } },
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
  const student = await prisma.users.create({
    data: {
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
  });

  return students;
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
  const user = await prisma.users.create({
    data: {
      name: student.name,
      surname: student.surname,
      githubLogin: student.githubLogin,
      studentEmail: student.studentEmail,
      sectionsToUsers: { create: { section: { connect: { id: sectionId } } } },
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

export const deleteProfessorsFromSection = async (sectionId, professors) => {
  professors.map(async (professor) => {
    await prisma.sectionsToUsers.deleteMany({
      where: { section: { id: sectionId }, user: { id: professor } },
    });
  });

  return true;
};

export const deleteSection = async (sectionId) => {
  await prisma.sections.delete({ where: { id: sectionId } });

  return true;
};

export const createRepositoryForStudent = async (userId, link, sectionId) => {
  await prisma.repositories.create({
    data: {
      link: link,
      repositoriesToUsers: { create: { user: { connect: { id: userId } } } },
      section: { connect: { id: sectionId } },
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
      OR: [
        { name: { contains: filter, mode: "insensitive" } },
        { surname: { contains: filter, mode: "insensitive" } },
        { githubLogin: { contains: filter, mode: "insensitive" } },
        { studentEmail: { contains: filter, mode: "insensitive" } },
      ],
      usersToRoles: { some: { role: { role: { not: "Student" } } } },
    },
    orderBy: { [orderBy]: order },
  });

  return teachers;
};
