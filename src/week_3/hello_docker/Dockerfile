FROM alpine:3.24
RUN mkdir -p /app
WORKDIR /app
ENV COUNT=10
ENV STRING="Hello Docker!"
ENV NUMBER=8
COPY factorial.sh fibonacci.sh reverse_string.sh /app/
RUN chmod +x /app/factorial.sh /app/fibonacci.sh /app/reverse_string.sh