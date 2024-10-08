import mongoose from "mongoose"
import { logger } from "../utils/logger"

logger.info("[DB] Connecting...")

if (typeof process.env.DB_URL !== "string") {
  logger.error("Environment variable 'DB_URL' is not defined!")
  process.exit(1)
}

mongoose
  .connect(process.env.DB_URL)
  .then(() => logger.info("[DB] Connected!"))
  .catch((err) => {
    throw new Error(err)
  })
