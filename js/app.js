/* BUS BUDDY UI: hash-routed single page app (data kept in the browser's localStorage) */
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const inr = (n) => "₹" + Number(n).toLocaleString("en-IN");
let S; try { S = JSON.parse(localStorage.getItem("rr_s")); } catch (e) {}
if (!S || !S.users) S = RR.newState();
const save = () => { try { localStorage.setItem("rr_s", JSON.stringify(S)); } catch (e) {} };
let me = null; try { me = S.users.find((u) => u.id == sessionStorage.getItem("rr_u")) || null; } catch (e) {}
const tomorrow = () => new Date(Date.now() + 864e5).toISOString().slice(0, 10);
let sv = { from: "Bengaluru", to: "Mysuru", date: tomorrow(), bus: null, seat: null };
const COL = ["#2563eb,#14b8a6", "#1d4ed8,#06b6d4", "#4f46e5,#0ea5e9", "#0f766e,#2dd4bf", "#1e40af,#38bdf8"];
const BUS = (c) => `<svg viewBox="0 0 200 90" style="color:${c}"><rect x="4" y="10" width="190" height="55" rx="14" fill="currentColor"/>${[14, 50, 86, 122].map((x) => `<rect x="${x}" y="20" width="30" height="22" rx="4" fill="#dbeafe"/>`).join("")}<path d="M158 20h22a8 8 0 0 1 8 8v14h-30z" fill="#99f6e4"/><rect x="4" y="48" width="190" height="8" fill="#fff" opacity=".3"/><circle cx="48" cy="68" r="14" fill="#172033"/><circle cx="48" cy="68" r="6" fill="#cbd5e1"/><circle cx="150" cy="68" r="14" fill="#172033"/><circle cx="150" cy="68" r="6" fill="#cbd5e1"/></svg>`;
const LOGO = `<svg width="38" height="38" viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="#fff" stroke="#dbeafe" stroke-width="2"/><circle cx="20" cy="20" r="11" fill="none" stroke="#2563eb" stroke-width="5"/><circle cx="20" cy="20" r="4" fill="#14b8a6"/></svg>`;
const logo = (t) => `<div class="logo">${LOGO}<div>BUS <b>BUDDY</b>${t || ""}<small>SMARTER TRIPS. SEAMLESS BOOKING.</small></div></div>`;
const flash = (sel, t, k) => { const el = $(sel); if (el) el.innerHTML = t ? `<div class="msg ${k || "e"}">${esc(t)}</div>` : ""; };
const status = (s) => `<span class="tag2 ${s === "CONFIRMED" ? "ok" : "no"}">${s}</span>`;
const routeOf = (id) => { const b = S.buses.find((x) => x.id === id); return b ? `${b.from} → ${b.to}` : id; };
const unread = () => S.notes.filter((n) => n.uid === me.id && !n.read).length;

