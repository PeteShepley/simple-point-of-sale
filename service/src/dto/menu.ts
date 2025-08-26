import { MaxLength, Positive, integer, t } from "@deepkit/type";

export class CreateMenuRequest {
  name!: string & MaxLength<200>;
  description?: string & MaxLength<2000>;
}

export class UpdateMenuRequest {
  name?: string & MaxLength<200>;
  description?: string & MaxLength<2000>;
}

export class MenuResponse {
  id!: number;
  name!: string;
  description?: string;
  items?: MenuItemResponse[];
}

export class CreateMenuItemRequest {
  menuId!: number & Positive & integer;
  name!: string & MaxLength<200>;
  description?: string & MaxLength<2000>;
  costCents!: number & integer & Positive;
}

export class UpdateMenuItemRequest {
  name?: string & MaxLength<200>;
  description?: string & MaxLength<2000>;
  costCents?: number & integer & Positive;
}

export class MenuItemResponse {
  id!: number;
  menuId!: number;
  name!: string;
  description?: string;
  costCents!: number;
  cost!: number; // derived dollars
  recipeId?: number;
}

export class PaginationQuery {
  limit?: number & integer & Positive;
  offset?: number & integer;
}

export type IncludeParam = "items" | "all";
