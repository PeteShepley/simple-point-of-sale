import {
  http,
  HttpBadRequestError,
  HttpBody,
  HttpNotFoundError,
  HttpQuery,
} from "@deepkit/http";
import {
  CreateIngredientRequest,
  CreateMethodStepRequest,
  CreateRecipeRequest,
  IngredientResponse,
  MethodStepResponse,
  RecipeResponse,
  UpdateIngredientRequest,
  UpdateMethodStepRequest,
  UpdateRecipeRequest,
} from "../dto/recipe";
import { Recipe } from "../domain/recipe";
import { Ingredient } from "../domain/ingredient";
import { MethodStep } from "../domain/method-step";
import { MenuDatabase } from "../data/database";

function toIngredientResponse(i: Ingredient): IngredientResponse {
  return {
    id: i.id,
    recipeId: (i.recipe as any)?.id ?? 0,
    name: i.name,
    amount: i.amount,
    unit: i.unit,
  };
}

function toStepResponse(s: MethodStep): MethodStepResponse {
  return {
    id: s.id,
    recipeId: (s.recipe as any)?.id ?? 0,
    order: s.order,
    instruction: s.instruction,
  };
}

function toRecipeResponse(
  r: Recipe,
  ingredients?: Ingredient[],
  steps?: MethodStep[],
): RecipeResponse {
  const res: RecipeResponse = { id: r.id, name: r.name };
  if (ingredients) res.ingredients = ingredients.map(toIngredientResponse);
  if (steps)
    res.steps = steps.map(toStepResponse).sort((a, b) => a.order - b.order);
  return res;
}

export class RecipeController {
  constructor(private db: MenuDatabase) {}

  @http.GET("/api/recipes")
  async listRecipes(
    limit: HttpQuery<number> = 25,
    offset: HttpQuery<number> = 0,
  ) {
    const session = this.db.createSession();
    const items = await session
      .query(Recipe)
      .skip(Math.max(offset, 0))
      .limit(Math.min(Math.max(limit, 1), 100))
      .find();
    return items.map((r) => toRecipeResponse(r));
  }

  @http.GET("/api/recipes/:recipeId")
  async detail(
    recipeId: number,
    include?: HttpQuery<"ingredients" | "steps" | "all">,
  ) {
    const session = this.db.createSession();
    const r = await session
      .query(Recipe)
      .filter({ id: recipeId })
      .findOneOrUndefined();
    if (!r) throw new HttpNotFoundError("Recipe not found");
    if (include === "all") {
      const ingredients = await session
        .query(Ingredient)
        .filter({ recipe: r })
        .find();
      const steps = await session
        .query(MethodStep)
        .filter({ recipe: r })
        .find();
      return toRecipeResponse(r, ingredients, steps);
    }
    if (include === "ingredients") {
      const ingredients = await session
        .query(Ingredient)
        .filter({ recipe: r })
        .find();
      return toRecipeResponse(r, ingredients);
    }
    if (include === "steps") {
      const steps = await session
        .query(MethodStep)
        .filter({ recipe: r })
        .find();
      return toRecipeResponse(r, undefined, steps);
    }
    return toRecipeResponse(r);
  }

  @http.POST("/api/recipes")
  async createRecipe(body: HttpBody<CreateRecipeRequest>) {
    const session = this.db.createSession();
    const r = new Recipe();
    r.name = body.name;
    session.add(r);
    await session.commit();
    await session.flush();
    return toRecipeResponse(r);
  }

  @http.PUT("/api/recipes/:recipeId")
  async updateRecipe(recipeId: number, body: HttpBody<UpdateRecipeRequest>) {
    const session = this.db.createSession();
    const r = await session
      .query(Recipe)
      .filter({ id: recipeId })
      .findOneOrUndefined();
    if (!r) throw new HttpNotFoundError("Recipe not found");
    if (body.name !== undefined) r.name = body.name;
    await session.flush();
    return toRecipeResponse(r);
  }

  @http.DELETE("/api/recipes/:recipeId")
  async deleteRecipe(recipeId: number) {
    const session = this.db.createSession();
    const r = await session
      .query(Recipe)
      .filter({ id: recipeId })
      .findOneOrUndefined();
    if (!r) return new HttpNotFoundError("Recipe not found");
    session.remove(r);
    await session.flush();
  }

  // Ingredients
  @http.GET("/api/recipes/:recipeId/ingredients")
  async listIngredients(
    recipeId: number,
    limit: HttpQuery<number> = 25,
    offset: HttpQuery<number> = 0,
  ) {
    const session = this.db.createSession();
    const qb = session.query(Ingredient);
    if (recipeId) {
      const r = await session
        .query(Recipe)
        .filter({ id: recipeId })
        .findOneOrUndefined();
      if (!r) throw new HttpNotFoundError("Recipe not found");
      qb.filter({ recipe: r });
    }
    const rows = await qb
      .skip(Math.max(offset, 0))
      .limit(Math.min(Math.max(limit, 1), 100))
      .find();
    return rows.map(toIngredientResponse);
  }

