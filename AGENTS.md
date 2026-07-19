# AGENTS.md - hospital3 (Frontend)

## Quick Start

```bash
pnpm start            # Dev server http://localhost:4200
pnpm build            # Production build → dist/medicapp/browser
pnpm watch            # Dev build with watch
pnpm test             # Jasmine/Karma tests
```

## Stack

- **Framework**: Angular 20 standalone components
- **Language**: TypeScript 5.8 strict mode
- **Styling**: CSS + PostCSS + PurgeCSS + Autoprefixer (Bootstrap-like classes)
- **State**: Angular Signals + RxJS BehaviorSubject
- **PWA**: Angular Service Worker + Dexie.js (IndexedDB) for offline-first
- **Charts**: none (all chart libraries removed — unused)
- **Build**: Vite/esbuild via Angular CLI
- **Package manager**: pnpm (primary)

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

## Backend API (`back_sys`)

Base URL: `https://www.htecpan.com/fah` (root_path=`/fah`).
Auth: `admin` = requires admin role; `auth` = requires authenticated user; `public` = no auth.

### Stack

- **Framework**: FastAPI 0.122 (Python 3.11+)
- **Server**: Uvicorn 0.38
- **Database**: PostgreSQL 18 (db: `hospital`)
- **ORM**: SQLAlchemy 2.0 + psycopg2-binary
- **Auth**: JWT (python-jose HS256) + Argon2 (passlib)
- **Validation**: Pydantic 2.12
- **Email**: FastAPI-Mail (SMTP Gmail) + Jinja2 templates
- **Testing**: pytest 9 + FastAPI TestClient
- **Analytics**: pandas, matplotlib, numpy, plotly
- **Excel**: openpyxl
- **Package manager**: Poetry (primary) + pip

### Architecture: Modular Monolith

```
back_sys/
├── main.py                    # FastAPI app entry point (root_path="/fah")
├── core/                      # Shared framework
│   ├── config.py              # Env vars (JWT, mail, DB)
│   ├── database.py            # SQLAlchemy engine + session
│   ├── security.py            # JWT create/verify, Argon2 hash
│   ├── dependencies.py        # FastAPI DI re-exports
│   ├── exceptions.py          # Global error handlers (422, 409, 500)
│   └── mail.py                # FastAPI-Mail config
├── modules/                   # 28 domain modules
│   ├── auth/                  # POST /auth/login, GET /auth/me
│   ├── users/                 # Full user CRUD
│   ├── pacientes/             # Patient CRUD, duplicates (trigram/soundex), merge, neonates
│   ├── consultas/             # Medical consultations registry
│   ├── ciclos/                # Clinical cycles
│   ├── encamamiento/          # Bed census by service
│   ├── eventos/               # Clinical events (admission, evolution, discharge)
│   ├── medicos/               # Doctors CRUD
│   ├── citas/                 # Appointments
│   ├── expediente/            # Correlative number generation
│   ├── constancias_nacimiento/ # Birth certificates
│   ├── prestamos/             # Record/file loans
│   ├── procedimientos/        # Procedure catalog + records
│   ├── municipios/            # Guatemalan municipalities
│   ├── nacimientos/           # Birth records from madre-hijo
│   ├── paises_iso/            # ISO country codes
│   ├── renap/                 # RENAP civil registry integration
│   ├── totales/               # Real-time dashboard KPIs
│   ├── estadisticas/          # Statistics & reports (11 endpoints)
│   ├── audit_log/             # Access audit logging
│   ├── censo_camas/           # Bed census stats
│   ├── cie10/                 # ICD-10 diagnosis codes
│   ├── defunciones/           # Death certificates
│   ├── chat/                  # Internal chat
│   ├── laboratorios/          # Lab tests (models only)
│   ├── rayos_x/               # X-rays (models only)
│   ├── sigsa3/                # SIGSA-3 consultation registry
│   └── common/schemas.py      # Shared Pydantic schemas
└── api-cie11/                 # ICD-11 medical coding data
```

### Module Convention

