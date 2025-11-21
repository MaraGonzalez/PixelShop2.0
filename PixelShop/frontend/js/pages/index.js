////////////////////////////////////INDEX////////////////////////////////////
document.addEventListener("DOMContentLoaded", () => {
  fetch("http://localhost:3000/api/productos")
    .then(res => res.json())
    .then(data => {
      mostrarTarjetas(data.computadoras, "contenedorComputadoras");
      mostrarTarjetas(data.hardware, "contenedorHardware");
      mostrarTarjetas(data.perifericos, "contenedorPerifericos");
      mostrarTarjetas(data.consolas, "contenedorConsolas");
    })
    .catch(error => console.error("Error al cargar productos:", error));
});

function mostrarTarjetas(lista, contenedorId) {
  const contenedor = document.getElementById(contenedorId);
  if (!contenedor) return;

  const seleccion = lista.sort(() => Math.random() - 0.5).slice(0, 3);

  seleccion.forEach(producto => {
    contenedor.innerHTML += `
      <div class="tarjeta">
        <div class="imagen-container">
          <img src="http://localhost:3000${producto.imagen}" alt="${producto.nombre}" class="imagen">
        <div class="card-body">
            <h5 class="card-title">${producto.nombre}</h5>
            <h6 class="card-subtitle">$${producto.precio.toLocaleString()}</h6>
            <p class="card-text">${producto.descripcion}</p>
            <div class="producto-footer">
                <input type="number" class="cantidad" value="1" min="1">
                <button class="btn-carrito" data-id="${producto.id}">Agregar al carrito</button>
                <a href="${producto.link || '#'}" class="btn-vermas">Ver más</a>
            </div>
        </div>
      </div>
    `;
  });
  inicializarBotonesAgregar();
}


////////////////////////////////////CARRUSEL////////////////////////////////////
document.addEventListener("DOMContentLoaded", () => {
  const slides = document.querySelectorAll(".slides .box");
  const dotsContainer = document.getElementById("dots");
  const next = document.getElementById("next");
  const prev = document.getElementById("prev");
  let current = 0;

  // Crear puntos dinámicamente
  slides.forEach((_, index) => {
    const dot = document.createElement("span");
    dot.classList.add("dot");
    if (index === 0) dot.classList.add("active");
    dot.addEventListener("click", () => showSlide(index));
    dotsContainer.appendChild(dot);
  });

  const dots = document.querySelectorAll(".dot");

  function showSlide(index) {
    slides.forEach(slide => slide.style.display = "none");
    dots.forEach(dot => dot.classList.remove("active"));

    slides[index].style.display = "block";
    dots[index].classList.add("active");
    current = index;
  }

  function nextSlide() {
    current = (current + 1) % slides.length;
    showSlide(current);
  }

  function prevSlide() {
    current = (current - 1 + slides.length) % slides.length;
    showSlide(current);
  }

  next.addEventListener("click", nextSlide);
  prev.addEventListener("click", prevSlide);

  showSlide(current); // Mostrar el primero

  setInterval(nextSlide, 7000); // Cambiar automáticamente cada 7s
});



////////////////////////////////////FUNCIONES AGREGAR AL CARRITO////////////////////////////////////

function inicializarBotonesAgregar() {
  const botones = document.querySelectorAll(".btn-carrito");

  botones.forEach(boton => {
    boton.removeEventListener("click", handleAgregarCarrito);
    boton.addEventListener("click", handleAgregarCarrito);
  });
}

function handleAgregarCarrito(event) {
    const usuario = JSON.parse(sessionStorage.getItem("usuario"));
    if (!usuario) {
        alert("Debes iniciar sesión para agregar productos al carrito.");
        window.location.href = "login.html"; // Redirige a login
        return;
    }

    const boton = event.currentTarget;
    const tarjeta = boton.closest(".tarjeta");
    const id = boton.dataset.id;
    const nombre = tarjeta.querySelector(".card-title").textContent;
    const precioStr = tarjeta.querySelector(".card-subtitle").textContent.replace(/[^\d]/g, "");
    const precio = Number(precioStr);
    const cantidadInput = tarjeta.querySelector(".cantidad");
    const cantidad = Number(cantidadInput.value) || 1;
    const imagen = tarjeta.querySelector("img.imagen").src;

    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    const productoExistente = carrito.find(item => item.id == id);

    if (productoExistente) {
        productoExistente.cantidad += cantidad;
    } else {
        carrito.push({ id, nombre, precio, cantidad, imagen });
    }

    localStorage.setItem("carrito", JSON.stringify(carrito));
    alert(`Se agregó ${cantidad} "${nombre}" al carrito.`);
}

////////////////////////////////////Inicio y cerrar sesión////////////////////////////////////
document.addEventListener("DOMContentLoaded", () => {
  const navUsuario = document.getElementById("usuario-nav");

  function mostrarMenu(usuario) {
    if (usuario) {
      navUsuario.innerHTML = `
        <a href="carrito.html"><img src="assets/Iconos/icono-carrito.png" alt="Carrito" class="icono">Carrito</a>
        <a href="cuenta.html"><img src="assets/Iconos/icono-micuenta.png" alt="Mi cuenta" class="icono">Mi cuenta</a>
        <a href="#" id="cerrar-sesion"><img src="assets/Iconos/icono-cerrarsesion.png" alt="Cerrar sesión" class="icono">Cerrar sesión</a>
      `;

      // Evento para cerrar sesión
      document.getElementById("cerrar-sesion").addEventListener("click", (e) => {
        e.preventDefault();
        sessionStorage.removeItem("usuario"); // quitar usuario de sessionStorage
        mostrarMenu(null); // actualizar menú sin recargar
      });

    } else {
      navUsuario.innerHTML = `
        <a href="login.html"><img src="assets/Iconos/icono-micuenta.png" alt="Login" class="icono">Iniciar sesión</a>
        <a href="register.html"><img src="assets/Iconos/icono-cerrarsesion.png" alt="Registro" class="icono">Crear cuenta</a>
      `;
    }
  }

  // Obtener usuario desde sessionStorage y mostrar menú
  const usuario = JSON.parse(sessionStorage.getItem("usuario"));
  mostrarMenu(usuario);
});



