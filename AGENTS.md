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

All requests go to `https://www.htecpan.com/fah` (FastAPI backend = `back_sys`). Auth: `admin` = requires admin role; `auth` = requires authenticated user; `public` = no auth.

Full endpoint reference in `back_sys/AGENTS.md`.

| Module | Key Endpoints |
|--------|---------------|
| Auth | `POST /auth/login` (public), `GET /auth/me` (auth) |
| Users | `GET/POST /users/` (admin), `GET/PUT /users/{id}` (auth), `DELETE /users/{id}` (admin, soft), `PATCH /users/recuperar` (public) |
| Patients | `GET/POST /pacientes/` (auth), `GET/PATCH /pacientes/{id}` (auth), `POST /pacientes/madre-hijo/{id}` (auth), `POST /pacientes/merge` (admin), `GET /pacientes/duplicados/nombres-similares` (auth), `GET /pacientes/neonatales` (auth), `GET /pacientes/expediente/{expediente}` (auth), `GET /pacientes/debug/count` (auth), `DELETE /pacientes/{id}/eliminar-permanente` (admin) |
| Consultations | `GET/POST /consultas/` (auth), `GET/PATCH/DELETE /consultas/{id}` (auth), `POST /consultas/registro` (auth), `GET /consultas/pacienteId/{id}` (auth), `GET /consultas/buscarpaciente` (auth), `PATCH /consultas/sincronizar-indicadores` (auth), `DELETE /consultas/{id}/eliminar` (admin) |
| Appointments | `GET/POST /citas/` (auth), `GET/PUT/DELETE /citas/{id}` (auth), `GET /citas/disponibles` (auth), `GET /citas/paciente/{id}` (auth) |
| Doctors | `GET/POST /medicos/` (public), `GET/PUT/DELETE /medicos/{id}` (public) |
| Birth Certs | `GET/POST /constancias-nacimiento/` (auth), `GET/PUT /constancias-nacimiento/{id}` (auth), `DELETE /constancias-nacimiento/{id}` (admin), `GET /constancias-nacimiento/historial/{id}` (auth) |
| Procedures | `GET/POST /procedimientos/` (auth), `GET/PUT/DELETE /procedimientos/{id}` (auth), `GET/POST /procedimientos/catalogo` (auth), `PUT/DELETE /procedimientos/catalogo/{id}` (admin), `GET /procedimientos/reporte` (auth), `GET /procedimientos/estadisticas/resumen` (auth) |
| Record Loans | `GET/POST /prestamos/` (auth), `GET/PUT/DELETE /prestamos/{id}` (auth) |
| Correlatives | `POST /correlativos/expediente` (auth), `/emergencia` (auth), `/constancia_nacimiento` (auth), `/constancia_defuncion` (auth), `/constancia_medica` (auth) |
| Municipios | `GET/POST /municipios/` (public), `PUT/DELETE /municipios/{codigo}` (admin), `GET /municipios/departamentos` (public) |
| Encamamiento | `GET/POST /encamamiento/` (public), `GET/PATCH/DELETE /encamamiento/{servicio_id}` (public) |
| Countries | `GET /paises/` (public), `GET /paises/select` (public), `GET /paises/{codigo}` (public) |
| Nacimientos | `GET/POST /nacimientos/` (auth), `GET/PATCH/DELETE /nacimientos/{id}` (auth), `POST /nacimientos/desde-paciente/{id}` (auth), `POST /nacimientos/sincronizar` (auth), `GET /nacimientos/referenciar-legacy` (auth) |
| Nac. Legacy | `GET /nacimientos-legacy/` (auth), `PUT /nacimientos-legacy/{id}` (auth) |
| Events | `GET/POST /eventos/` (auth), `GET/PATCH/DELETE /eventos/{id}` (auth) |
| Cycles | `GET /ciclos/consulta/{id}` (auth), `GET /ciclos/{id}` (auth), `POST /ciclos/` (auth) |
| RENAP | `GET /renap/persona` (auth) |
| Totales | `GET /totales/` (auth) |
| Statistics | `GET /estadisticas/resumen` (auth), `/consultas/por-dia` (auth), `/por-especialidad` (auth), `/pacientes/piramide` (auth), `/procedimientos/top` (auth), `/ocupacion` (auth), `/reporte` (auth), `/personal-salud` (auth) |
| SIGSA-3 | `GET/POST /sigsa3/` (auth), `GET/PUT/DELETE /sigsa3/{id}` (auth) |
| Audit | `GET /audit-log/` (admin) |

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
| `DetallePacienteComponent` | `/detallePaciente/:id` | `PacienteService.getPaciente()` | `GET /pacientes/{id}` |
| `AdmisionComponent` | `/admision*`, `/editarAdmision*` | `ConsultaService` | `POST /consultas/registro`, `PATCH /consultas/{id}` |
| `ConsultasComponent` | `/consultas` | `ConsultaService` | `GET /consultas/` |
| `RecepcionComponent` | `/recepcion` | `ConsultaService.getPacientesBuscados()` | `GET /consultas/buscarpaciente` |
| `EmergenciasListComponent` | `/emergencias` | `ConsultaService` | `GET /consultas/` (especialidad=emergencia) |
| `HojaComponent` | `/hojaEmergencia/:id` | `ConsultaService` | `GET /consultas/{id}` |
| `CoexListaComponent` | `/coex` | `ConsultaService` | `GET /consultas/` (especialidad=coex) |
| `HojaCoexComponent` | `/coexHoja/:id` | `ConsultaService` | `GET /consultas/{id}` |
| `IngresosComponent` | `/ingresos` | `ConsultaService` | `GET /consultas/` (especialidad=hospitalizacion) |
| `HojaIngresoComponent` | `/ingreso/:id` | `ConsultaService` | `GET /consultas/{id}` |
| `NotaMedicaComponent` | `/notaMedica/:consultaId` | `ConsultaService` | `GET /consultas/{id}` |
| `HistoriaClinicaComponent` | `/historiaClinica/:consultaId` | `ConsultaService` | `GET /consultas/pacienteId/{paciente_id}` |
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
| `NuevaConstanciaNacimientoComponent` | `/nueva-cons-nac` | `PacienteService.pacienteExpediente()` | `GET /pacientes/expediente/{expediente}` |

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
