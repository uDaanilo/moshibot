import mongoose from 'mongoose'

export interface IGuild {
  id: string
  name: string
  population: number
  prefix: string
  owner: string
  welcomeChannel: string
  playerChannel?: {
    ch: string
    msg: string
  }
}

const Guild = new mongoose.Schema<IGuild>({
    id: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    population: {
        type: Number,
        required: true
    },
    prefix: {
        type: String,
        required: true,
        default: "m+"
    },
    owner: {
        type: String,
        required: true
    }
}, {
    timestamps: true
})

export default mongoose.model<IGuild>("guilds", Guild)