import { MaxLength, Positive, integer } from "@deepkit/type";

export class CreateRecipeRequest {
  name!: string & MaxLength<200>;
}

export class UpdateRecipeRequest {
  name?: string & MaxLength<200>;
}

export class RecipeResponse {
  id!: number;
  name!: string;
  ingredients?: IngredientResponse[];
  steps?: MethodStepResponse[];
}

export class CreateIngredientRequest {
  recipeId!: number & Positive & integer;
  name!: string & MaxLength<200>;
  amount!: number & Positive;
  unit!: string & MaxLength<50>;
}

export class UpdateIngredientRequest {
  name?: string & MaxLength<200>;
  amount?: number & Positive;
  unit?: string & MaxLength<50>;
}

export class IngredientResponse {
  id!: number;
  recipeId!: number;
  name!: string;
  amount!: number;
  unit!: string;
}

export class CreateMethodStepRequest {
  recipeId!: number & Positive & integer;
  order!: number & integer & Positive;
  instruction!: string & MaxLength<4000>;
}

export class UpdateMethodStepRequest {
  order?: number & integer & Positive;
  instruction?: string & MaxLength<4000>;
}

export class MethodStepResponse {
  id!: number;
  recipeId!: number;
  order!: number;
  instruction!: string;
}
