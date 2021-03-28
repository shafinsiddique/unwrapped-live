FROM golang:1.14.3-alpine AS build
COPY . /app
WORKDIR /app/src/unwrapped-live
RUN go build -o unwrapped-live
CMD ["./unwrapped-live"]