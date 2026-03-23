/**
 * Food Equivalents Table
 * Source: IMSS Delegación Sur DF — Plan de Alimentación en el Paciente con Obesidad
 * Doctor: Marco Polo Rodríguez Torres
 * All weights in grams, volumes in ml.
 * "portion" = 1 equivalent (intercambio) of that food group.
 */

export const FOOD_GROUPS = {
  leche: 'Leche y Sustitutos',
  carne: 'Carne',
  fruta: 'Fruta',
  verdura: 'Verdura',
  cereales: 'Cereales y Tubérculos',
  leguminosas: 'Leguminosas',
  grasas: 'Grasas',
};

// Each entry: { name, amount, unit, notes?, glycemicIndex? }
// glycemicIndex: 'bajo' | 'moderado' | 'alto' — used for colación validation

export const equivalents = {

  leche: [
    { name: 'Leche descremada',  amount: 240, unit: 'ml',  notes: '1 vaso' },
    { name: 'Leche entera',      amount: 240, unit: 'ml',  notes: '1 vaso' },
    { name: 'Leche en polvo',    amount: 26,  unit: 'g',   notes: '3 cucharadas' },
    { name: 'Jocoque',           amount: 180, unit: 'ml',  notes: '½ vaso' },
    { name: 'Yogurt natural',    amount: 240, unit: 'ml',  notes: '1 vaso' },
  ],

  carne: [
    { name: 'Atún natural',      amount: 28,  unit: 'g' },
    { name: 'Claras de huevo',   amount: 82,  unit: 'g',   notes: '2 piezas' },
    { name: 'Huevo entero',      amount: 60,  unit: 'g',   notes: '1 pieza' },
    { name: 'Carne de puerco',   amount: 30,  unit: 'g' },
    { name: 'Pollo',             amount: 25,  unit: 'g' },
    { name: 'Pescado',           amount: 35,  unit: 'g' },
    { name: 'Queso cottage',     amount: 45,  unit: 'g' },
    { name: 'Queso panela',      amount: 30,  unit: 'g' },
    { name: 'Requesón',          amount: 23,  unit: 'g' },
    { name: 'Carne de res',      amount: 30,  unit: 'g' },
  ],

  fruta: [
    // --- Bajo índice glucémico (válidas para colación) ---
    { name: 'Capulín',           amount: 91,  unit: 'g',   notes: '2½ tazas',    glycemicIndex: 'bajo' },
    { name: 'Ciruela',           amount: 129, unit: 'g',   notes: '2½ piezas',   glycemicIndex: 'bajo' },
    { name: 'Durazno',           amount: 153, unit: 'g',   notes: '2 piezas',    glycemicIndex: 'bajo' },
    { name: 'Fresas',            amount: 188, unit: 'g',   notes: '15 piezas',   glycemicIndex: 'bajo' },
    { name: 'Guanábana chica',   amount: 158, unit: 'g',   notes: '½ pieza',     glycemicIndex: 'bajo' },
    { name: 'Guayaba',           amount: 118, unit: 'g',   notes: '2 piezas',    glycemicIndex: 'bajo' },
    { name: 'Kiwi',              amount: 99,  unit: 'g',   notes: '1½ piezas',   glycemicIndex: 'bajo' },
    { name: 'Mandarina',         amount: 112, unit: 'g',   notes: '2 piezas',    glycemicIndex: 'bajo' },
    { name: 'Manzana',           amount: 92,  unit: 'g',   notes: '1 pieza',     glycemicIndex: 'bajo' },
    { name: 'Mango',             amount: 140, unit: 'g',   notes: '½ pieza',     glycemicIndex: 'bajo' },
    { name: 'Naranja chica',     amount: 126, unit: 'g',   notes: '2 piezas',    glycemicIndex: 'bajo' },
    { name: 'Pera',              amount: 103, unit: 'g',   notes: '½ pieza',     glycemicIndex: 'bajo' },
    { name: 'Plátano',           amount: 67,  unit: 'g',   notes: '½ pieza',     glycemicIndex: 'bajo' },
    { name: 'Toronja',           amount: 180, unit: 'g',   notes: '1 pieza',     glycemicIndex: 'bajo' },
    { name: 'Uvas',              amount: 90,  unit: 'g',   notes: '12 piezas',   glycemicIndex: 'bajo' },
    { name: 'Tunas',             amount: 90,  unit: 'g',   notes: '2 piezas',    glycemicIndex: 'bajo' },
    { name: 'Zapote',            amount: 45,  unit: 'g',   notes: '¼ pieza',     glycemicIndex: 'bajo' },
    { name: 'Zarzamora',         amount: 115, unit: 'g',   notes: '¾ taza',      glycemicIndex: 'bajo' },
    // --- Moderado índice glucémico ---
    { name: 'Melón',             amount: 166, unit: 'g',   notes: '1 taza',      glycemicIndex: 'moderado' },
    { name: 'Papaya',            amount: 152, unit: 'g',   notes: '1 taza',      glycemicIndex: 'moderado' },
    { name: 'Piña',              amount: 120, unit: 'g',   notes: '¾ taza',      glycemicIndex: 'moderado' },
    // --- Alto índice glucémico ---
    { name: 'Sandía',            amount: 200, unit: 'g',   notes: '1½ tazas',    glycemicIndex: 'alto' },
    { name: 'Tamarindo',         amount: 25,  unit: 'g',                          glycemicIndex: 'alto' },
  ],

  verdura: [
    // Grupo A — consumir ½ taza por porción
    { name: 'Alcachofa',         amount: null, unit: '½ taza',  glycemicIndex: 'bajo', group: 'A' },
    { name: 'Betabel',           amount: null, unit: '½ taza',  glycemicIndex: 'bajo', group: 'A' },
    { name: 'Berenjena',         amount: null, unit: '½ taza',  glycemicIndex: 'bajo', group: 'A' },
    { name: 'Calabaza de castilla', amount: null, unit: '½ taza', glycemicIndex: 'bajo', group: 'A' },
    { name: 'Cebolla',           amount: null, unit: '½ taza',  glycemicIndex: 'bajo', group: 'A' },
    { name: 'Chícharos',         amount: null, unit: '½ taza',  glycemicIndex: 'bajo', group: 'A' },
    { name: 'Espárragos',        amount: null, unit: '½ taza',  glycemicIndex: 'bajo', group: 'A' },
    { name: 'Chile poblano',     amount: null, unit: '½ taza',  glycemicIndex: 'bajo', group: 'A' },
    { name: 'Zanahoria',         amount: null, unit: '½ taza',  glycemicIndex: 'bajo', group: 'A' },
    { name: 'Jícama',            amount: null, unit: '½ taza',  glycemicIndex: 'bajo', group: 'A' },
    { name: 'Habas verdes',      amount: null, unit: '½ taza',  glycemicIndex: 'bajo', group: 'A' },
    { name: 'Quelites',          amount: null, unit: '½ taza',  glycemicIndex: 'bajo', group: 'A' },
    { name: 'Huitlacoche',       amount: null, unit: '½ taza',  glycemicIndex: 'bajo', group: 'A' },
    // Grupo B — consumir 1 taza por porción
    { name: 'Flor de calabaza',  amount: null, unit: '1 taza',  glycemicIndex: 'bajo', group: 'B' },
    { name: 'Hongos',            amount: null, unit: '1 taza',  glycemicIndex: 'bajo', group: 'B' },
    { name: 'Nopales',           amount: null, unit: '1 taza',  glycemicIndex: 'bajo', group: 'B' },
    { name: 'Lechuga',           amount: null, unit: '1 taza',  glycemicIndex: 'bajo', group: 'B' },
    { name: 'Pepino',            amount: null, unit: '1 taza',  glycemicIndex: 'bajo', group: 'B' },
    { name: 'Brócoli',           amount: null, unit: '1 taza',  glycemicIndex: 'bajo', group: 'B' },
    { name: 'Acelga',            amount: null, unit: '1 taza',  glycemicIndex: 'bajo', group: 'B' },
    { name: 'Chilacayote',       amount: null, unit: '1 taza',  glycemicIndex: 'bajo', group: 'B' },
    { name: 'Col',               amount: null, unit: '1 taza',  glycemicIndex: 'bajo', group: 'B' },
    { name: 'Coliflor',          amount: null, unit: '1 taza',  glycemicIndex: 'bajo', group: 'B' },
    { name: 'Rábano',            amount: null, unit: '1 taza',  glycemicIndex: 'bajo', group: 'B' },
    { name: 'Ejote',             amount: null, unit: '1 taza',  glycemicIndex: 'bajo', group: 'B' },
    { name: 'Jitomate',          amount: null, unit: '1 taza',  glycemicIndex: 'bajo', group: 'B' },
    { name: 'Espinaca',          amount: null, unit: '1 taza',  glycemicIndex: 'bajo', group: 'B' },
    { name: 'Berros',            amount: null, unit: '1 taza',  glycemicIndex: 'bajo', group: 'B' },
    { name: 'Chayote',           amount: null, unit: '1 taza',  glycemicIndex: 'bajo', group: 'B' },
    { name: 'Apio',              amount: null, unit: '1 taza',  glycemicIndex: 'bajo', group: 'B' },
    { name: 'Tomate verde',      amount: null, unit: '1 taza',  glycemicIndex: 'bajo', group: 'B' },
    { name: 'Poro',              amount: null, unit: '1 taza',  glycemicIndex: 'bajo', group: 'B' },
    { name: 'Romerito',          amount: null, unit: '1 taza',  glycemicIndex: 'bajo', group: 'B' },
    { name: 'Verdolaga',         amount: null, unit: '1 taza',  glycemicIndex: 'bajo', group: 'B' },
    { name: 'Quintoniles',       amount: null, unit: '1 taza',  glycemicIndex: 'bajo', group: 'B' },
  ],

  cereales: [
    // --- Bajo índice glucémico ---
    { name: 'Elote',                    amount: 90,  unit: 'g',   notes: '½ taza',      glycemicIndex: 'bajo' },
    { name: 'Avena',                    amount: 30,  unit: 'g',   notes: '2 cucharadas', glycemicIndex: 'bajo' },
    { name: 'Pasta',                    amount: 56,  unit: 'g',   notes: '½ taza',      glycemicIndex: 'bajo' },
    { name: 'Tortilla de maíz',         amount: 30,  unit: 'g',   notes: '1 pieza',     glycemicIndex: 'bajo' },
    { name: 'Amaranto',                 amount: 30,  unit: 'g',   notes: '¾ taza',      glycemicIndex: 'bajo' },
    // --- Moderado índice glucémico ---
    { name: 'Arroz',                    amount: 57,  unit: 'g',   notes: '1/3 taza',    glycemicIndex: 'moderado' },
    { name: 'Bolillo',                  amount: 24,  unit: 'g',   notes: '1/3 pieza',   glycemicIndex: 'moderado' },
    { name: 'Camote',                   amount: 70,  unit: 'g',   notes: '½ taza',      glycemicIndex: 'moderado' },
    { name: 'Cereal de caja sin azúcar', amount: 30, unit: 'g',   notes: '¾ taza',      glycemicIndex: 'moderado' },
    { name: 'Galletas Marías',          amount: 20,  unit: 'g',   notes: '5 piezas',    glycemicIndex: 'moderado' },
    { name: 'Galletas de animalitos',   amount: 60,  unit: 'g',   notes: '6 piezas',    glycemicIndex: 'moderado' },
    { name: 'Galletas habaneras',       amount: 20,  unit: 'g',   notes: '3 piezas',    glycemicIndex: 'moderado' },
    { name: 'Maicena',                  amount: 18,  unit: 'g',   notes: '3½ cucharadas', glycemicIndex: 'moderado' },
    { name: 'Yuca',                     amount: 50,  unit: 'g',   notes: '2 piezas',    glycemicIndex: 'moderado' },
    // --- Alto índice glucémico ---
    { name: 'Palitos de pan',           amount: 60,  unit: 'g',   notes: '2 piezas',    glycemicIndex: 'alto' },
    { name: 'Pan de caja light',        amount: 30,  unit: 'g',   notes: '1 pieza',     glycemicIndex: 'alto' },
    { name: 'Pan tostado',              amount: 60,  unit: 'g',   notes: '1 pieza',     glycemicIndex: 'alto' },
    { name: 'Papa',                     amount: 85,  unit: 'g',   notes: '½ pieza',     glycemicIndex: 'alto' },
    { name: 'Palomitas naturales',      amount: 18,  unit: 'g',   notes: '2½ tazas',    glycemicIndex: 'alto' },
  ],

  leguminosas: [
    { name: 'Alverjón',          amount: 35,  unit: 'g',   notes: '½ taza' },
    { name: 'Alubia',            amount: 87,  unit: 'g',   notes: '1½ tazas' },
    { name: 'Frijol',            amount: 90,  unit: 'g',   notes: '½ taza' },
    { name: 'Garbanzo',          amount: 72,  unit: 'g',   notes: '½ taza' },
    { name: 'Haba',              amount: 100, unit: 'g',   notes: '¾ taza' },
    { name: 'Lenteja',           amount: 100, unit: 'g',   notes: '½ taza' },
    { name: 'Soya texturizada',  amount: 70,  unit: 'g',   notes: '½ taza' },
  ],

  grasas: [
    { name: 'Aceite de linaza',  amount: 5,   unit: 'ml',  notes: '1 cucharadita' },
    { name: 'Aceite de cártamo', amount: 5,   unit: 'ml',  notes: '1 cucharadita' },
    { name: 'Aceite de canola',  amount: 5,   unit: 'ml',  notes: '1 cucharadita' },
    { name: 'Aceite de oliva',   amount: 5,   unit: 'ml',  notes: '1 cucharadita' },
    { name: 'Aguacate chico',    amount: 30,  unit: 'g',   notes: '1/3 pieza' },
    { name: 'Ajonjolí',         amount: 5,   unit: 'g' },
    { name: 'Almendras',        amount: null, unit: '10 piezas' },
    { name: 'Avellanas',        amount: null, unit: '8 piezas' },
    { name: 'Cacahuate natural', amount: null, unit: '12 piezas' },
    { name: 'Margarina sin sal', amount: 5,   unit: 'ml',  notes: '1 cucharadita' },
    { name: 'Nuez',             amount: null, unit: '3 piezas' },
  ],
};

