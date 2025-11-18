const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Prueba rápida
app.get("/", (req, res) => {
  res.send("Servidor del planificador de gastos activo");
});

// Ruta de la IA
app.post("/ia", (req, res) => {
  const { income, categories } = req.body;

  if (!income || !categories || !Array.isArray(categories)) {
    return res.json({ suggestion: "Faltan datos para generar una sugerencia." });
  }

  const totalSpent = categories.reduce((acc, c) => acc + c.spent, 0);
  const over = categories.filter(c => c.spent > (income * c.percent / 100));
  const under = categories.filter(c => c.spent < (income * c.percent / 200));

  let msg = `Ingreso total: $${income}. Has gastado $${totalSpent.toFixed(2)}.`;

  if (over.length > 0) {
    msg += ` Cuidado: estás excediendo el presupuesto en ${over.map(c => c.name).join(', ')}.`;
  }

  if (under.length > 0) {
    msg += ` Consejo: podrías destinar más fondos a ${under.map(c => c.name).join(', ')}.`;
  }

  if (over.length === 0 && under.length === 0) {
    msg += " ¡Excelente! Tus gastos están bien equilibrados.";
  }

  res.json({ suggestion: msg });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
