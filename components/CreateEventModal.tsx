import { Form, Modal, Input, DatePicker } from "antd"
import { SlotInfo } from "react-big-calendar"
import dayjs from "dayjs"
import { Event } from "@prisma/client"
import { useEffect, useState } from "react"
import { useSWRConfig } from "swr"

interface IProps {
  slotInfo: SlotInfo | null
  open: boolean
  handleCancel: () => void
}

const TIME_FORMAT = "h:mm a"
const DATE_TIME_FORMAT = `MM/DD/YYYY ${TIME_FORMAT}`

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
      <Form
        form={form}
        initialValues={getInitialValues()}
        labelCol={{ xs: 24, sm: 4 }}
        labelAlign="left"
        onFinish={handleCreateEvent}
      >
        <Form.Item label="Title" name="title">
          <Input placeholder="Add title" />
        </Form.Item>
        <Form.Item
          label="Start"
          name="start"
          required
          rules={[
            { required: true, message: "Please select start date and time" },
          ]}
        >
          <DatePicker
            format={DATE_TIME_FORMAT}
            showTime={{ format: TIME_FORMAT, minuteStep: 15 }}
            placeholder="Start date and time"
            allowClear={false}
          />
        </Form.Item>
        <Form.Item
          label="End"
          name="end"
          required
          rules={[
            { required: true, message: "Please select end date and time" },
          ]}
        >
          <DatePicker
            format={DATE_TIME_FORMAT}
            disabledDate={(current) => {
              if (!form.getFieldValue("start")) return false
              return current.isBefore(form.getFieldValue("start"))
            }}
            disabledTime={(current) => {
              if (!form.getFieldValue("start")) return {}
              if (current?.isSame(form.getFieldValue("start"), "day"))
                return {
                  disabledHours: () => {
                    const startHour = form.getFieldValue("start").hour()
                    const disabledHours = []
                    for (let i = 0; i < startHour; i++) {
                      disabledHours.push(i)
                    }
                    return disabledHours
                  },
                }
              return {}
            }}
            showTime={{ format: TIME_FORMAT, minuteStep: 15 }}
            placeholder="End date and time"
            allowClear={false}
          />
        </Form.Item>
        <Form.Item label="Description" name="description">
          <Input.TextArea placeholder="Add description" />
        </Form.Item>
      </Form>
    </Modal>
  )
}
