# CLAUDE.md — ChordFlash (app-chord)

Documentación del proyecto para Claude Code. Lee este archivo antes de tocar cualquier archivo del proyecto.

---

## 1. ¿De qué trata el proyecto?

**ChordFlash** es una aplicación web progresiva (PWA) para músicos. Permite gestionar, visualizar y practicar acordes de canciones durante ensayos y presentaciones en vivo.

Funcionalidades principales:
- Gestión de **grupos/repertorios** con colores personalizados
- Gestión de **canciones** con secciones (Verso, Coro, Puente, etc.), tonalidad y BPM
- **Edición inline de secciones** — cada sección tiene botón lápiz para editar sin borrar
- **Editor de compases por sección** — cada sección puede tener un compás (4/4, 3/4, 6/8, etc.) con grilla de casillas para ingresar acordes por tiempo
- **Vista de escenario** fullscreen con fondo negro optimizada para actuaciones en vivo
- **Setlist** para organizar canciones en orden para una presentación
- **Importar PDF de ChordAI** — sube el PDF exportado de ChordAI y Gemini organiza los acordes en secciones automáticamente
- **Análisis de canciones con IA** (Gemini 2.5 Flash via Genkit)
- **Búsqueda de canciones** por título, artista, tonalidad y nombre de grupo
- Soporte **light/dark mode**
- Funciona como **PWA** instalable en móviles

Repositorio original: https://github.com/cr7-hue/app-chord

---

## 2. Stack tecnológico

| Categoría | Tecnología | Versión |
|---|---|---|
| Framework | Next.js (App Router) | 15.3.2 |
| UI | React | 18.3.1 |
| Lenguaje | TypeScript | 5 |
| Estilos | Tailwind CSS | 3.4.1 |
| Componentes base | Radix UI + shadcn/ui | latest |
| Iconos | Lucide React | 0.475.0 |
| Base de datos | Firebase / Firestore | 11.8.1 |
| Estado del servidor | TanStack Query (React Query) | 5.66.0 |
| Formularios | React Hook Form | 7.54.2 |
| Validación | Zod | 3.24.2 |
| IA | Genkit + Google Generative AI | 1.8.0 |
| Modelo IA | Gemini 2.5 Flash | — |
| Temas | next-themes | 0.4.6 |
| Build | Turbopack (Next.js) | — |

---

## 3. Comandos del proyecto

```bash
# Desarrollo
npm run dev           # Inicia dev server con Turbopack en puerto 9002
npm run genkit:dev    # Inicia servidor Genkit (necesario para funciones IA)
npm run genkit:watch  # Monitorea cambios en archivos de IA

# Producción
npm run build         # Compila la aplicación para producción
npm run start         # Inicia el servidor en producción

# Validación
npm run typecheck     # Verifica tipos TypeScript (sin emitir archivos)
npm run lint          # ESLint (deshabilitado en build)
```

> El puerto por defecto es **9002**, configurado en `package.json`.

---

## 4. Arquitectura del proyecto

```
app-chord/
├── src/
│   ├── app/                    # Rutas de Next.js (App Router)
│   │   ├── layout.tsx          # Layout raíz: tema, navbar, fuentes
│   │   ├── page.tsx            # Página principal (lista de grupos)
│   │   ├── globals.css         # Variables CSS globales (colores HSL, tipografía)
│   │   ├── songs/page.tsx      # Página de canciones
│   │   └── setlist/page.tsx    # Página de setlist
│   ├── components/
│   │   ├── ui/                 # Componentes base de shadcn/ui (no modificar directamente)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── form.tsx
│   │   │   ├── skeleton.tsx
│   │   │   └── ...
│   │   ├── GroupCard.tsx       # Card visual de un grupo/repertorio
│   │   ├── GroupForm.tsx       # Formulario para crear/editar grupos
│   │   ├── SongCard.tsx        # Card visual de una canción
│   │   ├── SongForm.tsx        # Formulario completo de canción con secciones (incluye edición inline por sección)
│   │   ├── ImportChordAI.tsx   # Modal de importación de PDF ChordAI con análisis de Gemini
│   │   ├── StageView.tsx       # Vista fullscreen para escenario (fondo negro)
│   │   ├── SongAnalysis.tsx    # Componente de análisis IA
│   │   ├── Navigation.tsx      # Navbar inferior con tabs
│   │   ├── ThemeToggle.tsx     # Botón light/dark mode
│   │   └── theme-provider.tsx  # Proveedor de tema (next-themes)
│   ├── hooks/
│   │   ├── useGroups.ts        # CRUD de grupos con Firestore
│   │   ├── useSongs.ts         # CRUD de canciones con Firestore
│   │   ├── use-toast.ts        # Hook para notificaciones toast
│   │   └── use-mobile.tsx      # Detecta si es dispositivo móvil
│   ├── lib/
│   │   ├── firebaseConfig.ts   # Inicialización de Firebase
│   │   └── utils.ts            # Función cn() para merge de clases Tailwind
│   ├── types/
│   │   └── index.ts            # Tipos: Song, Group, SongSection + constantes
│   └── ai/
│       ├── genkit.ts           # Configuración de Genkit
│       └── actions.ts          # Acciones server-side de IA
├── public/                     # Assets estáticos (iconos PWA, etc.)
├── docs/
│   └── blueprint.md            # Blueprint de diseño original del proyecto
├── next.config.ts              # Configuración de Next.js
├── tailwind.config.ts          # Configuración de Tailwind
├── tsconfig.json               # Configuración de TypeScript (strict mode)
├── components.json             # Configuración de shadcn/ui
├── postcss.config.mjs          # Configuración de PostCSS
└── .env.local                  # Variables de entorno (no commitear)
```

