let categories = [];

function updateCategoryList() {
  const tableBody = document.querySelector("#categoriesTable tbody");
  const select = document.getElementById("selectCategory");
  tableBody.innerHTML = "";
  select.innerHTML = "";

  const income = parseFloat(document.getElementById("income").value) || 0;

  categories.forEach((cat, i) => {
    const budget = (income * cat.percent) / 100;
    const row = document.createElement("tr");
    const alerta = cat.spent > budget ? "⚠️" : "";

    row.innerHTML = `
      <td>${cat.name}</td>
      <td>${cat.percent}%</td>
      <td>$${budget.toFixed(2)}</td>
      <td>$${cat.spent.toFixed(2)} ${alerta}</td>
      <td><button onclick="removeCategory(${i})">❌</button></td>
    `;

    tableBody.appendChild(row);

    const option = document.createElement("option");
    option.value = i;
    option.textContent = cat.name;
    select.appendChild(option);
  });
}

function addCategory() {
  const name = document.getElementById("category").value.trim();
  const percent = parseFloat(document.getElementById("percent").value);
  if (!name || isNaN(percent) || percent <= 0) {
    alert("Completa el nombre y porcentaje válido.");
    return;
  }

  categories.push({ name, percent, spent: 0 });
  document.getElementById("category").value = "";
  document.getElementById("percent").value = "";
  updateCategoryList();
}

function removeCategory(index) {
  categories.splice(index, 1);
  updateCategoryList();
}

function addExpense() {
  const idx = parseInt(document.getElementById("selectCategory").value);
  const amount = parseFloat(document.getElementById("expense").value);

  if (isNaN(idx) || isNaN(amount) || amount <= 0) {
    alert("Selecciona una categoría y un monto válido.");
    return;
  }

  categories[idx].spent += amount;
  document.getElementById("expense").value = "";
  updateCategoryList();
}

async function getIASuggestion() {
    const income = parseFloat(document.getElementById("income").value);
    const ia = document.getElementById("ia");
    ia.textContent = "Consultando IA...";
    ia.style.color = "gray";
  
    try {
      const res = await fetch('http://127.0.0.1:3000/ia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ income, categories })
      });
  
      const data = await res.json();
      ia.style.color = "#333";
      ia.textContent = data.suggestion;
    } catch {
      ia.style.color = "red";
      ia.textContent = "Error de conexión con el servidor.";
    }
  }
  
