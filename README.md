# KASTOR IoT

[![Svelte](https://img.shields.io/badge/Svelte-5-FF3E00?logo=svelte&logoColor=white)](https://svelte.dev/)
[![SvelteKit](https://img.shields.io/badge/SvelteKit-2-FF3E00?logo=svelte&logoColor=white)](https://kit.svelte.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Bun](https://img.shields.io/badge/Bun-1.1+-000000?logo=bun&logoColor=white)](https://bun.sh/)

**Industrial IoT Dashboard for Gas Power Plant Monitoring**

Real-time monitoring and analytics platform for gas-powered engines (Jenbacher J420/J624). Features live telemetry visualization, predictive maintenance forecasting, financial loss tracking, OEE metrics, and comprehensive alert management.

---

## Architecture

### System Overview

```mermaid
flowchart TB
    subgraph client [Client Layer]
        Browser[Browser PWA]
        SSE[SSE Real-time Stream]
    end
    
    subgraph app [SvelteKit Application]
        subgraph pages [Pages - 13 Routes]
            Dashboard[Dashboard]
            EngineDetails[Engine Details]
            Maintenance[Maintenance]
            Analytics[Analytics]
            Economics[Economics]
            Alerts[Alerts]
            Admin[Admin]
        end
        
        subgraph components [Component Library]
            UIComponents[UI Components]
            DashboardWidgets[Dashboard Widgets]
        end
        
        subgraph hooks [Reactive Layer]
            SSEHook[useSSE Hook]
            I18n[svelte-i18n]
        end
    end
    
    subgraph services [Services Layer]
        subgraph frontend [Frontend Services]
            AlertsSvc[Alerts Service]
            EconomicsSvc[Economics Service]
            MaintenanceSvc[Maintenance Service]
            WorkordersSvc[Workorders Service]
        end
        
        subgraph backend [Server Services]
            EngineSvc[Engine Service]
            TelemetrySvc[Telemetry Service]
            EventSvc[Event Service]
            MaintSvc[Maintenance Service]
        end
    end
    
    subgraph data [Data Layer]
        Drizzle[Drizzle ORM]
        Zod[Zod Validation]
    end
    
    subgraph infra [Infrastructure]
        TimescaleDB[(TimescaleDB)]
        EMQX[EMQX MQTT Broker]
        Simulator[Mock Device Script]
    end
    
    Browser --> pages
    SSE --> SSEHook
    SSEHook --> Dashboard
    pages --> components
    pages --> frontend
    frontend --> backend
    backend --> Drizzle
    Drizzle --> TimescaleDB
    Simulator --> EMQX
    EMQX -.-> backend
```

### Database Schema

```mermaid
erDiagram
    ENGINES {
        text id PK "Primary key"
        text model "Engine model"
        status status "ok | warning | error"
        int total_hours "Running hours"
    }
    
    TELEMETRY {
        timestamp time "Timestamp with timezone"
        text engine_id FK "Reference to engine"
        float power_kw "Power output in kW"
        float temp_exhaust "Exhaust temperature C"
        float gas_consumption "Gas consumption m3/h"
        float vibration "Vibration mm/s"
        float gas_pressure "Gas pressure bar"
    }
    
    EVENTS {
        text id PK "UUID"
        timestamp time "Event timestamp"
        text level "info | warning | error"
        text message "Event message"
        text engine_id FK "Optional engine reference"
    }
    
    DOWNTIMES {
        text id PK "UUID"
        text engine_id FK "Engine reference"
        timestamp start_time "Downtime start"
        timestamp end_time "Downtime end"
        text reason "Downtime reason"
        float loss_rub "Financial loss in RUB"
    }
    
    MAINTENANCE_SCHEDULES {
        text id PK "UUID"
        text engine_id FK "Engine reference"
        service_type service_type "Service type enum"
        timestamp due_date "Scheduled date"
        int due_hours "Due at hours"
        float estimated_cost "Cost estimate"
        jsonb parts_required "Required parts"
        bool completed "Completion status"
    }
    
    SPARE_PARTS {
        text id PK "UUID"
        text name "Part name"
        text part_number "Part number"
        int quantity "Current quantity"
        int min_quantity "Minimum threshold"
        float unit_cost "Cost per unit"
    }
    
    COST_RECORDS {
        text id PK "UUID"
        timestamp date "Record date"
        text category "gas | depreciation | spare_parts | labor | other"
        float amount "Amount in RUB"
        text engine_id FK "Optional engine reference"
        text description "Description"
    }
    
    ENGINES ||--o{ TELEMETRY : generates
    ENGINES ||--o{ EVENTS : triggers
    ENGINES ||--o{ DOWNTIMES : experiences
    ENGINES ||--o{ MAINTENANCE_SCHEDULES : requires
    ENGINES ||--o{ COST_RECORDS : tracks
```

---

## Tech Stack

| Category | Technologies |
|----------|-------------|
| **Frontend** | Svelte 5 (runes), SvelteKit 2.49, TailwindCSS v4 |
| **Backend** | Drizzle ORM 0.45, PostgreSQL 16 / TimescaleDB |
| **Real-time** | MQTT (EMQX 5.3), Server-Sent Events (SSE) |
| **Visualization** | ECharts 6, svelte-echarts |
| **UI** | lucide-svelte (icons), svelte-motion (animations) |
| **Validation** | Zod 4 (runtime type checking) |
| **i18n** | svelte-i18n (Russian / English) |
| **Testing** | Vitest, Playwright |
| **Runtime** | Bun 1.1+ |
| **Containerization** | Docker Compose |

---

## Application Modules

| Route | Module | Description |
|-------|--------|-------------|
| `/` | **Dashboard** | Fleet status, power output, OEE widget, live events feed |
| `/engine/[id]` | **Engine Details** | Real-time metrics, performance correlation charts, AI diagnostics |
| `/maintenance` | **Maintenance Forecast** | Predictive maintenance, spare parts inventory, budget forecast |
| `/analytics` | **Business Analytics** | ROI tracking, savings analysis, downtime prevention metrics |
| `/economics` | **Economics** | Cost structure breakdown, cost per kWh, monthly trends |
| `/alerts` | **Alert Center** | Active alerts, filtering, acknowledge/resolve workflow |
| `/alerts/rules` | **Alert Rules** | Configure alert thresholds and notifications |
| `/admin` | **Admin Panel** | System configuration, user management |
| `/settings` | **Settings** | Application preferences |
| `/reports` | **Reports** | Generate and export reports |
| `/calendar` | **Calendar** | Maintenance calendar view |
| `/comparison` | **Comparison** | Engine performance comparison |
| `/work-orders` | **Work Orders** | Work order management |
| `/integrations` | **Integrations** | External system integrations |
| `/dashboards` | **Custom Dashboards** | User-defined dashboards |

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/status` | GET | Dashboard data (engines with metrics, summary, events) |
| `/api/events` | GET | SSE stream for real-time updates (2s interval) |
| `/api/history/[id]` | GET | Telemetry history for specific engine |

### Response Types

All API responses are validated with Zod schemas defined in `src/lib/types/`:

- `DashboardData` - Full dashboard response
- `EngineWithMetrics` - Engine with calculated metrics
- `DashboardSummary` - Aggregated fleet statistics
- `EventDisplay` - Event log entry

---

## UI Component Library

### Base Components (`src/lib/components/ui/`)

| Component | Description |
|-----------|-------------|
| `Card` | Glass-morphism card with variants (default, danger) |
| `Button` | Button with variants (primary, outline, ghost, danger) |
| `Badge` | Status badge (success, warning, danger, info) |
| `Modal` | Accessible modal dialog |
| `KPICard` | Key performance indicator display |
| `ProgressBar` | Animated progress bar with variants |
| `Skeleton` | Loading skeleton placeholder |
| `StatusIndicator` | Engine status indicator (ok, warning, error) |
| `Toast` | Toast notification system |
| `NumberTicker` | Animated number counter |

### Dashboard Widgets (`src/lib/components/dashboard/`)

| Widget | Description |
|--------|-------------|
| `OEEWidget` | Overall Equipment Effectiveness display |
| `DowntimeTimeline` | Visual downtime timeline |

### Utility Components

| Component | Description |
|-----------|-------------|
| `CommandPalette` | Keyboard navigation (Cmd+K) |
| `LanguageSwitcher` | i18n language toggle |
| `MobileNav` | Responsive mobile navigation |

---

## Project Structure

```
kastor-IoT/
├── src/
│   ├── lib/
│   │   ├── components/
│   │   │   ├── ui/              # 10 reusable UI components
│   │   │   └── dashboard/       # Dashboard-specific widgets
│   │   ├── server/
│   │   │   ├── db/
│   │   │   │   ├── index.ts     # Drizzle client
│   │   │   │   └── schema.ts    # Database schema (7 tables)
│   │   │   └── services/        # Backend services
│   │   │       ├── engine.service.ts
│   │   │       ├── telemetry.service.ts
│   │   │       ├── event.service.ts
│   │   │       └── maintenance.service.ts
│   │   ├── services/            # Frontend services
│   │   │   ├── alerts.service.ts
│   │   │   ├── economics.service.ts
│   │   │   ├── maintenance.service.ts
│   │   │   └── workorders.service.ts
│   │   ├── types/               # Zod schemas & TypeScript types
│   │   │   ├── engine.ts
│   │   │   ├── telemetry.ts
│   │   │   ├── event.ts
│   │   │   ├── maintenance.ts
│   │   │   ├── alert.ts
│   │   │   ├── workorder.ts
│   │   │   └── api.ts
│   │   ├── hooks/
│   │   │   └── useSSE.svelte.ts # SSE connection hook
│   │   ├── i18n/
│   │   │   ├── index.ts
│   │   │   └── locales/
│   │   │       ├── ru.json
│   │   │       └── en.json
│   │   ├── index.ts             # Library exports
│   │   └── utils.ts             # Utility functions (cn, etc.)
│   ├── routes/                  # SvelteKit pages (13+)
│   │   ├── +layout.svelte
│   │   ├── +page.svelte         # Dashboard
│   │   ├── api/
│   │   │   ├── status/
│   │   │   ├── events/          # SSE endpoint
│   │   │   └── history/[id]/
│   │   ├── engine/[id]/
│   │   ├── maintenance/
│   │   ├── analytics/
│   │   ├── economics/
│   │   ├── alerts/
│   │   │   └── rules/
│   │   ├── admin/
│   │   └── ...
│   └── app.html
├── scripts/
│   └── mock-device.ts           # MQTT telemetry simulator
├── drizzle/                     # Database migrations
├── static/
│   ├── manifest.json            # PWA manifest
│   └── sw.js                    # Service Worker
├── compose.yaml                 # Docker Compose (TimescaleDB + EMQX)
├── drizzle.config.ts
├── svelte.config.js
├── vite.config.ts
└── package.json
```

---

## Setup & Installation

### Prerequisites

- [Bun](https://bun.sh/) v1.1+
- [Docker](https://www.docker.com/) & Docker Compose

### 1. Clone & Install

```bash
git clone https://github.com/FrankFMY/kastor-IoT.git
cd kastor-IoT
bun install
```

### 2. Environment Variables

Create `.env` file:

```env
DATABASE_URL=postgres://root:mysecretpassword@localhost:5444/local
```

### 3. Start Infrastructure

```bash
bun run db:start
# or
docker compose up -d
```

This starts:
- **TimescaleDB** on port `5444`
- **EMQX MQTT Broker** on ports `1883` (MQTT), `8083` (WebSocket), `8081` (Dashboard)

### 4. Apply Database Migrations

```bash
bun run db:migrate
```

### 5. Start Device Simulator (Optional)

In a separate terminal:

```bash
bun run scripts/mock-device.ts
```

Simulates 6 engines with realistic telemetry including "overheat" scenarios on GPU-2.

### 6. Start Development Server

```bash
bun run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Available Scripts

| Script | Description |
|--------|-------------|
| `bun run dev` | Start development server |
| `bun run build` | Build for production |
| `bun run preview` | Preview production build |
| `bun run check` | TypeScript type checking |
| `bun run lint` | Run ESLint + Prettier |
| `bun run format` | Format code with Prettier |
| `bun run test` | Run unit tests (Vitest) |
| `bun run test:unit` | Run unit tests in watch mode |
| `bun run db:start` | Start Docker infrastructure |
| `bun run db:migrate` | Apply database migrations |
| `bun run db:push` | Push schema changes |
| `bun run db:generate` | Generate migration files |
| `bun run db:studio` | Open Drizzle Studio GUI |

---

## Features

### Real-time Data

- **SSE (Server-Sent Events)** - Primary real-time transport with automatic reconnection
- **Polling Fallback** - 2-second polling if SSE unavailable
- **MQTT Integration** - Device telemetry via EMQX broker

### Progressive Web App (PWA)

- Service Worker for offline support
- Installable on desktop and mobile
- Web App Manifest

### Internationalization (i18n)

- Russian (default)
- English
- Persistent language preference

### Keyboard Navigation

- `Cmd/Ctrl + K` - Open Command Palette
- Quick navigation to any page

### Svelte 5 Runes

Project uses modern Svelte 5 reactive primitives:
- `$state()` - Reactive state
- `$derived()` - Computed values
- `$props()` - Component props
- `$effect()` - Side effects

---

## Library Export

This project can be used as an npm package. Components are exported via `dist/`:

```typescript
// Import components
import { NumberTicker } from 'kastor-iot';
import { cn } from 'kastor-iot';
```

Build the library:

```bash
bun run build
```

---

## Engine Constants

Default values used for calculations (configurable in `src/lib/types/engine.ts`):

| Constant | Value | Description |
|----------|-------|-------------|
| `TARIFF_RUB_PER_KWH` | 4.5 | Electricity tariff |
| `GAS_COST_RUB_PER_M3` | 6.0 | Gas cost |
| `PLANNED_MW_PER_ENGINE` | 1.2 | Target power per engine |
| `SERVICE_INTERVAL_HOURS` | 2000 | Maintenance interval |
| `CRITICAL_TEMP_THRESHOLD` | 520 | Critical exhaust temp (°C) |
| `WARNING_TEMP_THRESHOLD` | 500 | Warning exhaust temp (°C) |
| `CRITICAL_VIBRATION_THRESHOLD` | 15 | Critical vibration (mm/s) |
| `WARNING_VIBRATION_THRESHOLD` | 10 | Warning vibration (mm/s) |

---

## Author

**Прянишников Артём Алексеевич**

- Email: [Pryanishnikovartem@gmail.com](mailto:Pryanishnikovartem@gmail.com)
- Telegram: [@FrankFMY](https://t.me/FrankFMY)
- GitHub: [FrankFMY](https://github.com/FrankFMY)

---

## License

This project is proprietary software. All rights reserved.

---

Built with Svelte 5, SvelteKit, TailwindCSS & Bun
