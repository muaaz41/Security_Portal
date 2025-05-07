import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import guestReducer from './slice/guestSlice';
import guardReducer from './slice/guardSlice';

// Persistence configuration for guests
const guestPersistConfig = {
  key: 'guests',
  storage,
};

// Persistence configuration for guards
const guardPersistConfig = {
  key: 'guards',
  storage,
};

// Create persisted reducers
const persistedGuestReducer = persistReducer(guestPersistConfig, guestReducer);
const persistedGuardReducer = persistReducer(guardPersistConfig, guardReducer);

export const store = configureStore({
  reducer: {
    guests: persistedGuestReducer,
    guards: persistedGuardReducer,
    // Add other reducers here if needed
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['meta.arg', 'payload.timestamp'],
        // Ignore these paths in the state
        ignoredPaths: ['items.dates'],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
