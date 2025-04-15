import React, { useState, useMemo } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

/**
 * Composant de graphe pour l'évolution du poids
 * 
 * @param {Object} props
 * @param {Array} props.weightHistory - Tableau d'entrées de poids [{date, weight}, ...]
 * @param {number} props.targetWeight - Poids cible en kg
 * @param {number} props.timeRange - Période de temps à afficher en jours (7, 30, 90, 365, 0=tout)
 */
const WeightGraph = ({ weightHistory = [], targetWeight, timeRange = 30 }) => {
  // État pour gérer la période de temps sélectionnée
  const [selectedRange, setSelectedRange] = useState(timeRange);
  
  // Préparer les données pour le graphique
  const chartData = useMemo(() => {
    if (!weightHistory || weightHistory.length === 0) return [];
    
    // Trier les entrées par date (plus ancienne en premier)
    const sortedEntries = [...weightHistory].sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );
    
    // Filtrer selon la période sélectionnée
    const filteredEntries = selectedRange === 0 ? sortedEntries : sortedEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - selectedRange);
      return entryDate >= cutoffDate;
    });
    
    // Formater les données pour Recharts
    return filteredEntries.map(entry => ({
      date: formatDateShort(entry.date),
      originalDate: entry.date, // Conserver la date originale pour l'utiliser dans le tooltip
      weight: entry.weight,
    }));
  }, [weightHistory, selectedRange]);
  
  // Calculer les limites pour les axes
  const yAxisDomain = useMemo(() => {
    if (chartData.length === 0) return [50, 100]; // Valeurs par défaut
    
    // Trouver les valeurs min et max
    let min = Math.min(...chartData.map(entry => entry.weight));
    let max = Math.max(...chartData.map(entry => entry.weight));
    
    // Inclure le poids cible dans les limites si nécessaire
    if (targetWeight) {
      min = Math.min(min, targetWeight);
      max = Math.max(max, targetWeight);
    }
    
    // Ajouter une marge de 5% au-dessus et en-dessous
    const padding = (max - min) * 0.05;
    return [Math.max(0, min - padding), max + padding];
  }, [chartData, targetWeight]);
  
  // Fonction pour formater les dates pour l'affichage
  function formatDateShort(dateString) {
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  }
  
  // Fonction pour formater les dates dans le tooltip
  function formatDateLong(dateString) {
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  }
  
  // Style personnalisé pour le tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-neutral-800 p-2 border border-neutral-200 dark:border-neutral-700 rounded shadow">
          <p className="font-medium">{formatDateLong(data.originalDate)}</p>
          <p className="text-primary-600 dark:text-primary-400">
            {data.weight} kg
          </p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="card bg-white dark:bg-neutral-800 p-4 shadow-md rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-title font-semibold">Évolution du poids</h3>
        
        <div className="flex space-x-1 text-sm">
          <button 
            onClick={() => setSelectedRange(7)} 
            className={`px-2 py-1 rounded ${
              selectedRange === 7 
                ? 'bg-primary-600 text-white' 
                : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300'
            }`}
          >
            7j
          </button>
          <button 
            onClick={() => setSelectedRange(30)} 
            className={`px-2 py-1 rounded ${
              selectedRange === 30 
                ? 'bg-primary-600 text-white' 
                : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300'
            }`}
          >
            30j
          </button>
          <button 
            onClick={() => setSelectedRange(90)} 
            className={`px-2 py-1 rounded ${
              selectedRange === 90 
                ? 'bg-primary-600 text-white' 
                : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300'
            }`}
          >
            3m
          </button>
          <button 
            onClick={() => setSelectedRange(365)} 
            className={`px-2 py-1 rounded ${
              selectedRange === 365 
                ? 'bg-primary-600 text-white' 
                : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300'
            }`}
          >
            1a
          </button>
          <button 
            onClick={() => setSelectedRange(0)} 
            className={`px-2 py-1 rounded ${
              selectedRange === 0 
                ? 'bg-primary-600 text-white' 
                : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300'
            }`}
          >
            Tout
          </button>
        </div>
      </div>
      
      {weightHistory.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <p className="text-neutral-600 dark:text-neutral-400 mb-2">
            Aucune donnée de poids disponible.
          </p>
          <p className="text-sm text-neutral-500 dark:text-neutral-500">
            Commencez à enregistrer votre poids pour voir son évolution.
          </p>
        </div>
      ) : (
        <div className="h-64 sm:h-72 md:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#525252" opacity={0.2} />
              <XAxis 
                dataKey="date" 
                stroke="#737373"
                tickLine={false}
                axisLine={false}
                dy={10}
                tick={{ fill: '#737373', fontSize: 12 }}
              />
              <YAxis 
                domain={yAxisDomain}
                stroke="#737373"
                tickLine={false}
                axisLine={false}
                width={40}
                tick={{ fill: '#737373', fontSize: 12 }}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="weight"
                name="Poids (kg)"
                stroke="#16a34a"
                strokeWidth={2}
                dot={{ stroke: '#16a34a', strokeWidth: 2, r: 4, fill: 'white' }}
                activeDot={{ stroke: '#16a34a', strokeWidth: 2, r: 6, fill: 'white' }}
              />
              {targetWeight && (
                <ReferenceLine 
                  y={targetWeight} 
                  stroke="#ef4444" 
                  strokeDasharray="3 3" 
                  label={{ 
                    value: `Objectif: ${targetWeight} kg`, 
                    position: 'left',
                    fill: '#ef4444',
                    fontSize: 12
                  }} 
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default WeightGraph;