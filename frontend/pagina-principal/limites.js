// ===================================
// Límites de Gastos - JavaScript
// CON SINCRONIZACIÓN localStorage
// ===================================

const categoryConfig = {
    comida: { icon: "🍔", name: "Comida", color: "#f59e0b" },
    transporte: { icon: "🚗", name: "Transporte", color: "#3b82f6" },
    entretenimiento: { icon: "🎮", name: "Entretenimiento", color: "#ec4899" },
    educación: { icon: "📚", name: "Educación", color: "#6366f1" },
    salud: { icon: "⚕️", name: "Salud", color: "#10b981" },
    hogar: { icon: "🏠", name: "Hogar", color: "#f97316" }
};

// Límites por categoría (se cargan desde localStorage o valores por defecto)
let categoryLimits = {};

// Gastos actuales del mes (se calculan desde localStorage)
let monthlyExpenses = {};
let allExpenses = [];

document.addEventListener('DOMContentLoaded', function() {
    loadUserName();
    loadExpenses();
    loadLimits();
    calculateMonthlyExpenses();
    updateMonthlyLimit();
    renderCategoryLimits();
    loadAlertSettings();
});

function loadUserName() {
    const userName = localStorage.getItem('userName') || 'Carlos';
    document.getElementById('userName').textContent = userName;
}

function loadExpenses() {
    // Cargar todos los gastos desde localStorage
    const stored = localStorage.getItem('expenses');

    if (stored) {
        allExpenses = JSON.parse(stored);
        console.log('✅ Gastos cargados para límites:', allExpenses.length);
    } else {
        allExpenses = [];
        console.log('⚠️ No hay gastos registrados');
    }
}

function calculateMonthlyExpenses() {
    // Resetear gastos mensuales
    monthlyExpenses = {
        comida: 0,
        transporte: 0,
        entretenimiento: 0,
        educación: 0,
        salud: 0,
        hogar: 0
    };

    // Calcular inicio del mes actual
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthStartStr = monthStart.toISOString().split('T')[0];

    // Filtrar gastos del mes actual
    const currentMonthExpenses = allExpenses.filter(e => e.date >= monthStartStr);

    // Sumar gastos por categoría
    currentMonthExpenses.forEach(expense => {
        if (monthlyExpenses.hasOwnProperty(expense.category)) {
            monthlyExpenses[expense.category] += expense.amount;
        }
    });

    console.log('💰 Gastos del mes por categoría:', monthlyExpenses);
}

function loadLimits() {
    // Cargar límites desde localStorage o usar valores por defecto
    const savedLimits = localStorage.getItem('categoryLimits');

    if (savedLimits) {
        categoryLimits = JSON.parse(savedLimits);
    } else {
        // Límites por defecto
        categoryLimits = {
            comida: 5000,
            transporte: 2000,
            entretenimiento: 1500,
            educación: 3000,
            salud: 4000,
            hogar: 3500
        };
        localStorage.setItem('categoryLimits', JSON.stringify(categoryLimits));
    }

    console.log('🎯 Límites cargados:', categoryLimits);
}

function loadAlertSettings() {
    const savedSettings = localStorage.getItem('alertSettings');

    if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        document.getElementById('alert80').checked = settings.alert80 !== false;
        document.getElementById('alert100').checked = settings.alert100 !== false;
        document.getElementById('emailAlerts').checked = settings.emailAlerts || false;
    }
}

function updateMonthlyLimit() {
    // Cargar límite mensual
    const savedMonthlyLimit = localStorage.getItem('monthlyLimit');
    const limit = savedMonthlyLimit ? parseFloat(savedMonthlyLimit) : 15000;
    document.getElementById('monthlyLimit').value = limit;

    // Calcular total gastado este mes
    const spent = Object.values(monthlyExpenses).reduce((sum, val) => sum + val, 0);
    const available = limit - spent;
    const percentage = limit > 0 ? (spent / limit) * 100 : 0;

    // Actualizar UI
    document.getElementById('monthlySpent').textContent = formatCurrency(spent);
    document.getElementById('monthlyAvailable').textContent = formatCurrency(available);
    document.getElementById('monthlyPercentage').textContent = percentage.toFixed(1) + '%';

    // Actualizar barra de progreso
    const progressBar = document.getElementById('monthlyProgress');
    progressBar.style.width = Math.min(percentage, 100) + '%';

    // Cambiar color según porcentaje
    if (percentage >= 100) {
        progressBar.style.background = 'linear-gradient(90deg, #ef4444, #dc2626)';
    } else if (percentage >= 80) {
        progressBar.style.background = 'linear-gradient(90deg, #f59e0b, #f97316)';
    } else {
        progressBar.style.background = 'linear-gradient(90deg, #22C55E, #2563EB)';
    }

    console.log('📊 Límite mensual actualizado:');
    console.log('  - Límite:', formatCurrency(limit));
    console.log('  - Gastado:', formatCurrency(spent));
    console.log('  - Disponible:', formatCurrency(available));
    console.log('  - Porcentaje:', percentage.toFixed(1) + '%');
}

