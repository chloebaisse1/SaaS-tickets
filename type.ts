import { Ticket as TicketComapny } from "@prisma/client"

export type Ticket = TicketComapny & {
  serviceName: string
  avgTime: number
}
