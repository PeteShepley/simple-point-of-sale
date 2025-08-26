import { Database } from "@deepkit/orm";
import { SQLiteDatabaseAdapter } from "@deepkit/sqlite";
import { Menu } from "../domain/menu";
import { MenuItem } from "../domain/menu-Item";
import { Recipe } from "../domain/recipe";
import { Ingredient } from "../domain/ingredient";
import { MethodStep } from "../domain/method-step";

export class MenuDatabase extends Database {
  constructor() {
    super(
      new SQLiteDatabaseAdapter(process.env.APP_DB_PATH || "var/data.sqlite"),
      [Menu, MenuItem, Recipe, Ingredient, MethodStep],
    );
  }
}