  @http.GET("/api/recipes/:recipeId/ingredients/:id")
  async ingredientDetail(id: number) {
    const session = this.db.createSession();
    const row = await session
      .query(Ingredient)
      .filter({ id })
      .findOneOrUndefined();
    if (!row) return new HttpNotFoundError("Ingredient not found");
    return toIngredientResponse(row);
  }

  @http.POST("/api/ingredients")
  async createIngredient(body: HttpBody<CreateIngredientRequest>) {
    const session = this.db.createSession();
    const r = await session
      .query(Recipe)
      .filter({ id: body.recipeId })
      .findOneOrUndefined();
    if (!r) return new HttpNotFoundError("Recipe not found");
    const i = new Ingredient();
    i.recipe = r;
    i.name = body.name;
    i.amount = body.amount;
    i.unit = body.unit;
    session.add(i);
    await session.commit();
    await session.flush();
    return toIngredientResponse(i);
  }

  @http.PUT("/api/ingredients/:id")
  async updateIngredient(id: number, body: HttpBody<UpdateIngredientRequest>) {
    const session = this.db.createSession();
    const i = await session
      .query(Ingredient)
      .filter({ id })
      .findOneOrUndefined();
    if (!i) return new HttpNotFoundError("Ingredient not found");
    if (body.name !== undefined) i.name = body.name;
    if (body.amount !== undefined) i.amount = body.amount;
    if (body.unit !== undefined) i.unit = body.unit;
    session.add(i);
    await session.commit();
    await session.flush();
    return toIngredientResponse(i);
  }

  @http.DELETE("/api/ingredients/:id")
  async deleteIngredient(id: number) {
    const session = this.db.createSession();
    const i = await session
      .query(Ingredient)
      .filter({ id })
      .findOneOrUndefined();
    if (!i) return new HttpNotFoundError("Ingredient not found");
    session.remove(i);
    await session.flush();
  }

  // Steps
  @http.GET("/api/steps")
  async listSteps(recipeId?: number, limit: number = 25, offset: number = 0) {
    const session = this.db.createSession();
    const qb = session.query(MethodStep);
    if (recipeId) {
      const r = await session
        .query(Recipe)
        .filter({ id: recipeId })
        .findOneOrUndefined();
      if (!r) return new HttpNotFoundError("Recipe not found");
      qb.filter({ recipe: r });
    }
    const rows = await qb
      .skip(Math.max(offset, 0))
      .limit(Math.min(Math.max(limit, 1), 100))
      .find();
    return rows.map(toStepResponse).sort((a, b) => a.order - b.order);
  }

  @http.GET("/api/steps/:id")
  async stepDetail(id: number) {
    const session = this.db.createSession();
    const row = await session
      .query(MethodStep)
      .filter({ id })
      .findOneOrUndefined();
    if (!row) return new HttpNotFoundError("MethodStep not found");
    return toStepResponse(row);
  }

  @http.POST("/api/steps")
  async createStep(body: HttpBody<CreateMethodStepRequest>) {
    const session = this.db.createSession();
    const r = await session
      .query(Recipe)
      .filter({ id: body.recipeId })
      .findOneOrUndefined();
    if (!r) return new HttpNotFoundError("Recipe not found");
    // enforce unique order per recipe
    const existing = await session
      .query(MethodStep)
      .filter({ recipe: r, order: body.order as any })
      .findOneOrUndefined();
    if (existing)
      return new HttpBadRequestError("Step order already exists for recipe");
    const s = new MethodStep();
    s.recipe = r;
    s.order = body.order;
    s.instruction = body.instruction;
    session.add(s);
    await session.commit();
    await session.flush();
    return toStepResponse(s);
  }

  @http.PUT("/api/steps/:id")
  async updateStep(id: number, body: HttpBody<UpdateMethodStepRequest>) {
    const session = this.db.createSession();
    const s = await session
      .query(MethodStep)
      .filter({ id })
      .findOneOrUndefined();
    if (!s) return new HttpNotFoundError("MethodStep not found");
    if (body.order !== undefined) {
      const existing = await session
        .query(MethodStep)
        .filter({ recipe: s.recipe as any, order: body.order as any })
        .findOneOrUndefined();
      if (existing && existing.id !== s.id)
        return new HttpBadRequestError("Step order already exists for recipe");
      s.order = body.order;
    }
    if (body.instruction !== undefined) s.instruction = body.instruction;
    await session.flush();
    return toStepResponse(s);
  }

  @http.DELETE("/api/steps/:id")
  async deleteStep(id: number) {
    const session = this.db.createSession();
    const s = await session
      .query(MethodStep)
      .filter({ id })
      .findOneOrUndefined();
    if (!s) return new HttpNotFoundError("MethodStep not found");
    session.remove(s);
    await session.flush();
  }
}
