import { readdir } from "fs"
import path from "path"
import { ICommand, IMessage } from "../types"

class CommandsHandler {
  public commands = new Map<string, ICommand[]>()

  public registerCommands() {
    console.log('[BOT] Registering commands...')

    readdir(path.join(__dirname, '..', 'commands'), null, (err, commandsFolders) => {
      if(err) return console.log(err)
      
      commandsFolders = commandsFolders.filter(f => f.search('.ts') == -1 && f.search('.js') == -1)

      commandsFolders.forEach(folder => {
        readdir(path.join(__dirname, folder), null, (err, cmds) => {
          if(err) return console.log(err)
          if(!folder) return
          
          cmds = cmds.map(cmd => cmd.split('.')[0])

          cmds.forEach(cmd => {
            const registerCmd = require(`./${folder}/${cmd}`)

            if(typeof registerCmd !== "object" || !registerCmd.default) return

            const otherCommands = this.commands.get(folder) || []

            otherCommands.push({
              command: cmd,
              ...registerCmd.default
            })

            this.commands.set(folder, otherCommands)
          })
        })
      })
    })
  }
  
  public runCommand(msg: IMessage) {
    this.commands.forEach((commands, module) => {
      commands.forEach(cmd => {
        if(cmd.command == msg.cmd || cmd.alias && cmd.alias == msg.cmd) {
        if(module == 'dev' && msg.author.id !== process.env.OWNER_ID) return

          cmd.run(msg)
        }
      })
    })
  }
}

export default CommandsHandler