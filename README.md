# Pratvim React Native Mobile App

Fresh React Native implementation of the Pratvim mobile design package. This build is frontend-only and intentionally does not integrate with backend APIs, payment gateways, auth providers, or storage services.

## Run locally

```bash
npm install
npm run start
npm run ios
npm run android
```

## App name and icon

- App name: `Pratvim`
- Expo slug: `pratvim-mobile-app`
- App icon: `assets/images/pratvim-mobile-app-icon.png`

## Architecture

The project uses MVVM + UDF:

- `src/app/state`: single reducer-driven app state and actions. Screens do not mutate state directly.
- `src/features/*/presentation/viewmodels`: view-model hooks that expose UI-ready state and dispatch events.
- `src/features/*/presentation/screens`: React Native views only.
- `src/core/components`: reusable design primitives, cards, buttons, headers, screen shell.
- `src/core/theme`: Pratvim design tokens for colors, radii, shadows, and spacing.
- `src/app/navigation`: central route definitions and stack mapping.

## Notes

- The prototype uses local mock state from `src/app/state/seedData.ts`.
- The `spec-panel` from the supplied HTML prototype is intentionally ignored.
- No font file is bundled; the UI uses native system font weight mapping with Pratvim spacing, colors, layout, and assets.
- Design assets were copied from the provided `pratvim_design_ui.zip` package, including backgrounds, brand mark, avatars, splash child cutout, and app icon.