function landing() {
  $("#app").innerHTML = `<div class="nav">${logo()}<div><a class="btn g s" href="#/login">Sign In</a> <a class="btn s" href="#/register">Passenger Register</a></div></div>
  <section class="hero"><div><span class="pill">✦ Intelligent Bus Reservation Platform</span>
  <h1>Smart Travel. Zero Queues. <span>Effortless Bus Booking.</span></h1>
  <p>The next-generation digital reservation platform for bus operators and passengers. Live seat maps, instant tickets, transparent refunds and real-time operator analytics.</p>
  <a class="btn" href="#/login">Launch Passenger Portal →</a><a class="btn w" href="#/login">Admin Management Console</a></div>
  <div class="bus-hero" aria-label="BUS BUDDY premium bus illustration"><div class="sun-disc"></div><div class="city city-one"></div><div class="city city-two"></div><div class="floating-status live"><i></i><b>Live availability</b><span>12 seats open</span></div><div class="floating-status arrival"><span>Next departure</span><b>06:00 AM</b></div><div class="road"><div class="road-line"></div></div><div class="hero-bus"><div class="bus-roof"><span>BUS BUDDY</span></div><div class="bus-glass"><i></i><i></i><i></i><i></i><i></i></div><div class="bus-door"><span></span></div><div class="bus-light left"></div><div class="bus-light right"></div><div class="wheel wheel-left"><i></i></div><div class="wheel wheel-right"><i></i></div></div><div class="route-pin pin-start">BLR</div><div class="route-pin pin-end">MYR</div></div></section>
  <div class="destination-heading"><span>EXPLORE INDIA</span><h2>Popular places, ready to book</h2></div>
  <div class="destination-carousel"><button class="destination-arrow" data-act="destination-prev" aria-label="Previous destination">‹</button><div class="destination-grid">
    <article class="destination-card" style="background-image:linear-gradient(180deg,rgba(15,23,42,.05),rgba(15,23,42,.78)),url('images/bengaluru.jpg')"><div class="destination-tag">NOW TRENDING</div><div class="destination-name"><b>Bengaluru</b><span>Garden City · from ₹350</span></div></article>
    <article class="destination-card" style="background-image:linear-gradient(180deg,rgba(15,23,42,.05),rgba(15,23,42,.78)),url('images/mysuru.jpg')"><div class="destination-tag">ROYAL PICK</div><div class="destination-name"><b>Mysuru</b><span>Palace City · 3h 40m</span></div></article>
    <article class="destination-card" style="background-image:linear-gradient(180deg,rgba(15,23,42,.05),rgba(15,23,42,.78)),url('images/goa.jpg')"><div class="destination-tag">WEEKEND ESCAPE</div><div class="destination-name"><b>Goa</b><span>Beach Gateway · from ₹1,100</span></div></article>
    <article class="destination-card" style="background-image:linear-gradient(180deg,rgba(15,23,42,.05),rgba(15,23,42,.78)),url('images/ooty.jpg')"><div class="destination-tag">HILL STATION</div><div class="destination-name"><b>Ooty</b><span>Nilgiri Hills · from ₹680</span></div></article>
    <article class="destination-card" style="background-image:linear-gradient(180deg,rgba(15,23,42,.05),rgba(15,23,42,.78)),url('images/pune.jpg')"><div class="destination-tag">CITY BREAK</div><div class="destination-name"><b>Pune</b><span>Culture & cafés · from ₹1,250</span></div></article>
    <article class="destination-card" style="background-image:linear-gradient(180deg,rgba(15,23,42,.05),rgba(15,23,42,.78)),url('images/kochi.jpg')"><div class="destination-tag">COASTAL ROUTE</div><div class="destination-name"><b>Kochi</b><span>Queen of Arabian Sea · from ₹980</span></div></article>
  </div><button class="destination-arrow next" data-act="destination-next" aria-label="Next destination">›</button></div>
  <div class="trust-row"><div><b>20+</b><span>Smart seats</span></div><div><b>80%</b><span>Quick refund</span></div><div><b>100%</b><span>Digital tickets</span></div><div><b>24/7</b><span>Trip access</span></div></div>
  <div class="feat">${[["⚡", "Instant e-tickets", "Your unique ticket is ready the moment you confirm."], ["💺", "Interactive seat map", "See seat availability clearly and avoid double booking."], ["↩️", "Smart 80% refund", "Cancel in one tap with a transparent refund estimate."], ["🎒", "One journey hub", "Bookings, alerts, profiles and trips in one place."]].map((f) => `<article class="card feature-card"><div class="feature-icon">${f[0]}</div><h3>${f[1]}</h3><p class="sub">${f[2]}</p></article>`).join("")}</div>
  <div class="journey-planner"><div class="planner-copy"><span>JOURNEY PLANNER</span><h2>Where will your next adventure begin?</h2><p>Compare popular routes and reserve the right seat in seconds.</p></div><div class="planner-route"><div><small>FROM</small><b>Bengaluru</b></div><div class="planner-arrow">→</div><div><small>TO</small><b>Mysuru</b></div><a class="btn" href="#/login">Plan journey</a></div></div>
  <div class="boarding-showcase"><div class="boarding-map"><div class="terminal terminal-a">A1</div><div class="terminal-line"><i></i><i></i><i></i></div><div class="terminal terminal-b">A5</div><div class="boarding-bus"><span>BUS BUDDY</span></div></div><div class="boarding-copy"><span>YOUR BOARDING, SIMPLIFIED</span><h2>From search to seat—<br><em>everything in one flow.</em></h2><div class="boarding-steps"><div><b>01</b><span><strong>Choose a route</strong><small>Pick your source and destination</small></span></div><div><b>02</b><span><strong>Select your seat</strong><small>View live availability</small></span></div><div><b>03</b><span><strong>Travel with ease</strong><small>Keep your digital ticket ready</small></span></div></div></div></div>`;
}

