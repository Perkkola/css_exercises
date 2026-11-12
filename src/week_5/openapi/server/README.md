# Course Service

To run service in local development

```
docker compose up
```

Database migration

```
docker compose run --rm server npm run migrate
```

The service should now be running on http://localhost:3000

API doc from OpenAPI is available at http://localhost:3000/api-docs
