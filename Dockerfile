FROM node:16

WORKDIR /usr/src/app

COPY package.json ./
COPY yarn.lock ./
RUN yarn --production
COPY . .
RUN yarn build
# RUN npm install pm2 -g
# CMD ["pm2-runtime", "index.ts", "-i", "max"]