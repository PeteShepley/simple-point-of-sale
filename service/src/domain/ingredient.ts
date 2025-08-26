import {
  AutoIncrement,
  entity,
  MaxLength,
  Positive,
  PrimaryKey,
  Reference,
} from "@deepkit/type";
import {Recipe} from "./recipe";

@entity.collection("ingredients")
export class Ingredient {
  id: number & PrimaryKey & AutoIncrement = 0;
  recipe!: Recipe & Reference;
  name!: string & MaxLength<200>;
  amount!: number & Positive;
  unit!: string & MaxLength<50>;
}