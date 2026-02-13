# 🏗️ SincroChatCatalog — Architecture Document

## 📋 Overview

**SincroChatCatalog** es un motor de catálogos web transaccionales, multi-rubro y multi-negocio.  
Los usuarios finales acceden a catálogos de productos a través de **enlaces temporales enviados por WhatsApp**.  
El sistema es completamente **headless**: el frontend consume JSON desde **n8n** (no accede directo a Supabase).

---

## ⚙️ Stack Tecnológico

| Capa            | Tecnología                      |
| --------------- | ------------------------------- |
| Frontend        | **Astro + React (islands)**     |
| Estilos         | **Tailwind CSS**                |
| Backend lógico  | **n8n** (webhooks + workflows)  |
| Base de datos   | **Supabase (PostgreSQL)**       |
| Autenticación   | **n8n** (el frontend NO usa Supabase directamente) |

---

## 🗄️ Esquema de Base de Datos (Supabase — Inmutable)

> ⚠️ El esquema existente es **INMUTABLE**. No se pueden modificar, eliminar ni renombrar tablas ni columnas.

### Entidades Core

#### `business`
Negocio/empresa que usa el sistema. Entidad raíz multi-tenant.

| Columna       | Tipo        | Nota                        |
| ------------- | ----------- | --------------------------- |
| `id`          | uuid (PK)   | gen_random_uuid()           |
| `name`        | varchar     |                             |
| `category`    | varchar     | Rubro genérico              |
| `subcategory` | varchar?    |                             |
| `delivery`    | boolean     | ¿Ofrece delivery?          |
| `pick_up`     | boolean     | ¿Ofrece pick-up?           |
| `number_id`   | varchar?    | Unique, WhatsApp number ID  |
| `waba_id`     | varchar?    | Unique, WABA ID             |
| `created_at`  | timestamptz |                             |
| `updated_at`  | timestamp?  |                             |

#### `business_location`
Sucursal/ubicación de un negocio.

| Columna       | Tipo        | Nota              |
| ------------- | ----------- | ------------------ |
| `id`          | uuid (PK)   |                    |
| `business_id` | uuid (FK)   | → business.id      |
| `name`        | varchar     |                    |
| `address`     | varchar     |                    |
| `opening`     | timetz      | Hora de apertura   |
| `closing`     | timetz      | Hora de cierre     |
| `created_at`  | timestamptz |                    |

#### `business_branding`
Identidad visual del negocio.

| Columna          | Tipo        | Nota              |
| ---------------- | ----------- | ------------------ |
| `business_id`    | uuid (PK/FK)| → business.id      |
| `logo`           | varchar?    | URL del logo       |
| `primary_color`  | varchar?    | Hex color primario |
| `secondary_color`| varchar?    | Hex color secundario|
| `created_at`     | timestamptz |                    |
| `updated_at`     | timestamptz?|                    |

### Catálogo y Productos

#### `catalog`
Catálogo perteneciente a un negocio + ubicación.

| Columna       | Tipo        | Nota              |
| ------------- | ----------- | ------------------ |
| `id`          | uuid (PK)   |                    |
| `business_id` | uuid (FK)   | → business.id      |
| `location_id` | uuid (FK)   | → business_location.id |
| `name`        | varchar     |                    |
| `is_active`   | boolean     |                    |
| `created_at`  | timestamptz |                    |
| `updated_at`  | timestamptz?|                    |

#### `catalog_section`
Secciones dentro de un catálogo (e.g., "Bebidas", "Postres").

| Columna       | Tipo        | Nota              |
| ------------- | ----------- | ------------------ |
| `id`          | uuid (PK)   |                    |
| `catalog_id`  | uuid (FK)   | → catalog.id       |
| `name`        | varchar     |                    |
| `order`       | numeric     | Orden de display   |
| `is_active`   | boolean     |                    |

#### `product`
Producto genérico de un negocio (reutilizable en múltiples catálogos).

| Columna       | Tipo        | Nota              |
| ------------- | ----------- | ------------------ |
| `id`          | uuid (PK)   |                    |
| `business_id` | uuid (FK)   | → business.id      |
| `name`        | varchar     |                    |
| `description` | varchar?    |                    |
| `image`       | varchar     | URL de imagen      |
| `price`       | numeric     | Precio base        |
| `is_active`   | boolean     |                    |

#### `catalog_product`
Instancia de un producto dentro de un catálogo + sección.