---

## 5. Estructura de datos (Tipos principales)

Definidos en `src/types/index.ts`.

```typescript
interface Song {
  id: string;
  title: string;
  artist?: string;
  key: string;           // Tonalidad: 'Am', 'C', 'D', etc.
  bpm?: number;
  sections: SongSection[];
  groupIds: string[];    // IDs de grupos a los que pertenece
}

interface SongSection {
  id: string;
  type: string;          // Tipo de sección (Verso, Coro, etc.)
  chords: string;        // Acordes en texto plano (vacío si usa grilla de compás)
  repeat: number;        // Cantidad de repeticiones (1-4)
  timeSignature?: string; // Compás opcional: '4/4', '3/4', '6/8', etc.
  measures?: string[];   // Acordes por compás serializados: ["Bm|Gm|Em|Dm", "Am|F|G|"]
}

interface Group {
  id: string;
  name: string;
  color: string;         // Color hexadecimal
}
```

> **Importante sobre `measures`**: se almacena como `string[]` (no `string[][]`) porque Firestore **no soporta arrays anidados**. Cada elemento es un compás serializado con `|` como separador entre acordes. Deserializar con `.split('|')` al renderizar.

### Constantes importantes

```typescript
SECTION_TYPES = [
  'Introducción', 'Verso', 'Pre-Coro', 'Coro',
  'Puente', 'Fuga', 'Solo', 'Outro', 'Personalizado'
]

MUSICAL_KEYS = [
  // 12 menores (con enarmónicas aclaradas)
  'Am', 'Bbm/A#m', 'Bm', 'Cm', 'C#m/Dbm', 'Dm', 'Ebm/D#m', 'Em', 'Fm', 'F#m/Gbm', 'Gm', 'Abm/G#m',
  // 12 mayores (con enarmónicas aclaradas)
  'A',  'Bb/A#',   'B',  'C',  'C#/Db',   'D',  'Eb/D#',   'E',  'F',  'F#/Gb',   'G',  'Ab/G#',
]

TIME_SIGNATURES = [
  { label: '4/4', beats: 4 },
  { label: '3/4', beats: 3 },
  { label: '6/8', beats: 6 },
  { label: '2/4', beats: 2 },
  { label: '5/4', beats: 5 },
]

GROUP_COLORS = [
  '#e67700', '#7c3aed', '#0891b2', '#059669',
  '#dc2626', '#db2777', '#d97706', '#4f46e5'
]
```

---

## 6. Firebase / Firestore

**Proyecto Firebase**: `app-acordes`

Colecciones en Firestore:
```
firestore/
├── groups/
│   └── {groupId}
│       ├── name: string
│       ├── color: string
│       └── createdAt: timestamp
└── songs/
    └── {songId}
        ├── title: string
        ├── artist?: string
        ├── key: string
        ├── bpm?: number
        ├── sections: SongSection[]   ← cada sección puede tener timeSignature y measures
        ├── groupIds: string[]
        ├── createdAt: timestamp
        └── updatedAt: timestamp
```

> **Firestore no soporta arrays anidados (`string[][]`)**. Si se necesita almacenar una estructura de matriz, serializar cada fila como string con separador (ej: `"Bm|Gm|Em|Dm"`) y guardar como `string[]`.

Los hooks `useGroups` y `useSongs` usan `onSnapshot` de Firestore para actualizaciones en tiempo real.

### Variables de entorno requeridas (`.env.local`)

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=app-acordes
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
GOOGLE_GENAI_API_KEY=...
```

---

## 7. Estilo de código

### Convenciones de nombres
- **PascalCase** para componentes: `SongCard.tsx`, `GroupForm.tsx`
- **camelCase** para hooks: `useGroups.ts`, `useSongs.ts`
- **camelCase** para funciones y variables
- **UPPER_CASE** para constantes exportadas: `SECTION_TYPES`, `MUSICAL_KEYS`

### Estructura de componentes
```typescript
"use client"; // Siempre en componentes interactivos

