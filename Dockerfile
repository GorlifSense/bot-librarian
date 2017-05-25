FROM node:7-alpine

WORKDIR /usr/app

COPY package.json ./
RUN npm install

COPY app.js ./
COPY bin ./bin
