import mongoose from "mongoose"
import { logger } from "../utils/logger"

logger.info("[DB] Connecting...")

mongoose
  .connect(process.env.DB_URL)
  .then(() => logger.info("[DB] Connected!"))
  .catch((err) => {
    throw new Error(err)
  })
