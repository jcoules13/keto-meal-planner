# Algorithme de génération de plans de repas

## Principes fondamentaux

L'algorithme de génération de plans de repas repose sur quatre principes fondamentaux:

1. **Respect des besoins nutritionnels personnalisés**
   - Respect des objectifs caloriques de l'utilisateur
   - Distribution appropriée des macronutriments (keto: 70-75% lipides, 20-25% protéines, 5-10% glucides)

2. **Variété et équilibre**
   - Diversité des aliments et recettes
   - Rotation des types de protéines
   - Équilibre entre les groupes d'aliments

3. **Respect des contraintes et préférences**
   - Exclusion des aliments non désirés ou allergènes
   - Priorité aux aliments favoris
   - Prise en compte du régime (keto standard ou keto alcalin)
   - Respect de la saisonnalité si demandée

4. **Praticité et réalisme**
   - Gestion intelligente des restes
   - Préparations réalistes en termes de temps et complexité
   - Optimisation des achats (limitation du gaspillage)

## Étapes de l'algorithme

### 1. Calcul des besoins nutritionnels

```pseudo
FONCTION calculBesoinsNutritionnels(utilisateur):
    // Calcul du métabolisme de base (formule de Mifflin-St Jeor)
    SI utilisateur.genre == "homme":
        MB = 10 * utilisateur.poids + 6.25 * utilisateur.taille - 5 * utilisateur.age + 5
    SINON:
        MB = 10 * utilisateur.poids + 6.25 * utilisateur.taille - 5 * utilisateur.age - 161
    
    // Facteur d'activité
    SELON utilisateur.niveauActivite:
        CAS "sédentaire":           FA = 1.2
        CAS "légèrement_actif":     FA = 1.375
        CAS "modérément_actif":     FA = 1.55
        CAS "très_actif":           FA = 1.725
        CAS "extrêmement_actif":    FA = 1.9
    
    // Besoins caloriques totaux
    besoinsCaloriques = MB * FA
    
    // Ajustement selon l'objectif de poids
    SI utilisateur.poidsActuel > utilisateur.poidsCible:
        // Déficit calorique pour perte de poids (max 20% de déficit)
        besoinsCaloriques = besoinsCaloriques * 0.8
    SINON SI utilisateur.poidsActuel < utilisateur.poidsCible:
        // Surplus calorique pour prise de poids (max 10% de surplus)
        besoinsCaloriques = besoinsCaloriques * 1.1
    
    // Calcul des macronutriments pour régime keto
    macros = {
        "lipides": (besoinsCaloriques * 0.75) / 9,  // 75% des calories, 9 kcal/g
        "proteines": (besoinsCaloriques * 0.20) / 4,  // 20% des calories, 4 kcal/g
        "glucides": (besoinsCaloriques * 0.05) / 4   // 5% des calories, 4 kcal/g
    }
    
    RETOURNER {"caloriesQuotidiennes": besoinsCaloriques, "macros": macros}
```

### 2. Distribution des repas

