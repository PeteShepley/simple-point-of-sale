import { configureStore } from '@reduxjs/toolkit'
import menuReducer from '../features/menu/menuSlice'

export const store = configureStore({
  reducer: {
    menu: menuReducer,
  },
  // Default middleware from RTK includes thunk and good defaults
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
