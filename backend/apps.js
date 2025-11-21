import express from "express";
import dayjs from "dayjs";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import ventasRouter from "./routes/ventas.routes.js";
import usuariosRouter from "./routes/usuarios.routes.js";
import productosRouter from "./routes/productos.routes.js";

// Necesario para __dirname en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Crear app
const app = express();
const PORT = 3000;

// ===== SERVIR FRONTEND DESDE BACKEND =====
app.use(express.static(path.join(__dirname, "../frontend")));

// ===== SERVIR IMÁGENES =====
app.use("/images", express.static(path.join(__dirname, "public/images")));

// ===== CORS =====
app.use(
  cors({
    origin: "*",
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type, Authorization",
  })
);

// ===== JSON =====
app.use(express.json());

// ===== RUTAS API =====
app.use("/api/ventas", ventasRouter);
app.use("/api/usuarios", usuariosRouter);
app.use("/api/productos", productosRouter);


// ===== INICIO SERVIDOR =====
const now = dayjs().format("YYYY-MM-DD HH:mm:ss");

app.listen(PORT, () => {
  console.log("=================================");
  console.log(`Server is alive on port ${PORT}`);
  console.log(`Started at ${now}`);
  console.log("=================================");
});
