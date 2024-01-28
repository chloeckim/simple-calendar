import { Event } from "@prisma/client"
import { Typography, Modal } from "antd"

const { Paragraph } = Typography

interface IProps {
  event: Event | null
  open: boolean
  handleCancel: () => void
}

export const EventDetailsModal = ({ event, open, handleCancel }: IProps) => {
  return (
    <Modal
      title={event?.title}
      open={open}
      footer={null}
      onCancel={handleCancel}
    >
      {event && <Paragraph>{event.description}</Paragraph>}
    </Modal>
  )
}
