// Pure sales maths for the admin dashboard. Times are handled in India time (IST, UTC+5:30).
export const REVENUE = ["paid", "shipped", "delivered"];
export const dayKey = (t) => new Date(new Date(t).getTime() + 19800000).toISOString().slice(0, 10);
const sum = (a, f) => a.reduce((s, x) => s + f(x), 0);
export function buildStats(orders, offline, days, now = Date.now()) {
  const start = now - days * 864e5, prevStart = now - 2 * days * 864e5;
  const when = (o) => new Date(o.paid_at || o.created_at).getTime();
  const sold = orders.filter((o) => REVENUE.includes(o.status));
  const win = (rows, t, a, b) => rows.filter((r) => { const x = t(r); return x > a && x <= b; });
  const period = (a, b) => {
    const os = win(sold, when, a, b), off = win(offline, (r) => new Date(r.created_at).getTime(), a, b);
    const online = sum(os, (o) => o.total), offRev = sum(off, (r) => -r.change * (r.price || 0));
    return { online, offRev, total: online + offRev, orders: os.length, aov: os.length ? Math.round(online / os.length) : 0,
      pieces: sum(os, (o) => sum(o.order_items || [], (i) => i.qty)) + sum(off, (r) => -r.change), offPieces: sum(off, (r) => -r.change), os, off };
  };
  const cur = period(start, now), prev = period(prevStart, start);
  const series = Array.from({ length: days }, (_, k) => ({ day: dayKey(now - (days - 1 - k) * 864e5), online: 0, offline: 0 }));
  const idx = Object.fromEntries(series.map((s, k) => [s.day, k]));
  cur.os.forEach((o) => { const k = idx[dayKey(when(o))]; if (k !== undefined) series[k].online += o.total; });
  cur.off.forEach((r) => { const k = idx[dayKey(r.created_at)]; if (k !== undefined) series[k].offline += -r.change * (r.price || 0); });
  const top = {};
  cur.os.forEach((o) => (o.order_items || []).forEach((i) => { const t = (top[i.product_title] ||= { title: i.product_title, qty: 0, rev: 0 }); t.qty += i.qty; t.rev += i.qty * i.price; }));
  cur.off.forEach((r) => { const t = (top[r.product_title] ||= { title: r.product_title, qty: 0, rev: 0 }); t.qty += -r.change; t.rev += -r.change * (r.price || 0); });
  const pct = (a, b) => (b > 0 ? Math.round(((a - b) / b) * 100) : null);
  return { cur, prev, series, top: Object.values(top).sort((a, b) => b.qty - a.qty || b.rev - a.rev).slice(0, 5),
    delta: { total: pct(cur.total, prev.total), orders: pct(cur.orders, prev.orders), aov: pct(cur.aov, prev.aov), pieces: pct(cur.pieces, prev.pieces) } };
}
