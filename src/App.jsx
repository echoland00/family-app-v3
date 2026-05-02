import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDoc, onSnapshot, addDoc, updateDoc, deleteDoc, writeBatch, query, orderBy } from 'firebase/firestore';
import * as XLSX from 'xlsx';

import { 
  Utensils, ShoppingCart, Plus, CheckCircle2, Circle, Trash2, RefreshCw,
  ChevronLeft, ChevronRight, Sparkles, X, Home, Fingerprint, ShieldCheck,
  FileUp, PlusCircle, KeyRound, Zap, FolderPlus, ChevronRight as ChevronRightIcon,
  Tag, LayoutGrid, Info, StickyNote, Send, Download, BookOpen
} from 'lucide-react';

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyC0717TOX3YK_Zck6UNIoXFOGMNlhH_FsM",
  authDomain: "family-hub-v2-72195.firebaseapp.com",
  projectId: "family-hub-v2-72195",
  storageBucket: "family-hub-v2-72195.firebasestorage.app",
  messagingSenderId: "178135700731",
  appId: "1:178135700731:web:668ffed07c9e670d564c5e"
};

const APP_VERSION = "v2.0.0";
const MEAL_TYPES = ['Breakfast', 'Lunch', 'Snack', 'Dinner'];

const SUGGESTED_MEALS = {
  Breakfast: ['Avocado Toast', 'Pancakes', 'Scrambled Eggs'],
  Lunch: ['Chicken Caesar Salad', 'Tomato Soup', 'Turkey Club'],
  Snack: ['Fruit Bowl', 'Yogurt', 'Nuts', 'Hummus & Carrots'],
  Dinner: ['Spaghetti Carbonara', 'Grilled Salmon', 'Thai Green Curry']
};

