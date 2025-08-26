import {
  http,
  HttpBody,
  HttpNotFoundError,
  HttpQueries,
  HttpQuery,
} from "@deepkit/http";
import {
  CreateMenuItemRequest,
  CreateMenuRequest,
  IncludeParam,
  MenuItemResponse,
  MenuResponse,
  PaginationQuery,
  UpdateMenuItemRequest,
  UpdateMenuRequest,
} from "../dto/menu";
import { Menu } from "../domain/menu";
import { MenuItem } from "../domain/menu-Item";
import { MenuDatabase } from "../data/database";

function toMenuResponse(m: Menu, items?: MenuItem[]): MenuResponse {
  const res: MenuResponse = {
    id: m.id,
    name: m.name,
    description: m.description ?? undefined,
  };
  if (items) res.items = items.map(toMenuItemResponse);
  return res;
}

function toMenuItemResponse(i: MenuItem): MenuItemResponse {
  return {
    id: i.id,
    menuId: (i.menu as any)?.id ?? (i as any).menu?.id ?? 0,
    name: i.name,
    description: i.description ?? undefined,
    costCents: i.costCents,
    cost: Math.round(i.costCents) / 100,
    recipeId: (i.recipe as any)?.id,
  };
}

@http.controller("/api/menus")
export class MenuController {
  constructor(private db: MenuDatabase) {}

  @http.OPTIONS("")
  @http.GET("")
  async list(query: HttpQueries<PaginationQuery>) {
    const limit = Math.min(Math.max(query.limit ?? 25, 1), 100);
    const offset = Math.max(query.offset ?? 0, 0);
    const session = this.db.createSession();
    const items = await session.query(Menu).skip(offset).limit(limit).find();
    return items.map((m) => toMenuResponse(m));
  }

  @http.OPTIONS("/:menuId")
  @http.GET("/:menuId")
  async detail(menuId: number, include?: HttpQuery<IncludeParam>) {
    const session = this.db.createSession();
    const menu = await session
      .query(Menu)
      .filter({ id: menuId })
      .findOneOrUndefined();
    if (!menu) throw new HttpNotFoundError("Menu not found");
    if (include === "items" || include === "all") {
      const items = await session.query(MenuItem).filter({ menu }).find();
      return toMenuResponse(menu, items);
    }
    return toMenuResponse(menu);
  }

  @http.OPTIONS("")
  @http.POST("")
  async create(body: HttpBody<CreateMenuRequest>) {
    const session = this.db.createSession();
    const menu = new Menu();
    menu.name = body.name;
    menu.description = body.description;
    session.add(menu);
    await session.commit();
    await session.flush();
    return toMenuResponse(menu);
  }

  @http.OPTIONS("/:menuId")
  @http.PUT("/:menuId")
  async update(menuId: number, body: HttpBody<UpdateMenuRequest>) {
    const session = this.db.createSession();
    const menu = await session
      .query(Menu)
      .filter({ id: menuId })
      .findOneOrUndefined();
    if (!menu) throw new HttpNotFoundError();
    if (body.name !== undefined) menu.name = body.name;
    if (body.description !== undefined) menu.description = body.description;
    await session.flush();
    return toMenuResponse(menu);
  }

  @http.OPTIONS("/:menuId")
  @http.DELETE("/:menuId")
  async remove(menuId: number) {
    const session = this.db.createSession();
    const menu = await session
      .query(Menu)
      .filter({ id: menuId })
      .findOneOrUndefined();
    if (!menu) throw new HttpNotFoundError();
    session.remove(menu);
    await session.flush();
  }

  // Menu Items
  @http.OPTIONS("/:menuId/items")
  @http.GET("/:menuId/items")
  async listItems(menuId: number, query?: HttpQueries<PaginationQuery>) {
    const limit = Math.min(Math.max(query?.limit ?? 25, 1), 100);
    const offset = Math.max(query?.offset ?? 0, 0);
    const session = this.db.createSession();
    const qb = session.query(MenuItem);
    if (menuId) {
      const menu = await session
        .query(Menu)
        .filter({ id: menuId })
        .findOneOrUndefined();
      if (!menu) throw new HttpNotFoundError();
      qb.filter({ menu });
    }
    const rows = await qb.skip(offset).limit(limit).find();
    return rows.map(toMenuItemResponse);
  }

  @http.OPTIONS("/:menuId/items/:id")
  @http.GET("/:menuId/items/:id")
  async itemDetail(id: number) {
    const session = this.db.createSession();
    const item = await session
      .query(MenuItem)
      .filter({ id })
      .findOneOrUndefined();
    if (!item) throw new HttpNotFoundError();
    return toMenuItemResponse(item);
  }

  @http.OPTIONS("/:menuId/items")
  @http.POST("/:menuId/items")
  async createItem(menuId: number, body: HttpBody<CreateMenuItemRequest>) {
    const session = this.db.createSession();
    const menu = await session
      .query(Menu)
      .filter({ id: menuId })
      .findOneOrUndefined();
    if (!menu) throw new HttpNotFoundError("Menu not found");
    const item = new MenuItem();
    item.menu = menu;
    item.name = body.name;
    item.description = body.description;
    item.costCents = body.costCents;
    session.add(item);
    await session.commit();
    await session.flush();
    return toMenuItemResponse(item);
  }

  @http.OPTIONS("/:menuId/items/:id")
  @http.PUT("/:menuId/items/:id")
  async updateItem(
    menuId: number,
    id: number,
    body: HttpBody<UpdateMenuItemRequest>,
  ) {
    const session = this.db.createSession();
    const item = await session
      .query(MenuItem)
      .filter({ id })
      .findOneOrUndefined();
    if (!item) throw new HttpNotFoundError("MenuItem not found");
    if (body.name !== undefined) item.name = body.name;
    if (body.description !== undefined) item.description = body.description;
    if (body.costCents !== undefined) item.costCents = body.costCents;
    await session.flush();
    return toMenuItemResponse(item);
  }

  @http.OPTIONS("/:menuId/items/:id")
  @http.DELETE("/:menuId/items/:id")
  async deleteItem(menuId: number, id: number) {
    const session = this.db.createSession();
    const item = await session
      .query(MenuItem)
      .filter({ id })
      .findOneOrUndefined();
    if (!item) throw new HttpNotFoundError("MenuItem not found");
    session.remove(item);
    await session.flush();
  }
}
