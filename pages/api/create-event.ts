import prisma from "@/lib/prisma"
import { Event } from "@prisma/client"
import { NextApiRequest, NextApiResponse } from "next"

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // For now, only allow post event.
  if (req.method !== "POST") {
    res.status(405).json({ message: "Method not allowed" })
    return
  }
  const event = req.body as Event
  const result = await prisma.event.create({ data: event })
  res.json(result)
}
