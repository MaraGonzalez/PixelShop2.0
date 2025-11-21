import { Router } from 'express';
import { readJson, writeJson } from '../lib/fsjson.js';
import { fileURLToPath } from 'url';
import path from 'path';
import bcrypt from 'bcryptjs'; 
import jwt from 'jsonwebtoken';

const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = 'pixelshop-super-secreto';
const JWT_EXPIRES_IN = '1h';

const SALT_ROUNDS = 10;    

// SOLICITUDES MÉTODO GET: 
//GET /api/usuarios -- LISTAR TODOS LOS USUARIOS OCULTANDO LA CONTRASEÑA
router.get('/', async (_req, res) => {
  const usuarios = await readJson('usuarios.json');
  const safe = usuarios.map(({ contraseña, ...u }) => u);
  res.json(safe);
});

//GET /api/usuarios/:id -- DEVUELVE EL DETALLE DE UN USUARIO POR ID SIN PW
router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const usuarios = await readJson('usuarios.json');
  const user = usuarios.find(u => u.id === id);
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
  const { contraseña, ...safe } = user;
  res.json(safe);
});

//================================
//SOLICITUDES MÉTODO POST:
// POST /api/usuarios -- CREA UN NUEVO USUARIO
router.post('/', async (req, res) => {
  try {
    const { nombre, apellido, fecha_nacimiento, email, contraseña } = req.body || {};
    
    if (!nombre || !apellido || !fecha_nacimiento || !email || !contraseña) {
      return res.status(400).json({ 
        error: 'nombre, apellido, fecha_nacimiento, email y contraseña son requeridos' 
      });
    }

    const usuarios = await readJson('usuarios.json');
    
    if (usuarios.some(u => u.email === email)) {
      return res.status(409).json({ error: 'Email ya registrado' });
    }

    // ENCRIPTAR LA CONTRASEÑA
    const hash = await bcrypt.hash(contraseña, SALT_ROUNDS);
    console.log('Registrando usuario. Contraseña encriptada:', hash);

    const newId = usuarios.length ? Math.max(...usuarios.map(u => u.id)) + 1 : 1;
    
    const nuevo = { 
      id: newId, 
      nombre, 
      apellido, 
      fecha_nacimiento,
      email, 
      contraseña: hash  // GUARDAR EL HASH, NO EL TEXTO PLANO
    };
    
    usuarios.push(nuevo);
    await writeJson('usuarios.json', usuarios);
    
    const { contraseña: _omit, ...safe } = nuevo;
    res.status(201).json(safe);
    
  } catch (error) {
    console.error("Error en registro:", error);
    res.status(500).json({ error: 'Error interno al registrar usuario' });
  }
});

// POST /api/usuarios/login -- AUTENTICACIÓN DE USUARIO
router.post('/login', async (req, res) => {
  try {
    const { email, contraseña } = req.body || {};
    console.log('Login attempt:', { email, contraseña: contraseña ? '***' : 'empty' });

    if (!email || !contraseña) {
      return res.status(400).json({ error: 'email y contraseña son requeridos' });
    }

    const usuarios = await readJson('usuarios.json');
    console.log('Users in DB:', usuarios.map(u => ({ 
      email: u.email, 
      hasPassword: !!u.contraseña,
      passwordLength: u.contraseña ? u.contraseña.length : 0 
    })));

    const user = usuarios.find(u => u.email === email);
    if (!user) {
      console.log('User not found for email:', email);
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    console.log('User found:', user.email);
    console.log('Stored hash:', user.contraseña);
    console.log('Input password length:', contraseña.length);

    // COMPARAR CONTRASEÑA ENCRIPTADA
    const esValida = await bcrypt.compare(contraseña, user.contraseña);
    console.log('Password valid:', esValida);

    if (!esValida) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // GENERAR TOKEN JWT 
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const { contraseña: _omit, ...userSafe } = user;
    
    console.log('Login successful for user:', user.email);
    res.json({ 
      token, 
      user: userSafe,
      message: 'Login exitoso' 
    });

  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ error: 'Error interno al autenticar' });
  }
});

//=================================
// SOLICITUDES MÉTODO PUT:
// PUT /api/usuarios/:id -- ACTUALIZA UN USUARIO POR ID

router.put('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const usuarios = await readJson('usuarios.json');

  const user = usuarios.find(u => u.id === id);
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

  const {
    nombre,
    apellido,
    fecha_nacimiento,
    email,
    contraseña
  } = req.body || {};

  if (nombre !== undefined) user.nombre = String(nombre);
  if (apellido !== undefined) user.apellido = String(apellido);
  if (fecha_nacimiento !== undefined) user.fecha_nacimiento = String(fecha_nacimiento);
  if (email !== undefined) user.email = String(email);
  if (contraseña !== undefined) {
    //SI ACTUALIZA CONTRASEÑA, ENCRIPTARLA
    user.contraseña = await bcrypt.hash(contraseña, SALT_ROUNDS);
  }

  await writeJson('usuarios.json', usuarios);

  const { contraseña: _omit, ...safe } = user;
  res.json({ actualizado: safe });
});


// ================================
// SOLICITUD MÉTODO DELETE:
// DELETE /api/usuarios/:id (integridad con ventas)
router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const [usuarios, ventas] = await Promise.all([
    readJson('usuarios.json'),
    readJson('ventas.json'),
  ]);
  const tieneVentas = ventas.some(v => v.id_usuario === id); // ventas.json: id_usuario
  if (tieneVentas) {
    return res.status(409).json({
      error: 'No se puede eliminar el usuario porque tiene ventas asociadas. Elimine o reasigne esas ventas primero.',
    });
  }
  const idx = usuarios.findIndex(u => u.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Usuario no encontrado' });
  const [eliminado] = usuarios.splice(idx, 1);
  await writeJson('usuarios.json', usuarios);
  const { contraseña, ...safe } = eliminado;
  res.json({ eliminado: safe });
});

export default router;
