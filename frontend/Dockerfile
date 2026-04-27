FROM node:24-alpine3.22
WORKDIR /app
COPY package*.json ./
RUN npm install -g live-server
RUN npm install
COPY . .
RUN npm run build
CMD [ "npm","run","start" ]