FROM node:17

RUN apt-get update && \
    apt-get install ffmpeg -y

RUN curl -o /usr/local/bin/yt-dlp -L https://github.com/yt-dlp/yt-dlp/releases/download/2023.07.06/yt-dlp
RUN chmod +x /usr/local/bin/yt-dlp

WORKDIR /home/bot/moshi

COPY . .

RUN yarn

CMD [ "yarn", "dev" ]