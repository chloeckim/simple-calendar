import { dayjsLocalizer, Calendar, SlotInfo } from "react-big-calendar"
import dayjs from "dayjs"
import { Event } from "@prisma/client"
import { useEffect, useMemo, useState } from "react"
import { EventDetailsModal } from "./EventDetailsModal"
import { CreateEventModal } from "./CreateEventModal"
import { Row, Spin } from "antd"
import useSWR from "swr"
import { EditEventModal } from "./EditEventModal"

const localizer = dayjsLocalizer(dayjs)

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export const CalendarWrapper = () => {
  const [events, setEvents] = useState<Event[] | null>(null)
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [slotInfo, setSlotInfo] = useState<SlotInfo | null>(null)

  const { data, error, isLoading } = useSWR("/api/get-events", fetcher)

  useEffect(() => {
    if (!data) return
    setEvents(JSON.parse(data))
  }, [data])

  const eventMap = useMemo(() => {
    if (!events) return {}
    const map: Record<string, Event> = {}
    events.forEach((event: Event) => {
      map[event.id] = event
    })
    return map
  }, [events])

  const bigCalendarvents = useMemo(() => {
    if (!events) return []
    return events.map((prismaEvent: Event) => ({
      id: prismaEvent.id,
      title: prismaEvent.title,
      start: prismaEvent.start,
      end: prismaEvent.end,
    }))
  }, [events])

  if (error) {
    return (
      <Row justify="center" align="middle" style={{ height: "100vh" }}>
        <p>There was an error fetching events</p>
      </Row>
    )
  }

  if (isLoading) {
    return (
      <Row justify="center" align="middle" style={{ height: "100vh" }}>
        <Spin size="large" />
      </Row>
    )
  }

  return (
    <>
      <Calendar
        localizer={localizer}
        events={bigCalendarvents}
        startAccessor="start"
        endAccessor="end"
        selectable
        onSelectEvent={(event) => setSelectedEventId(event.id)}
        onSelectSlot={(slotInfo) => setSlotInfo(slotInfo)}
        style={{
          width: "80%",
          height: "80%",
          margin: "auto",
          marginTop: 24,
        }}
      />
      <EventDetailsModal
        event={selectedEventId ? eventMap[selectedEventId] : null}
        open={!!selectedEventId}
        handleCancel={() => setSelectedEventId(null)}
      />
      <EditEventModal
        event={selectedEventId ? eventMap[selectedEventId] : null}
        open={!!selectedEventId}
        handleCancel={() => setSelectedEventId(null)}
      />
      <CreateEventModal
        slotInfo={slotInfo}
        open={!!slotInfo}
        handleCancel={() => setSlotInfo(null)}
      />
    </>
  )
}
