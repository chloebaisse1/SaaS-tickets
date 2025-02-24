/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use server"

import prisma from "@/lib/prisma"

export async function checkAddUser(email: string, name: string) {
  if (!email) return
  try {
    const existingUser = await prisma.company.findUnique({
      where: {
        email: email,
      },
    })

    if (!existingUser && name) {
      await prisma.company.create({
        data: {
          email,
          name,
        },
      })
    }
  } catch (error) {
    console.error(error)
  }
}

export async function createService(
  email: string,
  serviceName: string,
  avgTime: number
) {
  if (!email || !serviceName || !avgTime == null) return
  try {
    const existingCompany = await prisma.company.findUnique({
      where: {
        email: email,
      },
    })
    if (existingCompany) {
      const newService = await prisma.service.create({
        data: {
          name: serviceName,
          avgTime: avgTime,
          companyId: existingCompany.id,
        },
      })
    } else {
      console.log(`No Company found with email ${email}`)
    }
  } catch (error) {
    console.error(error)
  }
}

export async function getServiceByEmail(email: string) {
  if (!email) return
  try {
    const company = await prisma.company.findUnique({
      where: {
        email: email,
      },
    })
    if (!company) {
      throw new Error("Aucunes entreprise trouvée avec cet email")
    }

    const services = await prisma.service.findMany({
      where: {
        companyId: company.id,
      },
      include: { company: true },
    })

    return services
  } catch (error) {
    console.error(error)
  }
}

export async function deleteServiceById(serviceId: string) {
  if (!serviceId) return
  try {
    const service = await prisma.service.findUnique({
      where: {
        id: serviceId,
      },
    })
    await prisma.service.delete({
      where: { id: serviceId },
    })
  } catch (error) {
    console.error(error)
  }
}

export async function getCompanyPageName(email: string) {
  try {
    const company = await prisma.company.findUnique({
      where: {
        email: email,
      },
      select: {
        pageName: true,
      },
    })

    if (company) {
      return company.pageName
    }
  } catch (error) {
    console.error(error)
  }
}

export async function setCompanyPageName(email: string, pageName: string) {
  try {
    const company = await prisma.company.findUnique({
      where: {
        email: email,
      },
    })
    await prisma.company.update({
      where: { email },
      data: { pageName },
    })
  } catch (error) {
    console.error(error)
  }
}

export async function getServicesByPageName(pageName: string) {
  try {
    const company = await prisma.company.findUnique({
      where: {
        pageName: pageName,
      },
    })

    if (!company) {
      throw new Error(
        `Aucune entreprise trouvée avec le nom page : ${pageName}`
      )
    }

    const services = await prisma.service.findMany({
      where: { companyId: company?.id },
      include: {
        company: true,
      },
    })

    return services
  } catch (error) {
    console.error(error)
  }
}

export async function createTicket(
  serviceId: string,
  nameComplete: string,
  pageName: string
) {
  try {
    const company = await prisma.company.findUnique({
      where: {
        pageName: pageName,
      },
    })
    if (!company) {
      throw new Error(
        `Aucune entreprise trouvée avec le nom de la page : ${pageName}`
      )
    }

    const ticketNum = `A${Math.floor(Math.random() * 10000)}`

    const ticket = await prisma.ticket.create({
      data: {
        serviceId,
        nameComplete,
        num: ticketNum,
        status: "PENDING",
      },
    })

    return ticketNum
  } catch (error) {
    console.error(error)
  }
}

export async function getPendingTicketsByEmail(email: string) {
  try {
    const company = await prisma.company.findUnique({
      where: {
        email: email,
      },
      include: {
        services: {
          include: {
            tickets: {
              where: {
                status: {
                  in: ["PENDING", "CALL", "IN_PROGRESS"],
                },
              },
              orderBy: {
                createdAt: "asc",
              },
              include: {
                post: true,
              },
            },
          },
        },
      },
    })

    if (!company) {
      throw new Error(
        `Aucune entreprise trouvée avec le nom de la page : ${email}`
      )
    }

    let pendingTickets = company.services.flatMap((service) =>
      service.tickets.map((ticket) => ({
        ...ticket,
        serviceName: service.name,
        avgTime: service.avgTime,
      }))
    )
    pendingTickets = pendingTickets.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )

    return pendingTickets
  } catch (error) {
    console.error(error)
  }
}

export async function getTicketsByIds(ticketNums: any[]) {
  try {
    const tickets = await prisma.ticket.findMany({
      where: {
        num: {
          in: ticketNums,
        },
      },
      orderBy: {
        createdAt: "asc",
      },
      include: {
        service: true,
        post: true,
      },
    })

    if (tickets.length === 0) {
      throw new Error("Aucuns tickets trouvé")
    }
    return tickets.map((ticket) => ({
      ...ticket,
      serviceName: ticket.service.name,
      avgTime: ticket.service.avgTime,
    }))
  } catch (error) {
    console.error(error)
  }
}

export async function createPost(email: string, postName: string) {
  try {
    const company = await prisma.company.findUnique({
      where: {
        email: email,
      },
    })

    if (!company) {
      throw new Error(`Aucune entreprise trouvée avec cet email`)
    }
    const newPost = await prisma.post.create({
      data: {
        name: postName,
        companyId: company.id,
      },
    })
  } catch (error) {
    console.error(error)
  }
}

export async function deletePost(postId: string) {
  try {
    await prisma.post.delete({
      where: {
        id: postId,
      },
    })
  } catch (error) {
    console.error(error)
  }
}

export async function getPostsByCompanyEmail(email: string) {
  try {
    const company = await prisma.company.findUnique({
      where: {
        email: email,
      },
    })
    if (!company) {
      throw new Error("Aucune entreprise trouvée avec cet email")
    }

    const posts = await prisma.post.findMany({
      where: {
        companyId: company.id,
      },
      include: {
        company: true,
      },
    })
    return posts
  } catch (error) {
    console.error(error)
  }
}
