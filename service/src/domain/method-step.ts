import {
  AutoIncrement,
  entity,
  integer,
  Maximum,
  MaxLength,
  Positive,
  PrimaryKey,
  Reference,
} from "@deepkit/type";
import {Recipe} from "./recipe";

@entity.collection("method_steps")
export class MethodStep {
  id: number & PrimaryKey & AutoIncrement = 0;
  recipe!: Recipe & Reference;
  // 1-based order index
  order!: number & integer & Positive & Maximum<10000>;
  instruction!: string & MaxLength<4000>;
}