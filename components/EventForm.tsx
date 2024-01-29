import { Client, Event } from "@prisma/client"
import { Form, Input, Select, DatePicker, Row, Spin } from "antd"
import form, { FormInstance } from "antd/es/form"
import { useEffect, useState } from "react"
import useSWR from "swr"

const TIME_FORMAT = "h:mm a"
const DATE_TIME_FORMAT = `MM/DD/YYYY ${TIME_FORMAT}`

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface IProps {
  form: FormInstance<Event>
  initialValues: any
  handleOnFinish: (values: Event) => void
}

export const EventForm = ({ form, initialValues, handleOnFinish }: IProps) => {
  const [clients, setClients] = useState<Client[] | null>(null)

  const { data, error, isLoading } = useSWR("/api/get-clients", fetcher)

  useEffect(() => {
    if (!data) return
    setClients(JSON.parse(data))
  }, [data])

  if (error) {
    return (
      <Row justify="center" align="middle">
        <p>There was an error fetching clients</p>
      </Row>
    )
  }

  if (isLoading) {
    return (
      <Row justify="center" align="middle">
        <Spin size="large" />
      </Row>
    )
  }

  return (
    <Form
      form={form}
      initialValues={initialValues}
      labelCol={{ xs: 24, sm: 4 }}
      labelAlign="left"
      onFinish={handleOnFinish}
    >
      <Form.Item label="Title" name="title">
        <Input placeholder="Add title" />
      </Form.Item>
      <Form.Item label="Client" name="clientId">
        <Select
          placeholder="Select a client"
          allowClear
          options={clients?.map((client) => ({
            value: client.id,
            label: client.name,
          }))}
        />
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
        rules={[{ required: true, message: "Please select end date and time" }]}
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
  )
}
