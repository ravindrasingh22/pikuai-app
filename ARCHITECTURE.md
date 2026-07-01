# Architecture: MVVM + UDF

## Layers

```text
AppRoot
 ├─ NavigationContainer
 ├─ RootNavigator
 └─ AppStoreProvider

src/app
 ├─ navigation/routes.ts
 ├─ navigation/RootNavigator.tsx
 └─ state/{AppStore,appReducer,seedData,types}.ts

src/core
 ├─ assets/assets.ts
 ├─ components/*
 ├─ theme/*
 └─ utils/layout.ts

src/features
 ├─ auth/presentation/{screens,viewmodels}
 ├─ onboarding/presentation/screens
 ├─ parent/presentation/{screens,viewmodels}
 ├─ kid/presentation/{screens,viewmodels}
 ├─ chat/presentation/{screens,viewmodels}
 ├─ payments/presentation/screens
 └─ info/presentation/screens
```

## UDF flow

```text
User action
  → Screen callback
  → ViewModel event function
  → dispatch({ type, payload })
  → appReducer returns new AppState
  → ViewModel derives UI state
  → Screen re-renders
```

## State ownership

- Auth forms keep short-lived local input state in view-model hooks.
- Family profiles, active child, chats, subscription, and avatar selections live in `AppState`.
- Navigation decisions stay in screen-level event handlers, while business state changes go through actions.

## Backend boundary

There are no API clients in this package. Future backend integration should be added through a separate `src/core/network` layer and repositories below each feature, keeping screens and view-models stable.
