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

// ========== NUEVO: Tasas de cambio a Peso Dominicano ==========
const EXCHANGE_RATES = {
    USD: 58.50,  // 1 USD = 58.50 DOP
    EUR: 63.20,  // 1 EUR = 63.20 DOP
    DOP: 1       // 1 DOP = 1 DOP
};
// ==============================================================

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    loadUserName();
    setDefaultDate();
    setupFormListeners();
    loadCategories();
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
  
    select.innerHTML = '<option value="">Selecciona una categoría</option>';

    // agregar categorías por defecto
    Object.entries(defaultCategories).forEach(([id, cat]) => {
        const option = document.createElement('option');
        option.value = id;
        option.textContent = `${cat.icon} ${cat.name}`;
        select.appendChild(option);
    });

    // agregar categorías personalizadas desde localStorage
    const storedCustom = localStorage.getItem('customCategories');
    if (storedCustom) {
        const customCategories = JSON.parse(storedCustom);
        Object.entries(customCategories).forEach(([id, cat]) => {
            const option = document.createElement('option');
            option.value = id;
            option.textContent = `${cat.icon} ${cat.name}`;
            select.appendChild(option);
        });
    }
}

// ========== NUEVA FUNCIÓN: Convertir a DOP ==========
function convertToDOP(amount, currency) {
    return amount * EXCHANGE_RATES[currency];
}

function formatCurrency(amount, currency) {
    const symbols = {
        USD: '$',
        EUR: '€',
        DOP: 'RD$'
    };
    return `${symbols[currency]} ${parseFloat(amount).toFixed(2)}`;
}
// ====================================================

// Configura listeners de formulario (preview, validaciones, submit)
function setupFormListeners() {
    const form = document.getElementById('expenseForm');
    const inputs = form.querySelectorAll('input, select');


    inputs.forEach(input => {
        input.addEventListener('input', updatePreview);
    });


    document.getElementById('date').addEventListener('change', validateDate);
    
    form.addEventListener('submit', handleSubmit);
}

// ========== MODIFICADO: Actualiza la tarjeta de vista previa con conversión ==========
function updatePreview() {
    const amount = document.getElementById('amount').value;
    const categoryId = document.getElementById('category').value;
    const date = document.getElementById('date').value;
    const currency = document.getElementById('currency').value;


    if (amount || categoryId || date) {
        document.getElementById('expensePreview').style.display = 'block';

        // Monto con conversión
        if (amount) {
            const amountNum = parseFloat(amount);
            const originalAmount = formatCurrency(amountNum, currency);
            
            // Si NO es DOP, mostrar conversión
            if (currency !== 'DOP') {
                const dopAmount = convertToDOP(amountNum, currency);
                document.getElementById('previewAmount').innerHTML = `
                    ${originalAmount}
                    <br>
                    <span style="font-size: 14px; color: #64748b; font-weight: 500;">
                        ≈ RD$ ${dopAmount.toFixed(2)}
                    </span>
                `;
            } else {
                document.getElementById('previewAmount').textContent = originalAmount;
            }
        }

        // Categoría
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
// ===================================================================================

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


    if (!validateDate()) return;


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


    if (!formData.amount || !formData.date || !formData.description || !formData.category) {
        showError('Por favor completa todos los campos obligatorios');
        return;
    }

    if (formData.amount <= 0) {
        showError('El monto debe ser mayor a cero');
        return;
    }


    saveExpense(formData);
}

// ========== MODIFICADO: Guarda el gasto con conversión a DOP ==========
function saveExpense(expenseData) {
    let expenses = JSON.parse(localStorage.getItem('expenses')) || [];

    const amountInDOP = convertToDOP(expenseData.amount, expenseData.currency);

    const newExpense = {
        id: Date.now(),
        amount: expenseData.amount,           // Monto original
        amountDOP: amountInDOP,               // NUEVO: Monto convertido a DOP
        description: expenseData.description,
        category: expenseData.category,
        date: expenseData.date,
        time: expenseData.time,
        currency: expenseData.currency
    };


    expenses.unshift(newExpense);
    localStorage.setItem('expenses', JSON.stringify(expenses));

    showSuccess(expenseData.amount, expenseData.currency, amountInDOP);
}
// ======================================================================

// ========== MODIFICADO: Muestra alert de éxito con conversión ==========
function showSuccess(amount, currency, amountDOP) {
    const originalAmount = formatCurrency(amount, currency);
    
    let message = `✅ ¡Gasto registrado exitosamente!\n\nMonto: ${originalAmount}`;
    
    if (currency !== 'DOP') {
        message += `\nEquivalente: RD$ ${amountDOP.toFixed(2)}`;
    }
    
    message += '\n\nRedirigiendo al dashboard...';
    
    alert(message);

    setTimeout(() => {
        window.location.href = 'index.html';
    }, 500);
}
// =======================================================================

// Muestra mensaje de error en el recuadro rojo
function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';


    setTimeout(() => {
        hideError();
    }, 5000);
}

// Oculta el mensaje de error
function hideError() {
    document.getElementById('errorMessage').style.display = 'none';
}

// Cambia la imagen lateral según la categoría seleccionada
function handleCategoryImageChange() {
    const select = document.getElementById('category');
    const categoryId = select.value;
    const img = document.getElementById('categoryImage');


    img.style.opacity = 0;

    setTimeout(() => {
        if (categoryImages[categoryId]) {
            img.src = categoryImages[categoryId];
        } else {
            img.src = 'img/registro-g.png';
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