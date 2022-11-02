FROM node:18-alpine as base
WORKDIR /src/
COPY ./package.json /src/package.json
RUN npm install
COPY . /
EXPOSE 3000