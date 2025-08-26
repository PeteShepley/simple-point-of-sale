import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type {
  CreateMenuItemRequest,
  CreateMenuRequest,
  MenuItemResponse,
  MenuResponse,
  UpdateMenuItemRequest,
  UpdateMenuRequest,
} from "./types";
import type { RootState } from "../../store";

// Small API helper using Vite environment variable, defaulting to '' so fetch('/api/...') works
const API_BASE =
  (import.meta as any).env?.VITE_API_BASE || "http://0.0.0.0:8080";

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed: ${res.status}`);
  }
  // 204 No Content shouldn't parse json
  if (res.status === 204) return undefined as unknown as T;
  return (await res.json()) as T;
}

// Async thunks guided by service/api.yml
export const fetchMenus = createAsyncThunk<MenuResponse[]>(
  "menu/fetchMenus",
  async () => api<MenuResponse[]>("/api/menus"),
);

export const getMenu = createAsyncThunk<
  MenuResponse,
  { menuId: number; include?: "items" | "all" }
>("menu/getMenu", async ({ menuId, include }: any) => {
  const query = include ? `?include=${encodeURIComponent(include)}` : "";
  return api<MenuResponse>(`/api/menus/${menuId}${query}`);
});

export const createMenu = createAsyncThunk<MenuResponse, CreateMenuRequest>(
  "menu/createMenu",
  async (body: any) =>
    api<MenuResponse>("/api/menus", {
      method: "POST",
      body: JSON.stringify(body),
    }),
);

export const updateMenu = createAsyncThunk<
  MenuResponse,
  { menuId: number; body: UpdateMenuRequest }
>("menu/updateMenu", async ({ menuId, body }: any) =>
  api<MenuResponse>(`/api/menus/${menuId}`, {
    method: "PUT",
    body: JSON.stringify(body),
  }),
);

export const deleteMenu = createAsyncThunk<number, { menuId: number }>(
  "menu/deleteMenu",
  async ({ menuId }) => {
    await api<void>(`/api/menus/${menuId}`, { method: "DELETE" });
    return menuId;
  },
);

export const fetchMenuItems = createAsyncThunk<
  MenuItemResponse[],
  { menuId: number; limit?: number; offset?: number }
>("menu/fetchMenuItems", async ({ menuId, limit, offset }) => {
  const params = new URLSearchParams();
  if (limit != null) params.set("limit", String(limit));
  if (offset != null) params.set("offset", String(offset));
  const qs = params.toString() ? `?${params.toString()}` : "";
  return api<MenuItemResponse[]>(`/api/menus/${menuId}/items${qs}`);
});

export const createMenuItem = createAsyncThunk<
  MenuItemResponse,
  CreateMenuItemRequest
>("menu/createMenuItem", async ({ menuId, ...rest }) =>
  api<MenuItemResponse>(`/api/menus/${menuId}/items`, {
    method: "POST",
    body: JSON.stringify({ menuId, ...rest }),
  }),
);

export const updateMenuItem = createAsyncThunk<
  MenuItemResponse,
  {
    menuId: number;
    id: number;
    body: UpdateMenuItemRequest;
  }
>("menu/updateMenuItem", async ({ menuId, id, body }) =>
  api<MenuItemResponse>(`/api/menus/${menuId}/items/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  }),
);

export const deleteMenuItem = createAsyncThunk<
  { menuId: number; id: number },
  { menuId: number; id: number }
>("menu/deleteMenuItem", async ({ menuId, id }) => {
  await api<void>(`/api/menus/${menuId}/items/${id}`, { method: "DELETE" });
  return { menuId, id };
});

// State
interface MenuState {
  menus: MenuResponse[];
  byId: Record<number, MenuResponse>;
  itemsByMenuId: Record<number, MenuItemResponse[]>;
  loading: boolean;
  error?: string;
}

const initialState: MenuState = {
  menus: [],
  byId: {},
  itemsByMenuId: {},
  loading: false,
};

