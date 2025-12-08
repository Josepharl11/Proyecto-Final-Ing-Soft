// ===================================
// Categorías - JavaScript
// ===================================

// Categorías por defecto del sistema (no se pueden eliminar)
const defaultCategories = {
    comida: { icon: "🍔", name: "Comida", color: "#f59e0b", isDefault: true },
    transporte: { icon: "🚗", name: "Transporte", color: "#3b82f6", isDefault: true },
    entretenimiento: { icon: "🎮", name: "Entretenimiento", color: "#ec4899", isDefault: true },
    educación: { icon: "📚", name: "Educación", color: "#6366f1", isDefault: true },
    salud: { icon: "⚕️", name: "Salud", color: "#10b981", isDefault: true },
    hogar: { icon: "🏠", name: "Hogar", color: "#f97316", isDefault: true }
};

let customCategories = {};
let editingCategoryId = null;

document.addEventListener('DOMContentLoaded', function() {
    loadUserName();
    loadCustomCategories();
    renderCategories();
    setupFormListener();
});

function loadUserName() {
    const userName = localStorage.getItem('userName') || 'Carlos';
    document.getElementById('userName').textContent = userName;
}

function loadCustomCategories() {
    const stored = localStorage.getItem('customCategories');
    if (stored) {
        customCategories = JSON.parse(stored);
        console.log('✅ Categorías personalizadas cargadas:', Object.keys(customCategories).length);
    }
}

function renderCategories() {
    const grid = document.getElementById('categoriesGrid');
    grid.innerHTML = '';

    // Renderizar categorías por defecto
    Object.entries(defaultCategories).forEach(([id, category]) => {
        const card = createCategoryCard(id, category);
        grid.appendChild(card);
    });

    // Renderizar categorías personalizadas
    Object.entries(customCategories).forEach(([id, category]) => {
        const card = createCategoryCard(id, category);
        grid.appendChild(card);
    });
}

function createCategoryCard(id, category) {
    const card = document.createElement('div');
    card.className = 'category-card';
    card.style.borderColor = category.color;

    card.innerHTML = `
        <div class="category-card-header">
            <div class="category-icon-large" style="background: ${category.color}20; color: ${category.color};">
                ${category.icon}
            </div>
            <h3 class="category-name">${category.name}</h3>
            ${category.isDefault ? '<span class="badge-default">Por defecto</span>' : ''}
        </div>

        <div class="category-card-info">
            <div class="info-item">
                <span class="info-label">Color:</span>
                <div class="color-badge" style="background: ${category.color}"></div>
            </div>
            <div class="info-item">
                <span class="info-label">ID:</span>
                <span class="info-value">${id}</span>
            </div>
        </div>

        ${!category.isDefault ? `
            <div class="category-card-actions">
                <button class="btn-edit-cat" onclick="editCategory('${id}')">✏️ Editar</button>
                <button class="btn-delete-cat" onclick="deleteCategory('${id}')">🗑️ Eliminar</button>
            </div>
        ` : '<p class="category-card-note">Las categorías por defecto no se pueden eliminar</p>'}
    `;

    return card;
}

// ===================================
// MODAL
// ===================================

function showAddCategoryModal() {
    editingCategoryId = null;
    document.getElementById('modalTitle').textContent = 'Nueva Categoría';
    document.getElementById('categoryForm').reset();
    document.getElementById('categoryId').value = '';
    document.getElementById('categoryColor').value = '#8b5cf6';
    document.getElementById('categoryModal').style.display = 'flex';
}

function closeCategoryModal() {
    document.getElementById('categoryModal').style.display = 'none';
    editingCategoryId = null;
}

function selectIcon(icon) {
    document.getElementById('categoryIcon').value = icon;
}

function selectColor(color) {
    document.getElementById('categoryColor').value = color;
}

// ===================================
// AGREGAR/EDITAR CATEGORÍA
// ===================================

function setupFormListener() {
    document.getElementById('categoryForm').addEventListener('submit', function(e) {
        e.preventDefault();

        const name = document.getElementById('categoryName').value.trim();
        const icon = document.getElementById('categoryIcon').value.trim();
        const color = document.getElementById('categoryColor').value;

        if (!name || !icon || !color) {
            alert('❌ Por favor completa todos los campos');
            return;
        }

        // Generar ID único para la categoría
        const categoryId = editingCategoryId || generateCategoryId(name);

        // Verificar que no exista ya (solo al crear nueva)
        if (!editingCategoryId && (defaultCategories[categoryId] || customCategories[categoryId])) {
            alert('❌ Ya existe una categoría con ese nombre');
            return;
        }

        // Crear/actualizar categoría
        customCategories[categoryId] = {
            icon: icon,
            name: name,
            color: color,
            isDefault: false
        };

        // Guardar en localStorage
        localStorage.setItem('customCategories', JSON.stringify(customCategories));

        // Actualizar vista
        renderCategories();
        closeCategoryModal();

        const action = editingCategoryId ? 'actualizada' : 'creada';
        alert(`✅ Categoría ${action} correctamente\n\n${icon} ${name}`);
        console.log('✅ Categoría guardada:', categoryId, customCategories[categoryId]);
    });
}

function generateCategoryId(name) {
    // Generar ID a partir del nombre (sin espacios, minúsculas, sin acentos)
    return name.toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/\s+/g, '-');
}

// ===================================
// EDITAR CATEGORÍA
// ===================================

function editCategory(categoryId) {
    const category = customCategories[categoryId];

    if (!category) {
        alert('❌ Categoría no encontrada');
        return;
    }

    editingCategoryId = categoryId;
    document.getElementById('modalTitle').textContent = 'Editar Categoría';
    document.getElementById('categoryName').value = category.name;
    document.getElementById('categoryIcon').value = category.icon;
    document.getElementById('categoryColor').value = category.color;
    document.getElementById('categoryId').value = categoryId;
    document.getElementById('categoryModal').style.display = 'flex';
}

// ===================================
// ELIMINAR CATEGORÍA
// ===================================

function deleteCategory(categoryId) {
    const category = customCategories[categoryId];

    if (!category) {
        alert('❌ Categoría no encontrada');
        return;
    }

    // Verificar si hay gastos con esta categoría
    const expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    const hasExpenses = expenses.some(e => e.category === categoryId);

    if (hasExpenses) {
        const confirmMsg = 
            `⚠️ Esta categoría tiene gastos registrados.\n\n` +
            `Si la eliminas, esos gastos quedarán sin categoría.\n\n` +
            `¿Estás seguro de continuar?`;

        if (!confirm(confirmMsg)) {
            return;
        }
    } else {
        if (!confirm(`¿Eliminar la categoría "${category.icon} ${category.name}"?`)) {
            return;
        }
    }

    // Eliminar categoría
    delete customCategories[categoryId];

    // Guardar en localStorage
    localStorage.setItem('customCategories', JSON.stringify(customCategories));

    // Actualizar vista
    renderCategories();

    alert(`✅ Categoría eliminada correctamente`);
    console.log('🗑️ Categoría eliminada:', categoryId);
}

function goToDashboard() {
    window.location.href = 'index.html';
}