function authView(reg) {
  $("#app").innerHTML = `<div class="nav">${logo()}<a class="btn g s" href="#/">← Home</a></div>
  <div class="auth-page"><div class="auth">
    <aside class="auth-art"><div class="art-mark">🚌</div><div><h2>${reg ? "Start your next journey." : "Welcome back."}</h2><p>${reg ? "Create your passenger account and reserve seats in just a few taps." : "Sign in to manage bookings, find buses and track your trips."}</p></div><small>BUS BUDDY · SMART TRAVEL</small></aside>
    <section class="auth-form"><h2>${reg ? "Create passenger account" : "Sign in to BUS BUDDY"}</h2><p class="h">${reg ? "Register to book and manage your bus tickets." : "Use your account or try a demo account below."}</p>
    ${reg ? "" : `<div class="demo-box"><b>Passenger:</b> demo@routerider.com / Demo@123<br><b>Admin:</b> admin@routerider.com / Admin@123</div>`}
    <form data-form="${reg ? "register" : "login"}">${reg ? `<label>Full name<input name="name" required></label><label>Phone<input name="phone" maxlength="10" required></label>` : ""}
    <label>Email<input name="email" type="email" required></label><label>Password<input name="password" type="password" required></label>
    <div id="am"></div><button class="btn" style="width:100%;justify-content:center">${reg ? "Create account" : "Sign in"}</button></form>
    <p class="h" style="margin:14px 0 0">${reg ? 'Already have an account? <a href="#/login"><b>Sign in</b></a>' : 'New passenger? <a href="#/register"><b>Create an account</b></a>'}</p></section>
  </div></div>`;
}

const NAV = { passenger: [["dashboard", "Dashboard"], ["search", "Search & Book"], ["bookings", "My Bookings"], ["notifications", "Notifications"], ["profile", "Profile"]],
  admin: [["dashboard", "Dashboard"], ["buses", "Manage Buses"], ["bookings", "All Bookings"], ["reports", "Reports & Analytics"]] };

function shell(page) {
  const r = me.role === "admin" ? "a" : "p";
  const P = { p: { dashboard: pDash, search: pSearch, bookings: pBook, notifications: pNote, profile: pProf }, a: { dashboard: aDash, buses: aBuses, bookings: aBook, reports: aRep } }[r];
  const fn = P[page] || P.dashboard;
  $("#app").innerHTML = `<div class="shell"><aside class="side">${logo(`<span class="tag">${me.role.toUpperCase()}</span>`)}
  ${NAV[me.role].map(([k, t]) => `<a class="${k === page ? "on" : ""}" href="#/${r}/${k}">${t}${k === "notifications" && unread() ? `<span class="bd">${unread()}</span>` : ""}</a>`).join("")}
  <a class="out" data-act="logout">⎋ Sign out</a></aside><main class="main">${fn()}</main></div>`;
  if (page === "search") runSearch();
}

const head = (e, t, s) => `<div class="eyebrow">${e}</div><h1>${t}</h1><p class="sub">${s}</p>`;
const stat = (t, v, s) => `<div class="card stat"><small>${t}</small><b>${v}</b><span>${s}</span></div>`;
const mine = () => S.bookings.filter((b) => b.uid === me.id);

function pDash() {
  const m = mine(), up = m.filter((b) => b.status === "CONFIRMED" && b.date >= RR.today());
  const hr = new Date().getHours(), g = hr < 12 ? "Morning" : hr < 17 ? "Afternoon" : "Evening";
  const nextTrip = up.slice().sort((a,b)=>a.date.localeCompare(b.date))[0];
  return head("Passenger portal", `Good ${g}, ${esc(me.name.split(" ")[0])}! 👋`, "Here is what is happening with your trips today.") +
    `<div class="cards">${stat("Upcoming trips", up.length, "Confirmed journeys")}${stat("Tickets booked", m.length, "All time")}${stat("Total spent", inr(m.filter((b) => b.status === "CONFIRMED").reduce((a, b) => a + b.fare, 0)), "Confirmed fares")}${stat("Refunds", inr(m.reduce((a, b) => a + b.refund, 0)), "80% on cancellation")}</div>
    ${nextTrip ? `<div class="next-trip card"><div><span>NEXT JOURNEY</span><h3>${routeOf(nextTrip.bus)}</h3><p>${nextTrip.date} · Seat ${nextTrip.seat} · ${nextTrip.id}</p></div><a class="btn" href="#/p/bookings">View ticket →</a></div>` : ""}
    <div class="quick-actions"><a href="#/p/search" class="card"><span>＋</span><div><b>Book a ride</b><small>Find a bus and choose seats</small></div></a><a href="#/p/bookings" class="card"><span>🎟</span><div><b>View my tickets</b><small>Manage and track journeys</small></div></a><a href="#/p/notifications" class="card"><span>🔔</span><div><b>Trip updates</b><small>${unread()} unread notification${unread() === 1 ? "" : "s"}</small></div></a></div>
    <div class="card"><h3>Upcoming journeys</h3>${up.length ? `<div class="tbl"><table><tr><th>Ticket</th><th>Route</th><th>Date</th><th>Seat</th></tr>${up.map((b) => `<tr><td>${b.id}</td><td>${routeOf(b.bus)}</td><td>${b.date}</td><td>${b.seat}</td></tr>`).join("")}</table></div>` : `<p class="sub">No upcoming trips. <a href="#/p/search"><b>Book one now →</b></a></p>`}</div>
    <h3 style="margin:6px 0 12px">Popular routes</h3><div class="routes">${S.buses.map((b, i) => `<div class="rt" style="background:linear-gradient(135deg,${COL[i % 5]})" data-act="route" data-f="${b.from}" data-t="${b.to}"><h3>${b.from} → ${b.to}</h3><small>Departs ${b.time} · from ${inr(b.fare)}</small>${BUS("#fff")}</div>`).join("")}</div>`;
}