```pseudo
FONCTION distribuerRepas(besoinsNutritionnels, utilisateur):
    nombreRepas = utilisateur.frequenceRepas
    
    // Ajuster pour le jeûne intermittent si activé
    SI utilisateur.jeuneIntermittent.active:
        // Vérifier que tous les repas tiennent dans la fenêtre d'alimentation
        heureDebut = convertirEnMinutes(utilisateur.jeuneIntermittent.heureDebut)
        heureFin = heureDebut + utilisateur.jeuneIntermittent.fenetreAlimentation * 60
        
        // Distribuer les repas uniformément dans la fenêtre d'alimentation
        intervalle = utilisateur.jeuneIntermittent.fenetreAlimentation * 60 / nombreRepas
    SINON:
        // Distribution standard sur la journée (de 7h à 20h)
        heureDebut = 7 * 60  // 7h du matin en minutes
        heureFin = 20 * 60   // 20h du soir en minutes
        intervalle = (heureFin - heureDebut) / nombreRepas
    
    repas = []
    
    POUR i DE 0 À nombreRepas - 1:
        heureRepas = heureDebut + intervalle * i + intervalle / 2  // Milieu de l'intervalle
        
        // Nommer le repas en fonction de l'heure
        SI heureRepas < 10 * 60:
            nomRepas = "Petit-déjeuner"
        SINON SI heureRepas < 14 * 60:
            nomRepas = "Déjeuner"
        SINON SI heureRepas < 17 * 60:
            nomRepas = "Goûter"
        SINON:
            nomRepas = "Dîner"
        
        // Distribution des calories
        SI nombreRepas == 1:
            pourcentageCalories = 100
        SINON SI nombreRepas == 2:
            SI i == 0:
                pourcentageCalories = 40  // Premier repas: 40%
            SINON:
                pourcentageCalories = 60  // Deuxième repas: 60%
        SINON:
            // Distribution équilibrée pour 3+ repas avec légère préférence pour déjeuner/dîner
            pourcentageCalories = 100 / nombreRepas
            
            SI nomRepas == "Déjeuner" OU nomRepas == "Dîner":
                pourcentageCalories = pourcentageCalories * 1.1
            SINON:
                pourcentageCalories = pourcentageCalories * 0.9
        
        caloriesRepas = besoinsNutritionnels.caloriesQuotidiennes * pourcentageCalories / 100
        
        // Même ratio de macros que pour la journée entière
        macrosRepas = {
            "lipides": besoinsNutritionnels.macros.lipides * pourcentageCalories / 100,
            "proteines": besoinsNutritionnels.macros.proteines * pourcentageCalories / 100,
            "glucides": besoinsNutritionnels.macros.glucides * pourcentageCalories / 100
        }
        
        repas.ajouter({
            "nom": nomRepas,
            "heure": convertirEnHeure(heureRepas),
            "calories": caloriesRepas,
            "macros": macrosRepas
        })
    
    // Normaliser les pourcentages pour atteindre exactement 100%
    totalPourcentage = SOMME(repas[i].calories) / besoinsNutritionnels.caloriesQuotidiennes * 100
    
    POUR chaque repas DANS repas:
        repas.calories = repas.calories * (100 / totalPourcentage)
        repas.macros = {
            "lipides": repas.macros.lipides * (100 / totalPourcentage),
            "proteines": repas.macros.proteines * (100 / totalPourcentage),
            "glucides": repas.macros.glucides * (100 / totalPourcentage)
        }
    
    RETOURNER repas
```

### 3. Sélection des aliments et recettes

