import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, collection, addDoc, updateDoc, deleteDoc, 
  doc, onSnapshot, query, orderBy, serverTimestamp 
} from 'firebase/firestore';
import { Check, CreditCard, Trash2, Send, Star, Search } from 'lucide-react';

const firebaseConfig = {
  apiKey: "AIzaSyCAGSdSZfT5iZOBnZqjm9B2T7d9tVFZbac",
  authDomain: "dentalstars-23a32.firebaseapp.com",
  projectId: "dentalstars-23a32",
  storageBucket: "dentalstars-23a32.firebasestorage.app",
  messagingSenderId: "755093585361",
  appId: "1:755093585361:web:a48b3cffc16c53dbddb4f0",
  measurementId: "G-218C9TM367"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function App() {
  const [patients, setPatients] = useState([]);
  const [name, setName] = useState('');
  const [details, setDetails] = useState('');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    const q = query(collection(db, 'patients'), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPatients(list);
    });
    return () => unsubscribe();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    await addDoc(collection(db, 'patients'), {
      name: name.trim(),
      details: details.trim(),
      designDone: false,
      paymentDone: false,
      createdAt: serverTimestamp()
    });
    setName('');
    setDetails('');
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const toggleDesign = async (id, currentVal) => {
    await updateDoc(doc(db, 'patients', id), { designDone: !currentVal });
  };

  const togglePayment = async (id, currentVal) => {
    await updateDoc(doc(db, 'patients', id), { paymentDone: !currentVal });
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, 'patients', id));
  };

  const filtered = patients.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          (p.details && p.details.toLowerCase().includes(search.toLowerCase()));
    if (filter === 'pending_design') return matchesSearch && !p.designDone;
    if (filter === 'unpaid') return matchesSearch && !p.paymentDone;
    return matchesSearch;
  });

  const designCount = patients.filter(p => p.designDone).length;
  const paidCount = patients.filter(p => p.paymentDone).length;

  return (
    <div style={{ backgroundColor: '#09090b', color: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'sans-serif' }}>
      {/* HEADER */}
      <header style={{ backgroundColor: '#000', borderBottom: '1px solid #27272a', padding: '16px 20px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Star fill="#fff" size={22} />
          <h1 style={{ margin: 0, fontSize: '22px', letterSpacing: '3px', fontWeight: 'bold' }}>DENTALSTARS</h1>
        </div>
        <div style={{ display: 'flex', gap: '12px', fontSize: '13px' }}>
          <span style={{ background: '#18181b', padding: '6px 12px', borderRadius: '8px', border: '1px solid #27272a' }}>Total: <b>{patients.length}</b></span>
          <span style={{ background: '#083344', color: '#22d3ee', padding: '6px 12px', borderRadius: '8px', border: '1px solid #164e63' }}>Design: <b>{designCount}/{patients.length}</b></span>
          <span style={{ background: '#422006', color: '#facc15', padding: '6px 12px', borderRadius: '8px', border: '1px solid #713f12' }}>Plătit: <b>{paidCount}/{patients.length}</b></span>
        </div>
      </header>

      {/* FILTRE & CAUTARE */}
      <div style={{ padding: '12px 20px', backgroundColor: '#121215', borderBottom: '1px solid #27272a', display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[['all', 'Toți'], ['pending_design', 'Fără Design'], ['unpaid', 'Neplătiți']].map(([key, label]) => (
            <button key={key} onClick={() => setFilter(key)} style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', backgroundColor: filter === key ? '#fff' : '#27272a', color: filter === key ? '#000' : '#a1a1aa', fontWeight: '600', fontSize: '13px' }}>
              {label}
            </button>
          ))}
        </div>
        <div style={{ position: 'relative', flex: '1', maxWidth: '250px' }}>
          <Search size={15} style={{ position: 'absolute', left: '10px', top: '9px', color: '#71717a' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Caută pacient..." style={{ width: '100%', padding: '7px 10px 7px 32px', borderRadius: '6px', border: '1px solid #27272a', backgroundColor: '#09090b', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }} />
        </div>
      </div>

      {/* LISTA PACIENTI */}
      <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '800px', width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
        {filtered.length === 0 && (
          <p style={{ textAlign: 'center', color: '#52525b', marginTop: '40px' }}>Niciun pacient în listă. Scrie mai jos pentru a adăuga.</p>
        )}
        {filtered.map(p => (
          <div key={p.id} style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', padding: '14px 16px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff' }}>{p.name}</div>
              {p.details && <div style={{ fontSize: '13px', color: '#a1a1aa', marginTop: '2px' }}>{p.details}</div>}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button onClick={() => toggleDesign(p.id, p.designDone)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', borderRadius: '8px', border: '1px solid', borderColor: p.designDone ? '#06b6d4' : '#3f3f46', backgroundColor: p.designDone ? 'rgba(6, 182, 212, 0.15)' : '#27272a', color: p.designDone ? '#22d3ee' : '#a1a1aa', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>
                <Check size={16} /> Design
              </button>

              <button onClick={() => togglePayment(p.id, p.paymentDone)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', borderRadius: '8px', border: '1px solid', borderColor: p.paymentDone ? '#eab308' : '#3f3f46', backgroundColor: p.paymentDone ? 'rgba(234, 179, 8, 0.15)' : '#27272a', color: p.paymentDone ? '#facc15' : '#a1a1aa', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>
                <CreditCard size={16} /> Plătit
              </button>

              <button onClick={() => handleDelete(p.id)} title="Șterge" style={{ padding: '8px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', color: '#71717a', cursor: 'pointer' }}>
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* BARA INPUT */}
      <form onSubmit={handleAdd} style={{ backgroundColor: '#000', borderTop: '1px solid #27272a', padding: '14px 20px', display: 'flex', gap: '10px', maxWidth: '800px', width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Nume pacient..." required style={{ flex: 2, padding: '12px', borderRadius: '8px', border: '1px solid #27272a', backgroundColor: '#18181b', color: '#fff', fontSize: '14px' }} />
        <input value={details} onChange={e => setDetails(e.target.value)} placeholder="Lucrare / Medic (opțional)" style={{ flex: 2, padding: '12px', borderRadius: '8px', border: '1px solid #27272a', backgroundColor: '#18181b', color: '#fff', fontSize: '14px' }} />
        <button type="submit" style={{ padding: '0 18px', borderRadius: '8px', border: 'none', backgroundColor: '#fff', color: '#000', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Send size={16} /> Trimite
        </button>
      </form>
    </div>
  );
}