// Types mirrored from service/api.yml schemas for client use
export interface MenuItemResponse {
  id: number
  menuId: number
  name: string
  description?: string | null
  costCents: number
  cost: number
  recipeId?: number | null
}

export interface MenuResponse {
  id: number
  name: string
  description?: string | null
  items?: MenuItemResponse[]
}

export interface CreateMenuRequest {
  name: string
  description?: string
}

export interface UpdateMenuRequest {
  name?: string
  description?: string
}

export interface CreateMenuItemRequest {
  menuId: number
  name: string
  description?: string
  costCents: number
}

export interface UpdateMenuItemRequest {
  name?: string
  description?: string
  costCents?: number
}
