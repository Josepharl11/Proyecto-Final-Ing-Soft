document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("registerForm");
    const btn = document.getElementById("btnRegistrar");
    const msg = document.getElementById("mensaje");

    // Validación visual avanzada
    function showError(fieldId, message) {
        const field = document.getElementById(fieldId);
        const formGroup = field.closest('.form-group');

        let errorElement = formGroup.querySelector('.error-message');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            formGroup.appendChild(errorElement);
        }

        field.style.borderColor = '#ef4444';
        field.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
        
        errorElement.textContent = message;
        errorElement.style.color = '#ef4444';
        errorElement.style.marginTop = '6px';
    }

    function clearErrors() {
        document.querySelectorAll('.error-message').forEach(e => e.remove());
        document.querySelectorAll('input').forEach(i => {
            i.style.borderColor = '#e2e8f0';
            i.style.boxShadow = 'none';
        });
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function validateForm(nombre, correo, password, confirmPassword, terms) {
        clearErrors();
        let valid = true;

        if (!nombre) {
            showError('nombre', 'Por favor ingresa tu nombre completo');
            valid = false;
        }

        if (!correo) {
            showError('correo', 'Por favor ingresa tu correo');
            valid = false;
        } else if (!isValidEmail(correo)) {
            showError('correo', 'El correo no es válido');
            valid = false;
        }

        if (!password) {
            showError('password', 'Por favor ingresa una contraseña');
            valid = false;
        } else if (password.length < 6) {
            showError('password', 'Debe tener mínimo 6 caracteres');
            valid = false;
        }

        if (!confirmPassword) {
            showError('confirmPassword', 'Confirma tu contraseña');
            valid = false;
        } else if (password !== confirmPassword) {
            showError('confirmPassword', 'Las contraseñas no coinciden');
            valid = false;
        }

        if (!terms) {
            alert('Debes aceptar los términos y condiciones');
            valid = false;
        }

        return valid;
    }

    btn.addEventListener("click", async (e) => {
        e.preventDefault();
        const nombre = document.getElementById("nombre").value.trim();
        const correo = document.getElementById("correo").value.trim();
        const password = document.getElementById("password").value;
        const confirm = document.getElementById("confirmPassword").value;
        const terms = document.getElementById("terms").checked;

        msg.textContent = "";
        msg.className = "mensaje";

        if (!validateForm(nombre, correo, password, confirm, terms)) {
            return;
        }

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

        const originalButtonText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        btn.disabled = true;

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
                btn.disabled = false;
                btn.innerHTML = originalButtonText;
                return;
            }

            btn.innerHTML = '<i class="fas fa-check"></i> ¡Cuenta creada!';
            btn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';

            msg.textContent = "Cuenta creada correctamente. Redirigiendo...";
            msg.classList.add("success");

            setTimeout(() => {
                window.location.href = "login.html";
            }, 1500);

        } catch (error) {
            msg.textContent = "No se pudo conectar al servidor.";
            msg.classList.add("error");

            btn.disabled = false;
            btn.innerHTML = originalButtonText;
        }
    });
});