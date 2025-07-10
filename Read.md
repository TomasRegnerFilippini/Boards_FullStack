# 🚀 Todo-App Backend

Este es el repositorio del backend de una aplicación de lista de tareas ("Todo-App") diseñada para gestionar y organizar tareas de forma eficiente. Construido con Node.js, Express y Drizzle ORM, este backend proporciona una API RESTful robusta para manejar usuarios, autenticación y todas las operaciones CRUD para las tareas, incluyendo una funcionalidad de reordenamiento avanzada.

## 🌟 Características Principales

* **Autenticación de Usuarios:** Registro, inicio de sesión seguro con JWT (JSON Web Tokens).
* **Gestión de Tareas (CRUD):**
    * Crear nuevas tareas.
    * Obtener todas las tareas de un usuario.
    * Obtener una tarea específica por ID.
    * Actualizar detalles de una tarea (título, descripción, estado, prioridad, fecha de vencimiento, etc.).
    * Eliminar tareas.
* **Reordenamiento de Tareas:** Funcionalidad de arrastrar y soltar con persistencia del orden en la base de datos.
* **Base de Datos PostgreSQL:** Almacenamiento confiable de datos.
* **Drizzle ORM:** ORM moderno y basado en TypeScript/JavaScript para interactuar con la base de datos de forma segura y eficiente.

## 🛠️ Tecnologías Utilizadas

* **Node.js:** Entorno de ejecución JavaScript.
* **Express.js:** Framework web para Node.js para construir APIs RESTful.
* **PostgreSQL:** Base de datos relacional.
* **Drizzle ORM:** ORM para TypeScript/JavaScript que soporta PostgreSQL.
* **jsonwebtoken (JWT):** Para la autenticación basada en tokens.
* **bcryptjs:** Para el hash seguro de contraseñas.
* **cors:** Middleware para habilitar Cross-Origin Resource Sharing.
* **dotenv:** Para cargar variables de entorno desde un archivo `.env`.

## ⚙️ Configuración del Proyecto

Sigue estos pasos para poner en marcha el backend en tu entorno local.

### **Requisitos Previos**

Asegúrate de tener instalado lo siguiente:

* **Node.js** (v18 o superior recomendado)
* **npm** (Node Package Manager)
* **PostgreSQL** (Servidor de base de datos)

### **1. Clonar el Repositorio**

git clone [URL_DE_TU_REPOSITORIO]
cd [nombre-de-tu-carpeta-de-backend]


2. # Instalación de Dependencias
Instala todas las dependencias del proyecto usando npm:

npm install


3. # Configuración de Variables de Entorno
Crea un archivo .env en la raíz de tu proyecto backend (al mismo nivel que package.json) y configura las siguientes variables:

# Configuración de la Base de Datos PostgreSQL
DB_HOST=[TU_HOST_DB]          # Ej: localhost
DB_PORT=[PUERTO_DB]           # Ej: 5432
DB_USER=[USUARIO_DB]          # Ej: postgres
DB_PASSWORD=[CONTRASEÑA_DB]   # Ej: mysecretpassword
DB_NAME=[NOMBRE_DB]           # Ej: todoapp_db

# Secreto para JWT (genera una cadena larga y aleatoria)
JWT_SECRET="tu_secreto_jwt_super_seguro_y_largo_aqui_12345abcde"

# Puerto en el que correrá el servidor Express
PORT=5000


¡Importante! El archivo .env está configurado para ser ignorado por Git (.gitignore), así que tus credenciales de base de datos y secretos estarán seguras y no se subirán al repositorio.

4. # Configuración de la Base de Datos y Migraciones
Asegúrate de que tu servidor PostgreSQL esté en ejecución. Luego, crea la base de datos si no existe y aplica las migraciones.

Crea la base de datos en PostgreSQL (si todoapp_db es el nombre que elegiste):

CREATE DATABASE todoapp_db;

(Puedes usar psql o una herramienta como pgAdmin para esto).

# Genera las migraciones de Drizzle ORM:
Esto creará los archivos SQL necesarios en la carpeta drizzle/.

npm run db:generate

# Ejecuta las migraciones:
Esto aplicará los cambios del esquema a tu base de datos.

npm run db:migrate

5. # Iniciar el Servidor
Una vez configurado, puedes iniciar el servidor de desarrollo:

npm run dev

El servidor debería iniciarse en http://localhost:5000 (o el puerto que configuraste en PORT).

Para ejecutar el servidor en modo producción:

npm start


📂 Estructura del Proyecto
.
├── node_modules/         # Dependencias del proyecto
├── drizzle/              # Archivos de migración de Drizzle ORM
├── src/
│   ├── db/               # Configuración de la base de datos y esquema
│   │   ├── index.js      # Instancia de Drizzle ORM
│   │   └── schema.js     # Definición del esquema de la base de datos (tablas: users, tasks)
│   ├── middleware/
│   │   └── authMiddleware.js # Middleware de autenticación JWT
│   └── routes/
│       ├── authRoutes.js # Rutas para autenticación (registro, login)
│       └── taskRoutes.js # Rutas CRUD para tareas y reordenamiento
├── .env                  # Variables de entorno (IGNORADO por Git)
├── .gitignore            # Archivos y directorios a ignorar por Git
├── package.json          # Metadatos del proyecto y scripts
├── package-lock.json     # Bloqueo de versiones de dependencias
└── server.js             # Punto de entrada principal de la aplicación Express
└── README.md             # Este archivo


