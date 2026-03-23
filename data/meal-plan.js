/**
 * Héctor's prescribed meal plan
 * Source: IMSS — Dieta de Reducción 2000 kcal
 * Each value = number of "intercambios" (portions) per meal
 */

export const MEAL_TYPES = ['desayuno', 'comida', 'cena', 'colacion'];

export const MEAL_LABELS = {
  desayuno: 'Desayuno',
  comida:   'Comida',
  cena:     'Cena',
  colacion: 'Colación',
};

export const MEAL_EMOJI = {
  desayuno: '🌅',
  comida:   '☀️',
  cena:     '🌙',
  colacion: '🍎',
};

// Meal time windows — used for display hints (not enforcement)
export const MEAL_TIME_HINTS = {
  desayuno: '7:00 – 10:00',
  comida:   '13:00 – 15:00',
  cena:     '19:00 – 21:00',
  colacion: 'Entre comidas',
};

/**
 * Prescribed portions per meal.
 * colacion: 0 = no fixed target — unlimited but must be low-GI fruit or veggie.
 */
export const MEAL_PLAN = {
  desayuno: {
    leche:        1,
    carne:        2,
    fruta:        1,
    verdura:      1,
    cereales:     3,
    leguminosas:  0,
    grasas:       1,
  },
  comida: {
    leche:        0,
    carne:        3,
    fruta:        1,
    verdura:      1,
    cereales:     4,
    leguminosas:  1,
    grasas:       2,
  },
  cena: {
    leche:        1,
    carne:        2,
    fruta:        1,
    verdura:      1,
    cereales:     2,
    leguminosas:  0,
    grasas:       1,
  },
  // Colaciones have no fixed target — only food type restriction
  colacion: {
    leche:        0,
    carne:        0,
    fruta:        null,   // null = allowed (low-GI only), no max
    verdura:      null,   // null = allowed (any), no max
    cereales:     0,
    leguminosas:  0,
    grasas:       0,
  },
};

/**
 * Ordered pipeline: desayuno must be logged before comida, comida before cena.
 * Colaciones can be logged at any time but don't block the pipeline.
 */
export const PIPELINE_ORDER = ['desayuno', 'comida', 'cena'];

/**
 * Given today's logged meal types, return the next required meal in pipeline.
 * @param {string[]} loggedMealTypes - e.g. ['desayuno']
 * @returns {string} - 'desayuno' | 'comida' | 'cena' | 'completed'
 */
export function getNextMeal(loggedMealTypes) {
  for (const meal of PIPELINE_ORDER) {
    if (!loggedMealTypes.includes(meal)) return meal;
  }
  return 'completed';
}

/**
 * Total daily portions across all meals (for progress tracking).
 */
export const DAILY_TOTALS = Object.keys(MEAL_PLAN.desayuno).reduce((acc, group) => {
  acc[group] = PIPELINE_ORDER.reduce((sum, meal) => sum + (MEAL_PLAN[meal][group] || 0), 0);
  return acc;
}, {});

/**
 * Group display labels in Spanish.
 */
export const GROUP_LABELS = {
  leche:       'Leche',
  carne:       'Carne',
  fruta:       'Fruta',
  verdura:     'Verdura',
  cereales:    'Cereales',
  leguminosas: 'Leguminosas',
  grasas:      'Grasas',
};

export const GROUP_ICONS = {
  leche:       '🥛',
  carne:       '🥩',
  fruta:       '🍎',
  verdura:     '🥦',
  cereales:    '🌽',
  leguminosas: '🫘',
  grasas:      '🥑',
};

/**
 * General diet recommendations from the doctor's plan.
 * Displayed in the app as tips.
 */
export const DOCTOR_RECOMMENDATIONS = [
  'Todos los pesos están reportados en cocido.',
  'Fija horarios de comida de acuerdo a tu actividad física.',
  'Realiza mínimo 3 comidas al día con intervalos de 6 horas.',
  'Las frutas o verduras recomendadas se pueden consumir entre comidas para evitar las bajas de glucosa o sensación de hambre.',
  'Bebe de 1.5 a 2 litros de agua natural al día.',
  'Realiza de 20 a 30 minutos de ejercicio aeróbico al día (caminata, natación, baile, etc.).',
];

export const FOODS_TO_AVOID = [
  'Azúcares refinadas: azúcar, miel, mermeladas, ates, jaleas, frutas en almíbar, dulces, chocolates, pan y galletas dulces, pasteles.',
  'Consume con moderación (1 vez al mes): queso de puerco, chorizo, paté, carnitas, vísceras, barbacoa, hamburguesas, crema, mantequilla, mayonesa, margarina.',
  'Revisa las etiquetas de productos enlatados o empaquetados para evitar los que contengan azúcar.',
];
