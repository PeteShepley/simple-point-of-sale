import {
  AutoIncrement,
  entity,
  integer,
  MaxLength,
  Positive,
  PrimaryKey,
  Reference,
} from "@deepkit/type";
import { Menu } from "./menu";

import { Recipe } from "./recipe";

@entity.collection("menu_items")
export class MenuItem {
  id: number & PrimaryKey & AutoIncrement = 0;
  menu!: Menu & Reference;
  name!: string & MaxLength<200>;
  description?: string & MaxLength<2000>;
  // store currency as integer cents
  costCents!: number & integer & Positive;
  // one to one recipe
  recipe?: Recipe & Reference;
}
