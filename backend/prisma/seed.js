import { PrismaClient } from "@prisma/client";
import {v4 as uuidv4} from 'uuid';
const prisma = new PrismaClient();

async function main() {
  await prisma.roles.createMany({
    data: [
      { role: "Profesor" },
      { role: "Student" },
      { role: "Administrator" },
      { role: "Kierownik" },
    ],
  });

  await prisma.users.create({
    data: {
      id: uuidv4(),
      name: "Aleksander",
      surname: "Uljaniwski",
      githubEmail: "indoras@o2.pl",
      studentEmail: "alekulj284@student.polsl.pl",
      approved: true,
      usersToRoles: {
        create: {
          role: {
            connect: {
              role: "Administrator",
            },
          },
        },
      },
    },
  });

  for (let i = 0; i < 10; i++) {
    await prisma.users.create({
      data: {
        id: uuidv4(),
        name: `Profesor${i}`,
        surname: `Nowak${i}`,
        githubEmail: `profesor${i}@git.com`,
        approved: true,
        usersToRoles: {
          create: {
            role: {
              connect: {
                role: "Profesor",
              },
            },
          },
        },
      },
    });
  }

  await prisma.organizations.createMany({
    data: [
      { name: `ORG1`, githubName: `ORG1`, link: `ogr1.git.com` },
      { name: `ORG2`, githubName: `ORG2`, link: `ogr2.git.com` },
      { name: `ORG3`, githubName: `ORG3`, link: `ogr3.git.com` },
      { name: `ORG4`, githubName: `ORG4`, link: `ogr4.git.com` },
      { name: `ORG5`, githubName: `ORG5`, link: `ogr5.git.com` },
    ],
  });

  for (let i = 0; i < 10; i++) {
    await prisma.organizations.create({
      data: {
        name: `ORGANIZACJA${i}`,
        githubName: `ORGANIZACJA${i}`,
        link: `github.jakis-link${i}`,
        organizationsToUsers: {
          create: {
            user: {
              connect: {
                githubEmail: `profesor${i}@git.com`,
              },
            },
          },
        },
      },
    });

    for (let j = 0; j < 5; j++) {
      await prisma.sections.create({
        data: {
          name: `sekcja${i}${j}`,
          organization: {
            connect: {
              githubName: `ORGANIZACJA${i}`,
            },
          },
          sectionsToUsers: {
            create: {
              user: {
                connect: {
                  githubEmail: `profesor${i}@git.com`,
                },
              },
            },
          },
        },
      });

      for (let k = 0; k < 20; k++) {
        await prisma.users.create({
          data: {
            id: uuidv4(),
            name: `Student${i}${j}${k}`,
            surname: `Kowalski${i}${j}${k}`,
            githubEmail: `Student${i}${j}${k}@git.com`,
            studentEmail: `Student${i}${j}${k}@polsl.com`,
            approved: true,
            usersToRoles: {
              create: {
                role: {
                  connect: {
                    role: "Student",
                  },
                },
              },
            },
            sectionsToUsers: {
              create: {
                section: {
                  connect: {
                    id: (i+1)*(j+1)
                  },
                },
              },
            },
            organizationsToUsers: {
              create: {
                organization: {
                  connect: {
                    name: `ORGANIZACJA${i}`,
                  },
                },
              },
            },
            repositoriesToUsers: {
              create: {
                repository: {
                  create: {
                    link: `student-repository${i}${j}${k}`,
                    section: {
                      connect: {
                        id: (i+1)*(j+1),
                      },
                    },
                  },
                },
              },
            },
          },
        });
      }
    }
  }

  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 5; j++) {
      for (let k = 0; k < 20; k++) {
        await prisma.repositories.upsert({
          where: {
            link: `student-repository${i}${j}${k}`,
          },
          update: {
            repositoriesToUsers: {
              create: {
                user: {
                  connect: {
                    githubEmail: `profesor${i}@git.com`,
                  },
                },
              },
            },
          },
          create: {
            link: `utracone${i}${j}${k}`,
            section: {
              connect: {
                id: (i+1)*(j+1),
              },
            },
          },
        });
      }
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
