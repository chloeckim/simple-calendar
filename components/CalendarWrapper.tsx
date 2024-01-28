import { dayjsLocalizer, Calendar } from "react-big-calendar"
import dayjs from "dayjs"
import { Event } from "@prisma/client"

const localizer = dayjsLocalizer(dayjs)

interface IProps {
  events: Event[]
}

export const CalendarWrapper = ({ events }: IProps) => {
  const bigCalendarvents = events.map((prismaEvent) => ({
    id: prismaEvent.id,
    title: prismaEvent.name,
    start: prismaEvent.start,
    end: prismaEvent.end,
  }))

  console.log(bigCalendarvents)

  const handleSelectEvent = (event: Object) => {
    console.log(event)
  }

  return (
    <Calendar
      localizer={localizer}
      events={bigCalendarvents}
      startAccessor="start"
      endAccessor="end"
      onSelectEvent={handleSelectEvent}
      style={{
        width: "80%",
        height: "80%",
        margin: "auto",
        marginTop: 24,
      }}
    />
  )
}
