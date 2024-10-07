#!/bin/bash

yarn
./docker/update-ytdlp.sh

exec $@