import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase'; 
import { onAuthStateChanged, signOut } from "firebase/auth";
import { 
  collection, query, where, orderBy, onSnapshot, 
  addDoc, deleteDoc, doc, updateDoc, getDoc 
} from "firebase/firestore";
import AuthView from './components/AuthView';
import AdminView from './components/AdminView';

function App() {
  const [bookToDelete, setBookToDelete] = useState(null); 
  const [showTrash, setShowTrash] = useState(false);     // To show the deleted books list
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [newBook, setNewBook] = useState({ title: "", author: "" });
  const [bookToEdit, setBookToEdit] = useState(null); 
  const [editForm, setEditForm] = useState({ title: "", author: "" });
  const [bookToPermanentDelete, setBookToPermanentDelete] = useState(null);
  const totalBooks = books.filter(b => !b.isDeleted).length;
  const readBooks = books.filter(b => !b.isDeleted && b.isRead).length;
  const unreadBooks = totalBooks - readBooks;
  const completionRate = totalBooks > 0 ? Math.round((readBooks / totalBooks) * 100) : 0;
  const [view, setView] = useState("library"); 

 useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        try {
          // Look for the document in your "users" collection
          const userRef = doc(db, "users", currentUser.uid);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists() && userSnap.data().isAdmin === true) {
            console.log("Admin detected!"); // This helps us debug
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        } catch (err) {
          console.error("Admin check failed:", err);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    });
    return () => unsubscribe();
  }, []);
  // --- CUSTOM EDIT LOGIC ---
const handleOpenEdit = (book) => {
  setBookToEdit(book);
  setEditForm({ title: book.title, author: book.author });
};

const handleSaveEdit = async () => {
  try {
    await updateDoc(doc(db, "books", bookToEdit.id), {
      title: editForm.title.trim(),
      author: editForm.author.trim()
    });
    setBookToEdit(null);
  } catch (err) {
    alert("Error: " + err.message);
  }
};

// --- PERMANENT DELETE LOGIC ---
const handleFinalDelete = async () => {
  try {
    await deleteDoc(doc(db, "books", bookToPermanentDelete));
    setBookToPermanentDelete(null);
  } catch (err) {
    alert("Error: " + err.message);
  }
};

  const handleAddBook = async () => {
    if (!newBook.title || !newBook.author) return alert("Fill all fields");
    try {
      await addDoc(collection(db, "books"), {
        userId: user.uid,
        title: newBook.title,
        author: newBook.author,
        isRead: false,
        isDeleted: false,
        createdAt: new Date()
      });
      setNewBook({ title: "", author: "" });
      setShowModal(false);
    } catch (err) {
      alert("Error adding book: " + err.message);
    }
  };

const handleSoftDelete = async () => {
  if (!bookToDelete) return;
  try {
    await updateDoc(doc(db, "books", bookToDelete), {
      isDeleted: true,
      deletedAt: new Date()
    });
    setBookToDelete(null); 
  } catch (err) {
    alert("Error moving to trash: " + err.message);
  }
};

