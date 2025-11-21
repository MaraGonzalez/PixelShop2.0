document.addEventListener("DOMContentLoaded", () => {
  const carritoBody = document.getElementById("carrito-body");
  const tablaCarrito = document.getElementById("tabla-carrito");
  const carritoVacio = document.getElementById("carrito-vacio");
  const totalDiv = document.getElementById("total");
  const btnVaciar = document.getElementById("btn-vaciar");
  const btnFinalizar = document.getElementById("btn-finalizar");
  const envioContenedor = document.getElementById("envio-contenedor");

  let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

  document.querySelectorAll("input[name='envio']").forEach(radio => {
  radio.addEventListener("change", () => {
    actualizarTotal();

    const metodoEnvio = radio.value;
    const dirContenedor = document.getElementById("direccion-contenedor");

    // Si el envío requiere dirección → mostrar el input
    if (metodoEnvio === "retiro") {
      dirContenedor.style.display = "none";
    } else {
      dirContenedor.style.display = "block";
    }
  });
});

  function calcularEnvio() {
    const metodo = document.querySelector("input[name='envio']:checked")?.value;
    switch (metodo) {
      case "correo": return 79000;
      case "oca": return 75000;
      case "andreani": return 85000;
      default: return 0;
    }
  }

  function calcularTotalConEnvio() {
    const totalProductos = carrito.reduce(
      (acc, p) => acc + p.precio * p.cantidad,
      0
    );
    return totalProductos + calcularEnvio();
  }

  function actualizarTotal() {
    const total = calcularTotalConEnvio();
    totalDiv.textContent = `Total con envío: $${total.toLocaleString()}`;
  }

  function mostrarCarrito() {
    carritoBody.innerHTML = "";

    if (carrito.length === 0) {
      tablaCarrito.style.display = "none";
      carritoVacio.style.display = "block";
      envioContenedor.style.display = "none";
      totalDiv.textContent = "";
      return;
    }

    tablaCarrito.style.display = "table";
    carritoVacio.style.display = "none";
    envioContenedor.style.display = "block";

    carrito.forEach((producto, index) => {
      const subtotal = producto.precio * producto.cantidad;
      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td><img src="${producto.imagen}" alt="${producto.nombre}" style="width: 50px;"> ${producto.nombre}</td>
        <td>$${producto.precio.toLocaleString()}</td>
        <td><input type="number" min="1" value="${producto.cantidad}" data-index="${index}" class="input-cantidad"></td>
        <td>$${subtotal.toLocaleString()}</td>
        <td><button class="btn btn-danger btn-sm btn-eliminar" data-index="${index}">Eliminar</button></td>
      `;
      carritoBody.appendChild(fila);
    });

    actualizarTotal();
    agregarEventos();
  }

  function agregarEventos() {
    document.querySelectorAll(".input-cantidad").forEach(input => {
      input.addEventListener("change", e => {
        const index = e.target.dataset.index;
        let nuevaCantidad = parseInt(e.target.value);
        if (isNaN(nuevaCantidad) || nuevaCantidad < 1) nuevaCantidad = 1;
        carrito[index].cantidad = nuevaCantidad;
        localStorage.setItem("carrito", JSON.stringify(carrito));
        mostrarCarrito();
      });
    });

    document.querySelectorAll(".btn-eliminar").forEach(btn => {
      btn.addEventListener("click", e => {
        carrito.splice(e.target.dataset.index, 1);
        localStorage.setItem("carrito", JSON.stringify(carrito));
        mostrarCarrito();
      });
    });

    document.querySelectorAll("input[name='envio']").forEach(radio => {
      radio.addEventListener("change", actualizarTotal);
    });
  }

  btnVaciar.addEventListener("click", () => {
    carrito = [];
    localStorage.removeItem("carrito");
    mostrarCarrito();
  });

  btnFinalizar.addEventListener("click", () => {
    const usuario = JSON.parse(sessionStorage.getItem("usuario"));
    
    if (!usuario) {
      alert("Debes iniciar sesión para finalizar la compra.");
      window.location.href = "login.html";
      return;
    }
    
    if (carrito.length === 0) {
      alert("Carrito vacío");
      return;
    }

    // Mostrar el modal de pago
    document.getElementById("modalPago").style.display = "flex";
  });

  // Eventos de botones del modal
  document.querySelector(".btn-transferencia")?.addEventListener("click", () => {
    pagoExitoso("Transferencia");
  });

  document.querySelector(".btn-debito")?.addEventListener("click", () => {
    pagoExitoso("Tarjeta de débito");
  });

  document.querySelector(".btn-credito")?.addEventListener("click", () => {
    pagoExitoso("Tarjeta de crédito");
  });

  document.querySelector(".btn-cancelar")?.addEventListener("click", () => {
    cerrarModal();
  });

  mostrarCarrito();
});

// Función para simular el pago
async function pagoExitoso(metodo) {
  try {
    const usuario = JSON.parse(sessionStorage.getItem("usuario"));
    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    if (!usuario) {
      alert("Debes iniciar sesión para comprar.");
      window.location.href = "login.html";
      return;
    }

    if (carrito.length === 0) {
      alert("Tu carrito está vacío.");
      return;
    }

    // 👉 Obtener método de envío seleccionado
    const metodoEnvio = document.querySelector("input[name='envio']:checked")?.value;

    const direccionInput = document.getElementById("direccion-input");
    const direccionError = document.getElementById("direccion-error");

    if (direccionError) direccionError.style.display = "none";

    let direccion = "Sin dirección registrada";

    // Validar dirección obligatoria
    if (metodoEnvio === "correo" || metodoEnvio === "oca" || metodoEnvio === "andreani") {
      const valorDireccion = direccionInput ? direccionInput.value.trim() : "";

      if (!valorDireccion) {
        if (direccionError) direccionError.style.display = "block";
        alert("Por favor ingrese una dirección para el envío.");
        if (direccionInput) direccionInput.focus();
        return;
      }

      direccion = valorDireccion;
    } else if (metodoEnvio === "retiro") {
      direccion = "Retiro por sucursal";
    }

    // 🧾 Construir orden de compra (sin id_usuario porque va en JWT)
    const venta = {
      direccion,
      metodo_pago: metodo,
      productos: carrito
    };

    const token = sessionStorage.getItem("token");

    const respuesta = await fetch("http://localhost:3000/api/ventas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify(venta)
    });

    const data = await respuesta.json();

    if (!respuesta.ok) {
      alert("Error al generar la venta: " + (data.error || "Desconocido"));
      return;
    }

    console.log("Venta generada:", data);

    // LIMPIAR CARRITO
    localStorage.removeItem("carrito");

    // REDIRIGIR AL CHECKOUT
    window.location.href = "checkout.html";

  } catch (error) {
    console.error("Error al generar la venta:", error);
    alert("Hubo un error procesando tu compra.");
  }
}

// Cerrar el modal
function cerrarModal() {
  const modal = document.getElementById("modalPago");
  modal.style.display = "none";
}