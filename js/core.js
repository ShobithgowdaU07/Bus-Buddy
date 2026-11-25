/* BUS BUDDY core logic: pure functions, shared by the browser app and the Node test suite */
(function (root) {
  const REFUND_RATE = 0.8;
  const H = { admin: "e86f78a8a3caf0b60d8e74e5942aa6d86dc150cd3c03338aef25b7d2d7e3acc7",
              demo: "ff96673205dc722320598ebf8f88325b2ac56922d5a2164b5765868274bc0d73" };
  const err = (m) => { throw new Error(m); };
  const today = () => new Date().toISOString().slice(0, 10);

  async function sha(s) {
    const c = root.crypto || require("crypto").webcrypto;
    const b = await c.subtle.digest("SHA-256", new TextEncoder().encode(s));
    return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
  }

  function newState() {
    const bus = (id, from, to, time, fare, type) => ({ id, from, to, time, fare, seats: 20, type });
    return {
      n: 1001, nb: 106, nu: 3,
      users: [
        { id: 1, name: "Mess Head Admin", email: "admin@routerider.com", phone: "9000000001", role: "admin", hash: H.admin },
        { id: 2, name: "Aarav Sharma", email: "demo@routerider.com", phone: "9811010000", role: "passenger", hash: H.demo }],
      buses: [bus("B101", "Bengaluru", "Mysuru", "06:00", 350, "AC Seater"),
        bus("B102", "Bengaluru", "Mangaluru", "21:30", 750, "AC Sleeper"),
        bus("B103", "Bengaluru", "Hyderabad", "20:00", 900, "Volvo Multi-Axle"),
        bus("B104", "Bengaluru", "Chennai", "22:00", 650, "AC Sleeper"),
        bus("B105", "Mysuru", "Bengaluru", "18:00", 350, "AC Seater"),
        bus("B106", "Bengaluru", "Goa", "19:00", 1100, "Volvo Multi-Axle"),
        bus("B107", "Bengaluru", "Pune", "17:30", 1250, "AC Sleeper"),
        bus("B108", "Bengaluru", "Coimbatore", "07:30", 550, "AC Seater"),
        bus("B109", "Bengaluru", "Ooty", "08:00", 680, "AC Seater"),
        bus("B110", "Bengaluru", "Kochi", "20:30", 980, "AC Sleeper"),
        bus("B111", "Chennai", "Bengaluru", "20:15", 650, "AC Sleeper"),
        bus("B112", "Hyderabad", "Bengaluru", "21:00", 900, "Volvo Multi-Axle")],
      bookings: [], notes: [],
    };
  }

  const note = (S, uid, text) => S.notes.push({ uid, text, read: false, at: new Date().toISOString() });

  async function register(S, { name, email, phone, password }) {
    name = (name || "").trim(); email = (email || "").trim().toLowerCase(); phone = (phone || "").trim();
    if (!/^[A-Za-z][A-Za-z .]{1,29}$/.test(name)) err("Enter a valid name.");
    if (!/^[^@\s]+@[^@\s]+\.[A-Za-z]{2,}$/.test(email)) err("Enter a valid email address.");
    if (!/^[6-9]\d{9}$/.test(phone)) err("Phone must be a valid 10-digit number.");
    if ((password || "").length < 6) err("Password must be at least 6 characters.");
    if (S.users.some((u) => u.email === email)) err("This email is already registered.");
    const u = { id: S.nu++, name, email, phone, role: "passenger", hash: await sha(password) };
    S.users.push(u); note(S, u.id, "Welcome to BUS BUDDY, " + name + "!");
    return u;
  }

  async function login(S, email, password) {
    const u = S.users.find((x) => x.email === (email || "").trim().toLowerCase());
    if (!u || u.hash !== (await sha(password || ""))) err("Invalid email or password.");
    return u;
  }

  function search(S, from, to) {
    if (!from || !to) err("Source and destination are required.");
    if (from === to) err("Source and destination cannot be the same.");
    return S.buses.filter((b) => b.from === from && b.to === to);
  }

  const taken = (S, id, date) => S.bookings.filter((b) => b.bus === id && b.date === date && b.status === "CONFIRMED").map((b) => b.seat);

  function book(S, user, { bus, date, seat, name, phone }) {
    const b = S.buses.find((x) => x.id === bus) || err("Bus not found.");
    if (!user || user.role !== "passenger") err("Only passengers can book tickets.");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date || "") || isNaN(new Date(date))) err("Date must be in YYYY-MM-DD format.");
    if (date < today()) err("Travel date cannot be in the past.");
    if (!/^[A-Za-z][A-Za-z .]{1,29}$/.test((name || "").trim())) err("Enter a valid passenger name.");
    if (!/^[6-9]\d{9}$/.test((phone || "").trim())) err("Phone must be a valid 10-digit number.");
    seat = Number(seat);
    if (!Number.isInteger(seat) || seat < 1 || seat > b.seats) err("Please pick a valid seat.");
    if (taken(S, bus, date).includes(seat)) err("Seat " + seat + " is already booked.");
    const bk = { id: "T" + S.n++, uid: user.id, bus, date, seat, name: name.trim(), phone: phone.trim(), fare: b.fare, status: "CONFIRMED", refund: 0 };
    S.bookings.push(bk);
    note(S, user.id, `Ticket ${bk.id} confirmed: ${b.from} to ${b.to} on ${date}, seat ${seat}.`);
    return bk;
  }

  function cancel(S, user, id) {
    const bk = S.bookings.find((x) => x.id === (id || "").trim().toUpperCase()) || err("Booking not found.");
    if (!user || (user.role !== "admin" && bk.uid !== user.id)) err("You can only cancel your own bookings.");
    if (bk.status === "CANCELLED") err("Booking is already cancelled.");
    bk.status = "CANCELLED"; bk.refund = Math.round(bk.fare * REFUND_RATE * 100) / 100;
    note(S, bk.uid, `Ticket ${bk.id} cancelled. Refund of Rs.${bk.refund} initiated.`);
    return bk;
  }

  function addBus(S, user, { from, to, time, fare, type }) {
    if (!user || user.role !== "admin") err("Only administrators can manage buses.");
    from = (from || "").trim(); to = (to || "").trim();
    if (!from || !to || from.toLowerCase() === to.toLowerCase()) err("Enter two different cities.");
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time || "")) err("Enter departure time as HH:MM.");
    fare = Number(fare);
    if (!(fare > 0 && fare <= 10000)) err("Fare must be between 1 and 10000.");
    const b = { id: "B" + S.nb++, from, to, time, fare, seats: 20, type: type || "AC Seater" };
    S.buses.push(b);
    S.users.filter((u) => u.role === "passenger").forEach((u) => note(S, u.id, `New bus ${b.id}: ${from} to ${to} at ${time}, Rs.${fare}.`));
    return b;
  }

  function deleteBus(S, user, id) {
    if (!user || user.role !== "admin") err("Only administrators can manage buses.");
    const i = S.buses.findIndex((b) => b.id === id); if (i < 0) err("Bus not found.");
    if (S.bookings.some((b) => b.bus === id && b.status === "CONFIRMED")) err("Bus has confirmed bookings and cannot be removed.");
    S.buses.splice(i, 1);
  }

  function stats(S) {
    const ok = S.bookings.filter((b) => b.status === "CONFIRMED"), no = S.bookings.filter((b) => b.status === "CANCELLED");
    const byRoute = {};
    ok.forEach((b) => { const x = S.buses.find((v) => v.id === b.bus); const k = x ? x.from + " - " + x.to : b.bus; byRoute[k] = (byRoute[k] || 0) + 1; });
    const revenue = ok.reduce((a, b) => a + b.fare, 0), refunds = no.reduce((a, b) => a + b.refund, 0);
    const cap = Math.max(S.buses.length * 20, 1);
    return { total: S.bookings.length, confirmed: ok.length, cancelled: no.length, revenue, refunds, byRoute, occupancy: Math.round((ok.length / cap) * 1000) / 10 };
  }

  root.RR = { REFUND_RATE, newState, register, login, search, taken, book, cancel, addBus, deleteBus, stats, note, today, sha };
  if (typeof module !== "undefined") module.exports = root.RR;
})(typeof window !== "undefined" ? window : globalThis);