| Columna       | Tipo        | Nota              |
| ------------- | ----------- | ------------------ |
| `id`          | uuid (PK)   |                    |
| `catalog_id`  | uuid (FK)   | → catalog.id       |
| `section_id`  | uuid (FK)   | → catalog_section.id |
| `product_id`  | uuid (FK)   | → product.id       |
| `order`       | numeric?    | Orden de display   |
| `is_available`| boolean     |                    |

### Subsecciones (Modifiers/Templates)

#### `catalog_subsection`
Template de personalización (e.g., "Elige tu salsa", "Empaque").

| Columna         | Tipo        | Nota                        |
| --------------- | ----------- | --------------------------- |
| `id`            | uuid (PK)   |                             |
| `name`          | varchar     | Nombre del bloque           |
| `description`   | varchar?    |                             |
| `type`          | varchar     | Tipo: single, multiple, text|
| `min`           | numeric?    | Mínimo de selecciones       |
| `max`           | numeric?    | Máximo de selecciones       |
| `allow_quantity`| boolean     | ¿Permite cantidad por opción?|
| `allow_price`   | boolean     | ¿Opciones tienen precio?   |
| `required`      | boolean     | ¿Es obligatorio?           |

#### `catalog_subsection_item`
Opciones dentro de una subsección.

| Columna         | Tipo        | Nota              |
| --------------- | ----------- | ------------------ |
| `id`            | uuid (PK)   |                    |
| `subsection_id` | uuid? (FK)  | → catalog_subsection.id |
| `name`          | varchar     |                    |
| `price`         | numeric     | Precio adicional   |
| `is_active`     | boolean     |                    |

#### `catalog_product_subsection`
Asignación de subsección a un producto de catálogo (tabla puente).

| Columna               | Tipo        | Nota                            |
| --------------------- | ----------- | ------------------------------- |
| `id`                  | uuid (PK)   |                                 |
| `catalog_product_id`  | boolean     | ⚠️ Tipo boolean – probablemente debería ser uuid FK |
| `catalog_subsection_id`| boolean    | ⚠️ Tipo boolean – probablemente debería ser uuid FK |
| `config`              | json?       | Override de configuración       |
| `order`               | numeric?    | Orden de display                |

> 🔴 **Nota arquitectónica**: `catalog_product_subsection` tiene `catalog_product_id` y `catalog_subsection_id` como `boolean` en vez de `uuid`. Esto parece ser un error de schema. Como NO podemos modificar tablas existentes, trabajaremos con esto o crearemos tablas complementarias si es necesario.

### Sesiones

#### `catalog_session`
Link temporal con token para acceder a un catálogo.

| Columna       | Tipo        | Nota              |
| ------------- | ----------- | ------------------ |
| `id`          | uuid (PK)   |                    |
| `token`       | uuid        | Token público del link |
| `business_id` | uuid (FK)   | → business.id      |
| `location_id` | uuid (FK)   | → business_location.id |
| `catalog_id`  | uuid (FK)   | → catalog.id       |
| `expires_at`  | timestamptz | Fecha de expiración|
| `created_at`  | timestamptz |                    |

### Pedidos

#### `order`
Pedido generado desde el catálogo.

| Columna             | Tipo        | Nota              |
| ------------------- | ----------- | ------------------ |
| `id`                | uuid (PK)   |                    |
| `business_id`       | uuid (FK)   | → business.id      |
| `location_id`       | uuid? (FK)  | → business_location.id |
| `customer_id`       | varchar     | Identificador del cliente |
| `state`             | varchar     | Estado del pedido  |
| `type`              | varchar?    | delivery/pick_up   |
| `payment_method`    | varchar?    |                    |
| `payment_status`    | varchar?    |                    |
| `payment_type`      | varchar?    |                    |
| `subtotal`          | numeric?    |                    |
| `total`             | numeric?    |                    |
| `delivery_fee`      | numeric?    |                    |
| `service_fee`       | numeric?    |                    |
| `delivery_address`  | varchar?    |                    |
| `delivery_token`    | varchar?    |                    |
| `awaiting_delivery_fee` | boolean |                    |
| `is_open`           | boolean     |                    |
| `app_ready`         | boolean?    |                    |
| `preparation_time`  | numeric?    |                    |
| `notified_at`       | timestamptz?|                    |

#### `order_item`
Ítems dentro de un pedido.

| Columna       | Tipo        | Nota              |
| ------------- | ----------- | ------------------ |
| `id`          | uuid (PK)   |                    |
| `order_id`    | uuid (FK)   | → order.id         |
| `menu_id`     | uuid (FK)   | → menu.id          |
| `quantity`    | numeric     |                    |
| `extras`      | json?       | Extras seleccionados|
| `notes`       | varchar?    |                    |

