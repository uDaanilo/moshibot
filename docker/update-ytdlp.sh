#!/bin/sh

json=$(wget -qO- https://api.github.com/repos/yt-dlp/yt-dlp/releases/latest)

download_url=$(echo "$json" | jq -r '.assets[] | select(.name == "yt-dlp").browser_download_url')

latest_release=$(echo "$json" | jq -r '.tag_name')
current_release=$(yt-dlp --version)

echo "Verifying yt-dlp version"
if [ "$latest_release" != "$current_release" ]; then
    echo "Updating yt-dlp from $current_release to $latest_release"
    wget -qO /usr/local/bin/yt-dlp $download_url
    chmod +x /usr/local/bin/yt-dlp
    echo "yt-dlp updated successfully"
else
    echo "yt-dlp is already up to date"
fi