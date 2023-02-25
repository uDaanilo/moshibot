import Guild from "../../db/models/Guild"
import GuildPlayer from "./guild_player"
import Track from "./track"

export class PlayerController {
  constructor(private guildPlayer: GuildPlayer) {}

  public stop() {
    this.guildPlayer.playing = false
    this.guildPlayer.queue.clear()
    this.guildPlayer.audioPlayer.stop()
  }

  public async setVolume(vol: number) {
    this.guildPlayer.volume = vol

    await Guild.updateOne(
      { id: this.guildPlayer.guild.db.id },
      {
        $set: {
          volume: vol,
        },
      }
    )
  }

  public pause() {
    this.guildPlayer.playing = false
    this.guildPlayer.audioPlayer.pause()
  }

  public resume() {
    this.guildPlayer.playing = true
    this.guildPlayer.audioPlayer.unpause()
  }

  public jump(to: number): Track {
    this.guildPlayer.queue.jumpTo(to - 1)
    this.guildPlayer.audioPlayer.stop()
    return this.guildPlayer.queue.tracks[1]
  }

  public toggleRepeat() {
    this.guildPlayer.repeat = !this.guildPlayer.repeat
  }

  public toggleShuffle() {
    this.guildPlayer.shuffle = !this.guildPlayer.shuffle
  }
}
