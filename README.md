<h1 align="center">moshi-bot</h1>

moshi é um bot para discord que possibilita o streaming de musica dos principais provedores diretamente no discord

### ⭐ Tecnologias

- [Discord.js](https://github.com/discordjs/discord.js)
- [Typescript](https://www.typescriptlang.org/)
- [MongoDB](https://www.mongodb.com/)
- [Docker](https://www.docker.com/)
- [yt-dlp](https://github.com/yt-dlp/yt-dlp)

### 🧩 Pré-requisitos

Você deve ter instalado em sua máquina o ffmpeg

- [ffmpeg](https://www.ffmpeg.org/)

### ⚡ Instalação

1. Caso não tenha, você deve criar uma aplicação em [discord developers portal](https://discord.com/developers/applications)
2. Clone o repositório
   ```sh
   git clone https://github.com/uDaanilo/moshi-bot.git
   ```
3. Instale os pacotes
   ```sh
   yarn
   ```
4. Renomeie o arquivo <kbd>[.example.env](.example.env)</kbd> para `.env` e preencha com suas informações
   ```sh
   mv .example.env .env
   ```
5. Inicie o projeto
   ```sh
   yarn dev
   ```
