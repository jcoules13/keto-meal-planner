import React from 'react';

// VERSION MINIMALE POUR DEBUG - SI CETTE PAGE NE GÈLE PAS, LE PROBLÈME EST DANS LE CODE ORIGINAL
export default function RecipesPage() {
  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h1>🧪 Page Recettes - VERSION TEST</h1>
      <p>Si vous voyez cette page SANS gel, le problème était dans le code de la page Recettes.</p>
      <p>Navigation fonctionne? Essayez de retourner à Home et revenir ici plusieurs fois.</p>
      <div style={{ marginTop: '30px', padding: '20px', background: '#e8f5e9', borderRadius: '8px' }}>
        <h2>✅ Test réussi!</h2>
        <p>Cette page minimale n'utilise AUCUN context.</p>
        <p>Si elle ne gèle pas, on reconstruira la vraie page étape par étape.</p>
      </div>
    </div>
  );
}
