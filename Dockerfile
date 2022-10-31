FROM node:18-alpine as base
WORKDIR /src
EXPOSE 3000
COPY . /
RUN npm i express-openid-connect
RUN npm install