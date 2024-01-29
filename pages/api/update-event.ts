import prisma from "@/lib/prisma"
import { Event } from "@prisma/client"
import { NextApiRequest, NextApiResponse } from "next"

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log(req.body)
  // For now, only allow put event.
  if (req.method !== "PUT") {
    res.status(405).json({ message: "Method not allowed" })
    return
  }
  const event = req.body as Event
  const result = await prisma.event.update({
    where: { id: event.id },
    data: { ...event },
  })
  res.json(result)
}
