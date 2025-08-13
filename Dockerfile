# --- Etapa de build ---
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Si no tienes paso de build, no falla:
RUN npm run build || echo "no build step"

# --- Runtime ---
FROM node:18-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app ./
RUN npm ci --omit=dev

# Script de arranque con fallback: server-index.js -> index.js -> server.js
RUN printf '#!/bin/sh\nset -e\nif [ -f "/app/${ENTRYPOINT:-server-index.js}" ]; then node "/app/${ENTRYPOINT:-server-index.js}"; elif [ -f "/app/index.js" ]; then node /app/index.js; elif [ -f "/app/server.js" ]; then node /app/server.js; else echo "No encuentro entrypoint"; exit 1; fi\n' > /usr/local/bin/start-crm && chmod +x /usr/local/bin/start-crm

EXPOSE 4000
CMD ["start-crm"]