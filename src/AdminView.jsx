import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, limit } from "firebase/firestore";

const AdminView = ({ onBack }) => {
  const [stats, setStats] = useState({ totalBooks: 0, totalUsers: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGlobalStats = async () => {
      try {
        const booksSnap = await getDocs(collection(db, "books"));
        // Note: For a real large app, you'd use a counter, but this works for now!
        setStats({
          totalBooks: booksSnap.size,
          totalUsers: "Check Firebase Auth" 
        });
        setLoading(false);
      } catch (err) {
        console.error(err);
      }
    };
    fetchGlobalStats();
  }, []);

  return (
    <div className="admin-panel" style={{ padding: '20px', color: 'white' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>👑 Admin Dashboard</h2>
        <button onClick={onBack}>Back to Library</button>
      </header>

      <div className="analytics-container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
        <div className="stat-card" style={{ background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '15px' }}>
          <h4>{stats.totalBooks}</h4>
          <p>Global Books Tracked</p>
        </div>
        <div className="stat-card" style={{ background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '15px' }}>
          <h4>Active</h4>
          <p>System Status</p>
        </div>
      </div>

      <div style={{ marginTop: '30px', padding: '20px', background: 'rgba(0,0,0,0.2)', borderRadius: '10px' }}>
        <h3>System Tools</h3>
        <button style={{ background: '#ff4444', width: '100%', marginTop: '10px' }}>
          🚨 Broadcast Maintenance Alert
        </button>
      </div>
    </div>
  );
};

export default AdminView;