function saveMonthlyLimit() {
    const limit = document.getElementById('monthlyLimit').value;
    localStorage.setItem('monthlyLimit', limit);
    updateMonthlyLimit();
    alert('✅ Límite mensual guardado correctamente');
}

function renderCategoryLimits() {
    const container = document.getElementById('categoriesLimits');
    container.innerHTML = '';

    Object.keys(categoryConfig).forEach(category => {
        const config = categoryConfig[category];
        const limit = categoryLimits[category];
        const spent = monthlyExpenses[category];
        const percentage = limit > 0 ? (spent / limit) * 100 : 0;
        const available = limit - spent;

        const categoryCard = document.createElement('div');
        categoryCard.className = 'category-limit-card';
        categoryCard.innerHTML = `
            <div class="category-limit-header">
                <div class="category-limit-icon" style="background: ${config.color}20;">
                    ${config.icon}
                </div>
                <div class="category-limit-info">
                    <h4>${config.name}</h4>
                    <p class="limit-subtitle">Límite mensual</p>
                </div>
                <div class="category-limit-input">
                    <input type="number" 
                           id="limit-${category}" 
                           value="${limit}" 
                           min="0" 
                           step="100" 
                           class="form-input-small"
                           onchange="updateCategoryLimit('${category}')">
                </div>
            </div>

            <div class="category-limit-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${Math.min(percentage, 100)}%; background: ${getProgressColor(percentage)}"></div>
                </div>

                <div class="limit-stats">
                    <span class="stat-item">
                        <span class="stat-label">Gastado:</span>
                        <span class="stat-value">${formatCurrency(spent)}</span>
                    </span>
                    <span class="stat-item">
                        <span class="stat-label">Disponible:</span>
                        <span class="stat-value ${available < 0 ? 'text-danger' : ''}">${formatCurrency(available)}</span>
                    </span>
                    <span class="stat-item">
                        <span class="stat-label">Progreso:</span>
                        <span class="stat-value ${percentage >= 100 ? 'text-danger' : percentage >= 80 ? 'text-warning' : ''}">${percentage.toFixed(1)}%</span>
                    </span>
                </div>
            </div>
        `;

        container.appendChild(categoryCard);
    });
}

function getProgressColor(percentage) {
    if (percentage >= 100) {
        return 'linear-gradient(90deg, #ef4444, #dc2626)';
    } else if (percentage >= 80) {
        return 'linear-gradient(90deg, #f59e0b, #f97316)';
    } else {
        return 'linear-gradient(90deg, #22C55E, #2563EB)';
    }
}

function updateCategoryLimit(category) {
    const newLimit = parseFloat(document.getElementById(`limit-${category}`).value);
    categoryLimits[category] = newLimit;

    // Guardar en localStorage
    localStorage.setItem('categoryLimits', JSON.stringify(categoryLimits));

    // Re-renderizar
    renderCategoryLimits();

    console.log(`✅ Límite de ${category} actualizado a ${formatCurrency(newLimit)}`);
}

function saveAlertSettings() {
    const alert80 = document.getElementById('alert80').checked;
    const alert100 = document.getElementById('alert100').checked;
    const emailAlerts = document.getElementById('emailAlerts').checked;

    const settings = {
        alert80,
        alert100,
        emailAlerts
    };

    localStorage.setItem('alertSettings', JSON.stringify(settings));

    alert('✅ Configuración de alertas guardada correctamente');
    console.log('📧 Configuración de alertas:', settings);
}

function formatCurrency(amount) {
    return 'RD$ ' + amount.toLocaleString('es-DO', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function goToDashboard() {
    window.location.href = 'index.html';
}