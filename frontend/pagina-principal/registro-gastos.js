// Categorías por defecto (IDs usados en dashboard, reportes y límites)
const defaultCategories = {
    comida: { icon: "🍔", name: "Comida" },
    transporte: { icon: "🚗", name: "Transporte" },
    entretenimiento: { icon: "🎮", name: "Entretenimiento" },
    educación: { icon: "📚", name: "Educación" },
    salud: { icon: "⚕️", name: "Salud" },
    hogar: { icon: "🏠", name: "Hogar" }
};

// Relación categoría -> imagen lateral
const categoryImages = {
    comida: "img/comida-g.png",
    transporte: "img/transporte-g.png",
    entretenimiento: "img/entetenimiento-g.png",
    educación: "img/edu-g.png",
    salud: "img/salud-g.png",
    hogar: "img/home-g.png"
};

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    loadUserName();
    setDefaultDate();
    setupFormListeners();
    loadCategories(); // llena el select con categorías
    // listener para cambiar la imagen al cambiar la categoría
    document.getElementById('category').addEventListener('change', handleCategoryImageChange);
});

// Carga el nombre del usuario desde localStorage
function loadUserName() {
    const userName = localStorage.getItem('userName') || 'Carlos';
    document.getElementById('userName').textContent = userName;
}

// Pone la fecha de hoy por defecto y bloquea fechas futuras
function setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').value = today;
    document.getElementById('date').max = today;
}

// Carga categorías por defecto + personalizadas en el <select>
function loadCategories() {
    const select = document.getElementById('category');

    // limpiar el select y dejar solo el placeholder
    select.innerHTML = '<option value="">Selecciona una categoría</option>';

    // 1) agregar categorías por defecto
    Object.entries(defaultCategories).forEach(([id, cat]) => {
        const option = document.createElement('option');
        option.value = id; // id ej: "comida"
        option.textContent = `${cat.icon} ${cat.name}`;
        select.appendChild(option);
    });

    // 2) agregar categorías personalizadas desde localStorage
    const storedCustom = localStorage.getItem('customCategories');
    if (storedCustom) {
        const customCategories = JSON.parse(storedCustom);
        Object.entries(customCategories).forEach(([id, cat]) => {
            const option = document.createElement('option');
            option.value = id; // id generado en categorias.js
            option.textContent = `${cat.icon} ${cat.name}`;
            select.appendChild(option);
        });
    }
}

// Configura listeners de formulario (preview, validaciones, submit)
function setupFormListeners() {
    const form = document.getElementById('expenseForm');
    const inputs = form.querySelectorAll('input, select');

    // Actualizar vista previa en tiempo real
    inputs.forEach(input => {
        input.addEventListener('input', updatePreview);
    });

    // Validar fecha cuando cambia
    document.getElementById('date').addEventListener('change', validateDate);

    // Guardar al enviar
    form.addEventListener('submit', handleSubmit);
}

// Actualiza la tarjeta de vista previa
function updatePreview() {
    const amount = document.getElementById('amount').value;
    const categoryId = document.getElementById('category').value;
    const date = document.getElementById('date').value;
    const currency = document.getElementById('currency').value;

    // Mostrar preview solo si hay algo escrito
    if (amount || categoryId || date) {
        document.getElementById('expensePreview').style.display = 'block';

        // Monto
        if (amount) {
            const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : 'RD$';
            document.getElementById('previewAmount').textContent =
                `${symbol} ${parseFloat(amount).toFixed(2)}`;
        }

        // Categoría (texto del option seleccionado)
        if (categoryId) {
            const select = document.getElementById('category');
            const text = select.options[select.selectedIndex].textContent;
            document.getElementById('previewCategory').textContent = text;
        }

        // Fecha formateada
        if (date) {
            const formattedDate = new Date(date).toLocaleDateString('es-DO', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            document.getElementById('previewDate').textContent = formattedDate;
        }
    }
}

// Evita que se registre un gasto con fecha futura
function validateDate() {
    const selectedDate = new Date(document.getElementById('date').value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate > today) {
        showError('No puedes registrar gastos con fecha futura');
        document.getElementById('date').value = today.toISOString().split('T')[0];
        return false;
    }

    hideError();
    return true;
}

// Maneja el submit del formulario
function handleSubmit(e) {
    e.preventDefault();

    // valida fecha
    if (!validateDate()) return;

    // recoge datos del formulario
    const formData = {
        amount: parseFloat(document.getElementById('amount').value),
        date: document.getElementById('date').value,
        description: document.getElementById('description').value,
        category: document.getElementById('category').value,
        currency: document.getElementById('currency').value,
        time: new Date().toLocaleTimeString('es-DO', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        })
    };

    // validaciones básicas
    if (!formData.amount || !formData.date || !formData.description || !formData.category) {
        showError('Por favor completa todos los campos obligatorios');
        return;
    }

    if (formData.amount <= 0) {
        showError('El monto debe ser mayor a cero');
        return;
    }

    // guarda el gasto
    saveExpense(formData);
}

// Guarda el gasto nuevo en localStorage
function saveExpense(expenseData) {
    let expenses = JSON.parse(localStorage.getItem('expenses')) || [];

    const newExpense = {
        id: Date.now(),                 // id único
        amount: expenseData.amount,
        description: expenseData.description,
        category: expenseData.category, // usa el ID de categoría
        date: expenseData.date,
        time: expenseData.time,
        currency: expenseData.currency
    };

    // inserta al inicio (para ver recientes primero)
    expenses.unshift(newExpense);
    localStorage.setItem('expenses', JSON.stringify(expenses));

    showSuccess(expenseData.amount, expenseData.currency);
}

// Muestra alert de éxito y redirige al dashboard
function showSuccess(amount, currency) {
    const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : 'RD$';

    alert(`✅ ¡Gasto registrado exitosamente!\n\nMonto: ${symbol} ${parseFloat(amount).toFixed(2)}\n\nRedirigiendo al dashboard...`);

    setTimeout(() => {
        window.location.href = 'index.html';
    }, 500);
}

// Muestra mensaje de error en el recuadro rojo
function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';

    // Oculta automáticamente después de 5 segundos
    setTimeout(() => {
        hideError();
    }, 5000);
}

// Oculta el mensaje de error
function hideError() {
    document.getElementById('errorMessage').style.display = 'none';
}

// Cambia la imagen lateral según la categoría seleccionada, con animación de fade
function handleCategoryImageChange() {
    const select = document.getElementById('category');
    const categoryId = select.value; // ej: "comida"
    const img = document.getElementById('categoryImage');

    // efecto de desvanecido
    img.style.opacity = 0;

    setTimeout(() => {
        if (categoryImages[categoryId]) {
            img.src = categoryImages[categoryId];
        } else {
            img.src = 'img/registro-g.png'; // imagen por defecto
        }
        img.style.opacity = 1;
    }, 300);
}

// Navegación al dashboard
function goToDashboard() {
    if (confirm('¿Estás seguro? Los cambios no guardados se perderán.')) {
        window.location.href = 'index.html';
    }
}