function pSearch() {
  const cities = [...new Set(S.buses.flatMap((b) => [b.from, b.to]))].sort();
  const o = (v) => cities.map((c) => `<option ${c === v ? "selected" : ""}>${esc(c)}</option>`).join("");
  return head("Passenger portal", "Search & Book", "Find a bus, choose your seat and get your ticket instantly.") +
    `<div class="card"><form class="row" data-form="search"><label>From<select name="from">${o(sv.from)}</select></label><label>To<select name="to">${o(sv.to)}</select></label><label>Date<input type="date" name="date" min="${RR.today()}" value="${sv.date}"></label><button class="btn">Search buses</button></form></div><div id="sres"></div><div id="sbox"></div>`;
}

function runSearch() {
  try {
    const r = RR.search(S, sv.from, sv.to);
    $("#sres").innerHTML = r.length ? r.map((b, i) => `<div class="card res">${BUS(["#2563eb", "#14b8a6", "#1d4ed8"][i % 3])}<div class="i"><h3>${esc(b.from)} → ${esc(b.to)}</h3><p class="sub" style="margin:4px 0">Departs ${b.time} · ${esc(b.type)} · ${b.seats - RR.taken(S, b.id, sv.date).length} seats left</p></div><div class="fare">${inr(b.fare)}</div><button class="btn" data-act="pick" data-id="${b.id}">Select seats</button></div>`).join("") : `<div class="card"><p class="sub">No buses found on this route.</p></div>`;
  } catch (e) { $("#sres").innerHTML = `<div class="msg e">${esc(e.message)}</div>`; }
  drawBox();
}

function drawBox(scroll) {
  const b = S.buses.find((x) => x.id === sv.bus), el = $("#sbox"); if (!el) return;
  if (!b) { el.innerHTML = ""; return; }
  const tk = RR.taken(S, b.id, sv.date); let h = "";
  for (let i = 1; i <= b.seats; i++) { h += `<button class="seat ${tk.includes(i) ? "x" : ""} ${sv.seat === i ? "sel" : ""}" ${tk.includes(i) ? "disabled" : ""} data-act="seat" data-n="${i}">${i}</button>`; if (i % 4 === 2) h += "<span></span>"; }
  el.innerHTML = `<div class="card"><h3>${esc(b.from)} → ${esc(b.to)} · ${sv.date}</h3><p class="sub" style="text-align:center;margin:10px 0 0">🚌 Front of the bus</p><div class="seats">${h}</div>
  <form class="row" data-form="book"><label>Passenger name<input name="name" value="${esc(me.name)}" required></label><label>Phone<input name="phone" value="${esc(me.phone)}" maxlength="10" required></label><button class="btn">Confirm booking${sv.seat ? " · seat " + sv.seat : ""}</button></form><div id="bm"></div></div>`;
  if (scroll) el.scrollIntoView({ behavior: "smooth" });
}

