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
│   │   └── administrador/   #   admin: usuarios, municipios, encamamiento, merge, eliminar
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

Backend runs at `http://localhost:8000/fah/...` (FastAPI). Full endpoint reference in `back_sys/AGENTS.md`.

| Module | Key Endpoints |
|--------|---------------|
| Auth | `POST /auth/login`, `GET /auth/me` |
| Users | `GET/POST /users/`, `GET/PUT/DELETE /users/{id}`, `PATCH /users/recuperar` |
| Patients | `GET/POST /pacientes/`, `GET/PATCH /pacientes/{id}`, `POST /pacientes/madre-hijo/{id}`, `POST /pacientes/merge`, `GET /pacientes/duplicados/nombres-similares` |
| Consultations | `GET/POST /consultas/`, `GET/PATCH/DELETE /consultas/{id}`, `POST /consultas/registro`, `GET /consultas/pacienteId/{id}`, `DELETE /consultas/{id}/eliminar` |
| Appointments | `GET/POST /citas/`, `GET/PUT/DELETE /citas/{id}`, `GET /citas/disponibles`, `GET /citas/paciente/{id}` |
| Doctors | `GET/POST /medicos/`, `GET/PUT/DELETE /medicos/{id}` |
| Birth Certs | `GET/POST /constancias-nacimiento/`, `GET/PUT/DELETE /constancias-nacimiento/{id}`, `GET /constancias-nacimiento/historial/{id}` |
| Procedures | `GET/POST /procedimientos/`, `GET/PUT/DELETE /procedimientos/{id}`, `GET/POST /procedimientos/catalogo`, `PUT/DELETE /procedimientos/catalogo/{id}` |
| Record Loans | `GET/POST /prestamos/`, `GET/PUT/DELETE /prestamos/{id}` |
| Correlatives | `POST /correlativos/expediente`, `/emergencia`, `/constancia_nacimiento`, `/constancia_defuncion`, `/constancia_medica` |
| Municipios | `GET/POST /municipios/`, `PUT/DELETE /municipios/{codigo}`, `GET /municipios/departamentos` |
| Encamamiento | `GET/POST /encamamiento/`, `GET/PATCH/DELETE /encamamiento/{servicio_id}` |
| Countries | `GET /paises/`, `GET /paises/select`, `GET /paises/{codigo}` |
| Nacimientos | `GET/POST /nacimientos/`, `GET/PATCH/DELETE /nacimientos/{id}`, `POST /nacimientos/desde-paciente/{id}`, `POST /nacimientos/sincronizar` |
| Events | `GET/POST /eventos/`, `GET/PATCH/DELETE /eventos/{id}` |
| Cycles | `GET /ciclos/consulta/{id}`, `GET /ciclos/{id}`, `POST /ciclos/` |
| RENAP | `GET /renap/persona` |
| Totals | `GET /totales/` |
| Statistics | `GET /estadisticas/resumen`, `/consultas/por-dia`, `/por-especialidad`, `/pacientes/piramide`, `/procedimientos/top`, `/ocupacion`, `/reporte`, `/personal-salud` |
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
| `ApiService` | `api.service.ts` | Main API consumer (all endpoints including municipios, encamamiento) |
| `BaseApiService` | `base-api.service.ts` | Shared base with offline, caching |
| `OfflineSyncService` | `offline-sync.service.ts` | Dexie cache, mutation queue |
| `OfflineDatabaseService` | `offline-database.service.ts` | IndexedDB schema & operations |

## Roles (RBAC)

`admin`, `registro`, `std`, `medico`, `uisau`, `ts`, `nutric`, `odonto`, `paramedic`, `lab`, `rx`, `epi`

## Deploy

Build → `deploy.sh` copies to `/var/www/medicapp`, sets nginx perms, reloads.

## Frontend ↔ Backend Mapping

All API calls go through `ApiService` (`service/api.service.ts`) to `http://localhost:8000/fah/...`.

### Admin Components

| Component | Route | Guard | ApiService Methods | Backend Endpoint |
|-----------|-------|-------|--------------------|------------------|
| `AdminComponent` | `/adminsys` | admin | *(navigation only)* | — |
| `UsuariosComponent` | `/usuarios` | admin | `getUsers()` | `GET /users/` |
| `UsuarioComponent` | `/usuario/:id` | admin | `getUser(id)`, `updateUser(id,data)` | `GET/PUT /users/{id}` |
| `RegistrarComponent` | `/newuser` | admin | `createUser(data)` | `POST /users/` |
| `GestionMunicipiosComponent` | `/gestion-municipios` | admin | `getMunicipios()`, `createMunicipio()`, `updateMunicipio()`, `deleteMunicipio()` | `GET/POST /municipios/`, `PUT/DELETE /municipios/{codigo}` |
| `GestionEncamamientoComponent` | `/gestion-encamamiento` | admin | `getServiciosEncamamiento()`, `createServicioEncamamiento()`, `updateServicioEncamamiento()`, `deleteServicioEncamamiento()` | `GET/POST /encamamiento/`, `PATCH/DELETE /encamamiento/{id}` |
| `MergePacientesComponent` | `/merge-pacientes` | admin | `mergePacientes()` | `POST /pacientes/merge` |
| `RecuperarComponent` | `/resetpass` | public | `passReset()` | `PATCH /users/recuperar` |

### Patient & Consultation Components