const BIBLE_VERSES = [
  { text: "The Lord is my shepherd; I shall not want.", source: "Psalm 23:1" },
  { text: "I can do all things through Christ who strengthens me.", source: "Philippians 4:13" },
  { text: "Trust in the Lord with all your heart.", source: "Proverbs 3:5" },
  { text: "Be strong and courageous. Do not be afraid.", source: "Joshua 1:9" },
  { text: "The Lord bless you and keep you.", source: "Numbers 6:24" },
  { text: "God is love.", source: "1 John 4:8" },
  { text: "Fear not, for I am with you.", source: "Isaiah 43:5" },
  { text: "The truth will set you free.", source: "John 8:32" },
  { text: "Love is patient, love is kind.", source: "1 Corinthians 13:4" },
  { text: "With God all things are possible.", source: "Matthew 19:26" },
  { text: "Do to others as you would have them do to you.", source: "Luke 6:31" },
  { text: "The light shines in the darkness, and the darkness has not overcome it.", source: "John 1:5" },
  { text: "Ask and it will be given to you.", source: "Matthew 7:7" },
  { text: "Be kind to one another.", source: "Ephesians 4:32" },
  { text: "The Spirit of God dwells in you.", source: "1 Corinthians 3:16" },
  { text: "Your word is a lamp to my feet.", source: "Psalm 119:105" },
  { text: "Jesus Christ is the same yesterday and today and forever.", source: "Hebrews 13:8" },
  { text: "Be joyful in hope, patient in affliction.", source: "Romans 12:12" },
  { text: "The name of the Lord is a strong tower.", source: "Proverbs 18:10" },
  { text: "He heals the brokenhearted.", source: "Psalm 34:18" },
  { text: "Walk by faith, not by sight.", source: "2 Corinthians 5:7" },
  { text: "The Lord is near to the brokenhearted.", source: "Psalm 34:18" },
  { text: "All things work together for good.", source: "Romans 8:28" },
  { text: "Whoever believes in me shall have eternal life.", source: "John 6:47" },
  { text: "Let your light shine before others.", source: "Matthew 5:16" },
  { text: "Peace I leave with you; my peace I give you.", source: "John 14:27" },
  { text: "Come to me, all who are weary.", source: "Matthew 11:28" },
  { text: "For where two or three gather, I am there among them.", source: "Matthew 18:20" },
  { text: "This is the day the Lord has made.", source: "Psalm 118:24" },
  { text: "Be transformed by the renewing of your mind.", source: "Romans 12:2" },
  { text: "The Lord is my light and my salvation.", source: "Psalm 27:1" },
  { text: "Your love never fails.", source: "1 Corinthians 13:8" },
  { text: "I am the way, the truth, and the life.", source: "John 14:6" },
  { text: "The kingdom of God is within you.", source: "Luke 17:21" },
  { text: "Hold fast to the word of life.", source: "Philippians 2:16" },
  { text: "The Lord will fight for you.", source: "Exodus 14:14" },
  { text: "Be devoted to one another in love.", source: "Romans 12:10" },
  { text: "My grace is sufficient for you.", source: "2 Corinthians 12:9" },
  { text: "You are the light of the world.", source: "Matthew 5:14" },
  { text: "Hope does not put us to shame.", source: "Romans 5:5" },
  { text: "The Lord is patient with you.", source: "2 Peter 3:9" },
  { text: "Seek first the kingdom of God.", source: "Matthew 6:33" },
  { text: "Whoever loves God must also love their brother.", source: "1 John 4:21" },
  { text: "God so loved the world.", source: "John 3:16" },
  { text: "Live by the Spirit.", source: "Galatians 5:25" },
  { text: "The fruit of the Spirit is love.", source: "Galatians 5:22" },
  { text: "Christ in you, the hope of glory.", source: "Colossians 1:27" },
  { text: "We walk by faith, not by sight.", source: "2 Corinthians 5:7" },
  { text: "The word of God is living and active.", source: "Hebrews 4:12" },
  { text: "Call upon me in the day of trouble.", source: "Psalm 50:15" },
  { text: "Delight yourself in the Lord.", source: "Psalm 37:4" },
  { text: "He commandeth his love toward us.", source: "Romans 5:8" },
  { text: "In all things God works for the good.", source: "Romans 8:28" },
  { text: "Be holy, for I am holy.", source: "1 Peter 1:16" },
  { text: "Godliness with contentment is great gain.", source: "1 Timothy 6:6" },
  { text: "The eternal God is your refuge.", source: "Deuteronomy 33:27" },
  { text: "Commit your work to the Lord.", source: "Proverbs 16:3" },
  { text: "Taste and see that the Lord is good.", source: "Psalm 34:8" },
  { text: "The Lord reigns forever.", source: "Psalm 146:10" },
  { text: "Give thanks to the Lord, for he is good.", source: "Psalm 136:1" },
  { text: "His mercies are new every morning.", source: "Lamentations 3:23" },
  { text: "The Lord is slow to anger and great in power.", source: "Nahum 1:3" },
  { text: "Wait for the Lord.", source: "Psalm 27:14" },
  { text: "The Lord directs our steps.", source: "Proverbs 20:24" },
  { text: "In him we live and move and have our being.", source: "Acts 17:28" },
  { text: "The Lord is trustworthy.", source: "Psalm 78:14" },
  { text: "Pour out your heart to him.", source: "Psalm 62:8" },
  { text: "Those who hope in him will not be put to shame.", source: "Romans 10:11" },
  { text: "The Lord is our righteousness.", source: "Jeremiah 23:6" },
  { text: "We are more than conquerors.", source: "Romans 8:37" },
  { text: "The Lord keeps us from all harm.", source: "Psalm 121:7" },
  { text: "Surely his salvation is near to those who fear him.", source: "Psalm 85:9" },
  { text: "The Lord is a refuge for the oppressed.", source: "Psalm 9:9" },
  { text: "Our heart finds rest in God alone.", source: "Psalm 131:2" },
  { text: "The Lord is good to all.", source: "Psalm 145:9" },
  { text: "He tends his flock like a shepherd.", source: "Isaiah 40:11" },
  { text: "Rise up, O Lord.", source: "Psalm 9:19" },
  { text: "The Lord is my rock and my fortress.", source: "Psalm 18:2" },
  { text: "We have this treasure in jars of clay.", source: "2 Corinthians 4:7" },
  { text: "To be self-controlled and pure.", source: "Titus 2:5" },
  { text: "The grace of the Lord Jesus Christ be with you.", source: "1 Corinthians 16:24" },
  { text: "The Lord has done great things for us.", source: "Psalm 126:3" },
  { text: "Be strong in the grace that is in Christ Jesus.", source: "2 Timothy 2:1" },
  { text: "The love of the Lord is from everlasting to everlasting.", source: "Psalm 103:17" },
  { text: "The Lord is our example.", source: "John 13:15" },
  { text: "To live is Christ and to die is gain.", source: "Philippians 1:21" },
  { text: "The Spirit bears witness with our spirit.", source: "Romans 8:16" },
  { text: "We have the mind of Christ.", source: "1 Corinthians 2:16" },
  { text: "The Word became flesh and dwelt among us.", source: "John 1:14" },
  { text: "The gift of God is eternal life.", source: "Romans 6:23" },
  { text: "Be strong and take heart.", source: "Psalm 31:24" },
  { text: "The Lord watches over you.", source: "Psalm 121:5" },
  { text: "The Lord is our peace.", source: "Judges 6:24" }
];

