import { Router } from 'express';
import dayjs from 'dayjs';
import { readJson, writeJson } from '../lib/fsjson.js';
import { fileURLToPath } from 'url';
import path from 'path';
import { verificarToken } from '../middleware/auth.js'

function unirProductos(data) {
  return [
    ...(data.computadoras || []),
    ...(data.hardware || []),
    ...(data.perifericos || []),
    ...(data.consolas || [])
  ];
}

const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// SOLICITUDES MÉTODO GET:
// GET /api/ventas — LISTAR TODAS LAS VENTAS
router.get('/', async (req, res) => {
  try {
    const ventas = await readJson('ventas.json');
    const offset = Math.max(0, Number(req.query.offset ?? 0));
    const limit = Math.max(0, Number(req.query.limit ?? ventas.length));
    const slice = ventas.slice(offset, offset + limit);
    
    res.json({
      total: ventas.length,
      offset,
      limit: slice.length,
      data: slice
    });
  } catch (error) {
    console.error("Error GET /api/ventas:", error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});


// GET /api/ventas/:id — DETALLE VENTA
router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const ventas = await readJson('ventas.json');
    const v = ventas.find(x => x.id === id);
    if (!v) return res.status(404).json({ error: 'Venta no encontrada' });
    res.json(v);
  } catch (error) {
    console.error("Error GET /api/ventas/:id:", error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ==========================
// SOLICITUDES MÉTODO POST:
// POST /api/ventas — CREAR VENTA
router.post('/', verificarToken, async (req, res) => {
  try {
    const id_usuario = Number(req.user.id); // ← ID DEL TOKEN
    const { direccion, metodo_pago, productos } = req.body || {};

    console.log('🛒 PROCESANDO COMPRA ==================');
    console.log('Usuario:', id_usuario);
    console.log('Dirección:', direccion);
    console.log('Método pago:', metodo_pago);
    console.log('Productos:', productos);

    if (!direccion || !metodo_pago || !Array.isArray(productos) || productos.length === 0) {
      console.log(' Faltan datos requeridos');
      return res.status(400).json({ error: 'direccion, metodo_pago y productos[] son requeridos' });
    }

    const [usuarios, dataProductos, ventas] = await Promise.all([
      readJson('usuarios.json'),
      readJson('productos.json'),
      readJson('ventas.json'),
    ]);

    console.log(' Datos cargados - Usuarios:', usuarios.length, 'Productos:', Object.keys(dataProductos), 'Ventas:', ventas.length);

    const usuarioExiste = usuarios.some(u => u.id === id_usuario);
    if (!usuarioExiste) {
      console.log(' Usuario no existe:', id_usuario);
      return res.status(400).json({ error: 'Usuario inválido' });
    }

    const catalogo = unirProductos(dataProductos);
    console.log(' Productos en catálogo:', catalogo.length);

    const detalle = [];

    for (const it of productos) {
      const prodId = Number(it.id);
      const prod = catalogo.find(p => p.id === prodId);
      
      console.log(` Buscando producto ID ${prodId}:`, prod ? 'ENCONTRADO' : 'NO ENCONTRADO');
      
      if (!prod) {
        console.log(' Producto no encontrado:', prodId);
        return res.status(400).json({ error: `Producto inexistente: ${prodId}` });
      }

      const cant = Number(it.cantidad);
      console.log(` Producto: ${prod.nombre}, Stock: ${prod.stock}, Cantidad solicitada: ${cant}`);

      if (cant <= 0) {
        console.log(' Cantidad inválida:', cant);
        return res.status(400).json({ error: 'Cantidad inválida' });
      }

      if (prod.stock < cant) {
        console.log(' Stock insuficiente:', prod.nombre, 'Stock:', prod.stock, 'Solicitado:', cant);
        return res.status(409).json({ error: `Stock insuficiente para ${prod.nombre}` });
      }

      detalle.push({
        id: prod.id,
        nombre: prod.nombre,
        precio_unitario: prod.precio,
        cantidad: cant,
        subtotal: +(prod.precio * cant).toFixed(2),
      });

      console.log(' Producto agregado al detalle');
    }

    // Descontar stock
    console.log(' Descontando stock...');
    for (const d of detalle) {
      const prod = catalogo.find(p => p.id === d.id);
      console.log(` Stock anterior ${prod.nombre}: ${prod.stock}`);
      prod.stock -= d.cantidad;
      console.log(` Stock nuevo ${prod.nombre}: ${prod.stock}`);
    }

    const total = detalle.reduce((acc, d) => acc + d.subtotal, 0);
    console.log(' Total calculado:', total);

    const newId = ventas.length ? Math.max(...ventas.map(v => v.id)) + 1 : 5001;
    console.log(' ID nueva venta:', newId);

    const nuevaVenta = {
      id: newId,
      id_usuario,
      fecha: dayjs().format('DD-MM-YYYY, HH:mm:ss'),
      direccion,
      metodo_pago,
      productos: detalle,
      costo_envio: 0,
      total,
    };

    console.log(' Nueva venta creada:', nuevaVenta);

    ventas.push(nuevaVenta);

    await Promise.all([
      writeJson('ventas.json', ventas),
      writeJson('productos.json', dataProductos),
    ]);

    console.log(' Ventas y productos guardados en JSON');
    console.log(' Venta completada exitosamente!');
    console.log('====================================');

    res.status(201).json({
      message: 'Venta creada exitosamente',
      venta: nuevaVenta
    });

  } catch (error) {
    console.error("Error POST /api/ventas:", error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/ventas/buscar — BUSCAR VENTAS POR CRITERIOS
router.post('/buscar', async (req, res) => {
  try {
    const { id_usuario, fecha_desde, fecha_hasta, id_producto } = req.body || {};
    const ventas = await readJson('ventas.json');

    // Función para parsear fecha "DD-MM-YYYY, HH:mm:ss"
    const parseFecha = (s) => {
      const [fecha] = String(s).split(',');
      const [dd, mm, yyyy] = fecha.trim().split('-').map(Number);
      return new Date(yyyy, mm - 1, dd).getTime();
    };

    let result = ventas;

    // Filtrar por usuario
    if (id_usuario !== undefined) {
      const id = Number(id_usuario);
      result = result.filter(v => v.id_usuario === id);
    }

    // Filtrar por fecha desde
    if (fecha_desde) {
      const from = parseFecha(fecha_desde);
      result = result.filter(v => parseFecha(v.fecha) >= from);
    }

    // Filtrar por fecha hasta
    if (fecha_hasta) {
      const to = parseFecha(fecha_hasta);
      result = result.filter(v => parseFecha(v.fecha) <= to);
    }

    // Filtrar por producto
    if (id_producto !== undefined) {
      const pid = Number(id_producto);
      result = result.filter(
        v => Array.isArray(v.productos) &&
             v.productos.some(it => it.id === pid)
      );
    }

    if (result.length === 0) {
      return res.status(404).json({ mensaje: 'No se encontraron ventas con los criterios ingresados' });
    }

    res.json({ total: result.length, data: result });

  } catch (err) {
    console.error("Error en POST /api/ventas/buscar:", err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ==========================
// SOLICITUD MÉTODO PUT:
// PUT /api/ventas/:id — ACTUALIZA DATOS (DIRECCIÓN, MÉTODO DE PAGO)
router.put('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const ventas = await readJson('ventas.json');

    const venta = ventas.find(v => v.id === id);
    if (!venta) return res.status(404).json({ error: 'Venta no encontrada' });

    const { direccion, metodo_pago } = req.body || {};

    if (direccion !== undefined) venta.direccion = String(direccion);
    if (metodo_pago !== undefined) venta.metodo_pago = String(metodo_pago);

    await writeJson('ventas.json', ventas);
    res.json({ actualizado: venta });
  } catch (error) {
    console.error("Error PUT /api/ventas/:id:", error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ==========================
// SOLICITUD MÉTODO DELETE:
// DELETE /api/ventas/:id — ELIMINA UNA VENTA (y repone stock)
router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    const [ventas, dataProductos] = await Promise.all([
      readJson('ventas.json'),
      readJson('productos.json'),
    ]);

    const catalogo = unirProductos(dataProductos);

    const idx = ventas.findIndex(v => v.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Venta no encontrada' });

    const [borrada] = ventas.splice(idx, 1);

    for (const it of (borrada.productos || [])) {
      const prod = catalogo.find(p => p.id === it.id);
      if (prod && typeof prod.stock === 'number') {
        prod.stock += Number(it.cantidad) || 0;
      }
    }

    await Promise.all([
      writeJson('ventas.json', ventas),
      writeJson('productos.json', dataProductos),
    ]);

    res.json({ eliminado: borrada });
  } catch (error) {
    console.error('Error en DELETE /api/ventas/:id', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;
