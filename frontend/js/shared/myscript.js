/* =====================================================
   FUNCIÓN GENERAL PARA AGREGAR AL CARRITO
====================================================== */
function inicializarBotonesAgregar() {
  const botones = document.querySelectorAll(".btn-carrito");

  botones.forEach(boton => {
    boton.addEventListener("click", () => {
      const usuario = JSON.parse(sessionStorage.getItem("usuario"));
      if (!usuario) {
        alert("Debes iniciar sesión para agregar productos al carrito.");
        window.location.href = "login.html";
        return;
      }

      const tarjeta = boton.closest(".tarjeta");
      const id = boton.dataset.id;
      const nombre = tarjeta.querySelector(".card-title").textContent;
      const precioStr = tarjeta.querySelector(".card-subtitle").textContent.replace(/[^\d]/g, "");
      const precio = Number(precioStr);
      const cantidad = Number(tarjeta.querySelector(".cantidad").value) || 1;
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

/* =====================================================
   PC ARMADAS
====================================================== */
document.addEventListener("DOMContentLoaded", () => {
  const contenedor = document.getElementById("contenedorComputadoras");
  if (!contenedor) return;

  const tituloFiltro = document.getElementById("tituloFiltro");
  const formFiltro = document.getElementById("formFiltroMarca");
  if (!formFiltro) return;

  let computadoras = [];

  fetch("http://localhost:3000/api/productos")
    .then(res => res.json())
    .then(data => {
      computadoras = data.computadoras;
      mostrarComputadoras(computadoras, "todas");
    })
    .catch(error => console.error("Error al cargar JSON:", error));

  formFiltro.addEventListener("change", () => {
    const marcaSeleccionada = document.querySelector('input[name="marca"]:checked')?.value || "todas";
    const lista = marcaSeleccionada === "todas"
      ? computadoras
      : computadoras.filter(pc => pc.marca === marcaSeleccionada);

    mostrarComputadoras(lista, marcaSeleccionada);
  });

  function mostrarComputadoras(lista, filtro) {
    contenedor.innerHTML = "";

    tituloFiltro.style.display = filtro !== "todas" ? "block" : "none";
    tituloFiltro.textContent = filtro !== "todas" ? `Mostrando: ${filtro}` : "";

    lista.forEach(pc => {
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
              <a href="${pc.link || '#'}" class="btn-vermas">Ver más</a>
            </div>
          </div>
        </div>
      `;
    });

    inicializarBotonesAgregar();
  }
});

/* =====================================================
   HARDWARE
====================================================== */
document.addEventListener("DOMContentLoaded", () => {
  const contenedor = document.getElementById("contenedorHardware");
  if (!contenedor) return;

  const tituloFiltro = document.getElementById("tituloFiltro");
  const formFiltro = document.getElementById("formFiltroMarca");
  if (!formFiltro) return;

  let productos = [];

  fetch("http://localhost:3000/api/productos")
    .then(res => res.json())
    .then(data => {
      productos = data.hardware;
      mostrarProductos(productos, "todas");
    })
    .catch(error => console.error("Error al cargar JSON:", error));

  formFiltro.addEventListener("change", () => {
    const categoriaSeleccionada = document.querySelector('input[name="categoria"]:checked')?.value || "todas";
    const lista = categoriaSeleccionada === "todas"
      ? productos
      : productos.filter(p => p.categoria === categoriaSeleccionada);

    mostrarProductos(lista, categoriaSeleccionada);
  });

  function mostrarProductos(lista, filtro) {
    contenedor.innerHTML = "";

    tituloFiltro.style.display = filtro !== "todas" ? "block" : "none";
    tituloFiltro.textContent = filtro !== "todas" ? `Mostrando: ${filtro}` : "";

    lista.forEach(item => {
      contenedor.innerHTML += `
        <div class="tarjeta">
          <div class="imagen-container">
            <img src="http://localhost:3000${item.imagen}" alt="${item.nombre}" class="imagen">
          </div>
          <div class="card-body">
            <h5 class="card-title">${item.nombre}</h5>
            <h6 class="card-subtitle">$${item.precio.toLocaleString()}</h6>
            <p class="card-text">${item.descripcion}</p>
            <div class="producto-footer">
              <input type="number" class="cantidad" value="1" min="1">
              <button class="btn-carrito" data-id="${item.id}">Agregar al carrito</button>
              <a href="${item.link || '#'}" class="btn-vermas">Ver más</a>
            </div>
          </div>
        </div>
      `;
    });

    inicializarBotonesAgregar();
  }
});

/* =====================================================
   PERIFÉRICOS
====================================================== */
document.addEventListener("DOMContentLoaded", () => {
  const contenedor = document.getElementById("contenedorPerifericos");
  if (!contenedor) return;

  const tituloFiltro = document.getElementById("tituloFiltro");
  const formFiltro = document.getElementById("formFiltroMarca");
  if (!formFiltro) return;

  let productos = [];

  fetch("http://localhost:3000/api/productos")
    .then(res => res.json())
    .then(data => {
      productos = data.perifericos;
      mostrarProductos(productos, "todas");
    })
    .catch(error => console.error("Error al cargar JSON:", error));

  formFiltro.addEventListener("change", () => {
    const categoriaSeleccionada = document.querySelector('input[name="categoria"]:checked')?.value || "todas";
    const lista = categoriaSeleccionada === "todas"
      ? productos
      : productos.filter(p => p.categoria === categoriaSeleccionada);

    mostrarProductos(lista, categoriaSeleccionada);
  });

  function mostrarProductos(lista, filtro) {
    contenedor.innerHTML = "";

    tituloFiltro.style.display = filtro !== "todas" ? "block" : "none";
    tituloFiltro.textContent = filtro !== "todas" ? `Mostrando: ${filtro}` : "";

    lista.forEach(item => {
      contenedor.innerHTML += `
        <div class="tarjeta">
          <div class="imagen-container">
            <img src="http://localhost:3000${item.imagen}" alt="${item.nombre}" class="imagen">
          </div>
          <div class="card-body">
            <h5 class="card-title">${item.nombre}</h5>
            <h6 class="card-subtitle">$${item.precio.toLocaleString()}</h6>
            <p class="card-text">${item.descripcion}</p>
            <div class="producto-footer">
              <input type="number" class="cantidad" value="1" min="1">
              <button class="btn-carrito" data-id="${item.id}">Agregar al carrito</button>
              <a href="${item.link || '#'}" class="btn-vermas">Ver más</a>
            </div>
          </div>
        </div>
      `;
    });

    inicializarBotonesAgregar();
  }
});

/* =====================================================
   CONSOLAS
====================================================== */
document.addEventListener("DOMContentLoaded", () => {
  const contenedor = document.getElementById("contenedorConsolas");
  if (!contenedor) return;

  const tituloFiltro = document.getElementById("tituloFiltro");
  const formFiltro = document.getElementById("formFiltroMarca");
  if (!formFiltro) return;

  let consolas = [];

  fetch("http://localhost:3000/api/productos")
    .then(res => res.json())
    .then(data => {
      consolas = data.consolas;
      mostrarConsolas(consolas, "todas");
    })
    .catch(error => console.error("Error al cargar JSON:", error));

  formFiltro.addEventListener("change", () => {
    const marcaSeleccionada = document.querySelector('input[name="marca"]:checked')?.value || "todas";
    const lista = marcaSeleccionada === "todas"
      ? consolas
      : consolas.filter(pc => pc.marca === marcaSeleccionada);

    mostrarConsolas(lista, marcaSeleccionada);
  });

  function mostrarConsolas(lista, filtro) {
    contenedor.innerHTML = "";

    tituloFiltro.style.display = filtro !== "todas" ? "block" : "none";
    tituloFiltro.textContent = filtro !== "todas" ? `Mostrando: ${filtro}` : "";

    lista.forEach(pc => {
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
              <a href="${pc.link || '#'}" class="btn-vermas">Ver más</a>
            </div>
          </div>
        </div>
      `;
    });

    inicializarBotonesAgregar();
  }
});

/* =====================================================
   USUARIO NAV
====================================================== */
document.addEventListener("DOMContentLoaded", () => {
  const navUsuario = document.getElementById("usuario-nav");
  if (!navUsuario) return;

  const usuario = JSON.parse(sessionStorage.getItem("usuario"));

  if (usuario) {
    navUsuario.innerHTML = `
      <a href="carrito.html"><img src="assets/Iconos/icono-carrito.png" alt="Carrito" class="icono">Carrito</a>
      <a href="cuenta.html"><img src="assets/Iconos/icono-micuenta.png" alt="Mi cuenta" class="icono">Mi cuenta</a>
      <a href="#" id="cerrar-sesion"><img src="assets/Iconos/icono-cerrarsesion.png" alt="Cerrar sesión" class="icono">Cerrar sesión</a>
    `;

    document.getElementById("cerrar-sesion").addEventListener("click", e => {
      e.preventDefault();
      sessionStorage.removeItem("usuario");
      location.reload();
    });

  } else {
    navUsuario.innerHTML = `
      <a href="login.html"><img src="assets/Iconos/icono-micuenta.png" alt="Login" class="icono">Iniciar sesión</a>
      <a href="register.html"><img src="assets/Iconos/icono-cerrarsesion.png" alt="Registro" class="icono">Registrar cuenta</a>
    `;
  }
});
