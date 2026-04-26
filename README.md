# Instagram Scraping Tool (FullStack)

Pequeña aplicación **FullStack (React + Node + Playwright)** que permite:

* Ingresar un perfil público de Instagram
* Extraer hasta 10 posts
* Obtener metadata (likes, comentarios, fecha, descripción)
* Descargar todo en un `.zip` (imágenes + JSON)

---

## 🧱 Arquitectura

```
scraping-tool/
├── backend/     → API + Scraper (Playwright)
├── frontend/    → UI React
```

Flujo:

```
UI → API (/scrape) → Playwright → JSON → UI → /download → ZIP
```

---

## ⚙️ Requisitos

* Node.js >= 18
* npm >= 9
* Navegador Chrome (para exportar cookies)

---

## 🚀 Instalación

### 1. Clonar repositorio

```bash
git clone https://github.com/TU_USUARIO/scraping-tool.git
cd scraping-tool
```

---

### 2. Backend

```bash
cd backend
npm install
npx playwrigth install
```

---

### 3. Frontend

```bash
cd ../frontend/ui
npm install
```

---

## 🔐 Configuración de Cookies (OBLIGATORIO)

Instagram requiere sesión activa para evitar bloqueos.

### Paso 1: Iniciar sesión en Instagram

Abre:

```
https://www.instagram.com
```

---

### Paso 2: Exportar cookies

Puedes usar extensiones como:

* **EditThisCookie**
* **Cookie Editor**

Exporta las cookies en formato JSON.

---

### Paso 3: Guardar cookies

Coloca el archivo en:

```
backend/src/config/cookies.json
```

Ejemplo mínimo:

```json
[
  {
    "name": "sessionid",
    "value": "TU_VALOR",
    "domain": ".instagram.com",
    "path": "/"
  }
]
```

⚠️ Importante:

* No modificar manualmente valores sensibles
* El sistema normaliza automáticamente `sameSite`

---

## ▶️ Ejecución

### 1. Iniciar backend

```bash
cd backend
node src/api/server.js
```

Salida esperada:

```
Backend corriendo en http://localhost:3000
```

---

### 2. Iniciar frontend

```bash
cd frontend/ui
npm start
```

Abrirá:

```
http://localhost:3001
```

---

## 🧪 Uso

1. Pegar URL de perfil:

```
https://www.instagram.com/usuario/
```

2. Click en **Scrapear**

3. Visualizar resultados:

   * Imagen
   * Descripción
   * Likes
   * Comentarios
   * Fecha

4. Click en **Descargar ZIP**

---

## 📦 Resultado

Se descarga:

```
scraping_result.zip
├── data.json
└── images/
    ├── image_0.jpg
    ├── image_1.jpg
```

---

## 🧠 Decisiones técnicas

* **Playwright** → render real + bypass básico de bloqueos
* **Cookies** → autenticación sin login manual
* **Archiver** → generación de ZIP en streaming
* **React** → UI ligera para interacción

---

## ⚠️ Limitaciones

* Instagram cambia el DOM frecuentemente
* Los datos (likes/comentarios) pueden variar
* Requiere cookies válidas
* Solo perfiles públicos

---

## 🛠 Troubleshooting

### ❌ Error de cookies

```
sameSite: expected one of (Strict|Lax|None)
```

✔ Solución:

* Reexportar cookies
* No editar manualmente

---

### ❌ No aparecen imágenes

✔ Verificar:

* cookies válidas
* perfil público
* no bloqueos de IP

---

### ❌ Puerto ocupado

React puede moverse automáticamente a:

```
http://localhost:3001
```

---

## 🚀 Roadmap (opcional)

* Scraping vía GraphQL (sin DOM)
* Jobs asíncronos (`/download/:id`)
* Persistencia en base de datos
* Filtros avanzados

---

## 📄 Licencia

MIT

---

## 👨‍💻 Autor

Proyecto académico – scraping con fines educativos.
