FROM node:20.11

RUN apt-get update && \
    apt-get install ffmpeg jq -y

RUN curl -o /usr/local/bin/yt-dlp -L https://github.com/yt-dlp/yt-dlp/releases/download/2024.09.27/yt-dlp
RUN chmod +x /usr/local/bin/yt-dlp

WORKDIR /home/bot/moshi

COPY . .

RUN yarn

CMD [ "yarn", "dev" ]