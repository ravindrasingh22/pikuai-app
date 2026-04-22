# React Native Mobile App Coding Guidelines

Version: 1.0  
Purpose: Define engineering standards for building and maintaining a clean, scalable, testable React Native mobile application, including guidance for AI-assisted code generation.

---

## 1. Core Principles

All code written for this React Native app must follow these principles:

- Prefer readability over cleverness.
- Keep files small and focused.
- Build reusable components, not repetitive screens.
- Separate UI, business logic, and data access.
- Optimize for long-term maintainability, not short-term speed.
- Make code easy for another engineer to understand in one pass.
- Any AI-generated code must be reviewed and aligned with this document before merging.

---

## 2. Project Structure

Use a consistent folder structure so code is easy to find and reason about.

```text
src/
  api/
  assets/
  components/
    common/
    forms/
    feedback/
  config/
  constants/
  hooks/
  navigation/
  screens/
    Auth/
    Home/
    Profile/
  services/
  store/
  types/
  utils/
  theme/
  features/
    chat/
      components/
      hooks/
      services/
      types/
      utils/
```

### Rules
- Put shared reusable UI inside `components/`.
- Put feature-specific code inside `features/<feature-name>/`.
- Put screen containers inside `screens/`.
- Put API clients, adapters, and request logic inside `api/` or `services/`.
- Put only truly global constants inside `constants/`.
- Put helper functions with no UI dependency inside `utils/`.
- Keep type definitions close to the feature when they are feature-specific.
- Avoid dumping everything into `utils/` or `helpers/`.

---

## 3. File and Naming Conventions

### File names
- Use `PascalCase.tsx` for React components.
- Use `camelCase.ts` for hooks, utilities, and services when appropriate.
- Use `kebab-case` only if the repo already follows it consistently.
- Keep naming consistent across the repo.

### Examples
- `PrimaryButton.tsx`
- `UserProfileCard.tsx`
- `useAuth.ts`
- `chatService.ts`
- `dateFormatter.ts`

### Naming rules
- Components: `PascalCase`
- Hooks: `useXyz`
- Functions: verb-based names such as `fetchProfile`, `validateForm`
- Booleans: `isLoading`, `hasError`, `canSubmit`
- Event handlers: `handleSubmit`, `handleRetryPress`
- Constants: `UPPER_SNAKE_CASE` only for true constants
- Types and interfaces: `PascalCase`

### Avoid
- Generic names like `data`, `temp`, `misc`, `helper`, `newData`
- Abbreviations unless they are widely understood
- One-letter variable names except in tiny loop scopes

---

## 4. Component Design Rules

### Preferred style
- Functional components only
- Hooks-based implementation
- One component = one clear responsibility

### Guidelines
- Keep presentational components focused on rendering.
- Move business logic into hooks or services.
- Extract repeated JSX into reusable components.
- Do not create giant screen files with rendering, validation, API calls, and navigation all mixed together.

### Good pattern
- `Screen` handles layout and screen flow
- `Feature hook` handles state and actions
- `Service` handles API/network
- `Reusable components` handle display

### Component size
- Prefer components under roughly 150 lines.
- If a component becomes hard to scan, split it.
- If JSX is deeply nested, extract sections into subcomponents.

---

## 5. State Management

Choose the lightest state solution that fits the problem.

### Use local state for
- Input values
- Toggle state
- Modal visibility
- Screen-only state

### Use shared state for
- Auth user
- Session
- Theme
- Global app settings
- Cached shared domain data if needed

### Rules
- Do not put everything in global state.
- Keep state as close as possible to where it is used.
- Avoid duplicated state derived from another source.
- Prefer derived values over storing calculated copies.

### Example
Bad:
- storing `fullName` and also `firstName + lastName`

Good:
- store `firstName` and `lastName`
- derive `fullName` when needed

---

## 6. Hooks Best Practices

### Rules
- Hooks must start with `use`
- Hooks should encapsulate reusable logic, not just hide code
- Keep hooks pure in purpose
- Avoid hooks that do too many unrelated things

### Good hook examples
- `useAuth`
- `useChatMessages`
- `useDebouncedValue`
- `useProfileForm`

### Avoid
- Hooks with hidden side effects that surprise the caller
- Hooks that fetch, transform, navigate, log, and mutate many unrelated concerns at once

---

## 7. TypeScript Standards

Use TypeScript strictly and avoid weakening types.

### Rules
- Prefer explicit domain types over `any`
- Avoid `any` unless absolutely unavoidable
- Use `unknown` when input is uncertain and validate it
- Type API responses
- Type props for every component
- Type navigation params clearly

