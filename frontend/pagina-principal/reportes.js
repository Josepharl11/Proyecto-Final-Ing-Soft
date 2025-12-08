// ===================================
// Reportes - JavaScript
// ===================================

const categoryConfig = {
    comida: { icon: "🍔", name: "Comida", color: "#f59e0b" },
    transporte: { icon: "🚗", name: "Transporte", color: "#3b82f6" },
    entretenimiento: { icon: "🎮", name: "Entretenimiento", color: "#ec4899" },
    educación: { icon: "📚", name: "Educación", color: "#6366f1" },
    salud: { icon: "⚕️", name: "Salud", color: "#10b981" },
    hogar: { icon: "🏠", name: "Hogar", color: "#f97316" }
};

let allExpenses = [];

document.addEventListener("DOMContentLoaded", () => {
    loadUserName();
    loadExpenses();
    setupEventListeners();
    updateReport();
});

function loadUserName() {
    const userName = localStorage.getItem("userName") || "Carlos";
    document.getElementById("userName").textContent = userName;
}

function loadExpenses() {
    const stored = localStorage.getItem("expenses");
    if (stored) {
        try {
            const parsed = JSON.parse(stored);
            allExpenses = Array.isArray(parsed)
                ? parsed.filter(e => typeof e.amount === "number" && e.date)
                : [];
        } catch (e) {
            console.error("Error parseando expenses en reportes:", e);
            allExpenses = [];
        }
    } else {
        allExpenses = [];
    }
}

function setupEventListeners() {
    document.getElementById("reportPeriod").addEventListener("change", function () {
        const customRange = document.getElementById("customDateRange");
        if (this.value === "custom") {
            customRange.style.display = "flex";
        } else {
            customRange.style.display = "none";
            updateReport();
        }
    });
}

function updateReport() {
    const period = document.getElementById("reportPeriod").value;
    const category = document.getElementById("reportCategory").value;

    const filtered = filterExpenses(period, category);
    updateSummary(filtered);
    updateTable(filtered);
}