const bookTable = (list, admin) => `<div class="card tbl"><table><tr><th>Ticket</th>${admin ? "<th>Passenger</th>" : ""}<th>Route</th><th>Date</th><th>Seat</th><th>Fare</th><th>Status</th><th></th></tr>${list.length ? list.map((b) => `<tr><td>${b.id}</td>${admin ? `<td>${esc(b.name)}</td>` : ""}<td>${routeOf(b.bus)}</td><td>${b.date}</td><td>${b.seat}</td><td>${inr(b.fare)}</td><td>${status(b.status)}</td><td>${b.status === "CONFIRMED" ? `<button class="btn s g" data-act="cancel" data-id="${b.id}">Cancel</button>` : b.refund ? `Refund ${inr(b.refund)}` : ""}</td></tr>`).join("") : `<tr><td colspan="8">No bookings yet.</td></tr>`}</table><div id="cm"></div></div>`;
const pBook = () => head("Passenger portal", "My Bookings", "View your tickets and cancel for an 80% refund.") + bookTable(mine().slice().reverse(), false);
const aBook = () => head("Admin console", "All Bookings", "Every ticket booked across all buses.") + bookTable(S.bookings.slice().reverse(), true);

function pNote() {
  const l = S.notes.filter((n) => n.uid === me.id).reverse(), out = head("Passenger portal", "Notifications", "Booking confirmations, refunds and new bus alerts.") +
    `<div class="card">${l.length ? l.map((n) => `<div class="note ${n.read ? "" : "u"}">${esc(n.text)} ${n.read ? "" : '<span class="tag2 new">NEW</span>'}<br><small class="sub">${new Date(n.at).toLocaleString()}</small></div>`).join("") : '<p class="sub">No notifications.</p>'}</div>`;
  S.notes.forEach((n) => { if (n.uid === me.id) n.read = true; }); save(); return out;
}
const pProf = () => head("Account details", "Passenger Profile", "Your registered contact information.") +
  `<div class="card"><h3>${esc(me.name)}</h3><p class="sub">${esc(me.email)}</p><p><b>Phone:</b> ${esc(me.phone)}</p><p><b>Role:</b> ${me.role}</p><p><b>Tickets booked:</b> ${mine().length}</p></div>`;

function aDash() {
  const t = RR.stats(S), al = [];
  if (t.occupancy < 30) al.push(["medium", "Low overall occupancy", `Occupancy is ${t.occupancy}%. Consider promotions on quiet routes.`]);
  if (t.total && t.cancelled / t.total > 0.2) al.push(["high", "High cancellation rate", `${t.cancelled} of ${t.total} tickets were cancelled.`]);
  const top = Object.entries(t.byRoute).sort((a, b) => b[1] - a[1])[0]; if (top) al.push(["low", "Top route", `${top[0]} leads with ${top[1]} confirmed tickets.`]);
  return head("Admin console", "Operations Overview", "Real-time bookings, revenue and occupancy.") +
    `<div class="cards">${stat("Total bookings", t.total, t.confirmed + " confirmed")}${stat("Revenue", inr(t.revenue), "Confirmed fares")}${stat("Refunds", inr(t.refunds), t.cancelled + " cancellations")}${stat("Occupancy", t.occupancy + "%", "Across all buses")}</div>
    <div class="card"><h3>Insights</h3>${al.length ? al.map((a) => `<div class="note"><b>${a[1]}</b> <span class="tag2 new">${a[0]}</span><br>${a[2]}</div>`).join("") : '<p class="sub">No insights yet. Bookings will appear here.</p>'}</div>
    <div class="card tbl"><h3>Fleet</h3><table><tr><th>Bus</th><th>Route</th><th>Departs</th><th>Fare</th></tr>${S.buses.map((b) => `<tr><td>${b.id}</td><td>${b.from} → ${b.to}</td><td>${b.time}</td><td>${inr(b.fare)}</td></tr>`).join("")}</table></div>`;
}

const aBuses = () => head("Admin console", "Manage Buses", "Add or remove buses. Passengers are notified of new buses.") +
  `<div class="card"><form class="row" data-form="addbus"><label>From<input name="from" required></label><label>To<input name="to" required></label><label>Departure<input name="time" type="time" required></label><label>Fare (₹)<input name="fare" type="number" required></label><label>Type<select name="type"><option>AC Seater</option><option>AC Sleeper</option><option>Volvo Multi-Axle</option></select></label><button class="btn">Add bus</button></form><div id="am"></div></div>
  <div class="card tbl"><table><tr><th>Bus</th><th>Route</th><th>Departs</th><th>Type</th><th>Fare</th><th></th></tr>${S.buses.map((b) => `<tr><td>${b.id}</td><td>${esc(b.from)} → ${esc(b.to)}</td><td>${b.time}</td><td>${esc(b.type)}</td><td>${inr(b.fare)}</td><td><button class="btn s g" data-act="delbus" data-id="${b.id}">Remove</button></td></tr>`).join("")}</table></div>`;

