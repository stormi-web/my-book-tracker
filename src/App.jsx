import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase'; 
import { onAuthStateChanged, signOut } from "firebase/auth";
import { 
  collection, query, where, orderBy, onSnapshot, 
  addDoc, deleteDoc, doc, updateDoc 
} from "firebase/firestore";
import AuthView from './components/AuthView';

function App() {
  const [bookToDelete, setBookToDelete] = useState(null); // For the "Are you sure?" popup
  const [showTrash, setShowTrash] = useState(false);     // To show the deleted books list
  const [user, setUser] = useState(null);
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [newBook, setNewBook] = useState({ title: "", author: "" });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
  if (!user) return;
  const q = query(
    collection(db, "books"),
    where("userId", "==", user.uid),
    orderBy("createdAt", "desc")
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    setBooks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  });
  return () => unsubscribe();
}, [user]);

  // --- RESTORED EDIT LOGIC ---
  const handleEditBook = async (id, oldTitle, oldAuthor) => {
    const newTitle = prompt("Update Book Title:", oldTitle);
    if (newTitle === null || newTitle.trim() === "") return;
    
    const newAuthor = prompt("Update Author Name:", oldAuthor);
    if (newAuthor === null || newAuthor.trim() === "") return;

    try {
      await updateDoc(doc(db, "books", id), {
        title: newTitle.trim(),
        author: newAuthor.trim()
      });
    } catch (err) {
      alert("Error updating book: " + err.message);
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
    setBookToDelete(null); // Close the confirmation popup
  } catch (err) {
    alert("Error moving to trash: " + err.message);
  }
};

  const filteredBooks = books.filter(b => 
  !b.isDeleted && ( 
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.author.toLowerCase().includes(searchTerm.toLowerCase())
  )
);

  if (!user) return <AuthView />;

  return (
    <div id="app">
      <header className="header-bar">
        <h2>📚 MyBookTracker</h2>
        <div style={{ position: 'relative' }}>
          <button id="menu-btn" onClick={() => setShowMenu(!showMenu)}>☰</button>
          {showMenu && (
            <div id="dropdown-menu" style={{ display: 'block' }}>
              <div className="menu-user-info">{user.displayName}</div>
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
        <div className="search-container">
          <input 
            type="text" 
            placeholder="Search by title or author..." 
            onChange={(e) => setSearchTerm(e.target.value)}
          />
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
              
              <button className="btn-edit" onClick={() => handleEditBook(book.id, book.title, book.author)}>
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
      <div id="trash-list">
        {books.filter(b => b.isDeleted).map(book => (
          <div key={book.id} className="book-card" style={{ marginBottom: '10px', minHeight: 'auto' }}>
            <strong>{book.title}</strong>
            <button 
              className="btn-read" 
              onClick={() => updateDoc(doc(db, "books", book.id), { isDeleted: false })}
            >
              🔄 Restore Book
            </button>
          </div>
        ))}
        {books.filter(b => b.isDeleted).length === 0 && <p>Trash is empty!</p>}
      </div>
    </div>
  </div>
)}

    </div>
  );
}

export default App;