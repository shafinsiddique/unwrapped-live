# Install dependencies only when needed
FROM node:alpine AS deps
COPY . /app
WORKDIR /app
EXPOSE 3000
RUN npm run build
CMD ["npm","run","start"]