FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache tzdata

ENV TZ=Europe/Paris

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "start"]