Each module in `modules/` contains:
- `router.py` → Route definitions
- `schemas.py` → Pydantic models
- `models.py` → SQLAlchemy ORM models
- `service.py` → Business logic

### Endpoint Reference

| Module | Method | Path | Auth | Description |
|--------|--------|------|------|-------------|
| Health | GET | `/health` | public | Health check (DB) |
| Auth | POST | `/auth/login` | public | Login → JWT |
| Auth | GET | `/auth/me` | auth | Current user |
| Users | GET | `/users/` | admin | List (filtros: username, id, email, rol) |
| Users | GET | `/users/{user_id}` | auth | By ID |
| Users | POST | `/users/` | admin | Create (envía email) |
| Users | PUT | `/users/{user_id}` | admin/self | Update |
| Users | PATCH | `/users/recuperar` | public | Reset password |
| Users | DELETE | `/users/{user_id}` | admin | Soft delete |
| Pacientes | GET | `/pacientes/` | auth | Search (15+ filtros: q, id, cui, expediente, nombre, sexo, estado, etc.) |
| Pacientes | GET | `/pacientes/neonatales` | auth | Neonatales |
| Pacientes | GET | `/pacientes/{paciente_id}` | auth | By ID |
| Pacientes | POST | `/pacientes/` | auth | Create (201) |
| Pacientes | PATCH | `/pacientes/{paciente_id}` | auth | Update/activar/desactivar/expediente |
| Pacientes | DELETE | `/pacientes/{paciente_id}/eliminar-permanente` | admin | Hard delete (204) |
| Pacientes | GET | `/pacientes/debug/count` | auth | Conteo |
| Pacientes | GET | `/pacientes/expediente/{expediente}` | auth | By expediente |
| Pacientes | GET | `/pacientes/duplicados/nombres-similares` | auth | Trigram/soundex |
| Pacientes | POST | `/pacientes/merge` | admin | Merge duplicados |
| Pacientes | POST | `/pacientes/madre-hijo/{madre_id}` | auth | Crear desde madre (201) |
| Consultas | GET | `/consultas/` | auth | List (15+ filtros) |
| Consultas | GET | `/consultas/buscarpaciente` | auth | Buscar pacientes |
| Consultas | GET | `/consultas/{consulta_id}` | auth | By ID |
| Consultas | PATCH | `/consultas/sincronizar-indicadores` | auth | Sync indicadores |
| Consultas | PATCH | `/consultas/{consulta_id}` | auth | Update |
| Consultas | POST | `/consultas/registro` | auth | Nueva consulta (201) |
| Consultas | GET | `/consultas/pacienteId/{paciente_id}` | auth | By patient |
| Consultas | DELETE | `/consultas/{consulta_id}` | auth | Desactivar |
| Consultas | DELETE | `/consultas/{consulta_id}/eliminar` | admin | Hard delete |
| Ciclos | GET | `/ciclos/consulta/{consulta_id}` | auth | By consulta |
| Ciclos | GET | `/ciclos/{ciclo_id}` | auth | By ID |
| Ciclos | POST | `/ciclos/` | auth | Create (201) |
| Citas | POST | `/citas/` | auth | Create (201) |
| Citas | GET | `/citas/` | auth | List (filtros: id, expediente, paciente_id, especialidad, fecha_cita) |
| Citas | GET | `/citas/paciente/{paciente_id}` | auth | By patient |
| Citas | GET | `/citas/disponibles` | auth | Disponibles |
| Citas | GET | `/citas/{cita_id}` | auth | By ID |
| Citas | PUT | `/citas/{cita_id}` | auth | Update |
| Citas | DELETE | `/citas/{cita_id}` | auth | Soft delete |
| Medicos | POST | `/medicos/` | public | Create (201) |
| Medicos | GET | `/medicos/` | public | List (filtros: id, activo, nombre, colegiado, especialidad) |
| Medicos | GET | `/medicos/{medico_id}` | public | By ID |
| Medicos | PUT | `/medicos/{medico_id}` | public | Update |
| Medicos | DELETE | `/medicos/{medico_id}` | public | Delete (204) |
| Nac. Legacy | GET | `/nacimientos-legacy/` | auth | List (filtros: id, madre, doc, fecha) |
| Nac. Legacy | PUT | `/nacimientos-legacy/{id}` | auth | Update |
| Const. Nac. | POST | `/constancias-nacimiento/` | auth | Create (201) |
| Const. Nac. | GET | `/constancias-nacimiento/` | auth | List (6 filtros) |
| Const. Nac. | GET | `/constancias-nacimiento/historial/{constancia_id}` | auth | Historial |
| Const. Nac. | GET | `/constancias-nacimiento/{constancia_id}` | auth | By ID |
| Const. Nac. | PUT | `/constancias-nacimiento/{constancia_id}` | auth | Update (guarda historial) |
| Const. Nac. | DELETE | `/constancias-nacimiento/{constancia_id}` | admin | Delete |
| Correlativos | POST | `/correlativos/expediente` | auth | EXP-YYYY-###### (201) |
| Correlativos | POST | `/correlativos/emergencia` | auth | EMERG-###### (201) |
| Correlativos | POST | `/correlativos/constancia_nacimiento` | auth | CN-###### (201) |
| Correlativos | POST | `/correlativos/constancia_defuncion` | auth | DF-###### (201) |
| Correlativos | POST | `/correlativos/constancia_medica` | auth | CM-###### (201) |
| Municipios | GET | `/municipios/` | public | List (filtros: q, codigo, municipio, departamento, vecindad) |
| Municipios | POST | `/municipios/` | admin | Create (201) |
| Municipios | PUT | `/municipios/{codigo}` | admin | Update |
| Municipios | DELETE | `/municipios/{codigo}` | admin | Delete (204) |
| Municipios | GET | `/municipios/departamentos` | public | Departamentos distinct |
| Paises | GET | `/paises/` | public | All ISO countries |
| Paises | GET | `/paises/select` | public | For select/autocomplete |
| Paises | GET | `/paises/{codigo}` | public | By ISO code |
| RENAP | GET | `/renap/persona` | auth | By CUI or names+dob |
| Totales | GET | `/totales/` | auth | Dashboard KPIs |
| Prestamos | POST | `/prestamos/` | auth | Create |
| Prestamos | GET | `/prestamos/` | auth | List (6 filtros) |
| Prestamos | GET | `/prestamos/{prestamo_id}` | auth | By ID |
| Prestamos | PUT | `/prestamos/{prestamo_id}` | auth | Update (devuelve si fecha_devolucion) |
| Prestamos | DELETE | `/prestamos/{prestamo_id}` | auth | Desactivar |
| Procedimientos | GET | `/procedimientos/catalogo` | auth | Catálogo (filtros: abreviatura, nombre) |
| Procedimientos | GET | `/procedimientos/catalogo/{id}` | auth | Catálogo by ID |
| Procedimientos | POST | `/procedimientos/catalogo` | admin | Crear en catálogo |
| Procedimientos | PUT | `/procedimientos/catalogo/{id}` | admin | Update catálogo |
| Procedimientos | DELETE | `/procedimientos/catalogo/{id}` | admin | Delete (si sin registros) |
| Procedimientos | GET | `/procedimientos/` | auth | List realizados (5 filtros) |
| Procedimientos | GET | `/procedimientos/reporte` | auth | Reporte agregado |
| Procedimientos | GET | `/procedimientos/{id}` | auth | Realizado by ID |
| Procedimientos | POST | `/procedimientos/` | auth | Create realizado (201) |
| Procedimientos | PUT | `/procedimientos/{id}` | auth | Update realizado |
| Procedimientos | DELETE | `/procedimientos/{id}` | admin | Delete realizado |
| Procedimientos | GET | `/procedimientos/estadisticas/resumen` | auth | Stats por año/mes |
| Eventos | GET | `/eventos/` | auth | List (4 filtros) |
| Eventos | GET | `/eventos/{evento_id}` | auth | By ID |
| Eventos | POST | `/eventos/` | auth | Create (ingreso/evolucion/egreso) (201) |
| Eventos | PATCH | `/eventos/{evento_id}` | auth | Update |
| Eventos | DELETE | `/eventos/{evento_id}` | auth | Delete (204) |
| Estadisticas | GET | `/estadisticas/consultas/pacientesAtendidos` | auth | Pacientes por tipo, especialidad y sexo |
| Estadisticas | GET | `/estadisticas/consultas/hospitalizacion-infantil` | auth | Hospitalizaciones >28d y <5años |
| Estadisticas | GET | `/estadisticas/consultas/promedioDiario` | auth | Promedio diario por especialidad |
| Estadisticas | GET | `/estadisticas/consultas/personal-hospital` | auth | Consultas de personal del hospital |
| Estadisticas | GET | `/estadisticas/consultas/estudiante-publico` | auth | Consultas de estudiantes públicos |
| Estadisticas | GET | `/estadisticas/consultas/reingresos` | auth | Reingresos hospitalarios |
| Estadisticas | GET | `/estadisticas/consultas/reingresos-tipo3` | auth | Reingresos tipo 3 (paginado) |
| Estadisticas | GET | `/estadisticas/consultas/mayores-a-7-dias` | auth | Consultas activas >7 días |
| Estadisticas | GET | `/estadisticas/nacimientos` | auth | Estadísticas de nacimientos |
| Estadisticas | GET | `/estadisticas/sigsa3/por-especialidad` | auth | SIGSA-3 por especialidad |
| Estadisticas | GET | `/estadisticas/sigsa3/dx-frecuentes` | auth | Diagnósticos frecuentes SIGSA-3 |
| Audit | GET | `/audit-log/` | admin | Logs (filtros: tabla, username, desde, hasta) |
| Encamamiento | POST | `/encamamiento/` | public | Create servicio (201) |
| Encamamiento | GET | `/encamamiento/` | public | List (filtro: activo) |
| Encamamiento | GET | `/encamamiento/{servicio_id}` | public | By ID |
| Encamamiento | PATCH | `/encamamiento/{servicio_id}` | public | Update |
| Encamamiento | DELETE | `/encamamiento/{servicio_id}` | public | Delete (204) |
| Nacimientos | POST | `/nacimientos/` | auth | Create (solo requiere `paciente_id`) (201) |
| Nacimientos | POST | `/nacimientos/desde-paciente/{paciente_id}` | auth | Desde paciente (201) |
| Nacimientos | GET | `/nacimientos/` | auth | List (6 filtros, JOIN con pacientes) |
| Nacimientos | GET | `/nacimientos/{nacimiento_id}` | auth | By ID (incluye neonatales + paciente) |
| Nacimientos | PATCH | `/nacimientos/{nacimiento_id}` | auth | Update (solo `madre_id`) |
| Nacimientos | DELETE | `/nacimientos/{nacimiento_id}` | auth | Delete (204) |
| Nacimientos | POST | `/nacimientos/sincronizar` | auth | Sincronizar madre-hijo + legacy |
| Nacimientos | GET | `/nacimientos/referenciar-legacy` | auth | Referenciar legacy |
| SIGSA-3 | GET | `/sigsa3/` | auth | List (9 filtros) |
| SIGSA-3 | GET | `/sigsa3/{id}` | auth | By ID |
| SIGSA-3 | POST | `/sigsa3/` | auth | Create (201) |
| SIGSA-3 | PUT | `/sigsa3/{id}` | auth | Update |
| SIGSA-3 | DELETE | `/sigsa3/{id}` | auth | Delete (204) |

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

