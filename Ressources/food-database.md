# Structure de la base de données d'aliments

## Catégories principales

1. **Viandes**
   - Bœuf
   - Poulet
   - Porc
   - Agneau
   - Canard
   - Dinde
   - Veau
   - Gibier

2. **Poissons et fruits de mer**
   - Poissons gras (saumon, maquereau, sardine)
   - Poissons blancs (cabillaud, sole, merlu)
   - Crustacés (crevettes, homard, crabe)
   - Mollusques (moules, huîtres, coquilles Saint-Jacques)

3. **Œufs et produits laitiers**
   - Œufs
   - Fromages à pâte dure (parmesan, emmental, comté)
   - Fromages à pâte molle (brie, camembert)
   - Fromages frais (chèvre, feta, mozzarella)
   - Fromages bleus (roquefort, bleu d'Auvergne)
   - Crème et beurre

4. **Légumes à faible teneur en glucides**
   - Légumes feuillus (épinards, laitue, chou kale)
   - Crucifères (chou-fleur, brocoli, chou)
   - Légumes-tiges (asperges, céleri)
   - Légumes-racines faibles en glucides (radis)
   - Autres légumes (courgette, aubergine, poivron)

5. **Noix et graines**
   - Amandes
   - Noix
   - Noisettes
   - Noix de macadamia
   - Noix du Brésil
   - Graines de chia
   - Graines de lin
   - Graines de courge

6. **Fruits à faible indice glycémique**
   - Baies (fraises, framboises, myrtilles)
   - Avocat
   - Olives
   - Tomates (botaniquement un fruit)

7. **Matières grasses**
   - Huiles (olive, coco, avocat, MCT)
   - Beurres (normal, clarifié, ghee)
   - Crèmes (fraîche, épaisse)
   - Sources naturelles (avocat, olives)

8. **Condiments et épices**
   - Herbes fraîches et séchées
   - Épices (sans sucre ajouté)
   - Vinaigres
   - Sauces faibles en glucides

## Structure des données d'un aliment

```javascript
{
  id: "poulet-blanc",
  name: "Blanc de poulet",
  category: "viande",
  subCategory: "poulet",
  nutritionPer100g: {
    calories: 165,
    protein: 31.0,
    fat: 3.6,
    carbs: 0,
    fiber: 0,
    netCarbs: 0,
    sodium: 74, // en mg
    potassium: 256, // en mg
    magnesium: 29, // en mg
    calcium: 15 // en mg
  },
  pHValue: 6.1, // légèrement acide
  isKeto: true,
  isAlkaline: false,
  seasons: ["printemps", "été", "automne", "hiver"], // disponible toute l'année
  commonUnitWeight: 120, // poids moyen d'un blanc de poulet en g
  unitName: "filet",
  image: "chicken-breast.jpg",
  glycemicIndex: 0, // non applicable pour les viandes
  insulinIndex: 51, // index insulinique moyen
  allergens: ["volaille"],
  nutritionalDensity: 8.5, // score de 1 à 10 basé sur la densité en micronutriments
  easeOfDigestion: 7 // score de 1 à 10 pour la facilité de digestion
}
```

## Éléments spécifiques au régime keto alcalin

Pour le régime keto alcalin, nous devons classifier les aliments selon leur effet acidifiant ou alcalinisant sur l'organisme:

### Aliments acidifiants (pH < 7)
- La plupart des viandes
- Certains fromages
- Œufs
- Céréales
- Légumineuses
- Alcool
- Sucre
- Caféine

### Aliments alcalinisants (pH > 7)
- La plupart des légumes verts
- Avocat
- Certaines noix et graines
- Citron (acidité gustative mais effet alcalinisant)
- Herbes fraîches
- Épices
- Eau minérale alcaline

## Exemple de structure pour un régime keto alcalin

```javascript
{
  id: "avocat",
  name: "Avocat",
  category: "fruits",
  subCategory: "faible-indice-glycemique",
  nutritionPer100g: {
    calories: 160,
    protein: 2.0,
    fat: 14.7,
    carbs: 8.5,
    fiber: 6.7,
    netCarbs: 1.8,
    sodium: 7, // en mg
    potassium: 485, // en mg
    magnesium: 29, // en mg
    calcium: 12 // en mg
  },
  pHValue: 8.2, // alcalin
  isKeto: true,
  isAlkaline: true,
  seasons: ["automne", "hiver", "printemps"], // principalement disponible de septembre à mai
  commonUnitWeight: 170, // poids moyen d'un avocat moyen sans peau ni noyau
  unitName: "unité",
  image: "avocado.jpg",
  glycemicIndex: 15, // très bas
  insulinIndex: 20, // très bas
  allergens: [],
  nutritionalDensity: 9.2, // très dense en nutriments
  easeOfDigestion: 8.5 // facile à digérer
}
```

## Données saisonnières

Pour promouvoir une alimentation écologique et saisonnière, chaque aliment comprend des informations sur sa disponibilité saisonnière en France:

- **Printemps**: mars, avril, mai
- **Été**: juin, juillet, août
- **Automne**: septembre, octobre, novembre
- **Hiver**: décembre, janvier, février

Les aliments importés ou produits toute l'année sont marqués comme disponibles dans toutes les saisons.

## Importation et mise à jour des données

La base de données initiale sera fournie avec l'application, mais pourra être enrichie par:

1. **Mises à jour périodiques**
   - Nouvelles données nutritionnelles
   - Nouveaux aliments
   - Corrections et ajustements

2. **Contributions des utilisateurs**
   - Ajout d'aliments personnalisés
   - Commentaires et corrections

## Format de stockage

La base de données sera stockée en format JSON pour faciliter:

1. La manipulation via JavaScript
2. L'interopérabilité avec d'autres systèmes
3. L'extensibilité
4. La mise en cache locale

## Exemple de base de données minimale pour le démarrage

Pour commencer le développement, une base de données minimale comprendra:

- 20 types de viandes et poissons
- 15 types de légumes à faible teneur en glucides
- 10 types de fromages et produits laitiers
- 8 types de noix et graines
- 5 types de fruits à faible indice glycémique
- 10 types de matières grasses et huiles
- 15 condiments et épices

Soit environ 83 aliments de base, suffisants pour générer des plans de repas variés et nutritionnellement complets.