function filterExpenses(period, category) {
    let filtered = [...allExpenses];

    if (category !== "all") {
        filtered = filtered.filter(e => e.category === category);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (period === "today") {
        const todayStr = today.toISOString().split("T")[0];
        filtered = filtered.filter(e => e.date === todayStr);
    } else if (period === "week") {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        filtered = filtered.filter(e => new Date(e.date) >= weekAgo);
    } else if (period === "month") {
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        filtered = filtered.filter(e => new Date(e.date) >= monthAgo);
    }
    return filtered;
}

function updateSummary(expenses) {
    const total = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    document.getElementById("reportTotal").textContent = formatCurrency(total);

    const days = getDaysCount(document.getElementById("reportPeriod").value);
    const average = days > 0 ? total / days : 0;
    document.getElementById("reportAverage").textContent = formatCurrency(average);

    const categoryTotals = {};
    expenses.forEach(e => {
        if (!e.category) return;
        categoryTotals[e.category] = (categoryTotals[e.category] || 0) + (Number(e.amount) || 0);
    });

    const topCat = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
    if (topCat) {
        const config = categoryConfig[topCat[0]] || { icon: "🏷️", name: topCat[0] };
        document.getElementById("topCategory").textContent = `${config.icon} ${config.name}`;
    } else {
        document.getElementById("topCategory").textContent = "-";
    }
}

function getDaysCount(period) {
    if (period === "today") return 1;
    if (period === "week") return 7;
    if (period === "month") return 30;
    return 1;
}

function updateTable(expenses) {
    const tbody = document.getElementById("expensesTableBody");
    tbody.innerHTML = "";

    document.getElementById("recordsCount").textContent =
        `${expenses.length} registro${expenses.length !== 1 ? "s" : ""}`;

    if (!expenses.length) {
        tbody.innerHTML =
            '<tr><td colspan="5" style="text-align:center;padding:40px;color:#64748b;">No hay gastos para mostrar</td></tr>';
        return;
    }

    expenses.sort((a, b) => new Date(b.date) - new Date(a.date));

    expenses.forEach(expense => {
        const config = categoryConfig[expense.category] || {
            icon: "🏷️",
            name: expense.category || "Sin categoría",
            color: "#64748b"
        };

        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${formatDate(expense.date)}</td>
            <td>${expense.description || "Sin descripción"}</td>
            <td><span class="category-badge" style="background:${config.color}20;color:${config.color};">
                ${config.icon} ${config.name}
            </span></td>
            <td class="amount-cell">${formatCurrency(Number(expense.amount) || 0)}</td>
            <td class="actions-cell">
                <button class="btn-edit" onclick="editExpense(${expense.id})" title="Editar">✏️</button>
                <button class="btn-delete" onclick="deleteExpense(${expense.id})" title="Eliminar">🗑️</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// ============= EDITAR / ELIMINAR =================

function editExpense(expenseId) {
    const expense = allExpenses.find(e => e.id === expenseId);
    if (!expense) {
        alert("❌ Gasto no encontrado");
        return;
    }

    const config = categoryConfig[expense.category] || { icon: "🏷️", name: expense.category || "" };
    const newAmountStr = prompt(
        `Editar Gasto\n\n` +
        `Descripción: ${expense.description || ""}\n` +
        `Categoría: ${config.icon} ${config.name}\n` +
        `Monto actual: ${formatCurrency(expense.amount)}\n\n` +
        `Ingresa el nuevo monto:`,
        expense.amount
    );

    if (newAmountStr === null) return;
    const newAmount = parseFloat(newAmountStr);
    if (isNaN(newAmount) || newAmount <= 0) {
        alert("❌ Monto inválido");
        return;
    }

    if (!confirm(`¿Confirmas cambiar el monto a ${formatCurrency(newAmount)}?`)) return;

    expense.amount = newAmount;
    localStorage.setItem("expenses", JSON.stringify(allExpenses));
    loadExpenses();
    updateReport();
    alert("✅ Gasto actualizado correctamente");
}

function deleteExpense(expenseId) {
    const expense = allExpenses.find(e => e.id === expenseId);
    if (!expense) {
        alert("❌ Gasto no encontrado");
        return;
    }

    const config = categoryConfig[expense.category] || { icon: "🏷️", name: expense.category || "" };

    const confirmMsg =
        `¿Estás seguro de eliminar este gasto?\n\n` +
        `Descripción: ${expense.description || ""}\n` +
        `Categoría: ${config.icon} ${config.name}\n` +
        `Monto: ${formatCurrency(expense.amount)}\n` +
        `Fecha: ${formatDate(expense.date)}\n\n` +
        `⚠️ Esta acción no se puede deshacer.`;

    if (!confirm(confirmMsg)) return;

    allExpenses = allExpenses.filter(e => e.id !== expenseId);
    localStorage.setItem("expenses", JSON.stringify(allExpenses));
    loadExpenses();
    updateReport();
    alert("✅ Gasto eliminado correctamente");
}

// ============= UTILIDADES / NAVEGACIÓN =============

function exportReport() {
    alert("📥 Aquí iría la exportación a PDF (pendiente de implementar).");
}

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

function goToDashboard() {
    window.location.href = "index.html";
}

document.addEventListener('DOMContentLoaded', () => {
  const btnExportar = document.getElementById('btn-exportar-pdf');
  const contenidoReporte = document.getElementById('reporte-pdf');

  if (!btnExportar || !contenidoReporte) {
    console.warn('No se encontró el botón o el contenedor de reporte para PDF');
    return;
  }

  btnExportar.addEventListener('click', () => {
    try {
      const opciones = {
        margin: 10,
        filename: `Reporte-gastos-${new Date().toISOString().slice(0, 10)}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      html2pdf()
        .from(contenidoReporte)
        .set(opciones)
        .save();
    } catch (error) {
      console.error('Error generando el PDF:', error);
      alert('Ocurrió un error al generar el PDF. Revisa la consola para más detalles.');
    }
  });
});


