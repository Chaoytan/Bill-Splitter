import { useState } from 'react';
import './App.css';
// --- NEW: Import the logo from your assets folder ---
import appLogo from './assets/bill-logo-bg.png';

export default function BillSplitter() {
  const [totalBefore, setTotalBefore] = useState('');
  const [totalAfter, setTotalAfter] = useState('');
  const [newName, setNewName] = useState('');

  const [people, setPeople] = useState([]);

  // Function to add a new person
  const handleAddPerson = (e) => {
    if (e.key === 'Enter' && newName.trim() !== '') {
      e.preventDefault();
      const newPerson = {
        id: Date.now(),
        name: newName.trim(),
        items: '',
        owed: 0
      };
      setPeople([...people, newPerson]);
      setNewName('');
    }
  };

  // Function to remove a person
  const handleRemovePerson = (idToRemove) => {
    setPeople(people.filter(person => person.id !== idToRemove));
  };

  // Function to update items for a person
  const handleItemChange = (id, value) => {
    setPeople(people.map(person =>
        person.id === id ? { ...person, items: value } : person
    ));
  };

  // The main calculation function
  const calculateSplits = () => {
    const beforeNum = parseFloat(totalBefore);
    const afterNum = parseFloat(totalAfter);

    if (!beforeNum || !afterNum) {
      alert("Please enter the Total Before and Total After tax first!");
      return;
    }

    const updatedPeople = people.map(person => {
      let gross = 0;
      try {
        const safeExpression = person.items.replace(/[^0-9\.\+\-\*\/\(\)\s]/g, '');
        if (safeExpression) {
          gross = eval(safeExpression);
        }
      } catch (e) {
        gross = 0;
      }

      // Your original formula
      const calculatedOwed = (gross / beforeNum) * afterNum;

      return {
        ...person,
        owed: calculatedOwed >= 0 ? calculatedOwed : 0
      };
    });

    setPeople(updatedPeople);
  };

  return (
      <div className="app-container">
        {/* --- UPDATED HEADER WITH LOGO --- */}
        <header className="header-section">
          <img src={appLogo} alt="Fair Share Logo" className="app-logo" />
          <h1 className="header-title">Bill Splitter</h1>
        </header>

        <main className="card">

          {/* Main Bill Section */}
          <div className="bill-section">
            <div className="input-group">
              <label>Total Before Tax</label>
              <input
                  type="number"
                  value={totalBefore}
                  onChange={(e) => setTotalBefore(e.target.value)}
                  placeholder="0.00"
                  inputMode="decimal"
              />
            </div>
            <div className="input-group">
              <label>Total After Tax</label>
              <input
                  type="number"
                  value={totalAfter}
                  onChange={(e) => setTotalAfter(e.target.value)}
                  placeholder="0.00"
                  inputMode="decimal"
              />
            </div>
          </div>

          <hr className="divider" />

          {/* Add People Section */}
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

          {/* People List & Individual Items */}
          {people.length > 0 && (
              <div className="people-container">
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

          {/* Calculate Button */}
          {people.length > 0 && (
              <button className="calculate-btn" onClick={calculateSplits}>
                Calculate Splits
              </button>
          )}

        </main>
      </div>
  );
}