```pseudo
FONCTION selectionnerAlimentsEtRecettes(repas, utilisateur, baseDonnees):
    planSemaine = []
    
    // Pour chaque jour de la semaine
    POUR jour DE 1 À 7:
        planJour = {
            "date": calculerDate(jourActuel + jour - 1),
            "repas": []
        }
        
        // Initialiser le suivi des aliments utilisés aujourd'hui
        alimentsUtilisesAujourdhui = {}
        
        // Historique des protéines principales pour éviter les répétitions
        proteinesRecentes = obtenirProteinesRecentes(planSemaine, 3)  // Éviter les 3 dernières
        
        // Pour chaque repas de la journée
        POUR chaque repasJour DANS repas:
            planRepas = {
                "nom": repasJour.nom,
                "heure": repasJour.heure,
                "calories": repasJour.calories,
                "macrosObjectif": repasJour.macros,
                "items": []
            }
            
            // Déterminer si on utilise une recette ou des aliments individuels
            // 70% chance d'utiliser une recette pour les repas principaux
            utiliserRecette = (ALEATOIRE() < 0.7) ET (repasJour.nom == "Déjeuner" OU repasJour.nom == "Dîner")
            
            SI utiliserRecette:
                // Filtrer les recettes appropriées
                recettesFiltrees = filtrerRecettes(baseDonnees.recettes, {
                    "isKeto": true,
                    "isAlkaline": utilisateur.regimeType == "keto_alcalin",
                    "caloriesMax": repasJour.calories * 1.1,  // 10% de marge
                    "caloriesMin": repasJour.calories * 0.9,  // 10% de marge
                    "exclureAliments": utilisateur.allergies.concat(utilisateur.preferences.alimentsExclus),
                    "exclureRecettes": planSemaine.recettesUtilisees,  // Éviter les doublons dans la semaine
                    "proteinePrincipale": proteinesRecentes  // Éviter les protéines récemment utilisées
                })
                
                // Prioriser les recettes favorites
                recettesFiltrees = prioriserFavoris(recettesFiltrees, utilisateur.preferences.recettesFavorites)
                
                // Sélectionner une recette aléatoire
                SI recettesFiltrees.longueur > 0:
                    recetteSelectionnee = recettesFiltrees[ALEATOIRE(0, recettesFiltrees.longueur - 1)]
                    
                    // Ajuster les portions pour respecter les objectifs caloriques
                    facteurAjustement = repasJour.calories / recetteSelectionnee.nutritionParPortion.calories
                    
                    // Ajouter la recette au repas
                    planRepas.items.ajouter({
                        "type": "recette",
                        "id": recetteSelectionnee.id,
                        "nom": recetteSelectionnee.nom,
                        "portions": ARRONDIR(facteurAjustement, 1),  // Arrondir à 1 décimale
                        "calories": recetteSelectionnee.nutritionParPortion.calories * facteurAjustement,
                        "macros": {
                            "lipides": recetteSelectionnee.nutritionParPortion.lipides * facteurAjustement,
                            "proteines": recetteSelectionnee.nutritionParPortion.proteines * facteurAjustement,
                            "glucides": recetteSelectionnee.nutritionParPortion.glucidesNets * facteurAjustement
                        },
                        "pHValue": recetteSelectionnee.pHMoyen
                    })
                    
                    // Mémoriser la protéine principale
                    proteinesRecentes.ajouter(recetteSelectionnee.proteinePrincipale)
                SINON:
                    // Si aucune recette ne convient, revenir aux aliments individuels
                    utiliserRecette = false
            
            SI NON utiliserRecette:
                // Composition du repas avec des aliments individuels
                
                // Répartition typique pour un repas keto
                // Protéine: 25-30% des calories
                // Légumes: 10-15% des calories
                // Matières grasses: 55-65% des calories
                
                caloriesProteine = repasJour.calories * 0.28  // 28% des calories
                caloriesLegumes = repasJour.calories * 0.12   // 12% des calories
                caloriesGraisses = repasJour.calories * 0.60  // 60% des calories
                
                // 1. Sélectionner une protéine principale
                proteinesFiltrees = filtrerAliments(baseDonnees.aliments, {
                    "categories": ["viande", "poisson", "oeufs"],
                    "exclure": proteinesRecentes.concat(utilisateur.allergies, utilisateur.preferences.alimentsExclus),
                    "keto": true,
                    "alcalin": utilisateur.regimeType == "keto_alcalin" ? true : null,
                    "saisonnier": utilisateur.preferences.uniquementSaisonnier ? saisonActuelle() : null
                })
                
                // Prioriser les favoris
                proteinesFiltrees = prioriserFavoris(proteinesFiltrees, utilisateur.preferences.alimentsFavoris)
                
                proteineChoisie = proteinesFiltrees[ALEATOIRE(0, proteinesFiltrees.longueur - 1)]
                quantiteProteine = caloriesProteine / (proteineChoisie.nutritionPar100g.calories / 100)
                
                planRepas.items.ajouter({
                    "type": "aliment",
                    "id": proteineChoisie.id,
                    "nom": proteineChoisie.nom,
                    "quantite": ARRONDIR(quantiteProteine),
                    "unite": "g",
                    "calories": proteineChoisie.nutritionPar100g.calories * quantiteProteine / 100,
                    "macros": {
                        "lipides": proteineChoisie.nutritionPar100g.lipides * quantiteProteine / 100,
                        "proteines": proteineChoisie.nutritionPar100g.proteines * quantiteProteine / 100,
                        "glucides": proteineChoisie.nutritionPar100g.glucidesNets * quantiteProteine / 100
                    },
                    "pHValue": proteineChoisie.pHValue
                })
                
                // Enregistrer pour éviter de répéter
                proteinesRecentes.ajouter(proteineChoisie.id)
                alimentsUtilisesAujourdhui[proteineChoisie.id] = true
                
                // 2. Sélectionner des légumes
                legumesFiltres = filtrerAliments(baseDonnees.aliments, {
                    "categories": ["legumes"],
                    "exclure": utilisateur.allergies.concat(utilisateur.preferences.alimentsExclus),
                    "keto": true,
                    "alcalin": utilisateur.regimeType == "keto_alcalin" ? true : null,
                    "saisonnier": utilisateur.preferences.uniquementSaisonnier ? saisonActuelle() : null,
                    "maxGlucidesNets": 5  // Max 5g de glucides nets par 100g
                })
                
                // Prioriser les favoris
                legumesFiltres = prioriserFavoris(legumesFiltres, utilisateur.preferences.alimentsFavoris)
                
                // Sélectionner 1-2 légumes
                nombreLegumes = ALEATOIRE(1, 2)
                legumesChoisis = []
                caloriesParLegume = caloriesLegumes / nombreLegumes
                
                POUR i DE 1 À nombreLegumes:
                    // Éviter de répéter le même légume
                    legumesFiltresUniques = FILTRER legumesFiltres OÙ (item.id NON DANS legumesChoisis)
                    legumeChoisi = legumesFiltresUniques[ALEATOIRE(0, legumesFiltresUniques.longueur - 1)]
                    quantiteLegume = caloriesParLegume / (legumeChoisi.nutritionPar100g.calories / 100)
                    
                    // Minimum 100g de légumes
                    quantiteLegume = MAX(quantiteLegume, 100)
                    
                    planRepas.items.ajouter({
                        "type": "aliment",
                        "id": legumeChoisi.id,
                        "nom": legumeChoisi.nom,
                        "quantite": ARRONDIR(quantiteLegume),
                        "unite": "g",
                        "calories": legumeChoisi.nutritionPar100g.calories * quantiteLegume / 100,
                        "macros": {
                            "lipides": legumeChoisi.nutritionPar100g.lipides * quantiteLegume / 100,
                            "proteines": legumeChoisi.nutritionPar100g.proteines * quantiteLegume / 100,
                            "glucides": legumeChoisi.nutritionPar100g.glucidesNets * quantiteLegume / 100
                        },
                        "pHValue": legumeChoisi.pHValue
                    })
                    
                    legumesChoisis.ajouter(legumeChoisi.id)
                    alimentsUtilisesAujourdhui[legumeChoisi.id] = true
                
                // 3. Sélectionner des matières grasses
                graissesFiltrees = filtrerAliments(baseDonnees.aliments, {
                    "categories": ["matieres_grasses", "noix_graines", "fromages"],
                    "exclure": utilisateur.allergies.concat(utilisateur.preferences.alimentsExclus),
                    "keto": true,
                    "alcalin": utilisateur.regimeType == "keto_alcalin" ? true : null
                })
                
                // Prioriser les favoris
                graissesFiltrees = prioriserFavoris(graissesFiltrees, utilisateur.preferences.alimentsFavoris)
                
                // Sélectionner 1-3 sources de graisses
                nombreGraisses = ALEATOIRE(1, 3)
                graissesChoisies = []
                caloriesParGraisse = caloriesGraisses / nombreGraisses
                
                POUR i DE 1 À nombreGraisses:
                    // Éviter de répéter la même source de graisse
                    graissesFiltreesUniques = FILTRER graissesFiltrees OÙ (item.id NON DANS graissesChoisies)
                    graisseChoisie = graissesFiltreesUniques[ALEATOIRE(0, graissesFiltreesUniques.longueur - 1)]
                    quantiteGraisse = caloriesParGraisse / (graisseChoisie.nutritionPar100g.calories / 100)
                    
                    planRepas.items.ajouter({
                        "type": "aliment",
                        "id": graisseChoisie.id,
                        "nom": graisseChoisie.nom,
                        "quantite": ARRONDIR(quantiteGraisse),
                        "unite": "g",
                        "calories": graisseChoisie.nutritionPar100g.calories * quantiteGraisse / 100,
                        "macros": {
                            "lipides": graisseChoisie.nutritionPar100g.lipides * quantiteGraisse / 100,
                            "proteines": graisseChoisie.nutritionPar100g.proteines * quantiteGraisse / 100,
                            "glucides": graisseChoisie.nutritionPar100g.glucidesNets * quantiteGraisse / 100
                        },
                        "pHValue": graisseChoisie.pHValue
                    })
                    
                    graissesChoisies.ajouter(graisseChoisie.id)
                    alimentsUtilisesAujourdhui[graisseChoisie.id] = true
            
            // Calculer les totaux nutritionnels du repas
            planRepas.totaux = calculerTotauxNutritionnels(planRepas.items)
            
            // Vérifier si les objectifs caloriques et de macros sont respectés
            // Tolérance de ±10% pour les calories et ±15% pour les macros
            SI NON estDansTolerances(planRepas.totaux, repasJour, 10, 15):
                // Ajuster les quantités pour respecter les objectifs
                planRepas.items = ajusterQuantites(planRepas.items, repasJour)
                planRepas.totaux = calculerTotauxNutritionnels(planRepas.items)
            
            // Ajouter le repas à la journée
            planJour.repas.ajouter(planRepas)
        
        // Calculer les totaux nutritionnels de la journée
        planJour.totaux = calculerTotauxJournee(planJour.repas)
        
        // Ajouter la journée au plan de la semaine
        planSemaine.ajouter(planJour)
    
    RETOURNER planSemaine
```