### Prefer
```ts
type UserProfile = {
  id: string;
  name: string;
  email: string;
};
```

### Avoid
```ts
const user: any = response.data;
```

### Additional rules
- Use union types for controlled states when useful
- Prefer shared type definitions for repeated response shapes
- Keep feature-specific types near the feature
- Avoid massive global type files without structure

---

## 8. Styling Guidelines

Use one styling approach consistently across the app.

### Rules
- Centralize colors, spacing, typography, and radius values in `theme/`
- Do not hardcode design values repeatedly across files
- Prefer reusable style tokens
- Keep styles readable and grouped logically

### Recommended
- `theme/colors.ts`
- `theme/spacing.ts`
- `theme/typography.ts`

### Avoid
- Random inline styles everywhere
- Repeated hardcoded values like `#123456`, `17`, `23`, `11`
- Mixing multiple styling systems without clear reason

### Example
Bad:
```tsx
<Text style={{ color: '#333', fontSize: 17, marginTop: 13 }}>Title</Text>
```

Better:
```tsx
<Text style={styles.title}>Title</Text>
```

---

## 9. API and Service Layer Rules

Never call APIs directly all over the UI.

### Rules
- API request logic belongs in `services/` or `api/`
- Screens and components should call service functions or hooks
- Keep API clients centralized
- Normalize response handling where possible
- Handle errors consistently

### Recommended separation
- `api/client.ts` for HTTP client setup
- `services/authService.ts`
- `services/chatService.ts`
- `hooks/useLogin.ts`

### Must do
- Add timeout handling where appropriate
- Handle loading, success, and error states
- Map raw API responses into usable shapes if needed
- Never silently swallow errors

---

## 10. Error Handling

Errors should be explicit, helpful, and safe.

### Rules
- Catch errors close to boundary points like API calls
- Show user-friendly messages in UI
- Log technical details in a controlled way
- Avoid exposing raw backend/internal errors to users

### Good practice
- Return structured error states
- Distinguish validation errors, network errors, auth errors, and unexpected failures

### Avoid
- Empty `catch` blocks
- `console.log(error)` everywhere without structure
- Generic “Something went wrong” for every case if more clarity is possible

---

## 11. Forms and Validation

### Rules
- Validate input before submit
- Keep validation rules centralized where possible
- Show clear inline feedback
- Do not mix heavy validation logic directly inside JSX

### Best practices
- Use form state hooks or dedicated form libraries when complexity grows
- Sanitize and validate API-bound data
- Disable submit only when there is a clear reason

---

## 12. Navigation Standards

### Rules
- Keep route names centralized
- Type navigation params
- Avoid magic strings spread across files
- Keep navigation logic in screens or dedicated navigation helpers, not buried in leaf components unless truly local

### Example
- Use a route constant or typed navigator
- Keep screen-to-screen contracts explicit

---

## 13. Performance Best Practices

Do not optimize prematurely, but avoid obvious waste.

### Rules
- Avoid unnecessary re-renders
- Memoize only where it provides real value
- Use `FlatList` correctly for lists
- Avoid inline object/function creation in hot render paths when it causes real churn
- Load only the data the screen needs

### Use carefully
- `React.memo`
- `useMemo`
- `useCallback`

### Avoid
- Blanket memoization everywhere
- Premature complexity for imagined performance issues

### For list screens
- Use stable keys
- Paginate when needed
- Avoid rendering heavy hidden UI

---

## 14. Logging and Debugging

### Rules
- Use structured logging utilities if available
- Remove debug-only logs before merge
- Never log secrets, tokens, or personal data
- Keep error logs useful and searchable

### Avoid
- Leaving temporary logs in production code
- Logging full API payloads with sensitive content

---

## 15. Security Basics

### Must do
- Never hardcode secrets in the app
- Use secure storage for sensitive tokens if needed
- Validate and sanitize user input
- Treat all API data as untrusted until handled safely
- Be careful with deep links and navigation params
- Protect child/parent profile boundaries if app supports family accounts

### Avoid
- Storing private keys in the app
- Trusting client-side checks alone for permissions

---

## 16. Accessibility Basics

### Rules
- Use accessible labels where needed
- Ensure tap targets are usable
- Support readable text sizes when practical
- Keep contrast and clarity in mind
- Do not rely only on color for meaning

---

## 17. Testing Expectations

Testing should focus on confidence, not just coverage numbers.

### Minimum expectations
- Unit test important utilities and business logic
- Test critical hooks if they contain non-trivial logic
- Test important screen flows and user actions
- Cover high-risk paths such as auth, payments, chat submission, profile switching

