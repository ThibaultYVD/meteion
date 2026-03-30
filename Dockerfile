FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache tzdata

ENV TZ=Europe/Paris

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

EXPOSE 3000

CMD ["sh", "-c", "node scripts/deploy-commands.js && node src/index.js"]