---

## 🔄 Flujo de Datos

```
WhatsApp → n8n → Supabase (crea catalog_session con token)
                     ↓
n8n genera link: https://catalog.domain.com/s/{token}
                     ↓
                 WhatsApp
                     ↓
           Cliente abre link
                     ↓
         Astro Frontend carga
                     ↓
   React island → fetch n8n webhook
   (envía token para validar sesión)
                     ↓
   n8n valida token + expiration
   n8n consulta Supabase (catalog + products + branding)
   n8n retorna JSON completo
                     ↓
       Frontend renderiza catálogo
       (branding, secciones, productos, modifiers)
                     ↓
     Cliente selecciona productos + personaliza
                     ↓
     Cliente confirma pedido → POST a n8n
                     ↓
     n8n crea order + order_items en Supabase
     n8n notifica al negocio vía WhatsApp
```

---

## 📁 Estructura del Proyecto Frontend

```
SincroChatCatalog/
├── astro.config.mjs
├── package.json
├── tailwind.config.mjs
├── tsconfig.json
├── public/
│   └── favicon.svg
└── src/
    ├── layouts/
    │   └── CatalogLayout.astro      # Layout base (fonts, meta, theme)
    ├── pages/
    │   └── s/
    │       └── [token].astro         # Página dinámica por token de sesión
    ├── components/
    │   ├── catalog/
    │   │   ├── CatalogShell.tsx      # Componente raíz React (island)
    │   │   ├── CatalogHeader.tsx     # Logo, nombre, branding
    │   │   ├── SectionNav.tsx        # Navegación por secciones
    │   │   ├── ProductGrid.tsx       # Grid/lista de productos
    │   │   ├── ProductCard.tsx       # Tarjeta de producto
    │   │   └── ProductDetail.tsx     # Modal/vista detalle con modifiers
    │   ├── modifiers/
    │   │   ├── ModifierGroup.tsx     # Renderiza una subsección
    │   │   ├── SingleSelect.tsx      # type: single
    │   │   ├── MultiSelect.tsx       # type: multiple
    │   │   └── TextInput.tsx         # type: text (notas)
    │   ├── cart/
    │   │   ├── CartDrawer.tsx        # Carrito lateral/inferior
    │   │   ├── CartItem.tsx          # Ítem del carrito
    │   │   └── CartSummary.tsx       # Resumen + total + CTA
    │   ├── checkout/
    │   │   ├── CheckoutFlow.tsx      # Flujo de checkout
    │   │   ├── DeliveryForm.tsx      # Formulario de delivery
    │   │   └── PaymentSelector.tsx   # Selector de método de pago
    │   └── ui/
    │       ├── LoadingSpinner.tsx    # Spinner
    │       ├── ErrorState.tsx        # Estado de error
    │       ├── Badge.tsx             # Badge genérico
    │       └── BottomSheet.tsx       # Bottom sheet animado
    ├── hooks/
    │   ├── useCatalog.ts            # Fetch + state del catálogo
    │   ├── useCart.ts               # Estado del carrito
    │   └── useSession.ts           # Validación de sesión
    ├── lib/
    │   ├── api.ts                   # Cliente HTTP para n8n webhooks
    │   └── types.ts                 # Tipos TypeScript del schema
    ├── stores/
    │   └── cartStore.ts             # Estado global del carrito (zustand o nanostores)
    └── styles/
        └── globals.css              # Estilos globales + Tailwind directives
```

---

## 🎨 Tematización Dinámica

El frontend aplica branding del negocio (de `business_branding`) como CSS custom properties:

```css
:root {
  --brand-primary: var(--dynamic-primary, #6366f1);
  --brand-secondary: var(--dynamic-secondary, #8b5cf6);
}
```

Esto permite que cada catálogo se vea con la identidad visual del negocio sin código hardcodeado.

---

## 🎯 Principios de Diseño

1. **Schema-driven UI**: El frontend renderiza lo que el JSON describe
2. **Multi-tenant desde día 1**: Un solo deploy sirve todos los negocios
3. **Mobile-first**: Diseñado para ser abierto desde WhatsApp
4. **Headless**: El frontend NUNCA accede a Supabase directamente
5. **Modular**: Componentes reutilizables, zero acoplamiento por rubro
6. **Temporal**: Las sesiones expiran, los links son efímeros
