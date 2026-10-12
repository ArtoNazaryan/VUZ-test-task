FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG VITE_API_URL=http://localhost:3000/api/v1
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

FROM nginxinc/nginx-unprivileged:1.29-alpine AS runtime
USER root
RUN sed -i 's/error.log notice;/error.log warn;/' /etc/nginx/nginx.conf
USER nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --chmod=755 docker-banner.sh /docker-entrypoint.d/99-print-urls.sh
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
