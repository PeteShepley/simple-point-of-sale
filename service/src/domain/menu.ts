import {
  AutoIncrement,
  BackReference,
  entity,
  MaxLength,
  PrimaryKey,
} from "@deepkit/type";

import { MenuItem } from "./menu-Item";

@entity.collection("menus")
export class Menu {
  id: number & PrimaryKey & AutoIncrement = 0;
  name!: string & MaxLength<200>;
  description?: string & MaxLength<2000>;
  items?: MenuItem[] & BackReference;
}
