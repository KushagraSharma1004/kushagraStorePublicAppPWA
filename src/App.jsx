import React, { useState, useEffect } from 'react';
import {
  collection,
  getDocs,
  getFirestore,
} from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import './main.css';

function App() {
  const firebaseConfig = {
    apiKey: "AIzaSyDDysDetkW22iKllrT-ThOC0yxcu7N8Gd8",
    authDomain: "kushagrastore-b983c.firebaseapp.com",
    projectId: "kushagrastore-b983c",
    storageBucket: "kushagrastore-b983c.firebasestorage.app",
    messagingSenderId: "597443297424",
    appId: "1:597443297424:web:3a3984e0b44c8cd92f1815",
    measurementId: "G-YQGS3B9GMM",
  };

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  const [search, setSearch] = useState('');
  const [items, setItems] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [showQuantityControls, setShowQuantityControls] = useState({});

  useEffect(() => {
    const fetchItems = async () => {
      const querySnapshot = await getDocs(collection(db, 'items'));
      const fetchedItems = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setItems(fetchedItems);

      // Load quantities and visibility from localStorage
      const savedQuantities = JSON.parse(localStorage.getItem('quantities')) || {};
      const savedVisibility = Object.fromEntries(
        Object.entries(savedQuantities).map(([key, value]) => [key, value > 0])
      );

      setQuantities(savedQuantities);
      setShowQuantityControls(savedVisibility);
    };
    fetchItems();
  }, []);

  const handleQuantityChange = (key, value) => {
    const newQuantity = Math.max(0, (quantities[key] || 0) + value);

    // Update state and localStorage
    const updatedQuantities = { ...quantities, [key]: newQuantity };
    setQuantities(updatedQuantities);
    localStorage.setItem('quantities', JSON.stringify(updatedQuantities));

    // Toggle visibility
    const updatedVisibility = { ...showQuantityControls, [key]: newQuantity > 0 };
    setShowQuantityControls(updatedVisibility);
  };

  const handleAddClick = (key) => {
    // Set default quantity to 1
    const updatedQuantities = { ...quantities, [key]: 1 };
    setQuantities(updatedQuantities);
    localStorage.setItem('quantities', JSON.stringify(updatedQuantities));

    // Update visibility
    const updatedVisibility = { ...showQuantityControls, [key]: true };
    setShowQuantityControls(updatedVisibility);
  };

  const highlightMatch = (text, query) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, `<span style="color: blue; font-weight: bold;">$1</span>`);
  };

  const filteredItems = items
  .filter((item) => item.name.toLowerCase().includes(search.toLowerCase()))
  .sort((a, b) => a.name.localeCompare(b.name));

  const fullTotalPrice = items.reduce((sum, item) => {
    return sum + item.prices.reduce((priceSum, priceOption, idx) => {
      const key = `${item.id}-${idx}`;
      const currentQuantity = quantities[key] || 0;
      return priceSum + priceOption.sellingPrice * currentQuantity;
    }, 0);
  }, 0);

  const resetQuantity = () => {
    setQuantities({});
    setShowQuantityControls({});
    localStorage.removeItem('quantities');
  }

  return (
    <div
      style={{
        padding: '10px',
        paddingTop: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        maxWidth: '100%',
        backgroundColor:'white'
      }}
    >
      <div
        style={{
          position: 'fixed',
          backgroundColor: 'white',
          padding: 8,
          paddingTop: 5,
          width: '100vw',
          display: 'flex',
          justifyContent: 'center',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '90%',
          }}
        >
          <h1 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>Item List</h1>
        </div>
        <div onClick={resetQuantity} style={{padding:7, backgroundColor:'red', color:'white', position:'absolute', top:2, right:20, borderRadius:5, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'}} >Reset All</div> 
        <input
          type="text"
          placeholder="Search items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: '5px',
            width: '85%',
            fontSize: '14px',
            height: 30,
          }}
        />
      </div>
      <table
        border="1"
        cellPadding="5"
        style={{
          width: '100%',
          textAlign: 'center',
          fontSize: '12px',
          marginBottom: '10px',
          marginTop: 90,
          border: 'none',
        }}
      >
        <thead>
          <tr style={{ position: 'sticky', top: 85, backgroundColor: '#fff', zIndex: 5 }}>
            <th>No</th>
            <th>Name</th>
            <th>MRP</th>
            <th>Qty</th>
            <th>SP</th>
            <th>Qty Ctrl</th>
            <div style={{boxShadow: '0px 10px 10px rgba(0, 0, 0, 0.3)', borderRadius:5, backgroundColor:'black', display:'flex', alignItems:'center', justifyContent:'center'}} >
            <th style={{backgroundColor:'black', color:'white', borderRadius:5, fontSize:16, border:'none'}} >{fullTotalPrice}</th>
            </div>
          </tr>
        </thead>
        <tbody>
          {filteredItems.map((item, index) => (
            <React.Fragment key={item.id}>
              {item.prices.map((priceOption, idx) => {
                const key = `${item.id}-${idx}`;
                const currentQuantity = quantities[key] || 0;
                const totalPrice = priceOption.sellingPrice * currentQuantity;

                return (
                  <tr style={{ backgroundColor: 'white' }} key={key}>
                    <td>{idx === 0 ? index + 1 : ''}</td>
                    <td
                      dangerouslySetInnerHTML={{
                        __html: idx === 0 ? highlightMatch(item.name, search) : '',
                      }}
                    />
                    <td>{priceOption.mrp}</td>
                    <td>{priceOption.quantity}</td>
                    <td>
                      <span
                        style={{
                          boxShadow: '0px 10px 10px rgba(0, 0, 0, 0.3)',
                          padding: 5,
                          borderRadius: 5,
                          color: 'blue',
                        }}
                      >
                        {priceOption.sellingPrice}
                      </span>
                    </td>
                    <td
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 2,
                      }}
                    >
                      {showQuantityControls[key] ? (
                        <div style={{ display: 'flex', gap: '2px', alignItems:'center', justifyContent:'center' }}>
                          <button style={{backgroundColor:'red', color:'white', borderRadius:5, borderColor:'red'}} onClick={() => handleQuantityChange(key, -1)}>-</button>
                          <span>{currentQuantity}</span>
                          <button style={{backgroundColor:'green', color:'white', borderRadius:5, borderColor:'green'}} onClick={() => handleQuantityChange(key, 1)}>+</button>
                        </div>
                      ) : (
                        <button style={{backgroundColor:'blue', color:'white', borderRadius:5, border:'none', padding:5}} onClick={() => handleAddClick(key)}>Add</button>
                      )}
                    </td>
                    {showQuantityControls[key] ? <td style={{backgroundColor:'black', color:'white', borderRadius:5}} >{totalPrice === 0 ? '' : totalPrice}</td> : <td>{totalPrice === 0 ? '' : totalPrice}</td>}
                    
                  </tr>
                );
              })}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;