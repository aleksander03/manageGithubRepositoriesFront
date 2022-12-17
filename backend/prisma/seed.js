import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  await prisma.roles.createMany({
    data: [
      {role: "Profesor"},
      {role: "Student"},
      {role: "Administrator"},
    ]
  })

  await prisma.users.create({
    data: {
      name: "Aleksander",
      surname: "Uljaniwski",
      githubEmail: "indoras@o2.pl",
      studentEmail: "alekulj284@student.polsl.pl",
      usersToRoles: {
        create: {
          role: {
            connect: {
              role: "Profesor"
            }
          }
        }
      }
    }
  })

  for (let i = 0; i < 10; i++) {
    await prisma.users.create({
      data: {
        name: `Profesor${i}`,
        surname: `Nowak${i}`,
        githubEmail: `profesor${i}@git.com`,
        usersToRoles: {
          create: {
            role: {
              connect: {
                role: "Profesor"
              }
            }
          }
        }
      },
    });
  }

  await prisma.organizations.createMany({
    data: [
      {name: `org1`, githubName: `org1`, link: `ogr1.git.com`},
      {name: `org2`, githubName: `org2`, link: `ogr2.git.com`},
      {name: `org3`, githubName: `org3`, link: `ogr3.git.com`},
      {name: `org4`, githubName: `org4`, link: `ogr4.git.com`},
      {name: `org5`, githubName: `org5`, link: `ogr5.git.com`}
    ]
  })

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
            name: `Student${i}${j}${k}`,
            surname: `Kowalski${i}${j}${k}`,
            githubEmail: `Student${i}${j}${k}@git.com`,
            studentEmail: `Student${i}${j}${k}@polsl.com`,
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
                    name: `sekcja${i}${j}`,
                  },
                },
              },
            },
            organisationsToUsers: {
              create: {
                organisation: {
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
                        name: `sekcja${i}${j}`,
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
                name: `sekcja${i}${j}`,
              },
            },
          },
        });
      }
    }
  }
}

main().then(async () => {
  await prisma.$disconnect()
}).catch(async (e) => {
  console.error(e)
  await prisma.$disconnect()
  process.exit(1)
})