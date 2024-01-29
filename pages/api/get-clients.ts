import prisma from "@/lib/prisma"
import { NextApiRequest, NextApiResponse } from "next"

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // For now, only allow get event.
  if (req.method !== "GET") {
    res.status(405).json({ message: "Method not allowed" })
    return
  }
  const clients = await prisma.client.findMany()
  res.json(JSON.stringify(clients))
}
