import ytdl from 'ytdl-core'
import Youtube from 'youtube-sr'
import { SoundCloud, Track } from 'scdl-core'
import { getData, getTracks } from 'spotify-url-info'
import formatDuration from '../../utils/formatDuration'
import { IMessage, ISong } from '../../types'
import Player from './player'

let scdl = new SoundCloud()

class GetSongInfo {
  private song: ISong | ISong[]
  private player: Player

  async init(msg: IMessage): Promise<ISong | ISong[]> {
    this.player = msg.client.player

    if(msg.args.search('youtube.com') !== -1) {
      if(msg.args.search('https://music.') !== -1){
        msg.args = msg.args.slice('https://music.'.length)
        msg.args = 'https://' + msg.args
      }
  
      if(msg.args.search('playlist') !== -1){
        this.song = await this.ytGetPlaylistByLink(msg.args)
        this.player.emit('playlistAdd', msg)
      } else {
        if(!ytdl.validateURL(msg.args)) {
          this.song = null
        } else {
          this.song = await this.ytGetSongByLink(msg.args)
        }
      }
    } else if(msg.args.search('soundcloud.com') !== -1) {

      this.song = await this.scGetSongByLink(msg.args)
  
    } else if(msg.args.search('--sc')  !== -1) {
      msg.args = msg.args.split('--sc')[0].trim()
  
      this.song = await this.scGetSongByKeyword(msg.args)
    } else if(msg.args.search('spotify.com') !== -1) {
      if(msg.args.search('track') !== -1) {
        this.song = await this.spotifyGetSongByLink(msg.args)
      } else if(msg.args.search('playlist') !== -1 || msg.args.search('album') !== -1) {
        this.song = await this.spotifyGetPlaylistByLink(msg.args)
        this.player.emit('playlistAdd', msg)
      } else {
        this.song = null
      }
    } else {
      try {
        this.song = await this.ytGetSongByKeyword(msg.args)
      } catch (err) {
        console.log(err)
  
        msg.reply(':warning: **|** Ocorreu um erro com o Youtube, pesquisando no SoundCloud')
  
        this.song = await this.scGetSongByKeyword(msg.args) as ISong
      }
    }
    
    if(!this.song) throw new Error('Song not found')

    if(Array.isArray(this.song)) {
      this.song = this.song.map(track => ({ ...track, requester: msg.member.user }))
    } else {
      this.song.requester = msg.member.user
    }

    return this.song
  }

  public async ytGetSongByLink(url): Promise<ISong> {
    let songInfo = await ytdl.getInfo(url)
      
    const song = {
      title: songInfo.videoDetails.title,
      url: songInfo.videoDetails.video_url,
      duration: formatDuration(songInfo.videoDetails.lengthSeconds),
      lengthSeconds: parseInt(songInfo.videoDetails.lengthSeconds),
      thumbnail: songInfo.videoDetails.thumbnails[(songInfo.videoDetails.thumbnails.length - 1)].url,
      channel: songInfo.videoDetails.author.name,
      live: songInfo.videoDetails.isLiveContent
    }

    return song
  }

  public async ytGetSongByKeyword(keyword): Promise<ISong> {
    const songInfo = await Youtube.searchOne(keyword, 'video')
  
    if(!songInfo) return null
  
    const song = {
      title: songInfo.title,
      url: `https://www.youtube.com/watch?v=${songInfo.id}`,
      duration: songInfo.durationFormatted,
      lengthSeconds: songInfo.duration / 1000,
      thumbnail: songInfo.thumbnail.url,
      channel: songInfo.channel.name,
    }
  
    return song
  }
  
  public async ytGetPlaylistByLink(url): Promise<ISong[]> {
    const songsInfo = await Youtube.getPlaylist(url)
  
    const songs = songsInfo.videos.map(song => ({
      title: song.title,
      url: `https://www.youtube.com/watch?v=${song.id}`,
      duration: song.durationFormatted,
      lengthSeconds: song.duration / 1000,
      thumbnail: song.thumbnail.url,
      channel: song.channel.name,
    }))
  
    return songs
  }
  
  public async scGetSongByLink(url) {
    await scdl.connect()
  
    let songInfo = await scdl.tracks.getTrack(url)
  
    if(!songInfo) return null
  
    const song = {
      title: songInfo.title,
      url: songInfo.permalink_url,
      duration: formatDuration(songInfo.full_duration / 1000),
      lengthSeconds: songInfo.full_duration / 1000,
      thumbnail: songInfo.artwork_url ? songInfo.artwork_url.replace('large', 't500x500') : '',
      channel: songInfo.user.username,
      stream: async () => await scdl.download(songInfo.permalink_url),
    }
  
    return song
  }
  
  public async scGetSongByKeyword(query) {
    await scdl.connect()
    
    let scSearch = await scdl.search({ query, limit: 1, filter: 'tracks' })
    let songInfo = scSearch.collection[0] as Track
  
    if(!songInfo) return null
  
    const song = {
      title: songInfo.title,
      url: songInfo.permalink_url,
      duration: formatDuration(songInfo.full_duration / 1000),
      lengthSeconds: songInfo.full_duration / 1000,
      thumbnail: songInfo.artwork_url ? songInfo.artwork_url.replace('large', 't500x500') : '',
      channel: songInfo.user.username,
      stream: async () => await scdl.download(songInfo.permalink_url),
    }
  
    return song
  }
  
  public async spotifyGetSongByLink(url) {
    const songInfo = await getData(url)
  
    if(!songInfo) return null
  
    const song = {
      title: songInfo.name,
      url: songInfo.external_urls.spotify,
      duration: formatDuration(songInfo.duration_ms / 1000),
      lengthSeconds: songInfo.duration_ms / 1000,
      thumbnail: songInfo.album.images[0].url,
      channel: songInfo.artists[0].name,
      stream: null
    }
  
    const video = await this.ytGetSongByKeyword(`${song.title} ${song.channel}`)
    
    if(!video || !video.url) return null
    
    song.stream = () => ytdl(video.url)
  
    return song
  }

  public async spotifyGetPlaylistByLink(url): Promise<ISong[]> {
    const songs = await getTracks(url)
  
    var songsFormatted = songs.map(async song => {
      const video = await this.ytGetSongByKeyword(`${song.name} ${song.artists[0].name}`).catch()

      if(!video || !video.url) return
      const songInfo = await ytdl.getInfo(video.url)
  
      return {
        title: songInfo.videoDetails.title,
        url: songInfo.videoDetails.video_url,
        duration: formatDuration(songInfo.videoDetails.lengthSeconds),
        lengthSeconds: parseInt(songInfo.videoDetails.lengthSeconds),
        thumbnail: songInfo.videoDetails.thumbnails[(songInfo.videoDetails.thumbnails.length - 1)].url,
        channel: songInfo.videoDetails.author.name,
      }
    })

    //@ts-ignore
    songsFormatted = await Promise.all(songsFormatted)

    //@ts-ignore
    return songsFormatted
  }
}

export default GetSongInfo