const getTodayVerse = () => {
  const today = new Date().toISOString().split('T')[0];
  const seed = today.split('-').join('') + today.split('-')[1];
  const idx = parseInt(seed, 10) % BIBLE_VERSES.length;
  return BIBLE_VERSES[idx];
};

export default function App() {
  const [isConfigReady, setIsConfigReady] = useState(false);
  const [user, setUser] = useState(null);
  const [loginError, setLoginError] = useState(null);
  const [appId] = useState('family-hub-v2');

  const [activeProfile, setActiveProfile] = useState(() => {
    const saved = localStorage.getItem('family_app_profile');
    try { return saved ? JSON.parse(saved) : null; } catch { return null; }
  });

  const [inputPhone, setInputPhone] = useState(() => localStorage.getItem('family_app_phone') || '');
  const [inputProfileName, setInputProfileName] = useState(() => {
    const saved = localStorage.getItem('family_app_profile');
    try { return saved ? JSON.parse(saved).name : ''; } catch { return ''; }
  });

  const [quickCode, setQuickCode] = useState('');
  const [isQuickLoginMode, setIsQuickLoginMode] = useState(true);

  const [activeTab, setActiveTab] = useState('meals');
  const [meals, setMeals] = useState([]);
  const [groceries, setGroceries] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const [todayVerse] = useState(getTodayVerse);

  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [currentCategoryId, setCurrentCategoryId] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newDishName, setNewDishName] = useState('');
  const [selectingFor, setSelectingFor] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importPendingList, setImportPendingList] = useState([]);

  const [editingRemark, setEditingRemark] = useState(null);
  const [manualInputs, setManualInputs] = useState({});
  const [newPin, setNewPin] = useState('');
  const [newGrocery, setNewGrocery] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');

  const firebaseRefs = useMemo(() => {
    try {
      const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
      return { auth: getAuth(app), db: getFirestore(app) };
    } catch (e) {
      console.error('Firebase init error:', e);
      return null;
    }
  }, []);

  useEffect(() => {
    if (!firebaseRefs) return;
    const { auth } = firebaseRefs;
    
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (e) {
        console.error('Auth error:', e);
      }
    };
    
    initAuth();
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsConfigReady(true);
    });
  }, [firebaseRefs]);

  useEffect(() => {
    if (!user || !activeProfile || !firebaseRefs) return;
    const { db } = firebaseRefs;
    const root = ['artifacts', appId, 'public', 'data', 'hubs', activeProfile.hubKey];

    const subs = [
      onSnapshot(collection(db, ...root, 'meals'), (s) => setMeals(s.docs.map(d => ({ id: d.id, ...d.data() })))),
      onSnapshot(collection(db, ...root, 'groceries'), (s) => setGroceries(s.docs.map(d => ({ id: d.id, ...d.data() })))),
      onSnapshot(collection(db, ...root, 'dishes'), (s) => setDishes(s.docs.map(d => ({ id: d.id, ...d.data() })))),
      onSnapshot(collection(db, ...root, 'categories'), (s) => setCategories(s.docs.map(d => ({ id: d.id, ...d.data() }))))
    ];

    return () => subs.forEach(unsub => unsub());
  }, [user, activeProfile, firebaseRefs, appId]);

  const getHubRef = (col, docId = null) => {
    if (!activeProfile || !firebaseRefs) return null;
    const c = collection(firebaseRefs.db, 'artifacts', appId, 'public', 'data', 'hubs', activeProfile.hubKey, col);
    return docId ? doc(c, docId) : c;
  };

  const handleQuickLogin = async () => {
    if (quickCode.length < 4) return;
    try {
      const snap = await getDoc(doc(firebaseRefs.db, 'artifacts', appId, 'public', 'data', 'pins', quickCode));
      if (snap.exists()) {
        const d = snap.data();
        const p = { hubKey: d.hubKey, name: d.name, phone: d.phone };
        localStorage.setItem('family_app_profile', JSON.stringify(p));
        setActiveProfile(p);
      } else { setLoginError("Invalid PIN"); }
    } catch (e) { setLoginError("Login Error"); }
  };

  const handleFullLogin = () => {
    const p = inputPhone.replace(/\D/g, '');
    const n = inputProfileName.trim();
    if (p.length < 5 || !n) return;
    const prof = { hubKey: `${p}_${n.toLowerCase()}`, name: n, phone: p };
    localStorage.setItem('family_app_profile', JSON.stringify(prof));
    setActiveProfile(prof);
  };

  const updateDayNote = async (val) => {
    const id = `${selectedDate}_planner`;
    await setDoc(getHubRef('meals', id), {
      date: selectedDate, type: 'PLANNER_NOTE', note: val, lastUpdated: Date.now()
    }, { merge: true });
  };

  const addDishToMeal = async (type, name) => {
    if (!name || !name.trim()) return;
    const id = `${selectedDate}_${type}`;
    const m = (meals || []).find(x => x.id === id);
    const existing = Array.isArray(m?.dishes) ? m.dishes : [];
    if (existing.includes(name)) return;
    await setDoc(getHubRef('meals', id), {
      date: selectedDate, type, dishes: [...existing, name], lastUpdated: Date.now()
    }, { merge: true });
    setManualInputs(prev => ({ ...prev, [type]: '' }));
    setIsLibraryOpen(false);
  };

  const removeDish = async (type, idx) => {
    const id = `${selectedDate}_${type}`;
    const m = (meals || []).find(x => x.id === id);
    if (!m) return;
    const updated = [...m.dishes];
    updated.splice(idx, 1);
    await updateDoc(getHubRef('meals', id), { dishes: updated, lastUpdated: Date.now() });
  };

  const saveMealNote = async (type) => {
    if (!editingRemark) return;
    const id = `${selectedDate}_${type}`;
    await setDoc(getHubRef('meals', id), { remark: editingRemark.value, lastUpdated: Date.now() }, { merge: true });
    setEditingRemark(null);
  };

  const handleAddGrocery = async () => {
    const val = newGrocery.trim();
    if (!val) return;
    await addDoc(getHubRef('groceries'), { text: val, completed: false, createdAt: Date.now() });
    setNewGrocery('');
  };

  const handleCreateCategory = async () => {
    const val = newCategoryName.trim();
    if (!val) return;
    await addDoc(getHubRef('categories'), { name: val, createdAt: Date.now() });
    setNewCategoryName('');
  };

  const handleEditCategory = async () => {
    if (!editingCategory || !editingCategoryName.trim()) return;
    await updateDoc(doc(firebaseRefs.db, 'artifacts', appId, 'public', 'data', 'hubs', activeProfile.hubKey, 'categories', editingCategory), { name: editingCategoryName.trim() });
    setEditingCategory(null);
    setEditingCategoryName('');
  };

  const handleDeleteCategory = async (catId) => {
    if (!window.confirm('Delete this category and all its dishes?')) return;
    // Delete all dishes in this category
    const dishesToDelete = (dishes || []).filter(d => d.categoryId === catId);
    const batch = writeBatch(firebaseRefs.db);
    dishesToDelete.forEach(d => batch.delete(doc(firebaseRefs.db, 'artifacts', appId, 'public', 'data', 'hubs', activeProfile.hubKey, 'dishes', d.id)));
    batch.delete(doc(firebaseRefs.db, 'artifacts', appId, 'public', 'data', 'hubs', activeProfile.hubKey, 'categories', catId));
    await batch.commit();
    if (currentCategoryId === catId) setCurrentCategoryId(null);
  };

  const handleAddDishToLib = async () => {
    const val = newDishName.trim();
    if (!val || !currentCategoryId) return;
    await addDoc(getHubRef('dishes'), { name: val, categoryId: currentCategoryId, createdAt: Date.now() });
    setNewDishName('');
  };

  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    if (!file || !currentCategoryId) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const extractedNames = new Set();

      wb.SheetNames.forEach(sheetName => {
        const ws = wb.Sheets[sheetName];
        // Convert to 2D array [row][column]
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

        data.forEach(row => {
          row.forEach(cell => {
            if (cell != null) {
              const val = String(cell).trim();
              // Filter out single characters or empty numbers
              if (val.length > 1) extractedNames.add(val);
            }
          });
        });
      });

      // Staging: allow user to review before writing to Firestore
      setImportPendingList(
        Array.from(extractedNames).map(name => ({
          name,
          selected: true
        }))
      );
      setIsImporting(true);
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  const confirmImport = async () => {
    const selected = importPendingList.filter(i => i.selected);
    if (selected.length === 0) return;
    const batch = writeBatch(firebaseRefs.db);
    selected.forEach(item => {
      const dRef = doc(collection(firebaseRefs.db, 'artifacts', appId, 'public', 'data', 'hubs', activeProfile.hubKey, 'dishes'));
      batch.set(dRef, { name: item.name, categoryId: currentCategoryId, createdAt: Date.now() });
    });
    await batch.commit();
    setImportPendingList([]);
    setIsImporting(false);
  };

  if (!isConfigReady) return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <RefreshCw className="animate-spin text-indigo-600 w-8 h-8" />
    </div>
  );

  if (!activeProfile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-8 border border-slate-100">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-indigo-50 rounded-2xl text-indigo-600">
              {isQuickLoginMode ? <KeyRound size={40} /> : <ShieldCheck size={40} />}
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center mb-8 text-slate-900 uppercase tracking-widest">Family Hub</h2>
          <div className="space-y-4">
            {isQuickLoginMode ? (
              <div className="space-y-4">
                <input 
                  type="password" 
                  inputMode="numeric" 
                  placeholder="••••" 
                  className="w-full px-5 py-5 rounded-2xl bg-slate-50 border border-slate-100 outline-none text-center text-3xl font-bold tracking-[0.5em]" 
                  maxLength={6} 
                  value={quickCode} 
                  onChange={(e) => setQuickCode(e.target.value)} 
                />
                <button 
                  onClick={handleQuickLogin} 
                  className="w-full bg-indigo-600 text-white font-bold py-5 rounded-2xl shadow-xl hover:bg-indigo-700 active:scale-95 transition-all"
                >
                  ENTER HUB
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <input 
                  type="tel" 
                  placeholder="Phone Number" 
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold" 
                  value={inputPhone} 
                  onChange={(e) => setInputPhone(e.target.value)} 
                />
                <input 
                  type="text" 
                  placeholder="Your Name" 
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold" 
                  value={inputProfileName} 
                  onChange={(e) => setInputProfileName(e.target.value)} 
                />
                <button 
                  onClick={handleFullLogin} 
                  className="w-full bg-indigo-600 text-white font-bold py-5 rounded-2xl shadow-xl hover:bg-indigo-700 active:scale-95 transition-all"
                >
                  LOGIN
                </button>
              </div>
            )}
            {loginError && <p className="text-xs text-red-500 font-bold text-center uppercase">{loginError}</p>}
            <button 
              onClick={() => setIsQuickLoginMode(!isQuickLoginMode)} 
              className="w-full text-slate-400 font-bold text-xs uppercase mt-4"
            >
              Change Login Method
            </button>
          </div>
        </div>
      </div>
    );
  }

  const dailyNote = (meals || []).find(m => m.id === `${selectedDate}_planner`)?.note || '';

  return (
    <div className="min-h-screen bg-slate-50 pb-32 font-sans select-none overflow-x-hidden">
      <header className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-30 px-5 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-md">
              <Home size={18} />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 uppercase leading-none">{activeProfile.name} Hub</h1>
              <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{APP_VERSION}</p>
            </div>
          </div>
          <button 
            onClick={() => { setIsLibraryOpen(true); setCurrentCategoryId(null); }} 
            className="bg-slate-900 text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md"
          >
            <LayoutGrid size={12} /> LIBRARY
          </button>
        </div>
        <div className="flex items-center justify-between gap-2 bg-slate-100/50 p-1.5 rounded-2xl border border-slate-100">
          <button 
            onClick={() => { const d = new Date(selectedDate); d.setDate(d.getDate() - 1); setSelectedDate(d.toISOString().split('T')[0]); }} 
            className="p-2 bg-white rounded-xl shadow-sm"
          >
            <ChevronLeft size={16} />
          </button>
          <p className="font-bold text-slate-700 text-xs">
            {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </p>
          <button 
            onClick={() => { const d = new Date(selectedDate); d.setDate(d.getDate() + 1); setSelectedDate(d.toISOString().split('T')[0]); }} 
            className="p-2 bg-white rounded-xl shadow-sm"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto p-4 space-y-6">
        {activeTab === 'meals' && (
          <div className="space-y-6">
            <div className="bg-amber-50 rounded-[2rem] p-6 border border-amber-100 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <StickyNote size={14} className="text-amber-600" />
                <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">Daily Note</span>
              </div>
              <textarea
                className="w-full bg-transparent border-none outline-none font-bold text-base text-amber-900 placeholder:text-amber-200 resize-none"
                placeholder="Agenda for today..."
                value={dailyNote}
                onChange={(e) => {
                  updateDayNote(e.target.value);
                  const el = e.target;
                  el.style.height = 'auto';
                  el.style.height = el.scrollHeight + 'px';
                }}
              />
            </div>

            {MEAL_TYPES.map(type => {
              const m = (meals || []).find(x => x.id === `${selectedDate}_${type}`);
              const isEdit = editingRemark?.type === type;
              const dishList = Array.isArray(m?.dishes) ? m.dishes : [];

              return (
                <div key={type} className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500" />
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{type}</span>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => { setSelectingFor({ type }); setIsLibraryOpen(true); setCurrentCategoryId(null); }} 
                        className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"
                      >
                        <PlusCircle size={16} />
                      </button>
                      <button 
                        onClick={() => addDishToMeal(type, SUGGESTED_MEALS[type][Math.floor(Math.random() * SUGGESTED_MEALS[type].length)])} 
                        className="p-2 bg-purple-50 text-purple-600 rounded-xl"
                      >
                        <Sparkles size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      placeholder={`Add ${type} dish...`}
                      className="flex-1 bg-slate-50 border-none px-4 py-2 rounded-xl text-sm font-bold text-slate-700 outline-none"
                      value={manualInputs[type] || ''}
                      onChange={(e) => setManualInputs(prev => ({ ...prev, [type]: e.target.value }))}
                      onKeyDown={(e) => e.key === 'Enter' && addDishToMeal(type, manualInputs[type])}
                    />
                    <button onClick={() => addDishToMeal(type, manualInputs[type])} className="p-2 bg-slate-100 text-slate-600 rounded-xl">
                      <Send size={16} />
                    </button>
                  </div>

                  <div className="space-y-2 mb-4">
                    {dishList.map((dish, i) => (
                      <div key={i} className="flex items-center justify-between bg-slate-50 px-4 py-3 rounded-xl border border-slate-100">
                        <span className="text-sm font-bold text-slate-800 break-words flex-1 pr-2">{dish}</span>
                        <button onClick={() => removeDish(type, i)} className="text-slate-300 flex-shrink-0">
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="bg-slate-100 rounded-xl p-3 border border-slate-200">
                    <div className="flex justify-between mb-1">
                      <span className="text-[8px] font-bold uppercase text-slate-400">Details</span>
                      <button
                        onClick={() => setEditingRemark(isEdit ? null : { type, value: m?.remark || '' })}
                        className={`${isEdit ? 'bg-rose-100 text-rose-700' : 'bg-indigo-100 text-indigo-700'} px-3 py-1.5 rounded-xl text-xs font-bold`}
                      >
                        {isEdit ? 'Cancel' : 'Edit'}
                      </button>
                    </div>
                    {isEdit ? (
                      <div className="space-y-2">
                        <textarea
                          ref={(el) => { if (el) { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px'; } }}
                          className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold min-h-[80px] resize-none"
                          rows={6}
                          value={editingRemark.value}
                          onChange={(e) => {
                            setEditingRemark({ ...editingRemark, value: e.target.value });
                            const el = e.target;
                            el.style.height = 'auto';
                            el.style.height = el.scrollHeight + 'px';
                          }}
                        />
                        <button 
                          onClick={() => saveMealNote(type)} 
                          className="w-full py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold uppercase shadow-lg"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <div className="text-sm font-bold text-slate-600 leading-relaxed whitespace-pre-wrap">
                        {m?.remark || 'No details added...'}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Bible Verse - shown after all meals */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-[2rem] p-6 border border-indigo-100 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen size={14} className="text-indigo-500" />
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Daily Verse</span>
              </div>
              <p className="text-sm font-bold text-indigo-900 leading-relaxed mb-2 italic">
                "{todayVerse.text}"
              </p>
              <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                — {todayVerse.source}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'groceries' && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Grocery item..." 
                className="flex-1 px-5 py-4 rounded-2xl bg-white border border-slate-200 outline-none font-bold text-sm shadow-sm" 
                value={newGrocery} 
                onChange={(e) => setNewGrocery(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && handleAddGrocery()} 
              />
              <button onClick={handleAddGrocery} className="bg-indigo-600 text-white px-5 rounded-2xl shadow-lg">
                <Plus size={24} />
              </button>
            </div>
            <div className="space-y-2">
              {(groceries || []).sort((a,b) => (b.createdAt || 0) - (a.createdAt || 0)).map(item => (
                <div key={item.id} className="bg-white p-5 rounded-2xl flex items-center gap-3 shadow-sm border border-slate-50">
                  <button onClick={() => updateDoc(getHubRef('groceries', item.id), { completed: !item.completed })} className="flex-shrink-0">
                    {item.completed ? <CheckCircle2 className="text-emerald-500" size={24} /> : <Circle className="text-slate-200" size={24} />}
                  </button>
                  <span className={`flex-1 text-sm font-bold break-words ${item.completed ? 'line-through text-slate-300' : 'text-slate-700'}`}>
                    {item.text}
                  </span>
                  <button onClick={() => deleteDoc(getHubRef('groceries', item.id))} className="text-slate-200 hover:text-red-500 flex-shrink-0">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 space-y-8">
            <section>
              <h3 className="text-xs font-bold text-indigo-600 uppercase mb-4 flex items-center gap-2">
                <Info size={14} /> App Info
              </h3>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Hub Name</p>
                <p className="font-mono text-sm font-bold text-slate-700">{activeProfile.name}</p>
              </div>
            </section>
            <section>
              <h3 className="text-xs font-bold text-indigo-600 uppercase mb-4 flex items-center gap-2">
                <Zap size={14} /> Set PIN
              </h3>
              <div className="flex gap-2">
                <input 
                  type="password" 
                  placeholder="PIN Code" 
                  maxLength={6} 
                  className="flex-1 bg-slate-50 px-4 py-3 rounded-xl font-bold text-center tracking-widest border border-slate-100" 
                  value={newPin} 
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g,''))} 
                />
                <button 
                  onClick={async () => {
                    if(newPin.length >= 4) { 
                      await setDoc(doc(firebaseRefs.db, 'artifacts', appId, 'public', 'data', 'pins', newPin), { hubKey: activeProfile.hubKey, name: activeProfile.name, phone: activeProfile.phone, createdAt: Date.now() }); 
                      setNewPin(''); 
                    }
                  }} 
                  className="bg-indigo-600 text-white px-5 rounded-xl text-xs font-bold uppercase"
                >
                  Set
                </button>
              </div>
            </section>
            <section className="pt-4">
              <button 
                onClick={() => { setActiveProfile(null); }} 
                className="w-full py-4 text-slate-400 font-bold text-xs uppercase bg-slate-100 rounded-xl"
              >
                Log Out
              </button>
            </section>
          </div>
        )}
      </main>

      {isLibraryOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-3">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center bg-white sticky top-0 z-10">
              <div className="flex items-center gap-2">
                {currentCategoryId && (
                  <button onClick={() => setCurrentCategoryId(null)} className="p-2 bg-slate-100 rounded-xl">
                    <ChevronLeft size={18} />
                  </button>
                )}
                <h2 className="text-sm font-bold text-slate-900 uppercase">
                  {currentCategoryId ? (categories || []).find(c => c.id === currentCategoryId)?.name : "Categories"}
                </h2>
              </div>
              <button onClick={() => setIsLibraryOpen(false)} className="p-2 text-slate-300 bg-slate-50 rounded-xl">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {!currentCategoryId ? (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Add Category..." 
                      className="flex-1 px-4 py-3 bg-slate-50 rounded-xl font-bold text-sm outline-none" 
                      value={newCategoryName} 
                      onChange={(e) => setNewCategoryName(e.target.value)} 
                      onKeyDown={(e) => e.key === 'Enter' && handleCreateCategory()}
                    />
                    <button onClick={handleCreateCategory} className="bg-indigo-600 text-white px-4 rounded-xl">
                      <FolderPlus size={18} />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {(categories || []).map(cat => (
                      <div
                        key={cat.id}
                        className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100"
                      >
                        {editingCategory === cat.id ? (
                          <div className="flex items-center gap-2 flex-1">
                            <input
                              type="text"
                              value={editingCategoryName}
                              onChange={(e) => setEditingCategoryName(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleEditCategory()}
                              className="flex-1 px-3 py-2 bg-white rounded-xl font-bold text-xs outline-none border border-indigo-200"
                              autoFocus
                            />
                            <button onClick={handleEditCategory} className="p-2 bg-indigo-600 text-white rounded-xl">
                              <CheckCircle2 size={14} />
                            </button>
                            <button onClick={() => { setEditingCategory(null); setEditingCategoryName(''); }} className="p-2 bg-slate-200 text-slate-600 rounded-xl">
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => setCurrentCategoryId(cat.id)}
                              className="flex items-center gap-3 flex-1"
                            >
                              <Tag size={16} className="text-indigo-500" />
                              <span className="font-bold text-slate-700 uppercase text-xs">{cat.name}</span>
                              <span className="text-[9px] font-bold text-slate-300 uppercase">
                                {(dishes || []).filter(d => d.categoryId === cat.id).length} Dishes
                              </span>
                            </button>
                            <div className="flex gap-1">
                              <button
                                onClick={() => { setEditingCategory(cat.id); setEditingCategoryName(cat.name); }}
                                className="p-2 text-slate-300 hover:text-indigo-500 rounded-xl"
                              >
                                <Info size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(cat.id)}
                                className="p-2 text-slate-300 hover:text-red-500 rounded-xl"
                              >
                                <Trash2 size={14} />
                              </button>
                              <ChevronRightIcon size={14} className="text-slate-300 self-center" />
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Add single dish..." 
                      className="flex-1 px-4 py-3 bg-slate-50 rounded-xl font-bold text-sm outline-none" 
                      value={newDishName} 
                      onChange={(e) => setNewDishName(e.target.value)} 
                      onKeyDown={(e) => e.key === 'Enter' && handleAddDishToLib()}
                    />
                    <button onClick={handleAddDishToLib} className="bg-indigo-600 text-white px-4 rounded-xl">
                      <Plus size={18} />
                    </button>
                  </div>

                  <label className="flex items-center justify-center gap-3 px-5 py-4 bg-emerald-50 text-emerald-600 rounded-2xl border border-dashed border-emerald-200 cursor-pointer">
                    <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleExcelUpload} disabled={isImporting && importPendingList.length > 0} />
                    <FileUp size={18} />
                    <span className="text-xs font-bold uppercase">Bulk Upload</span>
                  </label>

                  {importPendingList.length > 0 && (
                    <div className="bg-indigo-50 rounded-2xl p-4 border border-indigo-100 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-indigo-700 uppercase">
                          Import Review ({importPendingList.filter(i => i.selected).length} selected)
                        </span>
                        <button onClick={() => { setImportPendingList([]); setIsImporting(false); }} className="text-indigo-400 hover:text-indigo-600">
                          <X size={16} />
                        </button>
                      </div>
                      <div className="space-y-1 max-h-40 overflow-y-auto">
                        {importPendingList.map((item, idx) => (
                          <label key={idx} className="flex items-center gap-2 p-2 bg-white rounded-xl cursor-pointer">
                            <input
                              type="checkbox"
                              checked={item.selected}
                              onChange={(e) => {
                                const updated = [...importPendingList];
                                updated[idx].selected = e.target.checked;
                                setImportPendingList(updated);
                              }}
                              className="w-4 h-4 rounded accent-indigo-600"
                            />
                            <span className={`text-xs font-bold ${item.selected ? 'text-slate-700' : 'text-slate-400 line-through'}`}>
                              {item.name}
                            </span>
                          </label>
                        ))}
                      </div>
                      <button
                        onClick={confirmImport}
                        className="w-full py-3 bg-indigo-600 text-white rounded-xl text-xs font-bold uppercase"
                      >
                        Confirm Import ({importPendingList.filter(i => i.selected).length})
                      </button>
                    </div>
                  )}

                  <div className="space-y-2 pb-10">
                    {(dishes || []).filter(d => d.categoryId === currentCategoryId).map(dish => (
                      <div key={dish.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <span className="font-bold text-slate-700 text-xs break-words pr-2">{dish.name}</span>
                        <div className="flex gap-2 flex-shrink-0">
                          <button onClick={() => deleteDoc(getHubRef('dishes', dish.id))} className="text-slate-200 hover:text-red-500 p-1">
                            <Trash2 size={14} />
                          </button>
                          {selectingFor && (
                            <button 
                              onClick={() => addDishToMeal(selectingFor.type, dish.name)} 
                              className="bg-indigo-600 text-white px-3 py-1.5 rounded-xl font-bold text-xs uppercase"
                            >
                              ADD
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-100 px-10 py-5 pb-9 flex justify-between items-center z-40 shadow-xl">
        <button 
          onClick={() => setActiveTab('meals')} 
          className={`flex flex-col items-center gap-1.5 transition-all active:scale-90 ${activeTab === 'meals' ? 'text-indigo-600' : 'text-slate-300'}`}
        >
          <Utensils size={26} strokeWidth={2.5} />
          <span className="text-[9px] font-bold uppercase">Meals</span>
        </button>
        <button 
          onClick={() => setActiveTab('groceries')} 
          className={`flex flex-col items-center gap-1.5 transition-all active:scale-90 ${activeTab === 'groceries' ? 'text-indigo-600' : 'text-slate-300'}`}
        >
          <ShoppingCart size={26} strokeWidth={2.5} />
          <span className="text-[9px] font-bold uppercase">Grocery</span>
        </button>
        <button 
          onClick={() => setActiveTab('settings')} 
          className={`flex flex-col items-center gap-1.5 transition-all active:scale-90 ${activeTab === 'settings' ? 'text-indigo-600' : 'text-slate-300'}`}
        >
          <Fingerprint size={26} strokeWidth={2.5} />
          <span className="text-[9px] font-bold uppercase">Hub</span>
        </button>
      </nav>
    </div>
  );
}