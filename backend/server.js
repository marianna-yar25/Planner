const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// Archivo donde se guardan los usuarios
const usersFilePath = path.join(__dirname, "users.json");

// ------------------------------
//   FUNCIONES AUXILIARES
// ------------------------------

// Leer usuarios
function loadUsers() {
  if (!fs.existsSync(usersFilePath)) {
    fs.writeFileSync(usersFilePath, JSON.stringify([]));
  }
  const data = fs.readFileSync(usersFilePath, "utf8");
  return JSON.parse(data);
}

// Guardar usuarios
function saveUsers(users) {
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
}

// RUTA DE REGISTRO
app.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Faltan datos" });
  }

  const users = loadUsers();

  const exists = users.find(u => u.username === username);
  if (exists) {
    return res.status(400).json({ message: "El usuario ya existe" });
  }

  users.push({ username, password });
  saveUsers(users);

  res.json({ message: "Usuario registrado correctamente" });
});


// RUTA DE LOGIN
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const users = loadUsers();

  const user = users.find(u => u.username === username && u.password === password);

  if (!user) {
    return res.status(401).json({ message: "Credenciales incorrectas" });
  }

  res.json({ message: "Entrando..." });
});

// Ruta de IA
app.post("/ia", (req, res) => {
  const { income, categories } = req.body;

  if (!income || !categories) {
    return res.json({ suggestion: "Faltan datos para generar recomendaciones." });
  }

  const totalSpent = categories.reduce((acc, c) => acc + c.spent, 0);
  const remaining = income - totalSpent;

  let msg = `Ingreso total: $${income}\n`;
  msg += `Gastos actuales: $${totalSpent.toFixed(2)}\n`;
  msg += `Disponible: $${remaining.toFixed(2)}\n\n`;

  // Detectar categorías peligrosas
  const dangerous = categories.filter(c => c.spent > (income * c.percent / 100));
  if (dangerous.length > 0) {
    msg += "*Categorías en riesgo por exceso de gasto:*\n";
    dangerous.forEach(c => {
      const max = (income * c.percent) / 100;
      msg += `- ${c.name}: gastaste $${c.spent.toFixed(2)} (límite $${max.toFixed(2)})\n`;
    });
    msg += "\nRevisa estos gastos para evitar problemas a fin de mes.\n\n";
  }

  // Categorías con poco gasto
  const under = categories.filter(c => c.spent < (income * c.percent / 200));
  if (under.length > 0) {
    msg += "*Categorías con gasto muy bajo (posible oportunidad):*\n";
    under.forEach(c => msg += `- ${c.name}\n`);
    msg += "\nPuedes reasignar parte de su presupuesto a otras áreas.\n\n";
  }

  // Predicción mensual
  const avgDaily = totalSpent / 15; // suponiendo mitad de mes
  const projected = avgDaily * 30;

  msg += ` *Proyección mensual:* $${projected.toFixed(2)}\n`;

  if (projected > income) {
    msg += "🔴 *Al ritmo actual te quedarás sin dinero antes de fin de mes.*\n";
    msg += "Sugerencia: reduce gastos en las categorías en rojo.\n\n";
  } else {
    msg += "🟢 *Vas bien! Mantén tu patrón actual de gasto.*\n\n";
  }

  // Sugiere rebalanceo
  msg += "*Rebalanceo sugerido del presupuesto*\n";
  categories.forEach(c => {
    const optimal = (c.spent / totalSpent) * 100;
    msg += `- ${c.name}: sugiere ${optimal.toFixed(1)}% del ingreso\n`;
  });

  res.json({ suggestion: msg });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor activo en puerto ${PORT}`));