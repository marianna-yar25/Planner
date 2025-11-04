const express = require('express');
const cors = require('cors');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

const users = JSON.parse(fs.readFileSync('./users.json', 'utf-8'));

app.get('/', (req, res) => {
    res.send('Servidor funcionando');
})

// Guardar datos 
app.post('/save', (req, res) => {
    const { income, food, transport, home } = req.body;
    console.log('📦 Datos recibidos:', { income, food, transport, home });

    return res.status(200).json({
        message: "Datos guardados correctamente"
    });
  });

  app.post('/ia', (req, res) => {
    const { income } = req.body;
    const suggestion = `Según tu ingreso de $${income}, te recomendamos destinar 50% a necesidades básicas, 30% a ahorro y 20% a ocio.`;
    res.json({ suggestion });
  });


// Login simple
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (user) res.json({ success: true });
  else res.json({ success: false, message: 'Usuario o contraseña incorrecto' });
});

// Sugerencia "IA" básica
app.post('/ia', (req, res) => {
    const { income, categories } = req.body;
  
    if (!income || !categories || !Array.isArray(categories)) {
      return res.json({ suggestion: "Faltan datos para generar una sugerencia." });
    }
  
    const totalSpent = categories.reduce((acc, c) => acc + c.spent, 0);
    const over = categories.filter(c => c.spent > (income * c.percent / 100));
    const under = categories.filter(c => c.spent < (income * c.percent / 200)); // menos del 50%
  
    let msg = `Ingreso total: $${income}. Has gastado $${totalSpent.toFixed(2)}.`;
  
    if (over.length > 0) {
      msg += ` ⚠️ Cuidado: estás excediendo el presupuesto en ${over.map(c => c.name).join(', ')}.`;
    }
  
    if (under.length > 0) {
      msg += ` 💡 Consejo: podrías destinar más fondos a ${under.map(c => c.name).join(', ')}.`;
    }
  
    if (over.length === 0 && under.length === 0) {
      msg += " ¡Excelente! Tus gastos están bien equilibrados. 🎯";
    }
  
    res.json({ suggestion: msg });
  });
  

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en puerto ${PORT}`);
});