### 4. Génération de la liste de courses

```pseudo
FONCTION genererListeCourses(planSemaine, baseDonnees):
    listeCourses = {}
    
    // Parcourir tous les jours et repas
    POUR chaque jour DANS planSemaine:
        POUR chaque repas DANS jour.repas:
            POUR chaque item DANS repas.items:
                SI item.type == "aliment":
                    // Aliment individuel
                    alimentId = item.id
                    quantite = item.quantite
                    
                    SI alimentId DANS listeCourses:
                        listeCourses[alimentId].quantiteTotale += quantite
                    SINON:
                        aliment = rechercherAliment(baseDonnees, alimentId)
                        listeCourses[alimentId] = {
                            "nom": aliment.nom,
                            "categorie": aliment.categorie,
                            "quantiteTotale": quantite,
                            "unite": aliment.uniteCommune OU "g",
                            "coche": false
                        }
                SINON SI item.type == "recette":
                    // Recette: extraire tous les ingrédients
                    recette = rechercherRecette(baseDonnees, item.id)
                    facteurPortion = item.portions
                    
                    POUR chaque ingredient DANS recette.ingredients:
                        alimentId = ingredient.alimentId
                        quantite = ingredient.quantite * facteurPortion
                        
                        SI alimentId DANS listeCourses:
                            listeCourses[alimentId].quantiteTotale += quantite
                        SINON:
                            aliment = rechercherAliment(baseDonnees, alimentId)
                            listeCourses[alimentId] = {
                                "nom": aliment.nom,
                                "categorie": aliment.categorie,
                                "quantiteTotale": quantite,
                                "unite": ingredient.unite OU aliment.uniteCommune OU "g",
                                "coche": false
                            }
    
    // Convertir les quantités en unités pratiques
    POUR chaque alimentId, item DANS listeCourses:
        aliment = rechercherAliment(baseDonnees, alimentId)
        
        SI item.unite == "g" ET aliment.uniteCommune EXISTE:
            // Convertir en unités usuelles (ex: œufs au lieu de grammes)
            quantiteUnites = item.quantiteTotale / aliment.poidsUniteCommune
            
            // Si le nombre d'unités est assez grand, utiliser cette unité
            SI quantiteUnites >= 0.75:
                item.quantiteTotale = ARRONDIR(quantiteUnites, 1)  // Arrondir à 1 décimale
                item.unite = aliment.nomUnite
    
    // Regrouper par catégorie pour faciliter les courses
    listeCategorisee = {}
    
    POUR chaque alimentId, item DANS listeCourses:
        categorie = item.categorie
        
        SI categorie NON DANS listeCategorisee:
            listeCategorisee[categorie] = []
        
        listeCategorisee[categorie].ajouter({
            "id": alimentId,
            "nom": item.nom,
            "quantite": item.quantiteTotale,
            "unite": item.unite,
            "coche": item.coche
        })
    
    // Trier chaque catégorie par nom d'aliment
    POUR chaque categorie, aliments DANS listeCategorisee:
        listeCategorisee[categorie] = TRIER aliments PAR nom ASC
    
    RETOURNER listeCategorisee
```