| Component | Route | ApiService / Service Method | Backend Endpoint |
|-----------|-------|-----------------------------|------------------|
| `PacientesComponent` | `/pacientes` | `ApiService` (via `BaseApiService`) | `GET /pacientes/` |
| `FormularioPacienteComponent` | `/paciente`, `/paciente/:modo`, `/pacienteEdit/:id` | `ApiService` | `GET/POST /pacientes/`, `PATCH /pacientes/{id}` |
| `DetallePacienteComponent` | `/detallePaciente/:id` | `ApiService` | `GET /pacientes/{id}` |
| `AdmisionComponent` | `/admision*`, `/editarAdmision*` | `ApiService` | `POST /consultas/registro`, `PATCH /consultas/{id}` |
| `ConsultasComponent` | `/consultas` | `ApiService` via `ConsultaService` | `GET /consultas/` |
| `RecepcionComponent` | `/recepcion` | `ApiService` via `ConsultaService` | `GET /consultas/buscarpaciente` |
| `EmergenciasListComponent` | `/emergencias` | `ApiService` via `ConsultaService` | `GET /consultas/` (especialidad=emergencia) |
| `HojaComponent` | `/hojaEmergencia/:id` | `ApiService` via `ConsultaService` | `GET /consultas/{id}` |
| `CoexListaComponent` | `/coex` | `ApiService` via `ConsultaService` | `GET /consultas/` (especialidad=coex) |
| `HojaCoexComponent` | `/coexHoja/:id` | `ApiService` via `ConsultaService` | `GET /consultas/{id}` |
| `IngresosComponent` | `/ingresos` | `ApiService` via `ConsultaService` | `GET /consultas/` (especialidad=hospitalizacion) |
| `HojaIngresoComponent` | `/ingreso/:id` | `ApiService` via `ConsultaService` | `GET /consultas/{id}` |
| `NotaMedicaComponent` | `/notaMedica/:consultaId` | `ApiService` via `ConsultaService` | `GET /consultas/{id}` |
| `HistoriaClinicaComponent` | `/historiaClinica/:consultaId` | `ApiService` | `GET /consultas/pacienteId/{paciente_id}` |
| `DesactivarConsultaComponent` | `/desactivar-consulta` | `ConsultaService.updateConsulta()` | `PATCH /consultas/{id}` |
| `EliminarConsultaComponent` | `/eliminar-consulta` | `ConsultaService.deleteConsulta()` | `DELETE /consultas/{id}/eliminar` |

### Appointment Components

| Component | Route | ApiService Method | Backend Endpoint |
|-----------|-------|--------------------|------------------|
| `CitadosComponent` | `/citas` | `ApiService` | `GET /citas/` |
| `AgendarComponent` | `/agendar*`, `/reagendar*` | `ApiService` | `POST/GET/PUT /citas/`, `GET /citas/disponibles` |
| `CitasEspecialidadComponent` | `/citaspacientes` | `ApiService` | `GET /citas/` |

### Birth Certificate Components

| Component | Route | Service Method | Backend Endpoint |
|-----------|-------|----------------|------------------|
| `ListarConstanciasComponent` | `/nacimientos` | `ConstanciasService` | `GET /constancias-nacimiento/` |
| `ConstanciasNacimientoComponent` | `/cons-nac/:id` | `ConstanciasService` | `GET/PUT /constancias-nacimiento/{id}` |
| `NuevaConstanciaNacimientoComponent` | `/nueva-cons-nac` | `ConstanciasService` | `POST /constancias-nacimiento/` |
| `EliminarConstanciaComponent` | `/eliminar-constancia` | `ConstanciasService.deleteConstancia()` | `DELETE /constancias-nacimiento/{id}` |

### STD / Catalog Components

| Component | Route | ApiService Method | Backend Endpoint |
|-----------|-------|--------------------|------------------|
| `EstadisticaComponent` | `/estadistica` | `ApiService` | `GET /estadisticas/*` |
| `ConsultorComponent` | `/consultar` | `ApiService` | `GET /estadisticas/reporte` |
| `DoctoresComponent` | `/doctores` | `ApiService` | `GET /medicos/` |
| `DoctorFormComponent` | `/doctor*` | `ApiService` | `GET/POST/PUT /medicos/`, `DELETE /medicos/{id}` |
| `CatalogoprocedimientoComponent` | `/catalogoProcedimientos` | `ApiService` | `GET/POST /procedimientos/catalogo`, `PUT/DELETE /procedimientos/catalogo/{id}` |
| `ProcedimientosmenoresComponent` | `/procedimientosmenores` | `ApiService` | `GET /procedimientos/` |
| `ProcemedicoComponent` | `/procemedic*` | `ApiService` | `GET/POST/PUT /procedimientos/` |

### Loan Components

| Component | Route | Service Method | Backend Endpoint |
|-----------|-------|----------------|------------------|
| `ListarPrestamosComponent` | `/prestamos` | `PrestamoService` | `GET /prestamos/` |
| `CrearPrestamoComponent` | `/prestamo/:id`, `/editarPrestamo/:id` | `PrestamoService` | `GET/POST/PUT /prestamos/` |

### Other Modules

| Component | Route | Backend |
|-----------|-------|---------|
| `RenapComponent` | `/renap` | `GET /renap/persona` |
| `HijosComponent` | `/hijo/:id` | `POST /pacientes/madre-hijo/{id}` |
| `DashboardComponent` | `/dash` | `GET /totales/` |
| `EncamamientoComponent` (UISAU) | `/encamamiento` | `GET /encamamiento/` |
| `MenuNutriComponent` | `/menu-nutri` | *(navigation)* |
| `MenuOdontoComponent` | `/menu-odonto` | *(navigation)* |
| `MenutsComponent` | `/TrabajoSocial` | *(navigation)* |
| `UisauMenuComponent` | `/uisau` | *(navigation)* |

## Related Projects

- **back_sys** → Python/FastAPI backend (this is the API this frontend consumes)
- **migration_api** → Data migration from MySQL legacy to PostgreSQL
