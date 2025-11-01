# TourSite — project summary

A full‑stack monorepo implementing an e‑commerce / tour booking platform.

## Tech stack

- Frontend: Next.js (App Router) + TypeScript
  - UI: Tailwind CSS + DaisyUI
  - Images: `next/image`
  - State: Redux
- Backend: Spring Boot (Java) + Gradle
  - Persistence: Spring Data JPA
  - Mapping: MapStruct
  - Security: Spring Security + JWT

## Layout & important folders

- `frontend/`
  - `src/app/` — Next pages (App Router)
  - `src/components/` — reusable UI components
  - `src/lib/` — API clients (e.g. `tourService.ts`, `AuthService.ts`)
  - `src/types/` — shared TypeScript types
- `backend/`
  - `src/main/java/.../controller` — REST controllers
  - `.../service` — business logic
  - `.../repository` — JPA repositories
  - `.../model` — JPA entities
  - `.../dto` & `.../mapper` — DTOs and MapStruct mappers

## Communication

- Frontend communicates with backend via Axios.
- Default ports: backend `8080`, frontend dev `3000`.
- Axios is configured with `withCredentials: true` for authenticated calls (cookies/JWT). Public calls may use `withCredentials: false`.

## Key files

- `frontend/tailwind.config.mjs` — DaisyUI & Tailwind config
- `frontend/package.json` — frontend scripts
- `backend/build.gradle` & `gradlew(.bat)` — backend build/run
- `frontend/src/lib/*` — canonical API clients that mirror backend endpoints

## Developer commands

From the `frontend/` folder:

```bash
npm install
npm run dev       # start Next dev server (3000)
npm run build     # build for production
npm run lint      # linting
```

From the `backend/` folder (use the Gradle wrapper):

```powershell
# Windows PowerShell
.\gradlew.bat clean build
.\gradlew.bat bootRun
# build JAR
.\gradlew.bat bootJar
# run produced JAR (from backend/build/libs)
java -jar build\libs\<your-app>.jar
```

## Common issues & tips

- CORS / cookies / CSRF: If you get `403` on auth endpoints, check `SecurityConfig` for `permitAll()` and backend CORS configuration. Registration/login endpoints should be accessible without authentication.
- DaisyUI themes: configure themes in `tailwind.config.mjs` (do not try to configure DaisyUI via CSS `@plugin` lines).
- Use `next/image` for optimized image delivery instead of raw `<img>` where possible.
- If you hit optimistic locking exceptions in JPA, add a `@Version` field to the entity to enable proper optimistic locking handling.

---

If you want this content copied to the repository root `README.md` or turned into a short `.github/copilot-instructions.md` tailored for AI contributors, tell me where and I'll add it.