### 5. Optimisation et ajustements

```pseudo
FONCTION ajusterQuantites(items, objectifs):
    // Calculer les totaux actuels
    totauxActuels = calculerTotauxNutritionnels(items)
    
    // Calculer les facteurs d'ajustement
    facteurCalories = objectifs.calories / totauxActuels.calories
    facteurLipides = objectifs.macros.lipides / totauxActuels.macros.lipides
    facteurProteines = objectifs.macros.proteines / totauxActuels.macros.proteines
    facteurGlucides = objectifs.macros.glucides / totauxActuels.macros.glucides
    
    // Priorité aux macros keto: d'abord lipides, puis protéines, enfin glucides
    facteurPrincipal = (facteurLipides * 0.7 + facteurProteines * 0.2 + facteurGlucides * 0.1 + facteurCalories) / 2
    
    // Limiter l'ajustement à ±30% pour éviter des changements trop drastiques
    facteurPrincipal = MAX(MIN(facteurPrincipal, 1.3), 0.7)
    
    // Ajuster les quantités de chaque item
    POUR chaque item DANS items:
        item.quantite = item.quantite * facteurPrincipal
        
        // Recalculer les valeurs nutritionnelles
        SI item.type == "aliment":
            aliment = rechercherAliment(baseDonnees, item.id)
            
            item.calories = aliment.nutritionPar100g.calories * item.quantite / 100
            item.macros = {
                "lipides": aliment.nutritionPar100g.lipides * item.quantite / 100,
                "proteines": aliment.nutritionPar100g.proteines * item.quantite / 100,
                "glucides": aliment.nutritionPar100g.glucidesNets * item.quantite / 100
            }
        SINON SI item.type == "recette":
            recette = rechercherRecette(baseDonnees, item.id)
            
            item.calories = recette.nutritionParPortion.calories * item.portions
            item.macros = {
                "lipides": recette.nutritionParPortion.lipides * item.portions,
                "proteines": recette.nutritionParPortion.proteines * item.portions,
                "glucides": recette.nutritionParPortion.glucidesNets * item.portions
            }
    
    RETOURNER items

FONCTION optimiserPlanRepas(planSemaine, utilisateur):
    // Éviter la répétition excessive d'aliments
    frequenceAliments = compterFrequenceAliments(planSemaine)
    
    // Si un aliment apparaît plus de 4 fois dans la semaine, essayer de le remplacer
    POUR chaque alimentId, frequence DANS frequenceAliments:
        SI frequence > 4:
            planSemaine = essayerRemplacerAliment(planSemaine, alimentId, utilisateur)
    
    // Équilibrer le pH moyen pour le régime keto alcalin
    SI utilisateur.regimeType == "keto_alcalin":
        POUR chaque jour DANS planSemaine:
            pHMoyenJour = calculerPHMoyen(jour)
            
            // Objectif: pH moyen > 7.0 pour régime alcalin
            SI pHMoyenJour < 7.0:
                // Essayer d'ajouter plus d'aliments alcalins ou remplacer certains aliments acides
                jour = equilibrerPHJour(jour, utilisateur, baseDonnees)
    
    // Vérifier le respect des contraintes caloriques quotidiennes
    POUR chaque jour DANS planSemaine:
        totalCaloriesJour = jour.totaux.calories
        objectifCalories = utilisateur.objectifCalories
        
        // Si écart > 10%, ajuster
        SI ABS(totalCaloriesJour - objectifCalories) / objectifCalories > 0.1:
            jour = ajusterCaloriesJour(jour, objectifCalories)
    
    RETOURNER planSemaine
```

