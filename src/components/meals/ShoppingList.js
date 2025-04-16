import React, { useState, useEffect } from 'react';
import './ShoppingList.css';

const ShoppingList = ({ shoppingList }) => {
  const [checkedItems, setCheckedItems] = useState(() => {
    const storedCheckedItems = localStorage.getItem('checkedShoppingItems');
    return storedCheckedItems ? JSON.parse(storedCheckedItems) : {};
  });

  useEffect(() => {
    localStorage.setItem('checkedShoppingItems', JSON.stringify(checkedItems));
  }, [checkedItems]);

  const handleCheckboxChange = (itemId) => {
    setCheckedItems(prevCheckedItems => ({
      ...prevCheckedItems,
      [itemId]: !prevCheckedItems[itemId],
    }));
  };

  const groupedItems = {};
  if (shoppingList) {
    shoppingList.forEach(item => {
      const category = item.category || 'Uncategorized';
      if (!groupedItems[category]) {
        groupedItems[category] = [];
      }
      groupedItems[category].push(item);
    });
  }

  return (
    <div className="shopping-list">
      {Object.keys(groupedItems).length > 0 ? (
        Object.keys(groupedItems).map(category => (
          <div key={category} className="shopping-category">
            <h3 className="category-title">{category}</h3>
            <ul className="category-items">
              {groupedItems[category].map(item => (
                <li key={item.id} className="shopping-item">
                  <input
                    type="checkbox"
                    id={`item-${item.id}`}
                    checked={checkedItems[item.id] || false}
                    onChange={() => handleCheckboxChange(item.id)}
                  />
                  <label htmlFor={`item-${item.id}`} className={checkedItems[item.id] ? 'checked' : ''}>{item.name}</label>
                </li>
              ))}
            </ul>
          </div>
        ))
      ) : (
        <p>No items in the shopping list.</p>
      )}
    }
};

export default ShoppingList;
```
```css
/* ShoppingList.css */
.shopping-list {
    font-family: sans-serif;
    padding: 20px;
    background-color: #f4f4f4;
    border-radius: 5px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .shopping-list h2 {
    color: #333;
    margin-bottom: 20px;
  }
  
  .shopping-list-category {
    margin-bottom: 20px;
  }
  
  .shopping-list-category h3 {
    color: #555;
    border-bottom: 1px solid #ddd;
    padding-bottom: 5px;
    margin-bottom: 10px;
  }
  
  .shopping-list-item {
    list-style: none;
    margin-bottom: 5px;
  }
  
  .shopping-list-item label {
    margin-left: 10px;
    color: #666;
  }
  
  .shopping-list-item input[type="checkbox"] {
    cursor: pointer;
  }