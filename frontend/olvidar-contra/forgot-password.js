console.log("JS cargado correctamente");

async function sendLink(event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const errorMsg = document.getElementById("errorMessage");
    const successMsg = document.getElementById("successMessage");

    errorMsg.style.display = "none";
    successMsg.style.display = "none";

    try {
        const res = await fetch("http://127.0.0.1:8000/auth/forgot-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        });

        const data = await res.json();

        if (!res.ok) {
            errorMsg.textContent = data.detail || "No se pudo enviar el enlace. Verifica tu correo.";
            errorMsg.style.display = "block";
            return;
        }

        successMsg.textContent = "¡Enlace enviado! Revisa tu correo electrónico.";
        successMsg.style.display = "block";

        document.getElementById("email").value = "";

    } catch (error) {
        errorMsg.textContent = "Error de conexión. Intenta nuevamente.";
        errorMsg.style.display = "block";
        console.error(error);
    }
}