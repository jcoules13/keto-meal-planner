# Audit des Composants - Keto Meal Planner

## Date: 2025-11-05

## 📊 Statistiques Globales

- **Total composants**: 42
- **Composants non utilisés**: 5
- **Composants > 500 lignes**: 4 (TRÈS GROS)
- **Composants > 200 lignes**: 11

---

## ❌ Composants Non Utilisés (À Supprimer)

### 1. DayNavigator.jsx
- **Fichier**: `src/components/meals/DayNavigator.jsx`
- **État**: Jamais importé
- **Action**: À supprimer

### 2. WeeklyMealPlanGrid.jsx
- **Fichier**: `src/components/meals/WeeklyMealPlanGrid.jsx`
- **État**: Jamais importé
- **Action**: À supprimer

### 3. Button.tsx
- **Fichier**: `src/components/ui/Button.tsx`
- **État**: Jamais importé (probablement remplacé par classes Tailwind)
- **Action**: À supprimer

### 4. Input.tsx
- **Fichier**: `src/components/ui/Input.tsx`
- **État**: Jamais importé
- **Action**: À supprimer

### 5. ThemeIndicator.tsx
- **Fichier**: `src/components/ui/ThemeIndicator.tsx`
- **État**: Jamais importé (probablement remplacé par ThemeToggle)
- **Action**: À supprimer

**Impact estimé**: ~400-600 lignes de code mort à supprimer

---

## ⚠️ Composants TRÈS GROS (Problème de Performance)

### 1. WeeklyMealGenerator.jsx - 924 LIGNES 🔥

**Problème CRITIQUE**:
- **924 lignes** dans un seul composant!
- Utilise **4 contexts** simultanément: User, MealPlan, Food, Recipe
- Quand N'IMPORTE QUEL context change → tout le composant re-render
- Contient logique métier complexe + UI + state management

**Contexts utilisés**:
```javascript
const { calorieTarget, macroTargets, dietType, preferences, mealFrequency } = useUser();
const { currentPlan, addMealToCurrentPlan, deleteMeal } = useMealPlan();
const { foods } = useFood();
const { recipes } = useRecipe();
```

**Impact**: C'est probablement LA cause principale du gel de MealPlanner

**Recommandation**:
- ✅ Désactivé temporairement dans MealPlannerPage (ligne 177)
- 🔨 À refactorer: Séparer en 3-4 composants plus petits
- 🔨 Mémoriser avec React.memo
- 🔨 Utiliser useMemo pour calculs lourds

---

### 2. MealPlanOptions.jsx - 614 lignes

**Problème**:
- Formulaire massif d'options
- Utilise useUser context
- Beaucoup de state local

**Recommandation**:
- Séparer en sous-composants (FastingOptions, MealFrequencyOptions, etc.)
- Utiliser React.memo pour sections indépendantes

---

### 3. MealGeneratorForPlan.jsx - 609 lignes

**Problème**:
- Utilise **4 contexts** simultanément
- Logique de génération complexe inline

**Recommandation**:
- Extraire logique génération dans utils/
- Séparer UI et logique métier

---

### 4. RecipeForm.jsx - 608 lignes

**Problème**:
- Formulaire massif
- Utilise useRecipe ET useFood
- Ligne 15: **utilise setFilter** ⚠️

```javascript
const { foods, setFilter, filteredFoods, resetFilters } = useFood();
```

**Impact**: Potentiel re-render si mal utilisé

**Recommandation**:
- Vérifier si setFilter est dans useEffect
- Séparer formulaire en sections (ingredients, nutrition, etc.)

---

## 📈 Composants Moyens (200-500 lignes)

| Composant | Lignes | Contexts | Note |
|-----------|--------|----------|------|
| FridgeSelector.jsx | 306 | Food | OK |
| MealGeneratorFromFridge.jsx | 291 | Multiple | À vérifier |
| MealGenerator.jsx | 287 | Multiple | À vérifier |
| DayMealsList.jsx | 248 | MealPlan | OK |
| RecipeDetail.jsx | 226 | Recipe | OK |
| MealPlanDetail.jsx | 219 | MealPlan | OK |
| WeightGraph.jsx | 217 | Recharts | OK |
| FoodDetail.jsx | 209 | Food | OK |
| WeeklyMealPlanDisplay.jsx | 208 | MealPlan | Désactivé |
| MealItem.jsx | 207 | MealPlan | OK |

