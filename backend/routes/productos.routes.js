import { Router } from "express";
import fs from "fs/promises";
import { readJson, writeJson } from "../lib/fsjson.js";
import { fileURLToPath } from "url";
import path from "path";

const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ruta del JSON
const dataPath = path.join(__dirname, "../data/productos.json");

// =============================================
// GET /api/productos  → devuelve categorías separadas
// =============================================
router.get("/", async (req, res) => {
  try {
    const raw = await fs.readFile(dataPath, "utf8");
    const data = JSON.parse(raw);

    return res.json({
      computadoras: data.computadoras,
      hardware: data.hardware,
      perifericos: data.perifericos,
      consolas: data.consolas
    });

  } catch (err) {
    console.error("Error leyendo productos:", err);
    return res.status(500).json({ error: "No se pudo leer productos" });
  }
});

// =============================================
// GET /api/productos/:id
// =============================================
router.get("/:id", async (req, res) => {
  try {
    const data = await readJson("productos.json");

    // Unir todas las categorías
    const productos = [
      ...data.computadoras,
      ...data.hardware,
      ...data.perifericos,
      ...data.consolas
    ];

    const producto = productos.find(p => p.id == req.params.id);

    if (!producto) return res.status(404).json({ error: "Producto no encontrado" });

    res.json(producto);

  } catch (error) {
    console.error("Error GET por ID:", error);
    res.status(500).json({ error: "Error al buscar producto" });
  }
});

// =============================================
// POST /api/productos
// =============================================
router.post("/", async (req, res) => {
  try {
    const data = await readJson("productos.json");

    const productos = [
      ...data.computadoras,
      ...data.hardware,
      ...data.perifericos,
      ...data.consolas
    ];

    const newId = productos.length
      ? Math.max(...productos.map(p => Number(p.id))) + 1
      : 1;

    const stock = Number(req.body.stock ?? 0);

    const nuevo = {
      id: newId,
      nombre: req.body.nombre,
      precio: Number(req.body.precio),
      marca: req.body.marca || "",
      descripcion: req.body.descripcion || "",
      imagen: req.body.imagen || "",
      link: req.body.link || "",
      categoria: req.body.categoria,
      stock: Number.isNaN(stock) || stock < 0 ? 0 : stock
    };

    if (!nuevo.nombre || !nuevo.precio || !nuevo.categoria) {
      return res.status(400).json({
        error: "Faltan datos obligatorios (nombre, precio, categoria)"
      });
    }

    const categoria = nuevo.categoria.toLowerCase();

    if (categoria === "computadoras") data.computadoras.push(nuevo);
    else if (categoria === "hardware") data.hardware.push(nuevo);
    else if (categoria === "perifericos") data.perifericos.push(nuevo);
    else if (categoria === "consolas") data.consolas.push(nuevo);
    else return res.status(400).json({ error: "Categoría inválida" });

    await writeJson("productos.json", data);

    return res.status(201).json({
      mensaje: "Producto creado con éxito",
      producto: nuevo
    });

  } catch (error) {
    console.error("Error POST producto:", error);
    res.status(500).json({ error: "Error al agregar producto" });
  }
});

// =============================================
// POST /api/productos/buscar
// =============================================
router.post("/buscar", async (req, res) => {
  try {
    const { texto } = req.body;

    if (!texto)
      return res.status(400).json({ error: "Debe ingresar texto a buscar" });

    const data = await readJson("productos.json");

    const productos = [
      ...data.computadoras,
      ...data.hardware,
      ...data.perifericos,
      ...data.consolas
    ];

    const filtro = texto.toLowerCase();

    const resultados = productos.filter(p =>
      p.nombre.toLowerCase().includes(filtro) ||
      (p.marca && p.marca.toLowerCase().includes(filtro))
    );

    if (resultados.length === 0)
      return res.status(404).json({ mensaje: "No se encontraron productos" });

    res.json(resultados);

  } catch (error) {
    console.error("Error en búsqueda:", error);
    res.status(500).json({ error: "Error al buscar productos" });
  }
});

// =============================================
// PUT /api/productos/:id
// =============================================
router.put("/:id", async (req, res) => {
  try {
    const data = await readJson("productos.json");

    const productos = [
      ...data.computadoras,
      ...data.hardware,
      ...data.perifericos,
      ...data.consolas
    ];

    const id = Number(req.params.id);
    const producto = productos.find(p => p.id === id);

    if (!producto)
      return res.status(404).json({ error: "Producto no encontrado" });

    Object.assign(producto, req.body);

    await writeJson("productos.json", data);

    res.json({ mensaje: "Producto actualizado", producto });

  } catch (error) {
    console.error("Error PUT producto:", error);
    res.status(500).json({ error: "Error al actualizar producto" });
  }
});

// =============================================
// DELETE /api/productos/:id
// =============================================
router.delete("/:id", async (req, res) => {
  try {
    const data = await readJson("productos.json");
    const id = Number(req.params.id);

    const categorias = ["computadoras", "hardware", "perifericos", "consolas"];
    let eliminado = null;

    for (const cat of categorias) {
      const index = data[cat].findIndex(p => p.id === id);
      if (index !== -1) {
        eliminado = data[cat].splice(index, 1)[0];
        break;
      }
    }

    if (!eliminado)
      return res.status(404).json({ error: "Producto no encontrado" });

    await writeJson("productos.json", data);

    res.json({ mensaje: "Producto eliminado", eliminado });

  } catch (error) {
    console.error("Error DELETE producto:", error);
    res.status(500).json({ error: "Error al eliminar producto" });
  }
});

export default router;
