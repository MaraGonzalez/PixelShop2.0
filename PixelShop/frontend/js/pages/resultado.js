document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const busqueda = params.get("q")?.toLowerCase() || "";
  const contenedor = document.getElementById("contenedorResultados");
  if (!contenedor) return; 
  
  if (!busqueda) {
    contenedor.innerHTML = "<p>No ingresaste ningún término de búsqueda.</p>";
    return;
  }

  fetch("http://localhost:3000/api/productos")
    .then((res) => res.json())
    .then((productos) => {
      const resultados = [];

      for (const categoria in productos) {
        resultados.push(
          ...productos[categoria].filter((producto) =>
            producto.nombre.toLowerCase().includes(busqueda) ||
            producto.descripcion.toLowerCase().includes(busqueda)
          )
        );
      }

      mostrarResultados(resultados);
    })
    .catch((error) => {
      console.error("Error al cargar los productos:", error);
      contenedor.innerHTML = "<p>Ocurrió un error al cargar los productos.</p>";
    });


    function mostrarResultados(productos) {
  contenedor.innerHTML = "";

  if (productos.length === 0) {
    contenedor.innerHTML = "<p>No se encontraron productos.</p>";
    return;
  }

  productos.forEach(pc => {
    contenedor.innerHTML += `
      <div class="tarjeta">
        <div class="imagen-container">
          <img src="http://localhost:3000${pc.imagen}" alt="${pc.nombre}" class="imagen">
        </div>
        <div class="card-body">
          <h5 class="card-title">${pc.nombre}</h5>
          <h6 class="card-subtitle">$${pc.precio.toLocaleString()}</h6>
          <p class="card-text">${pc.descripcion}</p>
          <div class="producto-footer">
            <input type="number" class="cantidad" value="1" min="1">
            <button class="btn-carrito" data-id="${pc.id}">Agregar al carrito</button>
            <a href="${pc.link || `producto.html?id=${pc.id}`}" class="btn-vermas">Ver más</a>
          </div>
        </div>
      </div>
    `;
  }); 
  inicializarBotonesAgregar();
}

function inicializarBotonesAgregar() {
  const botones = document.querySelectorAll(".btn-carrito");

  botones.forEach(boton => {
    boton.addEventListener("click", (e) => {
      const usuario = JSON.parse(sessionStorage.getItem("usuario"));
      
      // Si no está logueado, cancelar acción y redirigir
      if (!usuario) {
        e.preventDefault(); // Evita que ocurra cualquier acción predeterminada
        alert("Debes iniciar sesión para agregar productos al carrito.");
        window.location.href = `login.html?redirect=${encodeURIComponent(window.location.href)}`;
        return;
      }

      // Continuar agregando al carrito
      const tarjeta = boton.closest(".tarjeta");
      const id = boton.dataset.id;
      const nombre = tarjeta.querySelector(".card-title").textContent;
      const precioStr = tarjeta.querySelector(".card-subtitle").textContent.replace(/[^0-9.,]/g, "").replace(",", ".");
      const precio = parseFloat(precioStr);
      const cantidadInput = tarjeta.querySelector(".cantidad");
      const cantidad = Number(cantidadInput.value) || 1;
      const imagen = tarjeta.querySelector("img.imagen").src;
      const link = tarjeta.querySelector("a.btn-vermas")?.href || "#"; 

      let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

      const productoExistente = carrito.find(item => item.id == id);

      if (productoExistente) {
        productoExistente.cantidad += cantidad;
      } else {
        carrito.push({ id, nombre, precio, cantidad, imagen, link });
      }

      localStorage.setItem("carrito", JSON.stringify(carrito));

      alert(`Se agregó ${cantidad} "${nombre}" al carrito.`);
      });
    });
  }

const navUsuario = document.getElementById("usuario-nav");
    // Verifica si hay una sesión activa
const usuario = JSON.parse(sessionStorage.getItem("usuario"));

if (usuario) {
// Si está logueado, mostrar opciones completas
  navUsuario.innerHTML = `
    <a href="carrito.html"><img src="assets/Iconos/icono-carrito.png" alt="Carrito" class="icono">Carrito</a>
    <a href="cuenta.html"><img src="assets/Iconos/icono-micuenta.png" alt="Mi cuenta" class="icono">Mi cuenta</a>
    <a href="#" id="cerrar-sesion"><img src="assets/Iconos/icono-cerrarsesion.png" alt="Cerrar sesión" class="icono">Cerrar sesión</a>
  `;

  // Cerrar sesión
  document.getElementById("cerrar-sesion").addEventListener("click", (e) => {
    e.preventDefault();
    sessionStorage.removeItem("usuario");
    location.reload();
    });
  } else {
  // Si no está logueado, mostrar login y registro
    navUsuario.innerHTML = `
      <a href="login.html"><img src="assets/Iconos/icono-micuenta.png" alt="Login" class="icono">Iniciar sesión</a>
      <a href="register.html"><img src="assets/Iconos/icono-cerrarsesion.png" alt="Registro" class="icono">Registrar cuenta</a>
    `;
  }
});