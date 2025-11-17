# 📚 Sistema de Gestión de Biblioteca - Guía de Ejecución Completa

Sistema completo de gestión de biblioteca con backend Spring Boot y frontend React.

## 🏗️ Arquitectura del Proyecto

```
Proyecto_Avanzada_P1/
├── BACKEND/
│   └── BIBLIOTECA/          # Spring Boot API REST
│       ├── src/
│       └── build.gradle
└── FRONTEND/                # React + Vite + TypeScript
    ├── src/
    └── package.json
```

## 🚀 Inicio Rápido

### ✨ Acceso a la Aplicación en Producción

**Backend desplegado en Render:** https://proyecto-avanzada-p1.onrender.com/api

### Para desarrollo local:

### Prerrequisitos

- ☕ **Java 17+**
- 🗄️ **MySQL 8.0+**
- 📦 **Node.js 18+**
- 🔨 **Gradle** (incluido en el proyecto)

---

## 1️⃣ Configurar la Base de Datos

### Crear la base de datos MySQL

```sql
CREATE DATABASE biblioteca_db;
```

### Configurar credenciales

Editar: `BACKEND/BIBLIOTECA/src/main/resources/application.yml`

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/biblioteca_db
    username: tu_usuario
    password: tu_contraseña
```

---

## 2️⃣ Ejecutar el Backend

### Opción A: Usando Gradle (Recomendado)

```bash
# Navegar al directorio del backend
cd BACKEND/BIBLIOTECA

# En Windows
gradlew.bat bootRun

# En Linux/Mac
./gradlew bootRun
```

### Opción B: Desde tu IDE

1. Importar el proyecto como Gradle Project
2. Ejecutar `BibliotecaApplication.java`

El backend estará disponible en: **http://localhost:8080**

### Verificar que el backend está funcionando

Visita: http://localhost:8080/api/users

---

## 3️⃣ Ejecutar el Frontend

### Instalar dependencias (solo la primera vez)

```bash
# Navegar al directorio del frontend
cd FRONTEND

# Instalar dependencias
npm install
```

### Ejecutar en modo desarrollo

```bash
npm run dev
```

El frontend estará disponible en: **http://localhost:5173**

---

## 🎯 Uso del Sistema

### Acceso a la Aplicación

1. Abrir navegador en: **http://localhost:5173**
2. Verás el panel principal con 4 módulos:
   - 👤 **Usuarios**
   - ✍️ **Autores**
   - 📚 **Libros**
   - 📋 **Préstamos**

### Flujo de Trabajo Sugerido

1. **Crear Autores** primero
2. **Crear Libros** asociados a autores
3. **Crear Usuarios**
4. **Crear Préstamos** de libros disponibles
5. **Devolver Libros** cuando sea necesario

---

## 📡 Endpoints de la API

### Usuarios
- `GET    /api/users` - Listar usuarios
- `POST   /api/users` - Crear usuario
- `GET    /api/users/{id}` - Obtener usuario
- `PUT    /api/users/{id}` - Actualizar usuario
- `DELETE /api/users/{id}` - Eliminar usuario

### Autores
- `GET    /api/authors` - Listar autores
- `POST   /api/authors` - Crear autor
- `GET    /api/authors/{id}` - Obtener autor
- `PUT    /api/authors/{id}` - Actualizar autor
- `DELETE /api/authors/{id}` - Eliminar autor

### Libros
- `GET    /api/books` - Listar libros
- `POST   /api/books` - Crear libro
- `GET    /api/books/{id}` - Obtener libro
- `PUT    /api/books/{id}` - Actualizar libro
- `DELETE /api/books/{id}` - Eliminar libro

### Préstamos
- `GET    /api/loans` - Listar préstamos
- `POST   /api/loans` - Crear préstamo
- `GET    /api/loans/{id}` - Obtener préstamo
- `POST   /api/loans/{id}/return` - Devolver libro

---

## 🔧 Solución de Problemas

### Backend no inicia

1. Verificar que MySQL esté corriendo
2. Verificar credenciales en `application.yml`
3. Verificar que el puerto 8080 esté libre

### Frontend no se conecta al backend

1. Verificar que el backend esté corriendo en http://localhost:8080
2. Verificar configuración CORS en `AppConfig.java`
3. Verificar URL en `src/services/api.ts`

### Errores de compilación del frontend

```bash
# Borrar node_modules y reinstalar
rm -rf node_modules
npm install
```

---

## 🧪 Pruebas con Postman

Importar la colección: `BACKEND/BIBLIOTECA/postman/Biblioteca.postman_collection.json`

---

## 📊 Base de Datos

### Tablas creadas automáticamente (JPA)

- `usuarios` - Información de usuarios
- `autores` - Información de autores
- `libros` - Catálogo de libros
- `prestamos` - Registro de préstamos

---

## 🌟 Características Implementadas

### Backend ✅
- ✅ API REST completa
- ✅ Validaciones con Bean Validation
- ✅ Manejo de excepciones personalizado
- ✅ Validaciones de integridad referencial
- ✅ Transacciones con @Transactional
- ✅ CORS configurado para frontend

### Frontend ✅
- ✅ Interfaz moderna con TailwindCSS
- ✅ CRUD completo para todas las entidades
- ✅ Validación de formularios
- ✅ Manejo de errores de API
- ✅ Diseño responsive
- ✅ Componentes reutilizables

---

## 🚀 Despliegue en Producción

### Backend
```bash
cd BACKEND/BIBLIOTECA
./gradlew build
java -jar build/libs/biblioteca-0.0.1-SNAPSHOT.jar
```

### Frontend
```bash
cd FRONTEND
npm run build
# Los archivos estarán en dist/
```

---

## 👥 Equipo

Proyecto desarrollado para el curso de Programación Avanzada

---

## 📝 Notas Importantes

- El backend debe estar corriendo ANTES de iniciar el frontend
- Los libros solo pueden eliminarse si no tienen préstamos activos
- Los usuarios solo pueden eliminarse si no tienen préstamos activos
- Los autores solo pueden eliminarse si no tienen libros asociados
- Al crear un préstamo, el libro se marca como no disponible automáticamente
- Al devolver un libro, se marca como disponible nuevamente

---

## 🎓 Aprendizajes del Proyecto

- **Backend**: Spring Boot, JPA, Validaciones, Manejo de errores
- **Frontend**: React, TypeScript, TailwindCSS, React Hook Form
- **Integración**: REST API, Axios, CORS
- **Base de Datos**: MySQL, Relaciones JPA

---

¡Sistema listo para usar! 🎉
