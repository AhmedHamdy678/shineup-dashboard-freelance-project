# syntax=docker/dockerfile:1.7

FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_API_BASE_URL=/api/v1
ARG VITE_SOCKET_URL=https://api-dev.shineupapp.tech
ARG VITE_USE_MOCK_DATA=false

ENV VITE_API_BASE_URL=${VITE_API_BASE_URL} \
    VITE_SOCKET_URL=${VITE_SOCKET_URL} \
    VITE_USE_MOCK_DATA=${VITE_USE_MOCK_DATA}

RUN npm run build
RUN test -f dist/index.html

FROM nginx:1.27-alpine AS runner

ENV BACKEND_ORIGIN=https://api-dev.shineupapp.tech

COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1/healthz >/dev/null 2>&1 || exit 1

CMD ["nginx", "-g", "daemon off;"]
