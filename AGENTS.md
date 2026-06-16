# AGENTS.md - hospital3 (Frontend)

## Quick Start

```bash
yarn start            # Dev server http://localhost:4200
yarn build            # Production build → dist/medicapp/browser
yarn watch            # Dev build with watch
yarn test             # Jasmine/Karma tests
```

## Stack

- **Framework**: Angular 20 standalone components
- **Language**: TypeScript 5.8 strict mode
- **Styling**: CSS + PostCSS + PurgeCSS + Autoprefixer (Bootstrap-like classes)
- **State**: Angular Signals + RxJS BehaviorSubject
- **PWA**: Angular Service Worker + Dexie.js (IndexedDB) for offline-first
- **Charts**: Chart.js, ApexCharts, CanvasJS, ngx-charts, D3.js
- **Build**: Vite/esbuild via Angular CLI
- **Package manager**: Yarn (primary)

## Architecture

```
src/
├── app/
│   ├── directives/          # 4 custom directives
│   ├── enum/                # Enums: departamentos, diccionarios, especialidades, roles
│   ├── guards/              # AuthGuard + roleGuard
│   ├── interceptors/        # authInterceptor (JWT Bearer)
│   ├── interface/           # 12 TypeScript model files
│   ├── medica/              # Doctor clinic (notas, historia clínica)
│   ├── nutricion/           # Nutrition module
│   ├── odontologia/         # Dentistry module
│   ├── pipes/               # 9 custom pipes
│   ├── principal/           # Core: dashboard, admin, home
│   ├── pwa/                 # Offline banner, update notification
│   ├── registros/           # Records: patients, consultations, appointments,
│   │                        #   admissions, birth certs, loans, RENAP
│   ├── service/             # api.service, base-api, offline-db, sync, axios
│   ├── shared/              # Shared assets
│   ├── std/                 # Statistics, doctors, procedures (catalogopro uses modal CRUD)
│   ├── trabajoSocial/       # Social work
│   ├── uisau/               # Bed management (encamamiento)
│   └── validators/          # Custom validators
```

## Backend API

All requests go to `https://www.htecpan.com/fah` (FastAPI backend = `back_sys`).

Key endpoints consumed:
| Module | Endpoints |
|--------|-----------|
| Auth | `POST /auth/login`, `GET /auth/me` |
| Patients | `GET/POST /pacientes/`, `GET/PUT /pacientes/{id}`, `POST /pacientes/merge` |
| Consultations | `GET/POST /consultas/`, `GET/PUT /consultas/{id}`, `GET /consultas/pacienteId/{id}` |
| Appointments | `GET/POST /citas/`, `PUT/DELETE /citas/{id}` |
| Doctors | `GET/POST /medicos/`, `PUT/DELETE /medicos/{id}` |
| Birth Certs | `GET/POST /constancias-nacimiento/` |
| Procedures | `GET/POST /procedimientos/`, `GET /procedimientos/catalogo` |
| Record Loans | `GET/POST /prestamos/`, `PUT /prestamos/{id}` |
| Correlatives | `POST /correlativos/expediente`, `/emergencia`, `/constancia_nacimiento` |
| Reference | `GET /municipios/departamentos`, `GET /paises/` |
| RENAP | `GET /renap/persona` |
| Totals | `GET /totales/` |
| Statistics | `GET /estadisticas/resumen`, `/consultas/por-dia`, `/por-especialidad` |
| Audit | `GET /audit-log/` |

## Offline Architecture

- **Dexie DB tables**: `cache`, `mutations`, `syncMeta`, `pacientes`, `consultas`
- Reads use `cacheGet(key, request$, ttl)` → checks IndexedDB first
- Writes use `offMutation()` → if offline, queues in `mutations` table
- On reconnect, `OfflineSyncService` processes queued mutations
- Reference data (departments, countries) pre-cached on login with 30-60min TTL
- Patients and consultations pre-cached page-by-page on login

## Path Aliases (tsconfig)

`@enums/*`, `@shared/*`, `@services/*`, `@models/*`

## Key Services

| Service | File | Role |
|---------|------|------|
| `ApiService` | `api.service.ts` | Main API consumer (all endpoints) |
| `BaseApiService` | `base-api.service.ts` | Shared base with offline, caching |
| `OfflineSyncService` | `offline-sync.service.ts` | Dexie cache, mutation queue |
| `OfflineDatabaseService` | `offline-database.service.ts` | IndexedDB schema & operations |

## Roles (RBAC)

`admin`, `registro`, `std`, `medico`, `uisau`, `ts`, `nutric`, `odonto`, `paramedic`, `lab`, `rx`, `epi`

## Deploy

Build → `deploy.sh` copies to `/var/www/medicapp`, sets nginx perms, reloads.

## Related Projects

- **back_sys** → Python/FastAPI backend (this is the API this frontend consumes)
- **migration_api** → Data migration from MySQL legacy to PostgreSQL
