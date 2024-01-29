import { Event } from "@prisma/client"
import { Typography, Modal, Form } from "antd"
import { EventForm } from "./EventForm"
import { useEffect, useState } from "react"
import { useSWRConfig } from "swr"
import dayjs from "dayjs"

interface IProps {
  event: Event | null
  open: boolean
  handleCancel: () => void
}

export const EditEventModal = ({ event, open, handleCancel }: IProps) => {
  const { mutate } = useSWRConfig()

  const [form] = Form.useForm<Event>()
  const [saving, setSaving] = useState<boolean>(false)

  useEffect(() => {
    console.log(form.getFieldsValue())
  }, [form])

  useEffect(() => {
    form.setFieldsValue(getInitialValues())
  }, [event])

  const handleEditEvent = async () => {
    // Once the schema gets more complicated, we can try to optimize by
    // only updating the fields that have changed.
    // AntD form doesn't provide such a great interface for this, but
    // we could use something like isFieldsTouched().
    const payload = {
      ...form.getFieldsValue(),
      id: event?.id,
      start: form.getFieldValue("start").toDate(),
      end: form.getFieldValue("end").toDate(),
    }
    try {
      setSaving(true)
      await fetch("/api/update-event", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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

  const getInitialValues = () => {
    if (!event) return {}
    return {
      ...event,
      start: dayjs(event.start),
      end: dayjs(event.end),
    }
  }

  return (
    <Modal
      title="Edit Event"
      open={open}
      width={600}
      onCancel={() => {
        form.resetFields()
        handleCancel()
      }}
      onOk={() => form.submit()}
      okText="Update"
      okButtonProps={{ loading: saving }}
      cancelButtonProps={{ disabled: saving }}
      style={{ maxWidth: "100%" }}
      styles={{ body: { paddingTop: 24 } }}
    >
      <EventForm
        form={form}
        initialValues={getInitialValues()}
        handleOnFinish={handleEditEvent}
      />
    </Modal>
  )
}
