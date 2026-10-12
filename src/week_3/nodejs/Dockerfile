FROM alpine:3.24

RUN mkdir -p /app
WORKDIR /app

RUN apk add --update nodejs=24.18.1-r0 npm=11.12.1-r0
COPY --chmod=+x ./ /app/
RUN npm i


RUN apk add --update postgresql18 postgresql18-client
RUN mkdir -p /run/postgresql /postgresql/data \
 && chown -R postgres:postgres /run/postgresql /postgresql \
 && su postgres -c "initdb -D /postgresql/data --auth=trust" \
 && su postgres -c "pg_ctl -D /postgresql/data -w start" \
 && su postgres -c "createdb testapp" \
 && npm run migrate \
 && su postgres -c "pg_ctl -D /postgresql/data -m fast -w stop"

EXPOSE 3000

CMD su postgres -c "pg_ctl -D /postgresql/data -w start" && exec npm start