function aRep() {
  const t = RR.stats(S), rows = Object.entries(t.byRoute), mx = Math.max(1, ...rows.map((r) => r[1])), sp = Math.max(t.revenue, t.refunds, 1);
  const bar = (l, v, m, txt) => `<div class="bar"><span>${l}</span><i style="width:${Math.max(4, (v / m) * 55)}%"></i><b>${txt}</b></div>`;
  return head("Admin console", "Reports & Analytics", "Bookings per route, revenue and refunds.") +
    `<div class="card"><h3>Confirmed bookings per route</h3>${rows.length ? rows.map((r) => bar(r[0], r[1], mx, r[1])).join("") : '<p class="sub">No confirmed bookings yet.</p>'}</div>
    <div class="card"><h3>Revenue vs refunds</h3>${bar("Revenue", t.revenue, sp, inr(t.revenue))}${bar("Refunds", t.refunds, sp, inr(t.refunds))}</div>
    <div class="card"><h3>Booking status</h3>${bar("Confirmed", t.confirmed, Math.max(t.total, 1), t.confirmed)}${bar("Cancelled", t.cancelled, Math.max(t.total, 1), t.cancelled)}</div>`;
}

document.addEventListener("click", (e) => {
  const a = e.target.closest("[data-act]"); if (!a) return; const d = a.dataset;
  try {
    if (d.act === "logout") { sessionStorage.removeItem("rr_u"); me = null; location.hash = "#/"; render(); }
    else if (d.act === "route") { sv.from = d.f; sv.to = d.t; sv.bus = null; location.hash = "#/p/search"; render(); }
    else if (d.act === "pick") { sv.bus = d.id; sv.seat = null; drawBox(true); }
    else if (d.act === "seat") { sv.seat = Number(d.n); drawBox(); }
    else if (d.act === "cancel") { const b = RR.cancel(S, me, d.id); save(); render(); flash("#cm", `Ticket ${b.id} cancelled. Refund: ${inr(b.refund)}`, "k"); }
    else if (d.act === "delbus") { RR.deleteBus(S, me, d.id); save(); render(); }
    else if (d.act === "destination-prev" || d.act === "destination-next") {
      const grid = document.querySelector(".destination-grid");
      if (!grid) return;
      const distance = Math.min(260, grid.clientWidth);
      grid.scrollBy({ left: d.act === "destination-next" ? distance : -distance, behavior: "smooth" });
    }
  } catch (x) { flash("#cm", x.message); flash("#am", x.message); }
});

document.addEventListener("submit", async (e) => {
  const f = e.target.dataset.form; if (!f) return; e.preventDefault();
  const d = Object.fromEntries(new FormData(e.target));
  try {
    if (f === "login" || f === "register") {
      me = f === "login" ? await RR.login(S, d.email, d.password) : await RR.register(S, d);
      save(); sessionStorage.setItem("rr_u", me.id); location.hash = me.role === "admin" ? "#/a/dashboard" : "#/p/dashboard"; render();
    } else if (f === "search") { Object.assign(sv, { from: d.from, to: d.to, date: d.date, bus: null, seat: null }); runSearch(); }
    else if (f === "book") {
      const bk = RR.book(S, me, { bus: sv.bus, date: sv.date, seat: sv.seat, name: d.name, phone: d.phone }); save(); sv.seat = null;
      runSearch(); flash("#bm", `Booked! Your ticket ID is ${bk.id}. See My Bookings.`, "k");
    } else if (f === "addbus") { const b = RR.addBus(S, me, d); save(); render(); flash("#am", `Bus ${b.id} added and passengers notified.`, "k"); }
  } catch (x) { flash("#am", x.message); flash("#bm", x.message); }
});

function render() {
  const h = location.hash.replace(/^#\/?/, ""), [role, page] = h.split("/");
  if (h === "" || h === "home") return landing();
  if (h === "login" || h === "register") return authView(h === "register");
  if (!me) { location.hash = "#/login"; return; }
  if ((role === "p" && me.role === "passenger") || (role === "a" && me.role === "admin")) return shell(page || "dashboard");
  location.hash = me.role === "admin" ? "#/a/dashboard" : "#/p/dashboard";
}
window.addEventListener("hashchange", render);
render();
