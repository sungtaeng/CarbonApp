// utils/seriesFromDates.js
// 주봉=금요일만, 월봉=그 달 말일만(없으면 그 달 마지막 값), 년봉=12/31만(없으면 그 해 마지막 값)
// 요일/말일/연말 판정은 "시간대 무관(UTC)"으로 계산해서 기기 타임존 영향 제거.

function parseYMD(s) {
  // s: 'YYYY-MM-DD'
  const y = Number(s.slice(0, 4));
  const m = Number(s.slice(5, 7)); // 1..12
  const d = Number(s.slice(8, 10)); // 1..31
  return { y, m, d };
}

function utcMsOf(s) {
  const { y, m, d } = parseYMD(s);
  return Date.UTC(y, m - 1, d); // UTC 자정 ms
}

function weekdayUTC(s) {
  const { y, m, d } = parseYMD(s);
  // 해당 '달력 날짜'의 요일을 시간대 독립적으로 계산
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay(); // 0=Sun .. 5=Fri
}

function monthEndDay(y, m0) {
  // m0: 0..11
  // UTC 기준 말일 (시간대 무관)
  return new Date(Date.UTC(y, m0 + 1, 0)).getUTCDate();
}

/** 주: 금요일만 */
function weeklyFridayPairs(dates, values) {
  const out = [];
  for (let i = 0; i < dates.length; i++) {
    if (weekdayUTC(dates[i]) === 5) { // 금요일
      out.push({ date: dates[i], value: Number(values[i]) });
    }
  }
  return out;
}

/** 월: 말일 값 있으면 그 값, 없으면 그 달의 마지막 값 */
function monthlyEOMPairs(dates, values) {
  const buckets = new Map(); // 'YYYY-MM' -> { monthEndIdx, lastIdx, lastMs }
  for (let i = 0; i < dates.length; i++) {
    const { y, m, d } = parseYMD(dates[i]);
    const key = `${y}-${String(m).padStart(2, '0')}`;
    const eom = monthEndDay(y, m - 1);
    const ms = utcMsOf(dates[i]);
    const slot = buckets.get(key) || { monthEndIdx: -1, lastIdx: -1, lastMs: -1 };
    if (ms >= slot.lastMs) { slot.lastIdx = i; slot.lastMs = ms; }
    if (d === eom) slot.monthEndIdx = i;
    buckets.set(key, slot);
  }
  const out = [];
  for (const key of Array.from(buckets.keys()).sort()) {
    const { monthEndIdx, lastIdx } = buckets.get(key);
    const idx = monthEndIdx >= 0 ? monthEndIdx : lastIdx;
    if (idx >= 0) out.push({ date: dates[idx], value: Number(values[idx]) });
  }
  return out;
}

/** 년: 12/31 값 있으면 그 값, 없으면 그 해 마지막 값 */
function yearlyDec31Pairs(dates, values) {
  const buckets = new Map(); // y -> { dec31Idx, lastIdx, lastMs }
  for (let i = 0; i < dates.length; i++) {
    const { y, m, d } = parseYMD(dates[i]);
    const ms = utcMsOf(dates[i]);
    const slot = buckets.get(y) || { dec31Idx: -1, lastIdx: -1, lastMs: -1 };
    if (ms >= slot.lastMs) { slot.lastIdx = i; slot.lastMs = ms; }
    if (m === 12 && d === 31) slot.dec31Idx = i;
    buckets.set(y, slot);
  }
  const out = [];
  for (const y of Array.from(buckets.keys()).sort((a, b) => a - b)) {
    const { dec31Idx, lastIdx } = buckets.get(y);
    const idx = dec31Idx >= 0 ? dec31Idx : lastIdx;
    if (idx >= 0) out.push({ date: dates[idx], value: Number(values[idx]) });
  }
  return out;
}

/**
 * 봉 집계 (전체 기간 유지)
 * timeframe: '1주' | '1개월' | '3개월' | '6개월' | '1년' | '3년' | '5년'
 * 반환: { dates: string[], values: number[] }
 */
export function buildCloseSeriesFromDates(dates = [], values = [], timeframe = '1주') {
  if (!Array.isArray(dates) || !Array.isArray(values) || dates.length !== values.length) return { dates: [], values: [] };
  if (dates.length === 0) return { dates: [], values: [] };

  // 오름차순 정렬(UTC ms로 안정 정렬)
  const idxs = dates.map((d, i) => i).sort((a, b) => utcMsOf(dates[a]) - utcMsOf(dates[b]));
  const sDates = idxs.map(i => dates[i]);
  const sValues = idxs.map(i => Number(values[i]));

  let pairs = [];
  if (timeframe.includes('주'))         pairs = weeklyFridayPairs(sDates, sValues);
  else if (timeframe.includes('개월'))  pairs = monthlyEOMPairs(sDates, sValues);
  else                                  pairs = yearlyDec31Pairs(sDates, sValues);

  return { dates: pairs.map(p => p.date), values: pairs.map(p => p.value) };
}
