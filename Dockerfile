## Multi stage
# Build stage

FROM node:20.18.3-alpine3.20 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .

# Production stage

FROM node:20.18.3-alpine3.20

# create a non-root user (appuser) and group (appgroup) for security purposes
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/env.js ./
COPY --from=builder /app/index.js ./
COPY --from=builder /app/errors.js ./
COPY --from=builder /app/loader.cjs ./

RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 4000

# loader.cjs is the entry point of the application
CMD ["node", "loader.cjs"]
