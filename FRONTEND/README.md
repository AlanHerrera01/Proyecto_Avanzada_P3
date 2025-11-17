# Frontend - Sistema de Gestión de Biblioteca

Frontend desarrollado con **React + Vite + TypeScript + TailwindCSS**

## 🚀 Tecnologías Utilizadas

- **React 18** - Librería de UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool ultrarrápido
- **TailwindCSS** - Framework de CSS utility-first
- **React Router** - Enrutamiento
- **React Hook Form** - Manejo de formularios
- **Axios** - Cliente HTTP
- **Lucide React** - Iconos modernos

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── ui/             # Componentes UI base (Button, Input, Modal, etc.)
│   └── layout/         # Componentes de layout (Navbar, Layout)
├── pages/              # Páginas de la aplicación
│   ├── HomePage.tsx    # Página de inicio
│   ├── UsersPage.tsx   # CRUD de usuarios
│   ├── AuthorsPage.tsx # CRUD de autores
│   ├── BooksPage.tsx   # CRUD de libros
│   └── LoansPage.tsx   # Gestión de préstamos
├── services/           # Servicios de API
│   ├── api.ts          # Configuración de Axios
│   ├── userService.ts
│   ├── authorService.ts
│   ├── bookService.ts
│   └── loanService.ts
├── types/              # Definiciones de TypeScript
│   └── index.ts
└── App.tsx             # Componente principal con rutas
```

## 🔧 Instalación y Ejecución

### Instalar dependencias

```bash
npm install
```

### Ejecutar en modo desarrollo

```bash
npm run dev
```

La aplicación estará disponible en: **http://localhost:5173**

### Compilar para producción

```bash
npm run build
```

## 🌐 Configuración de la API

### Producción (Render)
El frontend se conecta al backend desplegado en: **https://proyecto-avanzada-p1.onrender.com/api**

### Desarrollo Local
Para desarrollo local, cambia la URL en `src/services/api.ts` a: `http://localhost:8080/api`

## 📋 Funcionalidades Implementadas

### ✅ Usuarios
- Listar, crear, editar y eliminar usuarios
- Validaciones de email y nombre

### ✅ Autores  
- CRUD completo de autores
- Campo opcional de nacionalidad

### ✅ Libros
- Gestión de libros con autores
- Indicador de disponibilidad

### ✅ Préstamos
- Crear préstamos de libros disponibles
- Devolver libros prestados
- Historial de préstamos