## Validation et règles métier

Pour garantir la qualité des plans de repas générés, l'algorithme applique plusieurs règles métier et validations:

### Règles pour le régime keto standard

1. **Macronutriments**
   - Lipides: 70-75% des calories totales
   - Protéines: 20-25% des calories totales
   - Glucides nets: 5-10% des calories totales (maximum 50g par jour)

2. **Composition des repas**
   - Chaque repas principal contient au moins une source de protéines
   - Les légumes représentent au moins 15% du volume des repas principaux
   - Maximum 20g de glucides nets par repas

### Règles supplémentaires pour le régime keto alcalin

1. **Équilibre pH**
   - pH moyen des aliments > 7.0
   - Maximum 30% d'aliments acides (pH < 7.0) par repas
   - Minimum 50% d'aliments alcalins (pH > 7.0) par repas

2. **Aliments prioritaires**
   - Légumes verts à feuilles
   - Avocat et huile d'avocat
   - Herbes fraîches
   - Citron et lime (effet alcalinisant malgré leur goût acide)

3. **Aliments à limiter**
   - Viandes rouges (limiter à 3 fois par semaine)
   - Fromages à pâte dure (limiter à 30g par jour)
   - Fruits à faible teneur en glucides mais acides

### Validation et feedback

Chaque plan de repas généré est soumis à une vérification finale pour s'assurer qu'il:

1. Respecte les besoins caloriques de l'utilisateur (±5%)
2. Maintient les ratios de macronutriments keto (±3%)
3. Inclut suffisamment de variété (minimum 15 aliments différents par semaine)
4. Respecte toutes les préférences et restrictions alimentaires
5. Pour le régime keto alcalin, maintient un pH moyen > 7.0

Si certains critères ne sont pas remplis, l'algorithme effectue des ajustements ciblés ou régénère certaines parties du plan jusqu'à obtenir un résultat satisfaisant.