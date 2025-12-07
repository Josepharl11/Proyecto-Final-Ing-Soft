        async function login(event) {
            event.preventDefault();
            
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value;
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
                
                // Bienveninaa
                alert(`¡Bienvenido a MoniFlow ${data.nombre}!`);
                window.location.href = "dashboard.html";
                
            } catch (error) {
                // Aqui te salta el Error de red 
                errorMsg.textContent = "Error de conexión. Intenta nuevamente";
                errorMsg.style.display = "block";
                console.error("Error:", error);
            }
        }
  