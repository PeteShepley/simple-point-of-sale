# Service App

This service exposes a REST API for a Menu domain (menus, menu-items, recipes, ingredients, steps) backed by a local SQLite database.

## Start server


```sh
$ npm run app server:start

2022-08-07T21:25:32.567Z [LOG] Start server ...
2022-08-07T21:25:32.569Z [LOG] RPC Controller HelloWorldControllerRpc /main
2022-08-07T21:25:32.569Z [LOG] 1 HTTP routes
2022-08-07T21:25:32.569Z [LOG] HTTP Controller HelloWorldControllerHttp
2022-08-07T21:25:32.569Z [LOG]   GET /hello/:name
2022-08-07T21:25:32.569Z [LOG] HTTP listening at http://0.0.0.0:8080
2022-08-07T21:25:32.569Z [LOG] Server started.
```

You can now open http://localhost:8080/hello/Peter.

Or open the Framework Debugger: http://localhost:8080/_debug/ (if debug is enabled in `new FrameworkModule({ debug: true })`)

### CLI

The file app.ts is at the same your CLI entrypoint to your application. There you can start the HTTP server or execute custom CLI commands.

One built-in CLI command is `server:start` which starts the HTTP/RPC server:

```sh
$ npm run app server:start

# or if supported
$ ./app.ts server:start
```

Another is an example `hello` from `./src/controller/hello-world.cli.ts`, which you can start as follows:

```sh
npm run app hello World!

# or if supported
$ ./app.ts hello World!
```

Run just `npm run app` to see all available commands.

If your operating system supports it, you can also call `app.ts` directly:

```sh
$ ./app.ts server:start
```

### HTTP

New REST endpoints (examples):

- Menus
  - List: curl -s http://localhost:8080/api/menus
  - Create: curl -s -X POST http://localhost:8080/api/menus -H 'content-type: application/json' -d '{"name":"Lunch"}'
  - Detail (with items): curl -s 'http://localhost:8080/api/menus/1?include=items'
- Menu Items
  - List for menu: curl -s 'http://localhost:8080/api/menu-items?menuId=1'
  - Create: curl -s -X POST http://localhost:8080/api/menu-items -H 'content-type: application/json' -d '{"menuId":1,"name":"Burger","costCents":1299}'
- Recipes
  - Create: curl -s -X POST http://localhost:8080/api/recipes -H 'content-type: application/json' -d '{"name":"Burger"}'
  - Detail with all: curl -s 'http://localhost:8080/api/recipes/1?include=all'
- Ingredients
  - Create: curl -s -X POST http://localhost:8080/api/ingredients -H 'content-type: application/json' -d '{"recipeId":1,"name":"Beef","amount":1,"unit":"lb"}'
- Method Steps
  - Create: curl -s -X POST http://localhost:8080/api/steps -H 'content-type: application/json' -d '{"recipeId":1,"order":1,"instruction":"Grill patty"}'

### RPC

An example RPC controller is at `./src/controller/hello-world.rpc.ts` which can be accessed by a Deepkit RPC client, after starting the server with `npm run app server:start`:

```sh
$ npm run client-rpc

# or if supported
$ ./client.rpc.ts
```

## Watcher

If you want to work on some server APIs and the server should restart automatically for each change, use `app:watch`:

```sh
$ npm run app:watch server:start
```

## Database & Migrations

- Local DB file: service/var/data.sqlite (ignored by git via root .gitignore)
- Override DB path with env: APP_DB_PATH=/absolute/or/relative/path.sqlite
- Auto-migrate: In development, the app attempts to auto-sync the schema on startup.
- Production migration: run `npm run db:migrate` before starting the server.

## Deploy

To deploy the app, you should build it via `npm run build`. It will compile TS to JS and puts it in `dist/` folder.

```sh
$ npm run build
$ node dist/app.js hello world

# or start server. 
$ APP_ENVIRONMENT=production node dist/app.js server:start
```

Make sure to set the environment `APP_ENVIRONMENT=production` variable correctly, or add a `production.env` file with `APP_ENVIRONMENT=production`.
In app.ts it's configured to use a JSON logger and disabled framework debugger as soon as production environment is set.

## Change port

To change the port or host, use `APP_FRAMEWORK_PORT` and `APP_FRAMEWORK_HOST` respectively.

```sh
$ APP_FRAMEWORK_PORT=9090 APP_FRAMEWORK_HOST=127.0.0.1 node dist/app.js server:start
2022-08-07T21:38:45.744Z [LOG] HTTP listening at http://127.0.0.1:9090
```