### Statistics / Reports Components

| Component | Route | ApiService Method | Backend Endpoint |
|-----------|-------|--------------------|------------------|
| `PacientesAtendidosComponent` | `/reportes/pacientes-atendidos` | `getPacientesAtendidos()` | `GET /estadisticas/consultas/pacientesAtendidos` |
| `HospitalizacionInfantilComponent` | `/reportes/hospitalizacion-infantil` | `getHospitalizacionInfantil()` | `GET /estadisticas/consultas/hospitalizacion-infantil` |
| `PromedioDiarioComponent` | `/reportes/promedio-diario` | `getPromedioDiario()` | `GET /estadisticas/consultas/promedioDiario` |
| `PersonalHospitalComponent` | `/reportes/personal-hospital` | `getPersonalHospital()` | `GET /estadisticas/consultas/personal-hospital` |
| `EstudiantePublicoComponent` | `/reportes/estudiante-publico` | `getEstudiantePublico()` | `GET /estadisticas/consultas/estudiante-publico` |
| `ReingresosComponent` | `/reportes/reingresos` | `getReingresos()` | `GET /estadisticas/consultas/reingresos` |
| `ReingresosTipo3Component` | `/reportes/reingresos-tipo3` | `getReingresosTipo3()` | `GET /estadisticas/consultas/reingresos-tipo3` |
| `ActivosMayores7DiasComponent` | `/reportes/activos-mayores-7-dias` | `getActivosMayores7Dias()` | `GET /estadisticas/consultas/mayores-a-7-dias` |
| `EstadisticasNacimientosComponent` | `/reportes/estadisticas-nacimientos` | `getEstadisticasNacimientos()` | `GET /estadisticas/nacimientos` |
| `Sigsa3EstadisticaComponent` | `/reportes/sigsa3-estadistica` | `sigsa3PorEspecialidad()` | `GET /estadisticas/sigsa3/por-especialidad` |
| `Sigsa3DxFrecuentesComponent` | `/reportes/sigsa3-dx-frecuentes` | `sigsa3DxFrecuentes()` | `GET /estadisticas/sigsa3/dx-frecuentes` |
| `ReporteProcedimientosComponent` | `/reportes/reporte-procedimientos` | `getReporteProcedimientos()` | `GET /procedimientos/reporte` |
| `ResumenProcedimientosComponent` | `/reportes/resumen-procedimientos` | `getResumenProcedimientos()` | `GET /procedimientos/estadisticas/resumen` |
| `DxZCIe10Component` | `/reportes/dx-z-cie10` | *(via Sigsa3Service, Z34/Z10)* | `GET /sigsa3/?codigo_dx=Z34\|Z10` |
| `EstadisticaComponent` | `/estadistica` | `ApiService` | `GET /estadisticas/consultas/*` |
| `ConsultorComponent` | `/consultar` | `ConsultaService` / `PacienteService` | `GET /consultas/buscarpaciente`, `GET /pacientes/` |

