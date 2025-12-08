window.addEventListener('DOMContentLoaded', function() {
    loadSavedCredentials();
});


function loadSavedCredentials() {
    const savedEmail = localStorage.getItem('rememberedEmail');
    const savedPassword = localStorage.getItem('rememberedPassword');
    const rememberChecked = localStorage.getItem('rememberMe') === 'true';
    
    if (savedEmail && savedPassword && rememberChecked) {
        document.getElementById('email').value = savedEmail;
        document.getElementById('password').value = savedPassword;
        document.getElementById('remember').checked = true;
    }
}

async function login(event) {
    event.preventDefault();
    
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const rememberMe = document.getElementById("remember").checked;
    const errorMsg = document.getElementById("errorMessage");
    
    errorMsg.style.display = "none";
    
    try {
        const res = await fetch("http://127.0.0.1:8000/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });
        
        const data = await res.json();
        
        if (!res.ok) {
            errorMsg.textContent = "Correo o contraseña incorrectos";
            errorMsg.style.display = "block";
            return;
        }
        
        if (rememberMe) {
            localStorage.setItem('rememberedEmail', email);
            localStorage.setItem('rememberedPassword', password);
            localStorage.setItem('rememberMe', 'true');
        } else {
            localStorage.removeItem('rememberedEmail');
            localStorage.removeItem('rememberedPassword');
            localStorage.removeItem('rememberMe');
        }
        
        if (data.token) {
            localStorage.setItem('authToken', data.token);
        }
        
        if (data.usuario_id) {
            localStorage.setItem('userId', data.usuario_id);
        }
        if (data.nombre) {
            localStorage.setItem('userName', data.nombre);
        }
        
        alert(`¡Bienvenido a MoniFlow ${data.nombre}!`);
        window.location.href = "dashboard.html";
        
    } catch (error) {
        errorMsg.textContent = "Error de conexión. Intenta nuevamente";
        errorMsg.style.display = "block";
        console.error("Error:", error);
    }
}