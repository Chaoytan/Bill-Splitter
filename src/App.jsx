import { useState } from 'react';
import './App.css';
import appLogo from './assets/bill-logo-bg.png';

export default function BillSplitter() {
  const [totalBefore, setTotalBefore] = useState('');
  const [totalAfter, setTotalAfter] = useState('');
  const [newName, setNewName] = useState('');

  const [people, setPeople] = useState([]);
  const [sharedItems, setSharedItems] = useState([]);

  // --- NEW: State to track if we've calculated and what the sum is ---
  const [hasCalculated, setHasCalculated] = useState(false);
  const [calculatedTotal, setCalculatedTotal] = useState(0);

  const evaluateMath = (expression) => {
    try {
      const safeExpression = String(expression).replace(/[^0-9\.\+\-\*\/\(\)\s]/g, '');
      return safeExpression ? eval(safeExpression) : 0;
    } catch (e) {
      return 0;
    }
  };

  const handleAddPerson = (e) => {
    if (e.key === 'Enter' && newName.trim() !== '') {
      e.preventDefault();
      const newPerson = { id: Date.now(), name: newName.trim(), items: '', owed: 0 };
      setPeople([...people, newPerson]);
      setNewName('');
      setHasCalculated(false); // Hide validation if things change
    }
  };

  const handleRemovePerson = (idToRemove) => {
    setPeople(people.filter(person => person.id !== idToRemove));
    setSharedItems(sharedItems.map(item => ({
      ...item,
      splitBetween: item.splitBetween.filter(pid => pid !== idToRemove)
    })));
    setHasCalculated(false);
  };

  const handleItemChange = (id, value) => {
    setPeople(people.map(person => person.id === id ? { ...person, items: value } : person));
    setHasCalculated(false);
  };

  const handleAddSharedItem = () => {
    setSharedItems([...sharedItems, { id: Date.now(), amount: '', splitBetween: [] }]);
    setHasCalculated(false);
  };

  const handleRemoveSharedItem = (idToRemove) => {
    setSharedItems(sharedItems.filter(item => item.id !== idToRemove));
    setHasCalculated(false);
  };

  const handleSharedAmountChange = (id, value) => {
    setSharedItems(sharedItems.map(item => item.id === id ? { ...item, amount: value } : item));
    setHasCalculated(false);
  };

  const togglePersonInShared = (itemId, personId) => {
    setSharedItems(sharedItems.map(item => {
      if (item.id === itemId) {
        const isSharing = item.splitBetween.includes(personId);
        return {
          ...item,
          splitBetween: isSharing
              ? item.splitBetween.filter(id => id !== personId)
              : [...item.splitBetween, personId]
        };
      }
      return item;
    }));
    setHasCalculated(false);
  };

  const calculateSplits = () => {
    const beforeNum = parseFloat(totalBefore);
    const afterNum = parseFloat(totalAfter);

    if (!beforeNum || !afterNum) {
      alert("Please enter the Subtotal and Total first!");
      return;
    }

    let sharedExtras = {};
    people.forEach(p => sharedExtras[p.id] = 0);

    sharedItems.forEach(item => {
      if (item.splitBetween.length > 0) {
        const itemCost = evaluateMath(item.amount);
        const splitCost = itemCost / item.splitBetween.length;

        item.splitBetween.forEach(personId => {
          if (sharedExtras[personId] !== undefined) {
            sharedExtras[personId] += splitCost;
          }
        });
      }
    });

    let currentCalculatedTotal = 0;

    const updatedPeople = people.map(person => {
      const personalGross = evaluateMath(person.items);
      const totalGross = personalGross + sharedExtras[person.id];

      const calculatedOwed = (totalGross / beforeNum) * afterNum;
      const finalOwed = calculatedOwed >= 0 ? calculatedOwed : 0;

      currentCalculatedTotal += finalOwed; // Add to our running total

      return { ...person, owed: finalOwed };
    });

    setPeople(updatedPeople);

    // --- NEW: Save the total and show the validation box ---
    setCalculatedTotal(currentCalculatedTotal);
    setHasCalculated(true);
  };

  // Helper to determine if the totals match (allowing a 5 cent margin for rounding differences)
  const difference = Math.abs(calculatedTotal - parseFloat(totalAfter || 0));
  const isMatch = difference <= 0.05;

  return (
      <div className="app-container">
        <header className="header-section">
          <img src={appLogo} alt="Bill Splitter Logo" className="app-logo" />
          <h1 className="header-title">Bill Splitter</h1>
        </header>

        <main className="card">

          <div className="bill-section">
            <div className="input-group">
              <label>Subtotal</label>
              <input
                  type="number"
                  value={totalBefore}
                  onChange={(e) => { setTotalBefore(e.target.value); setHasCalculated(false); }}
                  placeholder="0.00"
                  inputMode="decimal"
              />
            </div>
            <div className="input-group">
              <label>Total</label>
              <input
                  type="number"
                  value={totalAfter}
                  onChange={(e) => { setTotalAfter(e.target.value); setHasCalculated(false); }}
                  placeholder="0.00"
                  inputMode="decimal"
              />
            </div>
          </div>

          <hr className="divider" />

          <div className="input-group">
            <label>Add People</label>
            <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={handleAddPerson}
                placeholder="Type name & press Enter"
            />
          </div>

          {people.length > 1 && (
              <div className="shared-section">
                <div className="shared-header-row">
                  <label>Shared Items</label>
                  <button className="add-shared-btn" onClick={handleAddSharedItem}>+ Add Shared</button>
                </div>
                {sharedItems.map(item => (
                    <div key={item.id} className="shared-item-card">
                      <div className="shared-input-row">
                        <input
                            type="text"
                            value={item.amount}
                            onChange={(e) => handleSharedAmountChange(item.id, e.target.value)}
                            placeholder="Price (e.g. 25.50)"
                            className="items-input"
                        />
                        <button onClick={() => handleRemoveSharedItem(item.id)} className="remove-btn">×</button>
                      </div>
                      <div className="shared-toggles">
                        {people.map(person => (
                            <button
                                key={person.id}
                                className={`toggle-chip ${item.splitBetween.includes(person.id) ? 'active' : ''}`}
                                onClick={() => togglePersonInShared(item.id, person.id)}
                            >
                              {person.name}
                            </button>
                        ))}
                      </div>
                    </div>
                ))}
              </div>
          )}

          {people.length > 0 && (
              <div className="people-container">
                <label>Personal Items</label>
                {people.map((person) => (
                    <div key={person.id} className="person-row">
                      <div className="person-header">
                        <strong>{person.name}</strong>
                        <button onClick={() => handleRemovePerson(person.id)} className="remove-btn">×</button>
                      </div>
                      <div className="person-inputs">
                        <input
                            type="text"
                            value={person.items}
                            onChange={(e) => handleItemChange(person.id, e.target.value)}
                            placeholder="Items (e.g. 15 + 4.50)"
                            className="items-input"
                        />
                        <div className="person-total">
                          RM {person.owed.toFixed(2)}
                        </div>
                      </div>
                    </div>
                ))}
              </div>
          )}

          {people.length > 0 && (
              <button className="calculate-btn" onClick={calculateSplits}>
                Calculate Splits
              </button>
          )}

          {/* --- NEW: Validation Check Box --- */}
          {hasCalculated && (
              <div className={`validation-box ${isMatch ? 'success' : 'error'}`}>
                <div className="validation-row">
                  <span>Target Total:</span>
                  <strong>RM {parseFloat(totalAfter || 0).toFixed(2)}</strong>
                </div>
                <div className="validation-row">
                  <span>Portions Total:</span>
                  <strong>RM {calculatedTotal.toFixed(2)}</strong>
                </div>

                {isMatch ? (
                    <div className="validation-message">
                      ✅ Perfect match!
                    </div>
                ) : (
                    <div className="validation-message">
                      ⚠️ Off by RM {difference.toFixed(2)}. Check your item prices!
                    </div>
                )}
              </div>
          )}

        </main>
      </div>
  );
}