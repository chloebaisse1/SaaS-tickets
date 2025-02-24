"use client"
import { Ticket } from "@/type"
import { useUser } from "@clerk/nextjs"
import { useEffect, useState } from "react"
import { getPendingTicketsByEmail } from "./actions"
import EmptyState from "./components/EmptyState"
import TicketComponent from "./components/TicketComponent"
import Wrapper from "./components/Wrapper"

export default function Home() {
  const { user } = useUser()
  const email = user?.primaryEmailAddress?.emailAddress
  const [tickets, setTickets] = useState<Ticket[]>([])
  const fetchTickets = async () => {
    if (email) {
      try {
        const fetchedTickets = await getPendingTicketsByEmail(email)
        if (fetchedTickets) {
          setTickets(fetchedTickets)
        }
      } catch (error) {
        console.error(error)
      }
    }
  }
  useEffect(() => {
    fetchTickets()
  }, [email])

  return (
    <Wrapper>
      {tickets.length === 0 ? (
        <div>
          <EmptyState
            message={"Aucun tickets en attente"}
            IconComponent="Bird"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {tickets.map((ticket, index) => {
            const totalWaitTime = tickets
              .slice(0, index)
              .reduce((acc, prevTicket) => acc + prevTicket.avgTime, 0)

            return (
              <TicketComponent
                key={ticket.id}
                ticket={ticket}
                totalWaitTime={totalWaitTime}
                index={index}
              />
            )
          })}
        </div>
      )}
    </Wrapper>
  )
}