// --- PERMANENT DELETE LOGIC ---
const handlePermanentDelete = async (id) => {
  // Always good to have a second confirmation for permanent actions
  if (!window.confirm("This will delete the book forever. Are you sure?")) return;
  try {
    await deleteDoc(doc(db, "books", id));
  } catch (err) {
    alert("Error deleting permanently: " + err.message);
  }
};

  const filteredBooks = books.filter(b => 
    !b.isDeleted && ( 
      b.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      b.author.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

 
// 1. If not logged in, show Auth
  if (!user) return <AuthView />;

  // 2. If view is admin, show Admin Panel
  if (view === "admin") {
    return <AdminView onBack={() => setView("library")} />;
  }

  return (
    <div id="app">
      <header className="header-bar">
        <h2>📚 MyBookTracker</h2>
        <div style={{ position: 'relative' }}>
          <button id="menu-btn" onClick={() => setShowMenu(!showMenu)}>☰</button>
          {showMenu && (
            <div id="dropdown-menu" style={{ display: 'block' }}>
              <div className="menu-user-info">{user.displayName}</div>
              
              {/* Only show if isAdmin state is true */}
              {isAdmin && (
                <button onClick={() => { setView("admin"); setShowMenu(false); }}>
                  👑 Admin Panel
                </button>
              )}

              <button onClick={() => { setShowTrash(true); setShowMenu(false); }}>
                  🗑️ Recently Deleted
              </button>
              <button onClick={() => signOut(auth)}>Logout</button>
            </div>
          )}
        </div>
      </header>

      <div className="dashboard-controls">
        <h3>Your Collection ({books.length})</h3>
        <div className="progress-section" style={{ margin: '15px 10px 25px 10px' }}>
  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
    <span style={{ color: 'var(--text-muted)' }}>Library Completion</span>
    <span style={{ fontWeight: 'bold', color: 'var(--accent-color)' }}>{completionRate}%</span>
  </div>
  
  {/* The Background Bar */}
  <div style={{ 
    width: '100%', 
    background: 'rgba(0,0,0,0.05)', 
    borderRadius: '20px', 
    height: '12px',
    overflow: 'hidden',
    border: '1px solid rgba(0,0,0,0.03)'
  }}>
    {/* The actual Progress Fill */}
    <div style={{ 
      width: `${completionRate}%`, 
      background: 'linear-gradient(90deg, #6366f1, #a855f7)', 
      height: '100%', 
      borderRadius: '20px',
      transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: '0 0 10px rgba(168, 85, 247, 0.4)'
    }}></div>
  </div>
</div>
        <div className="search-container">
          <input 
            type="text" 
            placeholder="Search by title or author..." 
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* ANALYTICS SECTION */}
<div className="analytics-container" style={{
  display: 'grid', 
  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
  gap: '15px', 
  marginBottom: '20px',
  padding: '10px'
}}>
  <div className="stat-card" style={{ background: 'var(--card-bg)', padding: '15px', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
    <span style={{ fontSize: '1.5rem' }}>📚</span>
    <h4 style={{ margin: '5px 0' }}>{totalBooks}</h4>
    <small style={{ color: 'var(--text-muted)' }}>Total Books</small>
  </div>

  <div className="stat-card" style={{ background: 'var(--card-bg)', padding: '15px', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
    <span style={{ fontSize: '1.5rem' }}>✅</span>
    <h4 style={{ margin: '5px 0' }}>{readBooks}</h4>
    <small style={{ color: 'var(--text-muted)' }}>Completed</small>
  </div>

  <div className="stat-card" style={{ background: 'var(--card-bg)', padding: '15px', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
    <span style={{ fontSize: '1.5rem' }}>⏳</span>
    <h4 style={{ margin: '5px 0' }}>{unreadBooks}</h4>
    <small style={{ color: 'var(--text-muted)' }}>To Read</small>
  </div>

  <div className="stat-card" style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', padding: '15px', borderRadius: '12px', textAlign: 'center', color: 'white' }}>
    <span style={{ fontSize: '1.5rem' }}>📈</span>
    <h4 style={{ margin: '5px 0' }}>{completionRate}%</h4>
    <small style={{ opacity: 0.8 }}>Finish Rate</small>
  </div>

</div>

      <div id="book-list">
        {filteredBooks.map(book => (
          <div key={book.id} className="book-card">
            <div className="book-info">
              <strong>{book.title}</strong><br/>
              <small>by {book.author}</small>
            </div>
            <div className="btn-group">
              <button 
                className={book.isRead ? "btn-read" : "btn-unread"}
                onClick={() => updateDoc(doc(db, "books", book.id), { isRead: !book.isRead })}
              >
                {book.isRead ? "✅ Read" : "📖 Mark Read"}
              </button>
              
              <button className="btn-edit" onClick={() => handleOpenEdit(book)}>
                 Edit
              </button>

              <button className="btn-delete" onClick={() => setBookToDelete(book.id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <button className="fab" onClick={() => setShowModal(true)}>+</button>

      {showModal && (
        <div className="modal" style={{ display: 'block' }}>
          <div className="modal-content">
            <span className="close-modal" onClick={() => setShowModal(false)}>&times;</span>
            <h3>Add a New Book</h3>
            <input 
              type="text" 
              placeholder="Book Title" 
              value={newBook.title}
              onChange={(e) => setNewBook({...newBook, title: e.target.value})}
            />
            <input 
              type="text" 
              placeholder="Author" 
              value={newBook.author}
              onChange={(e) => setNewBook({...newBook, author: e.target.value})}
            />
            <button id="add-book-btn" onClick={handleAddBook}>Save to Library</button>
          </div>
        </div>
      )}

      {bookToDelete && (
  <div className="modal" style={{ display: 'block' }}>
    <div className="modal-content">
      <h3>Delete Book?</h3>
      <p>Are you sure you want to move this book to the trash?</p>
      <div className="btn-group">
        <button onClick={() => setBookToDelete(null)}>Cancel</button>
        <button className="btn-delete" onClick={handleSoftDelete}>Yes, Delete</button>
      </div>
    </div>
  </div>
)}

  {showTrash && (
  <div className="modal" style={{ display: 'block' }}>
    <div className="modal-content" style={{ maxWidth: '600px' }}>
      <span className="close-modal" onClick={() => setShowTrash(false)}>&times;</span>
      <h3>Recently Deleted</h3>
      
      {/* This div handles the scrolling */}
      <div id="trash-list" style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '10px' }}>
        {books.filter(b => b.isDeleted).map(book => (
          <div key={book.id} className="book-card" style={{ marginBottom: '10px', minHeight: 'auto', padding: '15px' }}>
            <div className="book-info" style={{ marginBottom: '10px' }}>
              <strong>{book.title}</strong><br/>
              <small>by {book.author}</small>
            </div>
            
            <div className="btn-group">
              {/* Restore Button */}
              <button 
                className="btn-read" 
                style={{ flex: 2 }}
                onClick={() => updateDoc(doc(db, "books", book.id), { isDeleted: false })}
              >
                🔄 Restore
              </button>

              {/* Permanent Delete Button */}
              <button 
                  className="btn-delete" 
                    style={{ flex: 1, fontSize: '0.75rem' }} 
                    onClick={() => setBookToPermanentDelete(book.id)} >
                      🗑️ Delete </button>
            </div>
          </div>
        ))}
        
        {/* Shows if nothing is deleted */}
        {books.filter(b => b.isDeleted).length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Trash is empty!</p>
        )}
      </div>
    </div>
  </div>
)}

{/* CUSTOM EDIT MODAL */}
{bookToEdit && (
  <div className="modal" style={{ display: 'block' }}>
    <div className="modal-content">
      <h3>Update Book</h3>
      <input 
        type="text" 
        value={editForm.title}
        onChange={(e) => setEditForm({...editForm, title: e.target.value})}
      />
      <input 
        type="text" 
        value={editForm.author}
        onChange={(e) => setEditForm({...editForm, author: e.target.value})}
      />
      <div className="btn-group">
        <button onClick={() => setBookToEdit(null)}>Cancel</button>
        <button id="add-book-btn" style={{margin: 0}} onClick={handleSaveEdit}>Save Changes</button>
      </div>
    </div>
  </div>
)}

{/* PERMANENT DELETE CONFIRMATION */}
{bookToPermanentDelete && (
  <div className="modal" style={{ display: 'block' }}>
    <div className="modal-content">
      <h3>Delete Permanently?</h3>
      <p>This action cannot be undone. Are you sure?</p>
      <div className="btn-group">
        <button onClick={() => setBookToPermanentDelete(null)}>Cancel</button>
        <button className="btn-delete" onClick={handleFinalDelete}>Yes, Delete Forever</button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}

export default App;