const menuSlice = createSlice({
  name: "menu",
  initialState,
  reducers: {
    // In case we want to set API base dynamically in runtime in future, etc.
    clearError(state) {
      state.error = undefined;
    },
  },
  extraReducers: (builder) => {
    const pending = (state: MenuState) => {
      state.loading = true;
      state.error = undefined;
    };
    const rejected = (state: MenuState, action: any) => {
      state.loading = false;
      state.error = action.error?.message || "Request failed";
    };

    builder
      .addCase(fetchMenus.pending, pending)
      .addCase(
        fetchMenus.fulfilled,
        (state, action: PayloadAction<MenuResponse[]>) => {
          state.loading = false;
          state.menus = action.payload;
          for (const m of action.payload) {
            state.byId[m.id] = m;
          }
        },
      )
      .addCase(fetchMenus.rejected, rejected)

      .addCase(getMenu.pending, pending)
      .addCase(
        getMenu.fulfilled,
        (state, action: PayloadAction<MenuResponse>) => {
          state.loading = false;
          const menu = action.payload;
          state.byId[menu.id] = menu;
          const i = state.menus.findIndex((m) => m.id === menu.id);
          if (i >= 0) state.menus[i] = menu;
          else state.menus.push(menu);
          if (menu.items) {
            state.itemsByMenuId[menu.id] = menu.items;
          }
        },
      )
      .addCase(getMenu.rejected, rejected)

      .addCase(createMenu.pending, pending)
      .addCase(
        createMenu.fulfilled,
        (state, action: PayloadAction<MenuResponse>) => {
          state.loading = false;
          state.menus.push(action.payload);
          state.byId[action.payload.id] = action.payload;
        },
      )
      .addCase(createMenu.rejected, rejected)

      .addCase(updateMenu.pending, pending)
      .addCase(
        updateMenu.fulfilled,
        (state, action: PayloadAction<MenuResponse>) => {
          state.loading = false;
          const updated = action.payload;
          state.byId[updated.id] = updated;
          const i = state.menus.findIndex((m) => m.id === updated.id);
          if (i >= 0) state.menus[i] = updated;
        },
      )
      .addCase(updateMenu.rejected, rejected)

      .addCase(deleteMenu.pending, pending)
      .addCase(deleteMenu.fulfilled, (state, action: PayloadAction<number>) => {
        state.loading = false;
        const id = action.payload;
        delete state.byId[id];
        delete state.itemsByMenuId[id];
        state.menus = state.menus.filter((m) => m.id !== id);
      })
      .addCase(deleteMenu.rejected, rejected)

      .addCase(fetchMenuItems.pending, pending)
      .addCase(fetchMenuItems.fulfilled, (state, action) => {
        state.loading = false;
        const menuId = (action.meta.arg as { menuId: number }).menuId;
        state.itemsByMenuId[menuId] = action.payload;
      })
      .addCase(fetchMenuItems.rejected, rejected)

      .addCase(createMenuItem.pending, pending)
      .addCase(createMenuItem.fulfilled, (state, action) => {
        state.loading = false;
        const item = action.payload;
        const arr = state.itemsByMenuId[item.menuId] || [];
        state.itemsByMenuId[item.menuId] = [...arr, item];
      })
      .addCase(createMenuItem.rejected, rejected)

      .addCase(updateMenuItem.pending, pending)
      .addCase(updateMenuItem.fulfilled, (state, action) => {
        state.loading = false;
        const item = action.payload;
        const arr = state.itemsByMenuId[item.menuId] || [];
        const idx = arr.findIndex((x) => x.id === item.id);
        if (idx >= 0) arr[idx] = item;
        state.itemsByMenuId[item.menuId] = arr;
      })
      .addCase(updateMenuItem.rejected, rejected)

      .addCase(deleteMenuItem.pending, pending)
      .addCase(deleteMenuItem.fulfilled, (state, action) => {
        state.loading = false;
        const { menuId, id } = action.payload;
        const arr = state.itemsByMenuId[menuId] || [];
        state.itemsByMenuId[menuId] = arr.filter((x) => x.id !== id);
      })
      .addCase(deleteMenuItem.rejected, rejected);
  },
});

export const { clearError } = menuSlice.actions;

// Selectors
export const selectMenus = (state: RootState) => state.menu.menus;
export const selectMenuById = (id: number) => (state: RootState) =>
  state.menu.byId[id];
export const selectItemsByMenuId = (menuId: number) => (state: RootState) =>
  state.menu.itemsByMenuId[menuId] || [];
export const selectMenuLoading = (state: RootState) => state.menu.loading;
export const selectMenuError = (state: RootState) => state.menu.error;

export default menuSlice.reducer;
