// ===================================
// moniFlow Dashboard - JavaScript
// CON SINCRONIZACIÓN Y LÍMITE REAL
// ===================================

const categoryConfig = {
    comida: { icon: "🍔", bg: "#fef3c7", name: "Comida", color: "#f59e0b" },
    transporte: { icon: "🚗", bg: "#dbeafe", name: "Transporte", color: "#3b82f6" },
    entretenimiento: { icon: "🎮", bg: "#fce7f3", name: "Entretenimiento", color: "#ec4899" },
    educación: { icon: "📚", bg: "#e0e7ff", name: "Educación", color: "#6366f1" },
    salud: { icon: "⚕️", bg: "#dcfce7", name: "Salud", color: "#10b981" },
    hogar: { icon: "🏠", bg: "#fed7aa", name: "Hogar", color: "#f97316" }
};

let currentFilter = "month";
let expenses = [];
let monthlyLimit = 15000; // valor por defecto

document.addEventListener("DOMContentLoaded", () => {
    loadUserName();
    loadMonthlyLimit();
    loadExpenses();
    updateDashboard();
    checkLimits();
});

// ================= CARGA DE DATOS =================

function loadUserName() {
    const userName = localStorage.getItem("userName") || "Carlos";
    document.getElementById("userName").textContent = userName;
}

function loadMonthlyLimit() {
    const savedLimit = localStorage.getItem("monthlyLimit");
    if (savedLimit) {
        monthlyLimit = parseFloat(savedLimit) || 15000;
    } else {
        localStorage.setItem("monthlyLimit", monthlyLimit);
    }
}

function loadExpenses() {
    const stored = localStorage.getItem("expenses");
    if (stored) {
        try {
            const parsed = JSON.parse(stored);
            // normalizar y filtrar gastos mal formados
            expenses = Array.isArray(parsed)
                ? parsed.filter(e => typeof e.amount === "number" && e.date)
                : [];
        } catch (e) {
            console.error("Error parseando expenses, se reinicia:", e);
            expenses = [];
            localStorage.removeItem("expenses");
        }
    } else {
        expenses = [];
    }
}

// ================= DASHBOARD =================

function updateDashboard() {
    calculateTotals();
    renderPieChart();
    renderRecentExpenses();
}

function calculateTotals() {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const weekStart = new Date(today.getFullYear(), today.getMonth(), diff);
    const weekStartStr = weekStart.toISOString().split("T")[0];

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthStartStr = monthStart.toISOString().split("T")[0];

    const todayTotal = sumAmounts(expenses.filter(e => e.date === todayStr));
    const weekTotal = sumAmounts(expenses.filter(e => e.date >= weekStartStr));
    const monthTotal = sumAmounts(expenses.filter(e => e.date >= monthStartStr));

    document.getElementById("todayTotal").textContent = formatCurrency(todayTotal);
    document.getElementById("weekTotal").textContent = formatCurrency(weekTotal);
    document.getElementById("monthTotal").textContent = formatCurrency(monthTotal);
}

function sumAmounts(list) {
    return list.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
}

// ================= GRÁFICO CIRCULAR =================

function renderPieChart() {
    const filteredExpenses = getFilteredExpenses();
    const categoryTotals = {};

    filteredExpenses.forEach(expense => {
        if (!expense.category) return;
        if (!categoryTotals[expense.category]) categoryTotals[expense.category] = 0;
        categoryTotals[expense.category] += Number(expense.amount) || 0;
    });

    const totalAmount = Object.values(categoryTotals).reduce((s, v) => s + v, 0);
    const pieChart = document.getElementById("pieChart");
    const chartLegend = document.getElementById("chartLegend");
    document.getElementById("totalAmount").textContent = formatCurrency(totalAmount);

    if (!totalAmount) {
        pieChart.style.background = "#e2e8f0";
        chartLegend.innerHTML =
            '<p style="text-align:center;color:#64748b;padding:20px;">No hay gastos registrados</p>';
        return;
    }

    let gradientParts = [];
    let currentAngle = 0;
    let legendHTML = "";

    const sortedCategories = Object.entries(categoryTotals)
        .sort((a, b) => b[1] - a[1])
        .map(([category, amount]) => ({ category, amount }));

    sortedCategories.forEach(({ category, amount }) => {
        const config = categoryConfig[category] || {
            icon: "🏷️",
            name: category,
            color: "#64748b"
        };
        const percentage = (amount / totalAmount) * 100;
        const angleSize = (percentage / 100) * 360;
        const endAngle = currentAngle + angleSize;

        gradientParts.push(`${config.color} ${currentAngle}deg ${endAngle}deg`);

        legendHTML += `
            <div class="legend-item">
                <div class="legend-color" style="background:${config.color}"></div>
                <div class="legend-info">
                    <div class="legend-name">${config.icon} ${config.name}</div>
                    <div class="legend-percentage">${formatCurrency(
                        amount
                    )} (${percentage.toFixed(1)}%)</div>
                </div>
            </div>
        `;
        currentAngle = endAngle;
    });

    pieChart.style.background = `conic-gradient(${gradientParts.join(", ")})`;
    chartLegend.innerHTML = legendHTML;
}