### Good candidates for tests
- Validation functions
- Data transformation helpers
- Reducers/state logic
- Hooks with branching logic
- Error handling behavior

### Avoid
- Writing brittle tests for tiny implementation details
- Over-mocking everything until tests lose value

---

## 18. Code Review Rules

Every pull request should be reviewed for:

- Readability
- Naming clarity
- Separation of concerns
- Reusability
- Type safety
- Error handling
- Testability
- Performance risks
- Security risks
- Alignment with this guideline

### Review questions
- Can another engineer understand this quickly?
- Is this logic in the right layer?
- Is anything duplicated that should be extracted?
- Are edge cases handled?
- Is the code easy to test?
- Would this be safe to maintain six months later?

---

## 19. AI-Assisted Coding Rules

AI can accelerate work, but it must not lower quality.

### AI must do
- Follow the folder structure of this project
- Use TypeScript types properly
- Keep components focused and small
- Reuse existing patterns before introducing new ones
- Add comments only when they clarify non-obvious intent
- Prefer simple, maintainable solutions
- Respect theme tokens and existing design system
- Keep API logic out of UI components
- Handle loading, empty, and error states
- Avoid unsafe assumptions about backend responses

### AI must not do
- Generate huge files mixing UI, state, API, and navigation
- Introduce unused packages or patterns
- Use `any` without strong reason
- Duplicate existing components or helpers without checking
- Invent APIs or response fields without confirmation
- Add dead code, placeholder code, or fake TODO logic pretending to be complete
- Change unrelated files unnecessarily
- Break naming or folder conventions
- Add complex abstractions too early

### When AI generates code
The generated code should include:
- Clear component names
- Typed props and responses
- Error handling
- Maintainable structure
- Minimal but useful comments
- No hidden magic behavior

### Human review checklist for AI-generated code
- Is the code aligned with project structure?
- Are types correct?
- Is any logic duplicated?
- Is error handling complete?
- Is the code too clever or too large?
- Does it match existing patterns?
- Is it easy to extend later?

---

## 20. Commenting Standards

### Write comments for
- Why a decision exists
- Non-obvious business rules
- Workarounds with context
- Important assumptions

### Do not comment
- Obvious code
- Line-by-line narration of simple logic

Bad:
```ts
// increment i by 1
i++;
```

Better:
```ts
// We retry once here because the token refresh may complete during the first failure.
```

---

## 21. Dependency Rules

### Rules
- Add a new dependency only when justified
- Prefer established libraries over obscure packages
- Avoid overlapping libraries that solve the same problem
- Record why a major dependency was introduced

### Before adding a package
Ask:
- Can we solve this with existing tools?
- Is the package maintained?
- Is it too heavy for the value it adds?
- Will it complicate upgrades?

---

## 22. Git and PR Hygiene

### Branch and PR expectations
- Keep pull requests focused
- Avoid mixing refactor + feature + bug fix in one PR
- Name branches clearly
- Write meaningful PR descriptions

### Commit message style
Prefer clear action-oriented messages:
- `add typed auth service`
- `refactor profile screen state handling`
- `fix chat retry error handling`

---

## 23. Example Screen Design Pattern

Recommended flow for a non-trivial screen:

1. Screen component handles layout and navigation
2. Custom hook handles screen logic and state
3. Service handles API interaction
4. Reusable child components handle UI blocks
5. Shared types define contracts

### Example
```text
features/profile/
  components/
    ProfileHeader.tsx
    ProfileForm.tsx
  hooks/
    useProfileScreen.ts
  services/
    profileService.ts
  types/
    profileTypes.ts
  utils/
    profileMapper.ts
screens/
  Profile/
    ProfileScreen.tsx
```

---

## 24. Definition of Done

Code is not done when it “works on one screen.”
Code is done when:

- It is readable
- It follows project structure
- It is typed correctly
- It handles errors
- It avoids duplication
- It is tested at the right level
- It matches design/theme patterns
- It is reviewed and maintainable

---

## 25. Final Rule

Any engineer or AI writing code in this repository must optimize for:

**clarity, consistency, maintainability, and safe change over time.**

If a solution is faster to write but harder to maintain, it is not the right solution.

---

## Suggested File Location in Repo

Store this document at:

```text
/docs/react-native-coding-guidelines.md
```

or, if you want it closer to implementation:

```text
/src/docs/react-native-coding-guidelines.md
```

Preferred choice:
- `/docs/react-native-coding-guidelines.md`

This keeps standards separate from runtime code while still version-controlled inside the project.
