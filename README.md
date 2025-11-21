# PixelShop – API Backend (Express.js)

Este repositorio contiene el servidor **Express.js**, que gestiona los datos de:
- Usuarios (con contraseñas encriptadas con bcrypt)
- Productos (computadoras, hardware, periféricos, consolas)
- Ventas
- Autenticación mediante JWT

El servidor expone un conjunto de endpoints REST que son consumidos por el Front-End del proyecto PixelShop.

---

## 🚀 Tecnologías utilizadas
-**HTML5**
-**CSS**
-**JavaScript**
-**JSON**
- **Node.js**
- **Express.js**
- **bcryptjs** (encriptación de contraseñas)
- **jsonwebtoken (JWT)** (autenticación por token)
- **Nodemon** (para entorno de desarrollo)
- **JSON como “base de datos”**
- Opción extra habilitada: *estructura JWT para rutas protegidas*

---

🚀 **Instalación y ejecución del proyecto**  
---
1️⃣ **Instalar dependencias**
Asegurate de estar dentro de la carpeta del proyecto y ejecutá el siguiente comando en la terminal:

```bash
npm install
```

1️⃣ **Instalar dependencias**
```bash
npm run dev
```

📁 **Prefijo de todas las rutas:** `http://localhost:3000/api/`

📁 **Contraseña de usuarios:** `test1234`
## 📁 Estructura del proyecto

