FROM node:current-alpine
RUN npm install -g pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . ./

EXPOSE 9010
CMD ["pnpm", "next", "dev", "--turbopack", "-p", "9010"]