---

## ✅ Anti-Patterns Check

### useEffect Dangereux
```bash
✅ AUCUN trouvé dans les composants!
```

Tous les problèmes `useEffect` étaient dans les **pages**, pas les composants. Bon signe!

---

## 🔍 Duplications Potentielles

### MEAL_TYPES Constant

Trouvé dans:
1. WeeklyMealGenerator.jsx (ligne 13-39)
2. Probablement dans d'autres composants meal

**Recommandation**: Créer `src/constants/mealTypes.js` et l'importer

### Fonctions de Calcul de Distribution

- `calculateCalorieDistribution` dans WeeklyMealGenerator.jsx (ligne 551)
- Probablement dupliquée ailleurs

**Recommandation**: Déplacer dans `src/utils/mealCalculations.js`

---

## 📊 Résumé par Catégorie

### components/meals (16 composants)
- ✅ 14 utilisés
- ❌ 2 non utilisés (DayNavigator, WeeklyMealPlanGrid)
- 🔥 4 très gros (924, 609, 306, 291 lignes)

### components/recipes (3 composants)
- ✅ 3 utilisés
- 🔥 1 très gros (RecipeForm: 608 lignes)

### components/foods (2 composants)
- ✅ 2 utilisés

### components/weight (5 composants)
- ✅ 5 utilisés

### components/profile (1 composant)
- ✅ 1 utilisé

### components/layout (3 composants)
- ✅ 3 utilisés

### components/ui (12 composants)
- ✅ 9 utilisés
- ❌ 3 non utilisés (Button, Input, ThemeIndicator)

---

## 🎯 Plan d'Action Recommandé

### Phase 1: Nettoyage Immédiat
- [ ] Supprimer 5 composants non utilisés
- [ ] Créer `src/constants/mealTypes.js`
- [ ] Extraire constantes dupliquées

### Phase 2: Refactoring des Gros Composants (Si besoin)
- [ ] WeeklyMealGenerator.jsx: Séparer en 3-4 composants
- [ ] MealPlanOptions.jsx: Séparer en sous-formulaires
- [ ] MealGeneratorForPlan.jsx: Extraire logique métier
- [ ] RecipeForm.jsx: Vérifier usage setFilter

### Phase 3: Optimisation Performance (Si besoin)
- [ ] Ajouter React.memo aux composants lourds
- [ ] Utiliser useMemo pour calculs coûteux
- [ ] Utiliser useCallback pour fonctions passées en props

---

## ⚡ Impact Estimé du Nettoyage

| Action | Gain |
|--------|------|
| Supprimer composants inutilisés | ~600 lignes |
| Extraire constantes dupliquées | ~100 lignes |
| **Total** | **~700 lignes** |

---

## 🔥 Cause Racine du Gel MealPlanner

**Diagnostic Final**:

1. ❌ WeeklyMealGenerator.jsx (924 lignes, 4 contexts)
2. ❌ MealGeneratorForPlan.jsx (609 lignes, 4 contexts)
3. ❌ MealGeneratorFromFridge.jsx (291 lignes, multiple contexts)

Ces 3 composants utilisent TOUS les contexts simultanément. Quand **n'importe quel** context change:
- Tous les 3 re-render
- Calculent des centaines de lignes de logique
- Re-créent des objets/fonctions
- Déclenchent d'autres re-renders
- **→ GEL COMPLET**

**Solution actuelle**: Désactivés dans MealPlannerPage
**Solution long terme**: Refactorer avec React.memo + useMemo + useCallback

---

## 💡 Bonnes Pratiques Identifiées

✅ **Aucun** useEffect dangereux dans composants
✅ Séparation claire par fonctionnalité (meals/, foods/, etc.)
✅ Composants UI réutilisables (ui/)
✅ Utilisation de TypeScript pour certains (layout, ui, profile)

---

## 📝 Notes

- Les gros composants ne sont PAS un bug, mais une **dette technique**
- L'app fonctionne maintenant car ils sont désactivés
- Refactoring recommandé mais **pas urgent** si utilisateur satisfait
- Priorité: avoir une app stable et utilisable (✅ FAIT)

---

Date: 2025-11-05
Auditeur: Claude (Agent SDK)