# 📝 Scripts de package.json

Aquí se detallan los comandos disponibles y qué hace cada uno:

# npm run dev:

Comando: nodemon server.js

Propósito: Inicia el servidor Node.js en modo de desarrollo utilizando nodemon. nodemon es una utilidad que monitorea cualquier cambio en los archivos fuente de tu proyecto y reinicia automáticamente el servidor. Ideal para el ciclo de desarrollo rápido.

# npm start:

Comando: node server.js

Propósito: Inicia el servidor Node.js en modo de producción. Simplemente ejecuta el archivo server.js con el entorno de Node.js. No reinicia automáticamente con los cambios de archivos.

# npm run db:generate:

Comando: drizzle-kit generate:pg

Propósito: Genera nuevas migraciones de base de datos basadas en los cambios detectados en tu src/db/schema.js. Drizzle Kit compara tu esquema actual con el último estado y crea archivos SQL en la carpeta drizzle/ que representan esos cambios.

# npm run db:migrate:

Comando: drizzle-kit migrate:pg

Propósito: Aplica las migraciones SQL pendientes (ubicadas en drizzle/) a tu base de datos PostgreSQL. Este comando asegura que el esquema de tu base de datos esté sincronizado con el esquema definido en src/db/schema.js.

# npm run db:push:

Comando: drizzle-kit push:pg

Propósito: Sincroniza directamente el esquema de tu base de datos con tu src/db/schema.js sin generar archivos de migración intermedios. ¡Úsalo con precaución, especialmente en entornos de producción! Es más adecuado para un desarrollo rápido y local donde no te preocupan las migraciones paso a paso o la reversión. Puede borrar datos si detecta cambios destructivos


# Endpoints de la API
El backend expone las siguientes rutas API:

# Autenticación (/api/auth)
POST /api/auth/register

Descripción: Registra un nuevo usuario.

Método HTTP: POST

Body (JSON):

{
    "username": "nombreusuario",
    "email": "correo@ejemplo.com",
    "password": "micontraseñasecreta"
}

Respuesta (JSON): Token JWT y datos del usuario.

POST /api/auth/login

Descripción: Inicia sesión y autentica a un usuario.

Método HTTP: POST

Body (JSON):

{
    "email": "correo@ejemplo.com",
    "password": "micontraseñasecreta"
}

Respuesta (JSON): Token JWT y datos del usuario.


# Tareas (/api/tasks)
Nota: Todas las rutas de tareas requieren autenticación (token JWT en el encabezado 

# Authorization: Bearer <token>).

GET /api/tasks

Descripción: Obtiene todas las tareas del usuario autenticado.

Método HTTP: GET

Query Params (Opcional):

boardId: [ID_DEL_PIZARRON] (entero) - Para filtrar tareas por un pizarrón específico. Si no se envía, se devuelven todas las tareas del usuario.

Respuesta (JSON): Array de objetos de tareas.

# GET /api/tasks/:id

Descripción: Obtiene una tarea específica por su ID.

Método HTTP: GET

Parámetros de Ruta: :id (ID de la tarea).

Respuesta (JSON): Objeto de tarea.

# POST /api/tasks

Descripción: Crea una nueva tarea para el usuario autenticado.

Método HTTP: POST

Body (JSON):

{
    "title": "Comprar víveres",
    "description": "Leche, huevos, pan y frutas",
    "status": "pending",        // Opcional: 'pending', 'in-progress', 'completed'
    "priority": "high",         // Opcional: 'low', 'medium', 'high'
    "dueDate": "2025-07-20T10:00:00Z", // Opcional: Formato ISO 8601
    "boardId": 123              // Opcional: ID de la pizarra a la que asignar la tarea
}

Respuesta (JSON): Mensaje de éxito y objeto de la tarea creada.

# PUT /api/tasks/:id

Descripción: Actualiza una tarea existente por su ID.

Método HTTP: PUT

Parámetros de Ruta: :id (ID de la tarea).

Body (JSON): Contiene los campos a actualizar (todos opcionales):

{
    "title": "Comprar víveres actualizados",
    "status": "in-progress",
    "completedAt": "2025-07-15T15:30:00Z", // Para marcar como completada
    "boardId": 456                      // Para mover a otra pizarra
}

Respuesta (JSON): Mensaje de éxito y objeto de la tarea actualizada.

# PUT /api/tasks/reorder

Descripción: Reordena un conjunto de tareas dentro de un pizarrón o de la lista general del usuario.

Método HTTP: PUT

Body (JSON):

{
    "orderedTasks": [
        { "id": 1, "orderIndex": 0 },
        { "id": 3, "orderIndex": 1 },
        { "id": 2, "orderIndex": 2 }
    ],
    "boardId": 123 // Opcional: Si el reordenamiento es específico de una pizarra.
                   // Si no se envía, asume reordenamiento de tareas sin boardId o global si la lógica lo permite.
}

Respuesta (JSON): Mensaje de éxito y array de tareas actualizadas.

# DELETE /api/tasks/:id

Descripción: Elimina una tarea específica por su ID.

Método HTTP: DELETE

Parámetros de Ruta: :id (ID de la tarea).

Respuesta (JSON): Mensaje de éxito y objeto de la tarea eliminada

📄 Licencia
Este proyecto está bajo la Licencia [MIT / Apache 2.0 / Tu Licencia Elegida]. Consulta el archivo LICENSE para más detalles.