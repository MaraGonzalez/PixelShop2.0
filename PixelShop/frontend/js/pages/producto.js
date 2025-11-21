document.addEventListener("DOMContentLoaded", () => {
  // Manejo del menú de usuario
  const navUsuario = document.getElementById("usuario-nav");
  if (!navUsuario) {
    console.error("No se encontró el nav con id 'usuario-nav'");
    return;
  }

  const usuario = JSON.parse(sessionStorage.getItem("usuario"));

  if (usuario) {
    navUsuario.innerHTML = `
      <a href="../../carrito.html"><img src="../../assets/Iconos/icono-carrito.png" alt="Carrito" class="icono">Carrito</a>
      <a href="../../cuenta.html"><img src="../../assets/Iconos/icono-micuenta.png" alt="Mi cuenta" class="icono">Mi cuenta</a>
      <a href="#" id="cerrar-sesion"><img src="../../assets/Iconos/icono-cerrarsesion.png" alt="Cerrar sesión" class="icono">Cerrar sesión</a>
    `;

    document.getElementById("cerrar-sesion").addEventListener("click", (e) => {
      e.preventDefault();
      sessionStorage.removeItem("usuario");
      location.reload();
    });

  } else {
    navUsuario.innerHTML = `
      <a href="../login.html"><img src="../../assets/Iconos/icono-micuenta.png" alt="Login" class="icono">Iniciar sesión</a>
      <a href="../register.html"><img src="../../assets/Iconos/icono-cerrarsesion.png" alt="Registro" class="icono">Registrar cuenta</a>
    `;
  }

  // Botón agregar al carrito con control de sesión
  const botonAgregar = document.querySelector(".producto-footer-unid button");

  if (botonAgregar) {
    botonAgregar.addEventListener("click", () => {
      const usuario = JSON.parse(sessionStorage.getItem("usuario"));
      if (!usuario) {
        alert("Debes iniciar sesión para agregar productos al carrito.");
        window.location.href = `../login.html?redirect=${encodeURIComponent(window.location.href)}`;
        return;
      }

      const nombre = document.querySelector(".detalle-producto h1").textContent;
      const precioStr = document.querySelector(".precio").textContent.replace(/[^0-9.,]/g, "").replace(",", ".");
      const precio = parseFloat(precioStr);
      const cantidad = Number(document.querySelector(".producto-footer-unid input").value) || 1;
      const imagen = document.querySelector(".imagen-producto img").src;
      const link = window.location.pathname;
      const id = nombre.toLowerCase().replace(/\s+/g, "-");

      let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

      const productoExistente = carrito.find(item => item.id === id);
      if (productoExistente) {
        productoExistente.cantidad += cantidad;
      } else {
        carrito.push({ id, nombre, precio, cantidad, imagen, link });
      }

      localStorage.setItem("carrito", JSON.stringify(carrito));
      alert(`Se agregó ${cantidad} "${nombre}" al carrito.`);
    });
  }
});








