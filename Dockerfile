FROM node:18-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .          

ARG VITE_FASTAPI_URI
ENV VITE_FASTAPI_URI=$VITE_FASTAPI_URI

RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80