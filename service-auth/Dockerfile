FROM node:alpine3.17 as builder

WORKDIR /app/service-auth

COPY package.json ./

RUN npm install

COPY . .

RUN npm run build
# RUN rm -rf src

FROM node:alpine3.17

ENV NODE_ENV production
# USER node

WORKDIR /app/service-auth

COPY package.json ./

RUN npm install --production

COPY --from=builder /app/service-auth/dist ./dist
RUN npm i pm2 -g

EXPOSE 8080
CMD [ "pm2-runtime","start", "dist/app.js" ]