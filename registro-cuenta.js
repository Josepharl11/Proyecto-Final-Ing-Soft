const btn = document.getElementById("btnRegistrar");
const msg = document.getElementById("mensaje");

btn.addEventListener("click", async () => {
    const nombre = document.getElementById("nombre").value.trim();
    const correo = document.getElementById("correo").value.trim();
    const password = document.getElementById("password").value;
    const confirm = document.getElementById("confirmPassword").value;

    msg.textContent = "";
    msg.className = "mensaje";

    if (!nombre || !correo || !password || !confirm) {
        msg.textContent = "Todos los campos son obligatorios.";
        msg.classList.add("error");
        return;
    }

    if (password !== confirm) {
        msg.textContent = "Las contraseñas no coinciden.";
        msg.classList.add("error");
        return;
    }

    try {
        const response = await fetch("http://localhost:8000/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre, email: correo, password })
        });

        const data = await response.json();

        if (!response.ok) {
            msg.textContent = data.detail || "Error al registrar.";
            msg.classList.add("error");
            return;
        }

        msg.textContent = "Cuenta creada correctamente. Redirigiendo...";
        msg.classList.add("success");

        setTimeout(() => {
            window.location.href = "login.html";
        }, 1500);

    } catch (error) {
        msg.textContent = "No se pudo conectar al servidor.";
        msg.classList.add("error");
    }
});