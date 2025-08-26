import { expect, test } from "@jest/globals";
import { createTestingApp } from "@deepkit/framework";
import { AppConfig } from "../src/app/config";
import { MenuController } from "../src/controller/menu.http";
import { RecipeController } from "../src/controller/recipe.http";
import { Service } from "../src/app/service";
import { RequestBuilder } from "@deepkit/http";
import { MenuDatabase } from "../src/data/database";

// use a temp db file per run
const dbPath = "var/test-data.sqlite";

function providers() {
  return [Service, MenuDatabase];
}

test("menus list works (empty)", async () => {
  const testing = createTestingApp({
    config: AppConfig,
    controllers: [MenuController, RecipeController],
    providers: providers(),
  });
  try {
    const server = await testing.startServer();
    const res = await testing.request(new RequestBuilder("/api/menus", "GET"));
    expect(res.statusCode).toBe(200);
    const body = res.json;
    expect(Array.isArray(body)).toBe(true);
  } finally {
    await testing.stopServer();
  }
});
