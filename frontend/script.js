// ====================================
// PLANIFICADOR DE GASTOS COMPLETO
// ====================================

// BACKEND EN RENDER
const backendURL = "https://planner-1-ndao.onrender.com";

// --- CARGA AUTOMÁTICA DE DATOS ---
window.addEventListener("load", () => {
  const data = loadFromLocalStorage();
  if (data) {
    document.getElementById("income").value = data.income;
    data.categories.forEach(cat => {
      addCategoryToTable(cat.name, cat.percent, cat.spent);
    });
  }
});

// --- FUNCIONES DE LOCALSTORAGE ---
function saveToLocalStorage(data) {
  localStorage.setItem('plannerData', JSON.stringify(data));
  console.log('Guardado localmente');
}

function loadFromLocalStorage() {
  const stored = localStorage.getItem('plannerData');
  if (stored) {
    console.log('Datos cargados desde localStorage');
    return JSON.parse(stored);
  }
  return null;
}

// --- AÑADIR NUEVA CATEGORÍA ---
function addCategory() {
  const name = document.getElementById("category").value;
  const percent = parseFloat(document.getElementById("percent").value);
  const income = parseFloat(document.getElementById("income").value);

  if (!name || isNaN(percent) || isNaN(income)) {
    alert("Por favor, completa todos los campos antes de agregar.");
    return;
  }

  addCategoryToTable(name, percent, 0);

  document.getElementById("category").value = "";
  document.getElementById("percent").value = "";

  updateLocalStorage();
}

// --- FUNCIÓN AUXILIAR PARA INSERTAR EN TABLA ---
function addCategoryToTable(name, percent, spent = 0) {
  const income = parseFloat(document.getElementById("income").value);
  const budget = (income * percent) / 100;

  const tbody = document.querySelector("#categoriesTable tbody");
  const row = document.createElement("tr");

  row.innerHTML = `
    <td>${name}</td>
    <td>${percent}%</td>
    <td>$${budget.toFixed(2)}</td>
    <td class="spent">$${spent.toFixed(2)}</td>
    <td><button onclick="deleteCategory(this)">❌</button></td>
  `;

  tbody.appendChild(row);

  // Agregar opción al select
  const select = document.getElementById("selectCategory");
  const option = document.createElement("option");
  option.value = name;
  option.textContent = name;
  select.appendChild(option);
}

// --- ELIMINAR CATEGORÍA ---
function deleteCategory(btn) {
  const row = btn.parentElement.parentElement;
  const name = row.children[0].textContent;
  row.remove();

  // Eliminar del select
  const select = document.getElementById("selectCategory");
  Array.from(select.options).forEach(opt => {
    if (opt.value === name) opt.remove();
  });

  updateLocalStorage();
}

// --- REGISTRAR GASTO ---
function addExpense() {
  const category = document.getElementById("selectCategory").value;
  const expense = parseFloat(document.getElementById("expense").value);

  if (!category || isNaN(expense) || expense <= 0) {
    alert("Por favor selecciona una categoría y un monto válido.");
    return;
  }

  const rows = document.querySelectorAll("#categoriesTable tbody tr");
  rows.forEach(row => {
    if (row.children[0].textContent === category) {
      const spentCell = row.querySelector(".spent");
      const spent = parseFloat(spentCell.textContent.replace("$", ""));
      spentCell.textContent = `$${(spent + expense).toFixed(2)}`;
    }
  });

  document.getElementById("expense").value = "";
  updateLocalStorage();
}

// --- ACTUALIZAR LOCALSTORAGE ---
function updateLocalStorage() {
  const income = parseFloat(document.getElementById("income").value) || 0;
  const rows = document.querySelectorAll("#categoriesTable tbody tr");

  const categories = Array.from(rows).map(row => ({
    name: row.children[0].textContent,
    percent: parseFloat(row.children[1].textContent.replace("%", "")),
    spent: parseFloat(row.children[3].textContent.replace("$", ""))
  }));

  const data = { income, categories };
  saveToLocalStorage(data);
}

// --- IA FUNCIONAL ---
async function getIASuggestion() {
  const income = parseFloat(document.getElementById("income").value);
  const rows = document.querySelectorAll("#categoriesTable tbody tr");

  if (!income || rows.length === 0) {
    alert("Agrega tu ingreso y al menos una categoría antes de usar la IA.");
    return;
  }

  const categories = Array.from(rows).map(row => ({
    name: row.children[0].textContent,
    percent: parseFloat(row.children[1].textContent.replace("%", "")),
    spent: parseFloat(row.children[3].textContent.replace("$", ""))
  }));

  try {
    const res = await fetch(`${backendURL}/ia`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ income, categories })
    });

    if (!res.ok) throw new Error("Error al obtener sugerencia");

    const result = await res.json();
    document.getElementById("ia").textContent = result.suggestion;
  } catch (err) {
    console.error(err);
    document.getElementById("ia").textContent = "Error al conectar con la IA.";
  }
}
