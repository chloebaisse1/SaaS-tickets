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

    const pendingTickets = company.services.flatMap((service) =>
      service.tickets.map((ticket) => ({
        ...ticket,
        serviceName: service.name,
        avgTime: service.avgTime,
      }))
    )
    return pendingTickets
  } catch (error) {
    console.error(error)
  }
}
