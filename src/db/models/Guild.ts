import mongoose from "mongoose"

export interface IGuild {
  id: string
  name: string
  population: number
  prefix: string
  owner: string
  playChannelId: string
  volume: number
  playerChannel?: {
    ch: string
    msg: string
  }
}

const Guild = new mongoose.Schema<IGuild>(
  {
    id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    population: {
      type: Number,
      required: true,
    },
    prefix: {
      type: String,
      required: true,
      default: "m+",
    },
    owner: {
      type: String,
      required: true,
    },
    playChannelId: {
      type: String,
      default: null,
    },
    volume: {
      type: Number,
      default: 50,
    },
    playerChannel: {
      type: Object,
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.model<IGuild>("guilds", Guild)
