FROM node:18-alpine as base
RUN mkdir /app
COPY . /app
WORKDIR /app
RUN npm install
RUN npm install -g ts-node-dev