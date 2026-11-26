const RR = require("./js/core.js");
const fs = require("fs");
const results = [];
const rec = (id, module, scenario, expected, actual, ok) => results.push({ id, module, scenario, expected, actual, status: ok ? "PASS" : "FAIL" });
const tr = async (f) => { try { return { v: await f() }; } catch (e) { return { e: e.message }; } };
const D = new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10);
(async () => {
  const S = RR.newState();
  let r = await tr(() => RR.login(S, "demo@routerider.com", "Demo@123"));
  rec("TC01", "Authentication", "Passenger logs in with valid credentials.", "Login succeeds with passenger role.", r.v ? "Logged in as " + r.v.role : r.e, r.v && r.v.role === "passenger");
  r = await tr(() => RR.login(S, "demo@routerider.com", "wrong"));
  rec("TC02", "Authentication", "Login with an incorrect password.", "Rejected with an error; no session.", r.e || "accepted", r.e === "Invalid email or password.");
  r = await tr(() => RR.register(S, { name: "Asha Rao", email: "demo@routerider.com", phone: "9876543210", password: "secret1" }));
  rec("TC03", "Registration", "Register with an already used email.", "Rejected as duplicate email.", r.e || "accepted", /already registered/.test(r.e || ""));
  const admin = S.users[0], pax = S.users[1];
  r = await tr(() => RR.addBus(S, admin, { from: "Bengaluru", to: "Goa", time: "19:30", fare: 1100, type: "AC Sleeper" }));
  const notified = S.notes.some((n) => n.uid === pax.id && /New bus/.test(n.text));
  rec("TC04", "Bus Management", "Admin adds a new bus.", "Bus saved and passengers notified.", r.v ? r.v.id + " added, notified=" + notified : r.e, r.v && notified);
  r = await tr(() => RR.search(S, "Bengaluru", "Mysuru"));
  rec("TC05", "Search", "Passenger searches Bengaluru to Mysuru.", "AC and Non-AC buses are listed.", r.v ? r.v.map((b) => b.id).join(",") : r.e, r.v && r.v.some((b) => b.id === "B101") && r.v.some((b) => b.id === "B113"));
  const acBuses = RR.search(S, "Bengaluru", "Mysuru", "AC"), nonAcBuses = RR.search(S, "Bengaluru", "Mysuru", "Non-AC");
  rec("TC20", "Bus Type Filter", "Filter a route by AC or Non-AC.", "Each filter returns only the selected bus type.",
    `AC=${acBuses.map((b) => b.id).join(",")}; Non-AC=${nonAcBuses.map((b) => b.id).join(",")}`,
    acBuses.length === 1 && RR.busTypeOf(acBuses[0]) === "AC" && nonAcBuses.length === 1 && RR.busTypeOf(nonAcBuses[0]) === "Non-AC");
  const seatState = RR.newState(), seatPax = seatState.users[1];
  const lastSeat = RR.book(seatState, seatPax, { bus: "B101", date: D, seat: 40, name: seatPax.name, phone: seatPax.phone });
  rec("TC21", "Bus Seat Capacity", "Book the last seat on a bus.", "Seat 40 is available on 40-seat buses.", `Seat ${lastSeat.seat} of ${seatState.buses[0].seats}`, lastSeat.seat === 40 && seatState.buses.every((b) => b.seats === 40));
  const bd = { bus: "B101", date: D, seat: 5, name: "Aarav Sharma", phone: "9811010000" };
  r = await tr(() => RR.book(S, pax, bd));
  rec("TC06", "Booking", "Book a free seat.", "Ticket T1001 confirmed.", r.v ? r.v.id + " " + r.v.status : r.e, r.v && r.v.id === "T1001");
  r = await tr(() => RR.book(S, pax, bd));
  rec("TC07", "Booking", "Book the same seat again.", "Rejected: seat already booked.", r.e || "accepted", /already booked/.test(r.e || ""));
  r = await tr(() => RR.book(S, pax, { ...bd, date: "2020-01-01", seat: 6 }));
  rec("TC08", "Validation", "Book with a past travel date.", "Rejected: date in the past.", r.e || "accepted", /past/.test(r.e || ""));
  r = await tr(() => RR.book(S, pax, { ...bd, phone: "12345", seat: 6 }));
  rec("TC09", "Validation", "Book with an invalid phone number.", "Rejected: invalid phone.", r.e || "accepted", /10-digit/.test(r.e || ""));
  r = await tr(() => RR.cancel(S, pax, "t1001"));
  rec("TC10", "Cancellation", "Passenger cancels ticket T1001 (fare 350).", "Cancelled with Rs.280 refund (80%).", r.v ? r.v.status + ", refund Rs." + r.v.refund : r.e, r.v && r.v.refund === 280);
  r = await tr(() => RR.cancel(S, pax, "T1001"));
  rec("TC11", "Cancellation", "Cancel an already cancelled ticket.", "Rejected: already cancelled.", r.e || "accepted", /already cancelled/.test(r.e || ""));
  const other = await RR.register(S, { name: "Ravi Kumar", email: "ravi@example.com", phone: "9123456780", password: "secret1" });
  const t2 = RR.book(S, pax, { ...bd, seat: 7 });
  const a = await tr(() => RR.cancel(S, other, t2.id)); const b = await tr(() => RR.addBus(S, pax, { from: "A", to: "B", time: "10:00", fare: 100 }));
  rec("TC12", "Access Control", "Passenger cancels another's ticket / adds a bus.", "Both actions rejected.", (a.e || "ok") + " | " + (b.e || "ok"), a.e && b.e);
  const nn = S.notes.filter((n) => n.uid === pax.id && /Ticket T100[12]/.test(n.text)).length;
  rec("TC13", "Notifications", "Booking and cancellation create notifications.", "Notifications for confirm and cancel present.", nn + " ticket notifications", nn >= 3);
  r = await tr(() => RR.book(S, pax, { ...bd, seat: 5 }));
  rec("TC14", "Seat Availability", "Seat freed by cancellation can be rebooked.", "Seat 5 rebooked successfully.", r.v ? r.v.id + " seat " + r.v.seat : r.e, r.v && r.v.seat === 5);
  const st = RR.stats(S);
  rec("TC15", "Reports", "Admin report totals.", "Totals match bookings, revenue and refunds.", `total ${st.total}, confirmed ${st.confirmed}, cancelled ${st.cancelled}, revenue Rs.${st.revenue}, refunds Rs.${st.refunds}`,
    st.total === 3 && st.confirmed === 2 && st.cancelled === 1 && st.revenue === 700 && st.refunds === 280);
  const pricingState = RR.newState(), pricingPax = pricingState.users[1];
  const sleeper = RR.book(pricingState, pricingPax, { bus: "B103", date: D, seat: 1, seatType: "Sleeper", name: pricingPax.name, phone: pricingPax.phone });
  rec("TC16", "Fare Calculation", "Book a sleeper seat on a Volvo bus (base fare Rs.900).", "Fare is Rs.1,638 (Volvo 130% × Sleeper 140%).",
    `Rs.${sleeper.fare}`, sleeper.fare === 1638 && sleeper.seatType === "Sleeper");
  r = await tr(() => RR.book(pricingState, pricingPax, { bus: "B103", date: D, seat: 2, seatType: "Recliner", name: pricingPax.name, phone: pricingPax.phone }));
  rec("TC17", "Fare Validation", "Book using an unsupported seat type.", "Rejected with a seat-type validation error.", r.e || "accepted", /valid seat type/.test(r.e || ""));
  const refund = RR.cancel(pricingState, pricingPax, sleeper.id);
  rec("TC18", "Fare Refund", "Cancel a priced sleeper ticket.", "Refund is 80% of the final fare (Rs.1,310.4).",
    `Rs.${refund.refund}`, refund.refund === 1310.4);
  const nonAc = RR.addBus(pricingState, pricingState.users[0], { from: "Goa", to: "Pune", time: "10:00", fare: 1000, type: "Non-AC" });
  rec("TC19", "Bus Type Pricing", "Add a Non-AC bus with Rs.1,000 base fare.", "Seater fare is Rs.850.", `Rs.${RR.fareFor(nonAc, "Seater")}`,
    RR.fareFor(nonAc, "Seater") === 850);
  fs.writeFileSync("web_results.json", JSON.stringify(results, null, 1));
  results.forEach((x) => console.log(x.id, x.status, "-", x.scenario));
  console.log(results.filter((x) => x.status === "PASS").length + "/" + results.length + " passed");
})();
