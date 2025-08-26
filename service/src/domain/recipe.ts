import {
  AutoIncrement,
  BackReference,
  entity,
  MaxLength,
  PrimaryKey,
} from "@deepkit/type";
import { Ingredient } from "./ingredient";
import { MethodStep } from "./method-step";

@entity.collection("recipes")
export class Recipe {
  id: number & PrimaryKey & AutoIncrement = 0;
  name!: string & MaxLength<200>;
  ingredients?: Ingredient[] & BackReference;
  steps?: MethodStep[] & BackReference;
}
