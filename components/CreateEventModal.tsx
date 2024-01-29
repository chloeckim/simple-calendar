import { Form, Modal, Input, DatePicker, Select, Row, Spin } from "antd"
import { SlotInfo } from "react-big-calendar"
import dayjs from "dayjs"
import { Client, Event } from "@prisma/client"
import { useEffect, useState } from "react"
import useSWR, { useSWRConfig } from "swr"
import { EventForm } from "./EventForm"

interface IProps {
  slotInfo: SlotInfo | null
  open: boolean
  handleCancel: () => void
}

export const CreateEventModal = ({ slotInfo, open, handleCancel }: IProps) => {
  const { mutate } = useSWRConfig()

  const [form] = Form.useForm<Event>()
  const [saving, setSaving] = useState<boolean>(false)
  const start = Form.useWatch("start", form)
  const end = Form.useWatch("end", form)

  const getInitialValues = () => {
    if (!slotInfo || !slotInfo.slots.length) return {}

    const now = dayjs()
    const start = dayjs(slotInfo.slots[0])
      .hour(now.hour())
      .add(1, "hour")
      .startOf("hour")
    const end =
      slotInfo.slots.length === 1
        ? start.add(30, "minutes")
        : dayjs(slotInfo.slots[slotInfo.slots.length - 1])
            .hour(now.hour())
            .add(1, "hour")
            .startOf("hour")
    return {
      start,
      end,
    }
  }

  useEffect(() => {
    form.setFieldsValue(getInitialValues())
  }, [slotInfo])

  useEffect(() => {
    if (!start) return
    if (form.getFieldValue("end")?.isBefore(start)) {
      form.setFieldsValue({ end: dayjs(start).add(30, "minutes") })
    }
  }, [start])

  useEffect(() => {
    if (!end) return
    if (form.getFieldValue("start")?.isAfter(end)) {
      form.setFieldsValue({ start: dayjs(end).subtract(30, "minutes") })
    }
  }, [end])

  const handleCreateEvent = async () => {
    try {
      setSaving(true)
      await fetch("/api/create-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form.getFieldsValue()),
      })
      await mutate("/api/get-events")
    } catch (error) {
      console.error(error)
    } finally {
      setSaving(false)
      handleCancel()
      form.resetFields()
    }
  }

  return (
    <Modal
      title="Create Event"
      open={open}
      width={600}
      onCancel={() => {
        form.resetFields()
        handleCancel()
      }}
      onOk={() => form.submit()}
      okText="Create"
      okButtonProps={{ loading: saving }}
      cancelButtonProps={{ disabled: saving }}
      style={{ maxWidth: "100%" }}
      styles={{ body: { paddingTop: 24 } }}
    >
      <EventForm
        form={form}
        initialValues={getInitialValues()}
        handleOnFinish={handleCreateEvent}
      />
    </Modal>
  )
}