/**
 * Returns all food items that are valid for colaciones (snacks).
 * Rule: must be low-GI fruit or any vegetable.
 */
export function getValidColacionFoods() {
  const lowGiFruits = equivalents.fruta.filter(f => f.glycemicIndex === 'bajo');
  const allVeggies  = equivalents.verdura;
  return { fruta: lowGiFruits, verdura: allVeggies };
}

/**
 * Given a food name (string), fuzzy-find its group and equivalent entry.
 * Used by the GPT post-processing step to map identified foods to groups.
 */
export function findFoodInEquivalents(foodName) {
  const name = foodName.toLowerCase().trim();
  for (const [group, items] of Object.entries(equivalents)) {
    const match = items.find(item =>
      item.name.toLowerCase().includes(name) || name.includes(item.name.toLowerCase())
    );
    if (match) return { group, item: match };
  }
  return null;
}

/**
 * Build a compact text summary of the equivalents table for inclusion in GPT prompts.
 * Keeps token count low while giving GPT enough context to map foods to groups.
 */
export function buildEquivalentsPromptContext() {
  const lines = [];
  for (const [group, items] of Object.entries(equivalents)) {
    const names = items.map(i => i.name).join(', ');
    lines.push(`${FOOD_GROUPS[group]}: ${names}`);
  }
  return lines.join('\n');
}