### Doctors & Procedures Components

| Component | Route | ApiService Method | Backend Endpoint |
|-----------|-------|--------------------|------------------|
| `DoctoresComponent` | `/doctores` | `ApiService` | `GET /medicos/` |
| `DoctorFormComponent` | `/doctor*` | `ApiService` | `GET/POST/PUT /medicos/`, `DELETE /medicos/{id}` |
| `CatalogoprocedimientoComponent` | `/catalogoProcedimientos` | `ApiService` | `GET/POST /procedimientos/catalogo`, `PUT/DELETE /procedimientos/catalogo/{id}` |
| `ProcedimientosmenoresComponent` | `/procedimientosmenores` | `ApiService` | `GET /procedimientos/` |
| `ProcemedicoComponent` | `/procemedic*` | `ApiService` | `GET/POST/PUT /procedimientos/` |

### SIGSA-3 Components

| Component | Route | Service | Backend Endpoint |
|-----------|-------|---------|------------------|
| `Sigsa3ListComponent` | `/sigsa3` | `Sigsa3Service` | `GET /sigsa3/` |
| `Sigsa3FormComponent` | `/sigsa3/nuevo`, `/sigsa3/editar/:id` | `Sigsa3Service` | `GET/POST/PUT /sigsa3/` |
| `Sigsa3ImportComponent` | `/sigsa3/importar` | `Sigsa3Service` | `POST /sigsa3/importar-excel` |
| `PersonalSaludListComponent` | `/personal-salud` | `Sigsa3Service` | `GET /sigsa3/personal-salud` |
| `PersonalSaludFormComponent` | `/personal-salud/nuevo`, `/personal-salud/editar/:id` | `Sigsa3Service` | `POST/PUT /sigsa3/personal-salud` |

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
