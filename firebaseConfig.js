// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, getDocs, doc, getDoc, query, orderBy, limit } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAnGdd_lamAfaXeu7WKPmt0jkoJxW5ggAw",
  authDomain: "carbonapp-a921e.firebaseapp.com",
  projectId: "carbonapp-a921e",
  storageBucket: "carbonapp-a921e.appspot.com",
  messagingSenderId: "902415744034",
  appId: "1:902415744034:web:f1105fcb55244f3c6b9e7b",
  measurementId: "G-Q1G1PYD44R"
};

const app = initializeApp(firebaseConfig);

// RN 환경에서 analytics는 선택적으로
try { if (typeof window !== 'undefined') getAnalytics(app); } catch {}

export const db = getFirestore(app);

// KST 자정 파싱(정렬 안정)
const KST_OFFSET = '+09:00';
const kstDate = (d) => /\d{4}-\d{2}-\d{2}$/.test(d) ? new Date(`${d}T00:00:00${KST_OFFSET}`) : new Date(d);

export const testFirebaseConnection = async () => {
  try { await getDocs(collection(db, "naver_carbon_news")); return { success: true }; }
  catch (e) { return { success: false, message: e.message }; }
};

const getDefaultImage = () => 'https://via.placeholder.com/640x360?text=Carbon+News';
const getDefaultNewsData = () => ([{
  id: 'dummy-1', title: 'Firebase 연결 실패 — 더미 뉴스', summary: '뉴스 로딩 실패', source: '로컬',
  category: '기술', categoryColor: '#06B6D4', date: new Date().toISOString(),
  time: new Date().toLocaleString('ko-KR'), url: '#', image: getDefaultImage(), order: 9999
}]);

const getCategoryColor = (category) => ({
  '탄소배출권':'#10B981','탄소':'#10B981','환경':'#059669','에너지':'#F59E0B','재생에너지':'#4CAF50',
  '정책':'#3B82F6','경제':'#8B5CF6','기업':'#EF4444','기술':'#06B6D4','default':'#6B7280'
}[category] || '#6B7280');

const formatDate = (s) => {
  if (!s) return '날짜 정보 없음';
  try { const d=new Date(s); if (isNaN(+d)) return s;
    return d.toLocaleString('ko-KR',{year:'numeric',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'});
  } catch { return s; }
};

export const fetchNewsFromFirebase = async () => {
  try {
    const newsQuery = query(collection(db, "naver_carbon_news"), orderBy("order","asc"), limit(50));
    const snap = await getDocs(newsQuery);
    if (snap.empty) return [];
    const items = [];
    snap.forEach((docSnap)=>{
      const x=docSnap.data();
      items.push({
        id:docSnap.id, title:x.title||'제목 없음', summary:x.summary||x.content||'요약 없음',
        source:x.source||'네이버', category:x.category||'탄소배출권',
        categoryColor:getCategoryColor(x.category||'탄소배출권'),
        date:x.date||'날짜 정보 없음', time:formatDate(x.date), url:x.url||'#', image:x.image||getDefaultImage(),
        order:x.order ?? 0
      });
    });
    return items;
  } catch { return getDefaultNewsData(); }
};

/** 석탄 가격: {dates:['YYYY-MM-DD',...], values:[Number,...]} */
export const fetchCoalPriceData = async () => {
  try {
    const ref = doc(db, "data total1", "가격_coal");
    const snap = await getDoc(ref);
    if (!snap.exists()) return { dates: [], values: [] };
    const raw = snap.data(); // { "2025-02-28": "111.627", ... }
    const sorted = Object.entries(raw).sort(([a],[b]) => kstDate(a) - kstDate(b));
    return {
      dates: sorted.map(([d]) => d),
      values: sorted.map(([_,v]) => Number(v))
    };
  } catch {
    return { dates: [], values: [] };
  }
  
};

/** 천연가스 가격 (NAG): {dates:['YYYY-MM-DD',...], values:[Number,...]} */
export const fetchNagPriceData = async () => {
  try {
    const ref = doc(db, "data total1", "가격_nag");
    const snap = await getDoc(ref);
    if (!snap.exists()) return { dates: [], values: [] };
    const raw = snap.data();
    const sorted = Object.entries(raw).sort(([a],[b]) => kstDate(a) - kstDate(b));
    return {
      dates: sorted.map(([d]) => d),
      values: sorted.map(([_,v]) => Number(v))
    };
  } catch {
    return { dates: [], values: [] };
  }
};

/** 석유 가격 (WTI): {dates:['YYYY-MM-DD',...], values:[Number,...]} */
export const fetchWtiPriceData = async () => {
  try {
    const ref = doc(db, "data total1", "가격_wti");
    const snap = await getDoc(ref);
    if (!snap.exists()) return { dates: [], values: [] };
    const raw = snap.data();
    const sorted = Object.entries(raw).sort(([a],[b]) => kstDate(a) - kstDate(b));
    return {
      dates: sorted.map(([d]) => d),
      values: sorted.map(([_,v]) => Number(v))
    };
  } catch {
    return { dates: [], values: [] };
  }
};

/** 탄소배출권 가격(ETS): {dates:['YYYY-MM-DD',...], values:[Number,...]} */
export const fetchEtsPriceData = async () => {
  try {
    const ref = doc(db, "data total1", "종가_ets");
    const snap = await getDoc(ref);
    if (!snap.exists()) return { dates: [], values: [] };
    const raw = snap.data();
    const sorted = Object.entries(raw).sort(([a],[b]) => kstDate(a) - kstDate(b));
    return {
      dates: sorted.map(([d]) => d),
      values: sorted.map(([_,v]) => Number(v))
    };
  } catch {
    return { dates: [], values: [] };
  }
};