interface Props {
  song: Song;
  onEdit: (song: Song) => void;
}

export default function SongCard({ song, onEdit }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl border p-4">
      {/* JSX */}
    </div>
  );
}
```

### Gestión de estado
- **`useState`** para estado local de UI
- **Hooks personalizados** (`useGroups`, `useSongs`) para datos de Firebase
- **`useToast`** para notificaciones al usuario
- **No usar Redux ni Zustand** — el proyecto no los necesita

### Manejo de errores
```typescript
try {
  await addSong(data);
  toast({ title: 'Canción guardada' });
} catch {
  toast({ title: 'Error al guardar', variant: 'destructive' });
}
```

### TypeScript
- **Strict mode** habilitado
- Usar **`interface`** (no `type`) para objetos de datos
- Path alias **`@/*`** apunta a `src/*` — usarlo siempre
- Importar tipos de `@/types`

### Clases CSS
- Usar **Tailwind utility-first** directamente en JSX
- Usar la función **`cn()`** de `@/lib/utils` para clases condicionales
- No crear archivos CSS separados salvo en `globals.css`

```typescript
import { cn } from "@/lib/utils";

className={cn(
  "rounded-xl border p-3 transition-all",
  isActive && "bg-primary/10 border-primary/40"
)}
```

---

## 8. Sistema de diseño

### Colores (variables CSS HSL)

El sistema usa variables CSS HSL definidas en `src/app/globals.css`. Referenciarlas siempre así: `hsl(var(--primary))` o con clases Tailwind como `bg-primary`, `text-foreground`.

| Variable | Claro | Oscuro | Uso |
|---|---|---|---|
| `--background` | `0 0% 99%` | `224 15% 7%` | Fondo de página |
| `--foreground` | `224 15% 8%` | `210 20% 96%` | Texto principal |
| `--primary` | `24 100% 50%` | `24 100% 52%` | Color naranja de acento |
| `--secondary` | `220 14% 96%` | `224 12% 13%` | Fondos secundarios |
| `--destructive` | `0 84.2% 60.2%` | `0 62.8% 30.6%` | Acciones peligrosas |
| `--border` | `220 13% 91%` | — | Bordes |
| `--muted` | `220 14% 96%` | — | Texto y fondos apagados |

**Color primario**: naranja `#FF8C00` — es la identidad visual del proyecto.

### Tipografía
- **Fuente**: DM Sans (Google Fonts)
- **Pesos**: 400, 500, 600, 700, 800
- **Acordes**: fuente monoespaciada del sistema (para visualización en escenario)

### Componentes — reglas visuales
- **Cards**: `rounded-2xl border border-border/60 shadow` sutil
- **Botones**: variantes de shadcn/ui — `default`, `outline`, `ghost`, `destructive`
- **Feedback táctil**: `active:scale-[0.97]` o `active:scale-[0.99]` en botones
- **Inputs**: `rounded-xl`, ring en color primary al hacer focus
- **Modales**: fullscreen en mobile (`max-h-[90dvh]`)
- **Navegación**: bottom navbar con pill activa en el tab seleccionado

### Responsive / Layout
- **Mobile-first**: diseño base para smartphones, luego `md:` para tablets
- **Max-width del contenido**: `max-w-lg` (512px) centrado
- **Safe areas**: `pb-safe` para notches en móviles
- **Escenario**: fondo negro `bg-black`, texto blanco, acordes en `text-3xl` o `text-4xl` monoespaciado

### Dark mode
- Implementado con **`next-themes`** usando estrategia `class`
- Toggle con `ThemeToggle.tsx` en el header
- Todas las variables de color tienen variante oscura en `globals.css`
- No usar colores hardcodeados — siempre usar variables CSS o clases Tailwind con soporte dark

---

## 9. Configuración importante

### next.config.ts
- `typescript.ignoreBuildErrors: true` — los errores de TypeScript no bloquean el build
- `eslint.ignoreDuringBuilds: true` — ESLint no bloquea el build
- `serverExternalPackages: ['genkit', '@genkit-ai/googleai', '@genkit-ai/next']`
- Permite imágenes desde `placehold.co`

### tsconfig.json
- Target: ES2017
- Strict mode: `true`
- Path alias: `"@/*": ["./src/*"]`

### tailwind.config.ts
- Dark mode: `class`
- Extiende con todos los colores del sistema de diseño (`primary`, `secondary`, `accent`, `sidebar`, `chart-*`)
- Custom `borderRadius` con variable `--radius`
- Animaciones: `accordion-up` y `accordion-down` (0.2s ease-out)

---

## 10. Funcionalidades de IA implementadas

### Análisis de canción (`analyzeSong`)
- **Archivo**: `src/ai/actions.ts`
- **Uso**: Recibe título, tonalidad y secciones → devuelve dificultad, acordes necesarios y consejo
- **Componente**: `SongAnalysis.tsx`

### Importación de PDF ChordAI (`importChordAiPdf`)
- **Archivo**: `src/ai/actions.ts`
- **Uso**: Recibe un `FormData` con el archivo PDF → devuelve título, tonalidad, BPM y secciones detectadas
- **Flujo**:
  1. Convierte el PDF a base64
  2. Lo envía a Gemini 2.5 Flash como entrada **multimodal** (el modelo lee el PDF visualmente)
  3. Gemini detecta patrones de acordes que se repiten y los agrupa en secciones
  4. Devuelve JSON con la estructura de la canción
- **Componente**: `ImportChordAI.tsx` — modal con 3 pasos: subir PDF → cargando → revisar y corregir
- **Botón de acceso**: FAB secundario (ícono `FileUp`) en `src/app/songs/page.tsx`, encima del botón `+`
- **Importante**: No usar `pdf-parse` ni ninguna librería de extracción de texto. Gemini 2.5 Flash lee el PDF directamente. `pdf-parse` falla en Vercel porque intenta cargar un archivo de test al inicializarse.

### Edición inline de secciones (`SongForm.tsx`)
- Cada sección en el formulario tiene un botón lápiz (`Pencil`) además del de eliminar
- Al tocarlo se abre el panel de edición pre-relleno con los datos de esa sección
- Estado `editingSection: string | null` controla si se está editando o agregando
- Función `startEditSection(sec)` pre-rellena `newType`, `newChords`, `newRepeat`, `newTimeSignature` y `newMeasures` (deserializando `measures` con `.map(m => m.split('|'))`)
- El botón del panel dice "Guardar cambios" al editar y "Agregar" al crear

### Editor de compases por sección (`SongForm.tsx`)
- Cada sección puede tener un compás opcional seleccionable con pills: `4/4`, `3/4`, `6/8`, `2/4`, `5/4`
- Al seleccionar un compás, el `Textarea` se reemplaza por una **grilla de inputs** — una fila por compás, N casillas por fila según los tiempos
- Estado interno: `newMeasures: string[][]` (para edición en UI)
- Al guardar la sección se serializa: `newMeasures.map(m => m.join('|'))` → `string[]` (compatible con Firestore)
- Al cargar una sección para editar se deserializa: `sec.measures.map(m => m.split('|'))` → `string[][]`
- **Enter** avanza a la siguiente casilla; **Enter en la última casilla** crea un nuevo compás y mueve el foco
- **Backspace** en la primera casilla vacía de un compás (no el primero) elimina ese compás
- Helper `getBeats(ts: string): number` devuelve la cantidad de tiempos para un compás dado
- La grilla usa CSS Grid (`gridTemplateColumns: repeat(N, 1fr)`) para columnas iguales en todos los compases
- El botón `×` para eliminar compás siempre ocupa espacio (`invisible` cuando hay un solo compás) para mantener alineación

### Búsqueda extendida de canciones (`src/app/songs/page.tsx`)
- El buscador filtra por **título, artista, tonalidad y nombre de grupo** desde un solo campo
- La búsqueda por grupo resuelve los `groupIds` de la canción contra el array `groups` cargado
- `groups` está incluido en las dependencias del `useMemo` del filtro

---

## 11. Reglas para trabajar en este proyecto

1. **No modificar archivos en `src/components/ui/`** directamente — son componentes de shadcn/ui. Si necesitas cambiar comportamiento, crea un wrapper.
2. **Siempre usar `"use client"`** al inicio de componentes que usen hooks o eventos del browser.
3. **No hardcodear colores** — usar siempre las variables CSS o clases Tailwind del sistema.
4. **No crear nuevos archivos CSS** — todo va en clases Tailwind. Solo `globals.css` para variables.
5. **Datos siempre desde Firebase** vía los hooks `useGroups` y `useSongs`. No crear estado global paralelo.
6. **Validar con Zod** cuando se agreguen nuevos formularios.
7. **Importar con alias `@/`** — nunca con rutas relativas largas como `../../../`.
8. El proyecto está en **español** — mantener los textos de UI en español.
9. **No agregar dependencias sin necesidad** — revisar si algo ya está disponible (Radix UI, shadcn, Lucide).
10. Antes de crear un componente nuevo, revisar si ya existe algo similar en `src/components/ui/`.
11. **Firestore no soporta arrays anidados** — nunca guardar `string[][]` o similar directamente. Serializar como `string[]` con separador (ej: `|`) y deserializar al renderizar.