function renderRecentExpenses() {
    const expensesList = document.getElementById("expensesList");
    expensesList.innerHTML = "";

    if (!expenses.length) {
        expensesList.innerHTML =
            '<p style="text-align:center;padding:40px;color:#64748b;">No hay gastos registrados aún</p>';
        return;
    }

    const sorted = [...expenses].sort(
        (a, b) => new Date(b.date + " " + (b.time || "00:00")) - new Date(a.date + " " + (a.time || "00:00"))
    );

    sorted.slice(0, 6).forEach(expense => {
        const cfg = categoryConfig[expense.category] || {
            icon: "🏷️",
            name: expense.category || "Sin categoría",
            bg: "#e2e8f0"
        };
        const formattedDate = formatDate(expense.date);

        const div = document.createElement("div");
        div.className = "expense-item";
        div.innerHTML = `
            <div class="expense-icon" style="background:${cfg.bg}">
                ${cfg.icon}
            </div>
            <div class="expense-details">
                <div class="expense-description">${expense.description || "Sin descripción"}</div>
                <div class="expense-meta">
                    <span>${cfg.name}</span>
                    <span>•</span>
                    <span>${formattedDate}</span>
                    <span>•</span>
                    <span>${expense.time || ""}</span>
                </div>
            </div>
            <div class="expense-amount">-${formatCurrency(Number(expense.amount) || 0)}</div>
        `;
        expensesList.appendChild(div);
    });
}

function getFilteredExpenses() {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    if (currentFilter === "today") {
        return expenses.filter(e => e.date === todayStr);
    } else if (currentFilter === "week") {
        const dayOfWeek = today.getDay();
        const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        const weekStart = new Date(today.getFullYear(), today.getMonth(), diff);
        const weekStartStr = weekStart.toISOString().split("T")[0];
        return expenses.filter(e => e.date >= weekStartStr);
    } else {
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthStartStr = monthStart.toISOString().split("T")[0];
        return expenses.filter(e => e.date >= monthStartStr);
    }
}

// ================= LÍMITES =================

function checkLimits() {
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthStartStr = monthStart.toISOString().split("T")[0];

    const monthTotal = sumAmounts(expenses.filter(e => e.date >= monthStartStr));
    const percentage = monthlyLimit > 0 ? (monthTotal / monthlyLimit) * 100 : 0;

    if (percentage >= 100) {
        showAlert(
            `🚨 ¡Has superado tu límite mensual! Gastaste ${formatCurrency(
                monthTotal
            )} de ${formatCurrency(monthlyLimit)}`
        );
    } else if (percentage >= 80) {
        showAlert(
            ` Estás cerca de tu límite mensual (${percentage.toFixed(
                0
            )}%). Has gastado ${formatCurrency(monthTotal)} de ${formatCurrency(monthlyLimit)}`
        );
    }
}

function showAlert(message) {
    const alertDiv = document.getElementById("limitAlert");
    const alertMessage = document.getElementById("alertMessage");
    alertMessage.textContent = message;
    alertDiv.style.display = "flex";
}

function closeAlert() {
    document.getElementById("limitAlert").style.display = "none";
}

// ================= FILTROS / NAV =================

function filterByPeriod(period) {
    currentFilter = period;
    document.querySelectorAll(".filter-btn").forEach(btn => {
        btn.classList.remove("active");
        if (btn.getAttribute("data-filter") === period) btn.classList.add("active");
    });
    renderPieChart();
}

function registerExpense() {
    window.location.href = "registro-gastos.html";
}

function goToReports() {
    window.location.href = "reportes.html";
}

function goToLimits() {
    window.location.href = "limites.html";
}

function goToCategories() {
    window.location.href = "categorias.html";
}

function logout() {
    if (confirm("¿Estás seguro que deseas cerrar sesión?")) {
        localStorage.clear();
        alert("✅ Sesión cerrada correctamente");
    }
}

// ================= UTILIDADES =================

function formatCurrency(amount) {
    return "RD$ " + Number(amount || 0).toLocaleString("es-DO", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function formatDate(dateString) {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-DO", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });
}
