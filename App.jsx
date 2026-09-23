import React, { useState, useMemo } from "react";
import {
  BookOpen, GraduationCap, Users, ClipboardList, AlertTriangle,
  LogOut, Plus, Search, CheckCircle2, Clock, ShieldCheck, Settings,
  X, Trash2, Pencil, LayoutDashboard, UserCog, BookMarked, Undo2,
  Library, Lock, User
} from "lucide-react";

/* ---------------------------------------------------------
   DATA LAYER
   In production, everything in this block (seedUsers, seedBooks,
   seedRecords) is replaced by calls to a REST/GraphQL API backed
   by the schema described in library_schema.sql. State shape below
   mirrors the database tables 1:1 so the swap is mechanical:
     users          -> tbl_users
     books          -> tbl_books
     borrowRecords  -> tbl_borrow_records
--------------------------------------------------------- */

const seedUsers = [
  { id: "U-001", username: "admin", password: "admin123", role: "Admin", name: "Rhea Villanueva" },
  { id: "U-002", username: "librarian", password: "librarian123", role: "Librarian", name: "Mark Anthony Dizon" },
];

const seedBooks = [
  { id: "B-0001", accession: "GMVCC-2024-0001", title: "Fundamentals of Electrical Installation", author: "R. Santos", category: "General", program: "Electrical Technology", year: 2022, copiesTotal: 5, copiesAvailable: 3 },
  { id: "B-0002", accession: "GMVCC-2024-0002", title: "Principles of Food and Beverage Service", author: "L. Cruz", category: "General", program: "HRM", year: 2021, copiesTotal: 4, copiesAvailable: 4 },
  { id: "B-0003", accession: "GMVCC-2024-0003", title: "Automotive Servicing NC II Manual", author: "J. Bautista", category: "Reference", program: "Automotive Technology", year: 2023, copiesTotal: 3, copiesAvailable: 2 },
  { id: "B-0004", accession: "GMVCC-2025-0011", title: "A Mobile-Based Monitoring System for Barangay Tinambag Livestock Program", author: "D. Ramos, K. Ocampo, J. Villareal", category: "Capstone", program: "Information Technology", adviser: "Prof. E. Manalo", year: 2025, copiesTotal: 1, copiesAvailable: 1 },
  { id: "B-0005", accession: "GMVCC-2025-0012", title: "Solar-Assisted Irrigation Controller for Small-Scale Farmers", author: "M. Fernandez, A. Lopez", category: "Capstone", program: "Electrical Technology", adviser: "Engr. P. Reyes", year: 2025, copiesTotal: 1, copiesAvailable: 1 },
];

const seedRecords = [
  { id: "R-0001", bookId: "B-0001", borrowerName: "Jhon Carlo Marasigan", borrowerIdNo: "2023-00145", program: "BTVTEd - Electrical", dateBorrowed: daysAgo(12), dueDate: daysAgo(5), dateReturned: null, status: "Borrowed" },
  { id: "R-0002", bookId: "B-0003", borrowerName: "Angel Mae Torres", borrowerIdNo: "2022-00098", program: "BTVTEd - Automotive", dateBorrowed: daysAgo(20), dueDate: daysAgo(13), dateReturned: daysAgo(9), status: "Returned" },
];

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}
function addDays(dateStr, n) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}
function today() {
  return new Date().toISOString().slice(0, 10);
}
function dayDiff(a, b) {
  return Math.round((new Date(a) - new Date(b)) / 86400000);
}
function fmtDate(s) {
  if (!s) return "—";
  return new Date(s + "T00:00:00").toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" });
}

const DEFAULT_POLICY = {
  loanPeriodDays: 7,
  csHoursPerDayLate: 1,
  maxCsHours: 20,
};

export default function App() {
  const [users, setUsers] = useState(seedUsers);
  const [books, setBooks] = useState(seedBooks);
  const [records, setRecords] = useState(seedRecords);
  const [policy, setPolicy] = useState(DEFAULT_POLICY);
  const [currentUser, setCurrentUser] = useState(null);
  const [tab, setTab] = useState("dashboard");

  if (!currentUser) {
    return <LoginScreen users={users} onLogin={setCurrentUser} />;
  }

  return (
    <Shell
      currentUser={currentUser}
      onLogout={() => { setCurrentUser(null); setTab("dashboard"); }}
      tab={tab}
      setTab={setTab}
    >
      {tab === "dashboard" && <Dashboard books={books} records={records} />}
      {tab === "catalog" && <Catalog books={books} setBooks={setBooks} records={records} filterCategory={null} currentUser={currentUser} />}
      {tab === "capstone" && <Catalog books={books} setBooks={setBooks} records={records} filterCategory="Capstone" currentUser={currentUser} />}
      {tab === "circulation" && <Circulation books={books} setBooks={setBooks} records={records} setRecords={setRecords} policy={policy} />}
      {tab === "community" && <CommunityService records={records} setRecords={setRecords} books={books} policy={policy} />}
      {tab === "staff" && currentUser.role === "Admin" && <StaffAccounts users={users} setUsers={setUsers} />}
      {tab === "policy" && currentUser.role === "Admin" && <PolicySettings policy={policy} setPolicy={setPolicy} />}
    </Shell>
  );
}

/* ---------------------------------------------------------
   LOGIN
--------------------------------------------------------- */
function LoginScreen({ users, onLogin }) {
  const [role, setRole] = useState("Admin");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function submit(e) {
    e.preventDefault();
    const match = users.find(
      (u) => u.username === username.trim() && u.password === password && u.role === role
    );
    if (!match) {
      setError("Incorrect username, password, or role. Please try again.");
      return;
    }
    setError("");
    onLogin(match);
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "#ECE8DC", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{
        flex: "1 1 46%", background: "#173620", color: "#F3EFE1", display: "flex",
        flexDirection: "column", justifyContent: "space-between", padding: "56px 48px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: "#C9A227", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Library size={24} color="#173620" />
          </div>
          <div>
            <div style={{ fontWeight: 700, letterSpacing: 0.3, fontSize: 15 }}>GMVCC TINAMBAG</div>
            <div style={{ fontSize: 12.5, color: "#B9C9B6" }}>Campus Library</div>
          </div>
        </div>

        <div style={{ maxWidth: 420 }}>
          <div style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 38, lineHeight: 1.18, marginBottom: 18 }}>
            Every book returned<br />on time keeps the shelf<br />open for the next student.
          </div>
          <p style={{ color: "#CBD8C6", fontSize: 14.5, lineHeight: 1.7 }}>
            The Library Management System for general circulation and capstone
            archiving at GMVCC Tinambag. Borrowing, returns, and the community
            service policy for late returns, all in one record.
          </p>
        </div>

        <div style={{ fontSize: 12.5, color: "#93A690" }}>
          Guimba Municipal Vocational and College &mdash; Tinambag Campus
        </div>
      </div>

      <div style={{ flex: "1 1 54%", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <form onSubmit={submit} style={{
          width: 380, background: "#FFFFFF", border: "1px solid #DAD4C0", borderRadius: 12,
          padding: "36px 34px", boxShadow: "0 1px 2px rgba(0,0,0,0.04)"
        }}>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: 22, margin: "0 0 4px", color: "#1E1E1C" }}>Staff sign in</h1>
          <p style={{ fontSize: 13, color: "#7A7568", margin: "0 0 22px" }}>Access is limited to library staff.</p>

          <div style={{ display: "flex", background: "#F1EEE3", borderRadius: 8, padding: 4, marginBottom: 20 }}>
            {["Admin", "Librarian"].map((r) => (
              <button
                type="button"
                key={r}
                onClick={() => setRole(r)}
                style={{
                  flex: 1, padding: "9px 0", borderRadius: 6, border: "none", cursor: "pointer",
                  fontSize: 13.5, fontWeight: 600,
                  background: role === r ? "#173620" : "transparent",
                  color: role === r ? "#F3EFE1" : "#5B5748",
                  transition: "all .15s"
                }}
              >
                {r === "Admin" ? <ShieldCheck size={14} style={{ verticalAlign: -2, marginRight: 6 }} /> : <User size={14} style={{ verticalAlign: -2, marginRight: 6 }} />}
                {r}
              </button>
            ))}
          </div>

          <label style={fieldLabel}>Username</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder={role === "Admin" ? "admin" : "librarian"}
            style={inputStyle}
          />

          <label style={{ ...fieldLabel, marginTop: 14 }}>Password</label>
          <div style={{ position: "relative" }}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{ ...inputStyle, paddingRight: 34 }}
            />
            <Lock size={15} style={{ position: "absolute", right: 12, top: 12, color: "#B4AE9C" }} />
          </div>

          {error && (
            <div style={{ marginTop: 14, background: "#FBEAE6", color: "#8A3221", fontSize: 12.5, padding: "9px 11px", borderRadius: 6 }}>
              {error}
            </div>
          )}

          <button type="submit" style={primaryBtn}>Sign in</button>

          <div style={{ marginTop: 20, borderTop: "1px dashed #E1DCC9", paddingTop: 14, fontSize: 12, color: "#8A8570" }}>
            <div style={{ fontWeight: 600, marginBottom: 4, color: "#5B5748" }}>Demo credentials</div>
            Admin &mdash; admin / admin123<br />
            Librarian &mdash; librarian / librarian123
          </div>
        </form>
      </div>
    </div>
  );
}

const fieldLabel = { display: "block", fontSize: 12.5, fontWeight: 600, color: "#5B5748", marginBottom: 6 };
const inputStyle = {
  width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 7,
  border: "1px solid #DAD4C0", fontSize: 14, outline: "none", background: "#FCFBF7"
};
const primaryBtn = {
  width: "100%", marginTop: 20, padding: "11px 0", borderRadius: 7, border: "none",
  background: "#173620", color: "#F3EFE1", fontWeight: 700, fontSize: 14.5, cursor: "pointer"
};

/* ---------------------------------------------------------
   SHELL (sidebar + topbar)
--------------------------------------------------------- */
function Shell({ currentUser, onLogout, tab, setTab, children }) {
  const nav = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "catalog", label: "Book Catalog", icon: BookOpen },
    { id: "capstone", label: "Capstone Archive", icon: GraduationCap },
    { id: "circulation", label: "Borrow & Return", icon: BookMarked },
    { id: "community", label: "Community Service", icon: ClipboardList },
  ];
  if (currentUser.role === "Admin") {
    nav.push({ id: "staff", label: "Staff Accounts", icon: UserCog });
    nav.push({ id: "policy", label: "Policy Settings", icon: Settings });
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "#F3F1E8", fontFamily: "'Inter', system-ui, sans-serif", color: "#232320" }}>
      <div style={{ width: 236, background: "#173620", color: "#EDEADB", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ padding: "22px 20px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid #26492F" }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: "#C9A227", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Library size={18} color="#173620" />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 0.3 }}>GMVCC TINAMBAG</div>
            <div style={{ fontSize: 11, color: "#9FB39B" }}>Library System</div>
          </div>
        </div>

        <div style={{ flex: 1, padding: "14px 12px", display: "flex", flexDirection: "column", gap: 2 }}>
          {nav.map((n) => {
            const Icon = n.icon;
            const active = tab === n.id;
            return (
              <button
                key={n.id}
                onClick={() => setTab(n.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                  borderRadius: 7, border: "none", cursor: "pointer", textAlign: "left",
                  background: active ? "#0F2818" : "transparent",
                  color: active ? "#F3EFE1" : "#C7D2C2",
                  fontSize: 13.5, fontWeight: active ? 600 : 500
                }}
              >
                <Icon size={16} />
                {n.label}
              </button>
            );
          })}
        </div>

        <div style={{ padding: 16, borderTop: "1px solid #26492F" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#2A5136", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12.5, fontWeight: 700 }}>
              {currentUser.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
            </div>
            <div style={{ lineHeight: 1.3 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600 }}>{currentUser.name}</div>
              <div style={{ fontSize: 11, color: "#9FB39B" }}>{currentUser.role}</div>
            </div>
          </div>
          <button onClick={onLogout} style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
            padding: "9px 0", borderRadius: 7, border: "1px solid #2E5A3A", background: "transparent",
            color: "#DCE5D8", fontSize: 12.5, cursor: "pointer"
          }}>
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </div>

      <div style={{ flex: 1, padding: "30px 40px", overflow: "auto" }}>{children}</div>
    </div>
  );
}

/* ---------------------------------------------------------
   DASHBOARD
--------------------------------------------------------- */
function Dashboard({ books, records }) {
  const totalBooks = books.reduce((s, b) => s + b.copiesTotal, 0);
  const capstoneCount = books.filter((b) => b.category === "Capstone").length;
  const activeLoans = records.filter((r) => r.status !== "Returned").length;
  const overdue = records.filter((r) => r.status !== "Returned" && r.dueDate < today()).length;
  const pendingCS = records.filter((r) => r.csStatus === "Pending").length;

  const stats = [
    { label: "Total copies in collection", value: totalBooks, icon: BookOpen, tint: "#EFF6EC", fg: "#2F6B3F" },
    { label: "Capstone & thesis titles", value: capstoneCount, icon: GraduationCap, tint: "#FBF3DE", fg: "#8A6A0F" },
    { label: "Active loans", value: activeLoans, icon: BookMarked, tint: "#EAF1FB", fg: "#2A5C96" },
    { label: "Overdue right now", value: overdue, icon: AlertTriangle, tint: "#FBEAE6", fg: "#A13D2B" },
    { label: "Pending community service", value: pendingCS, icon: ClipboardList, tint: "#F3EDF8", fg: "#6B4A96" },
  ];

  const recent = [...records].sort((a, b) => (b.dateBorrowed > a.dateBorrowed ? 1 : -1)).slice(0, 6);

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Today's snapshot of the GMVCC Tinambag library collection and circulation." />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14, marginBottom: 28 }}>
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} style={{ background: "#fff", border: "1px solid #E3DFCF", borderRadius: 10, padding: "16px 16px" }}>
              <div style={{ width: 30, height: 30, borderRadius: 7, background: s.tint, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                <Icon size={15} color={s.fg} />
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "Georgia, serif" }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "#78745F", marginTop: 3, lineHeight: 1.4 }}>{s.label}</div>
            </div>
          );
        })}
      </div>

      <div style={{ background: "#fff", border: "1px solid #E3DFCF", borderRadius: 10, overflow: "hidden" }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid #EEEADC", fontWeight: 700, fontSize: 14 }}>Recent circulation activity</div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ color: "#8A8570", textAlign: "left" }}>
              <th style={th}>Borrower</th>
              <th style={th}>Book</th>
              <th style={th}>Borrowed</th>
              <th style={th}>Due</th>
              <th style={th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((r) => {
              const book = books.find((b) => b.id === r.bookId);
              return (
                <tr key={r.id} style={{ borderTop: "1px solid #F0EDE0" }}>
                  <td style={td}>{r.borrowerName}</td>
                  <td style={td}>{book ? book.title : "—"}</td>
                  <td style={td}>{fmtDate(r.dateBorrowed)}</td>
                  <td style={td}>{fmtDate(r.dueDate)}</td>
                  <td style={td}><StatusPill record={r} /></td>
                </tr>
              );
            })}
            {recent.length === 0 && (
              <tr><td colSpan={5} style={{ ...td, textAlign: "center", color: "#9C9880" }}>No circulation activity yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusPill({ record }) {
  const overdue = record.status !== "Returned" && record.dueDate < today();
  let label = record.status;
  let bg = "#EAF1FB", fg = "#2A5C96";
  if (overdue) { label = "Overdue"; bg = "#FBEAE6"; fg = "#A13D2B"; }
  else if (record.status === "Returned") { bg = "#EFF6EC"; fg = "#2F6B3F"; }
  return <span style={{ background: bg, color: fg, fontSize: 11.5, fontWeight: 700, padding: "3px 9px", borderRadius: 20 }}>{label}</span>;
}

const th = { padding: "10px 18px", fontWeight: 600, fontSize: 11.5, textTransform: "uppercase", letterSpacing: 0.4 };
const td = { padding: "11px 18px", verticalAlign: "middle" };

function PageHeader({ title, subtitle, action }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 22 }}>
      <div>
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: 26, margin: 0 }}>{title}</h1>
        {subtitle && <p style={{ margin: "6px 0 0", color: "#78745F", fontSize: 13.5 }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

/* ---------------------------------------------------------
   CATALOG (General books + Capstone view)
--------------------------------------------------------- */
function Catalog({ books, setBooks, records, filterCategory, currentUser }) {
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const list = books
    .filter((b) => (filterCategory ? b.category === filterCategory : true))
    .filter((b) =>
      (b.title + b.author + b.accession + (b.program || "")).toLowerCase().includes(query.toLowerCase())
    );

  function upsertBook(data) {
    if (editingId) {
      setBooks((bs) => bs.map((b) => (b.id === editingId ? { ...b, ...data } : b)));
    } else {
      const id = "B-" + String(Date.now()).slice(-6);
      setBooks((bs) => [...bs, { id, copiesAvailable: Number(data.copiesTotal), ...data }]);
    }
    setShowForm(false);
    setEditingId(null);
  }

  function removeBook(id) {
    const hasActiveLoan = records.some((r) => r.bookId === id && r.status !== "Returned");
    if (hasActiveLoan) {
      alert("This title has a copy currently out on loan. It can't be removed until it's returned.");
      return;
    }
    setBooks((bs) => bs.filter((b) => b.id !== id));
  }

  const editingBook = books.find((b) => b.id === editingId) || null;

  return (
    <div>
      <PageHeader
        title={filterCategory === "Capstone" ? "Capstone Archive" : "Book Catalog"}
        subtitle={
          filterCategory === "Capstone"
            ? "Research, thesis, and capstone projects submitted by GMVCC Tinambag students."
            : "General circulation titles held by the GMVCC Tinambag library."
        }
        action={
          <button onClick={() => { setEditingId(null); setShowForm(true); }} style={{ ...primaryBtn, width: "auto", marginTop: 0, padding: "10px 16px", display: "flex", alignItems: "center", gap: 7 }}>
            <Plus size={15} /> {filterCategory === "Capstone" ? "Add capstone entry" : "Add book"}
          </button>
        }
      />

      <div style={{ position: "relative", marginBottom: 18, maxWidth: 360 }}>
        <Search size={15} style={{ position: "absolute", left: 12, top: 12, color: "#A19C86" }} />
        <input
          placeholder="Search by title, author, or accession no."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ ...inputStyle, paddingLeft: 34 }}
        />
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        {list.map((b) => (
          <div key={b.id} style={{ background: "#fff", border: "1px solid #E3DFCF", borderRadius: 10, padding: "16px 18px", display: "flex", gap: 16 }}>
            <div style={{ width: 4, borderRadius: 3, background: b.category === "Capstone" ? "#C9A227" : b.category === "Reference" ? "#2A5C96" : "#2F6B3F", flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "baseline", flexWrap: "wrap" }}>
                <span style={{ fontFamily: "Georgia, serif", fontSize: 16, fontWeight: 700 }}>{b.title}</span>
                <span style={{ fontFamily: "monospace", fontSize: 11.5, color: "#8A8570" }}>{b.accession}</span>
              </div>
              <div style={{ fontSize: 13, color: "#5B5748", marginTop: 3 }}>
                {b.author} · {b.program || "General Collection"} · {b.year}
              </div>
              {b.category === "Capstone" && b.adviser && (
                <div style={{ fontSize: 12.5, color: "#8A6A0F", marginTop: 4 }}>Adviser: {b.adviser}</div>
              )}
              <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                <Tag>{b.category}</Tag>
                <Tag tone={b.copiesAvailable > 0 ? "green" : "red"}>
                  {b.copiesAvailable} of {b.copiesTotal} available
                </Tag>
              </div>
            </div>
            <div style={{ display: "flex", gap: 6, alignSelf: "flex-start" }}>
              <IconBtn onClick={() => { setEditingId(b.id); setShowForm(true); }} icon={Pencil} title="Edit" />
              {currentUser.role === "Admin" && <IconBtn onClick={() => removeBook(b.id)} icon={Trash2} title="Remove" danger />}
            </div>
          </div>
        ))}
        {list.length === 0 && (
          <div style={{ textAlign: "center", color: "#9C9880", padding: 40, background: "#fff", border: "1px dashed #DAD4C0", borderRadius: 10 }}>
            No titles match your search yet.
          </div>
        )}
      </div>

      {showForm && (
        <BookFormModal
          initial={editingBook}
          isCapstone={filterCategory === "Capstone"}
          onCancel={() => { setShowForm(false); setEditingId(null); }}
          onSave={upsertBook}
        />
      )}
    </div>
  );
}

function Tag({ children, tone }) {
  const map = {
    green: { bg: "#EFF6EC", fg: "#2F6B3F" },
    red: { bg: "#FBEAE6", fg: "#A13D2B" },
    default: { bg: "#F1EEE3", fg: "#5B5748" },
  };
  const c = map[tone] || map.default;
  return <span style={{ background: c.bg, color: c.fg, fontSize: 11.5, fontWeight: 600, padding: "3px 9px", borderRadius: 20 }}>{children}</span>;
}

function IconBtn({ icon: Icon, onClick, title, danger }) {
  return (
    <button onClick={onClick} title={title} style={{
      width: 32, height: 32, borderRadius: 7, border: "1px solid #E3DFCF", background: "#fff",
      cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
      color: danger ? "#A13D2B" : "#5B5748"
    }}>
      <Icon size={14} />
    </button>
  );
}

function BookFormModal({ initial, isCapstone, onCancel, onSave }) {
  const [form, setForm] = useState(initial || {
    accession: "", title: "", author: "", category: isCapstone ? "Capstone" : "General",
    program: "", adviser: "", year: new Date().getFullYear(), copiesTotal: 1,
  });
  const [error, setError] = useState("");

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  function submit(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.author.trim() || !form.accession.trim()) {
      setError("Title, author, and accession number are required.");
      return;
    }
    onSave({ ...form, year: Number(form.year), copiesTotal: Number(form.copiesTotal) });
  }

  return (
    <Modal onClose={onCancel} title={initial ? "Edit entry" : isCapstone ? "Add capstone entry" : "Add book"}>
      <form onSubmit={submit}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Accession number" value={form.accession} onChange={(v) => set("accession", v)} placeholder="GMVCC-2026-0001" />
          <Field label="Year" type="number" value={form.year} onChange={(v) => set("year", v)} />
        </div>
        <Field label="Title" value={form.title} onChange={(v) => set("title", v)} placeholder="Full title" />
        <Field label={isCapstone ? "Researcher(s)" : "Author"} value={form.author} onChange={(v) => set("author", v)} placeholder={isCapstone ? "Last name, First name, ..." : "Author name"} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Program / course" value={form.program} onChange={(v) => set("program", v)} placeholder="e.g. Information Technology" />
          {!isCapstone ? (
            <div>
              <label style={fieldLabel}>Category</label>
              <select value={form.category} onChange={(e) => set("category", e.target.value)} style={inputStyle}>
                <option>General</option>
                <option>Reference</option>
                <option>Capstone</option>
              </select>
            </div>
          ) : (
            <Field label="Adviser" value={form.adviser} onChange={(v) => set("adviser", v)} placeholder="Faculty adviser" />
          )}
        </div>
        <Field label="Number of copies" type="number" value={form.copiesTotal} onChange={(v) => set("copiesTotal", v)} />

        {error && <div style={{ background: "#FBEAE6", color: "#8A3221", fontSize: 12.5, padding: "9px 11px", borderRadius: 6, marginBottom: 6 }}>{error}</div>}

        <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
          <button type="button" onClick={onCancel} style={{ ...secondaryBtn, flex: 1 }}>Cancel</button>
          <button type="submit" style={{ ...primaryBtn, flex: 1, marginTop: 0 }}>Save entry</button>
        </div>
      </form>
    </Modal>
  );
}

function Field({ label, value, onChange, type = "text", placeholder }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={fieldLabel}>{label}</label>
      <input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} style={inputStyle} />
    </div>
  );
}

const secondaryBtn = {
  padding: "11px 0", borderRadius: 7, border: "1px solid #DAD4C0", background: "#fff",
  color: "#4A4638", fontWeight: 600, fontSize: 14, cursor: "pointer"
};

function Modal({ children, onClose, title }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(23,20,10,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: 460, maxHeight: "88vh", overflow: "auto", background: "#fff", borderRadius: 12, padding: "22px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: 18, margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={{ border: "none", background: "transparent", cursor: "pointer", color: "#8A8570" }}><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   CIRCULATION (borrow / return)
--------------------------------------------------------- */
function Circulation({ books, setBooks, records, setRecords, policy }) {
  const [showBorrow, setShowBorrow] = useState(false);
  const [tab, setTab] = useState("active");

  const active = records.filter((r) => r.status !== "Returned");
  const returned = records.filter((r) => r.status === "Returned");
  const list = tab === "active" ? active : returned;

  function borrowBook(data) {
    const book = books.find((b) => b.id === data.bookId);
    if (!book || book.copiesAvailable < 1) return;
    setBooks((bs) => bs.map((b) => (b.id === data.bookId ? { ...b, copiesAvailable: b.copiesAvailable - 1 } : b)));
    const id = "R-" + String(Date.now()).slice(-6);
    const dueDate = addDays(today(), policy.loanPeriodDays);
    setRecords((rs) => [...rs, { id, ...data, dateBorrowed: today(), dueDate, dateReturned: null, status: "Borrowed" }]);
    setShowBorrow(false);
  }

  function returnBook(recordId) {
    setRecords((rs) => rs.map((r) => {
      if (r.id !== recordId) return r;
      const returnedOn = today();
      const late = Math.max(0, dayDiff(returnedOn, r.dueDate));
      const csHours = late > 0 ? Math.min(late * policy.csHoursPerDayLate, policy.maxCsHours) : 0;
      setBooks((bs) => bs.map((b) => (b.id === r.bookId ? { ...b, copiesAvailable: b.copiesAvailable + 1 } : b)));
      return {
        ...r,
        dateReturned: returnedOn,
        status: "Returned",
        daysLate: late,
        csHoursAssigned: csHours,
        csHoursCompleted: 0,
        csStatus: csHours > 0 ? "Pending" : "N/A",
      };
    }));
  }

  return (
    <div>
      <PageHeader
        title="Borrow & Return"
        subtitle="Log new loans and process returns. Late returns are assessed under the community service policy."
        action={
          <button onClick={() => setShowBorrow(true)} style={{ ...primaryBtn, width: "auto", marginTop: 0, padding: "10px 16px", display: "flex", alignItems: "center", gap: 7 }}>
            <Plus size={15} /> Log a borrow
          </button>
        }
      />

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <PillTab active={tab === "active"} onClick={() => setTab("active")} label={`Active loans (${active.length})`} />
        <PillTab active={tab === "history"} onClick={() => setTab("history")} label={`Return history (${returned.length})`} />
      </div>

      <div style={{ background: "#fff", border: "1px solid #E3DFCF", borderRadius: 10, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ color: "#8A8570", textAlign: "left" }}>
              <th style={th}>Borrower</th>
              <th style={th}>Book</th>
              <th style={th}>Borrowed</th>
              <th style={th}>Due</th>
              <th style={th}>{tab === "history" ? "Returned" : "Status"}</th>
              {tab === "active" && <th style={th}></th>}
            </tr>
          </thead>
          <tbody>
            {list.map((r) => {
              const book = books.find((b) => b.id === r.bookId);
              return (
                <tr key={r.id} style={{ borderTop: "1px solid #F0EDE0" }}>
                  <td style={td}>
                    <div style={{ fontWeight: 600 }}>{r.borrowerName}</div>
                    <div style={{ fontSize: 11.5, color: "#8A8570" }}>{r.borrowerIdNo} · {r.program}</div>
                  </td>
                  <td style={td}>{book ? book.title : "—"}</td>
                  <td style={td}>{fmtDate(r.dateBorrowed)}</td>
                  <td style={td}>{fmtDate(r.dueDate)}</td>
                  <td style={td}>{tab === "history" ? fmtDate(r.dateReturned) : <StatusPill record={r} />}</td>
                  {tab === "active" && (
                    <td style={td}>
                      <button onClick={() => returnBook(r.id)} style={{ ...secondaryBtn, padding: "6px 12px", fontSize: 12.5, display: "flex", alignItems: "center", gap: 6 }}>
                        <Undo2 size={13} /> Return
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
            {list.length === 0 && (
              <tr><td colSpan={6} style={{ ...td, textAlign: "center", color: "#9C9880" }}>Nothing to show here.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showBorrow && (
        <BorrowModal books={books} onCancel={() => setShowBorrow(false)} onSave={borrowBook} loanDays={policy.loanPeriodDays} />
      )}
    </div>
  );
}

function PillTab({ active, onClick, label }) {
  return (
    <button onClick={onClick} style={{
      padding: "8px 14px", borderRadius: 20, border: "1px solid " + (active ? "#173620" : "#DAD4C0"),
      background: active ? "#173620" : "#fff", color: active ? "#F3EFE1" : "#5B5748",
      fontSize: 12.5, fontWeight: 600, cursor: "pointer"
    }}>{label}</button>
  );
}

function BorrowModal({ books, onCancel, onSave, loanDays }) {
  const available = books.filter((b) => b.copiesAvailable > 0);
  const [form, setForm] = useState({ bookId: available[0]?.id || "", borrowerName: "", borrowerIdNo: "", program: "" });
  const [error, setError] = useState("");

  function submit(e) {
    e.preventDefault();
    if (!form.bookId || !form.borrowerName.trim() || !form.borrowerIdNo.trim()) {
      setError("Please complete all fields before logging the borrow.");
      return;
    }
    onSave(form);
  }

  return (
    <Modal onClose={onCancel} title="Log a borrow">
      <form onSubmit={submit}>
        <div style={{ marginBottom: 12 }}>
          <label style={fieldLabel}>Book</label>
          <select value={form.bookId} onChange={(e) => setForm((f) => ({ ...f, bookId: e.target.value }))} style={inputStyle}>
            {available.map((b) => <option key={b.id} value={b.id}>{b.title} ({b.copiesAvailable} available)</option>)}
          </select>
          {available.length === 0 && <div style={{ fontSize: 12, color: "#A13D2B", marginTop: 6 }}>No copies are currently available.</div>}
        </div>
        <Field label="Borrower name" value={form.borrowerName} onChange={(v) => setForm((f) => ({ ...f, borrowerName: v }))} placeholder="Full name" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Student ID no." value={form.borrowerIdNo} onChange={(v) => setForm((f) => ({ ...f, borrowerIdNo: v }))} placeholder="2026-00123" />
          <Field label="Program" value={form.program} onChange={(v) => setForm((f) => ({ ...f, program: v }))} placeholder="e.g. BTVTEd - IT" />
        </div>
        <div style={{ fontSize: 12, color: "#78745F", marginBottom: 6 }}>Due date will be set {loanDays} days from today, per current library policy.</div>
        {error && <div style={{ background: "#FBEAE6", color: "#8A3221", fontSize: 12.5, padding: "9px 11px", borderRadius: 6, marginBottom: 6 }}>{error}</div>}
        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          <button type="button" onClick={onCancel} style={{ ...secondaryBtn, flex: 1 }}>Cancel</button>
          <button type="submit" disabled={available.length === 0} style={{ ...primaryBtn, flex: 1, marginTop: 0, opacity: available.length === 0 ? 0.5 : 1 }}>Confirm borrow</button>
        </div>
      </form>
    </Modal>
  );
}

/* ---------------------------------------------------------
   COMMUNITY SERVICE (late-return policy)
--------------------------------------------------------- */
function CommunityService({ records, setRecords, books, policy }) {
  const affected = records.filter((r) => r.csStatus === "Pending" || r.csStatus === "Completed");

  function logHours(recordId, hours) {
    setRecords((rs) => rs.map((r) => {
      if (r.id !== recordId) return r;
      const completed = Math.min(r.csHoursAssigned, (r.csHoursCompleted || 0) + hours);
      return { ...r, csHoursCompleted: completed, csStatus: completed >= r.csHoursAssigned ? "Completed" : "Pending" };
    }));
  }

  return (
    <div>
      <PageHeader title="Community Service Log" subtitle="In place of monetary fines, students who return a book late complete supervised community service hours." />

      <div style={{ background: "#FBF3DE", border: "1px solid #EBD9A3", borderRadius: 10, padding: "16px 18px", marginBottom: 20, display: "flex", gap: 14, alignItems: "flex-start" }}>
        <ClipboardList size={18} color="#8A6A0F" style={{ flexShrink: 0, marginTop: 2 }} />
        <div style={{ fontSize: 13, color: "#5B4A0F", lineHeight: 1.6 }}>
          <strong>Current policy:</strong> {policy.csHoursPerDayLate} hour(s) of supervised community service per day
          a book is overdue, capped at {policy.maxCsHours} hours per loan. Borrowing privileges are restored once
          assigned hours are marked complete by library staff. Admins can adjust these rules in Policy Settings.
        </div>
      </div>

      <div style={{ background: "#fff", border: "1px solid #E3DFCF", borderRadius: 10, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ color: "#8A8570", textAlign: "left" }}>
              <th style={th}>Borrower</th>
              <th style={th}>Book</th>
              <th style={th}>Days late</th>
              <th style={th}>Hours assigned</th>
              <th style={th}>Hours completed</th>
              <th style={th}>Status</th>
              <th style={th}></th>
            </tr>
          </thead>
          <tbody>
            {affected.map((r) => {
              const book = books.find((b) => b.id === r.bookId);
              return (
                <tr key={r.id} style={{ borderTop: "1px solid #F0EDE0" }}>
                  <td style={td}>
                    <div style={{ fontWeight: 600 }}>{r.borrowerName}</div>
                    <div style={{ fontSize: 11.5, color: "#8A8570" }}>{r.borrowerIdNo}</div>
                  </td>
                  <td style={td}>{book ? book.title : "—"}</td>
                  <td style={td}>{r.daysLate}</td>
                  <td style={td}>{r.csHoursAssigned}</td>
                  <td style={td}>{r.csHoursCompleted || 0}</td>
                  <td style={td}>
                    {r.csStatus === "Completed"
                      ? <Tag tone="green"><CheckCircle2 size={11} style={{ verticalAlign: -1, marginRight: 3 }} />Completed</Tag>
                      : <Tag tone="red"><Clock size={11} style={{ verticalAlign: -1, marginRight: 3 }} />Pending</Tag>}
                  </td>
                  <td style={td}>
                    {r.csStatus === "Pending" && (
                      <button onClick={() => logHours(r.id, 1)} style={{ ...secondaryBtn, padding: "6px 10px", fontSize: 12 }}>+1 hour done</button>
                    )}
                  </td>
                </tr>
              );
            })}
            {affected.length === 0 && (
              <tr><td colSpan={7} style={{ ...td, textAlign: "center", color: "#9C9880" }}>No community service obligations on record.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   ADMIN: STAFF ACCOUNTS
--------------------------------------------------------- */
function StaffAccounts({ users, setUsers }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ username: "", password: "", name: "", role: "Librarian" });
  const [error, setError] = useState("");

  function submit(e) {
    e.preventDefault();
    if (!form.username.trim() || !form.password.trim() || !form.name.trim()) {
      setError("All fields are required.");
      return;
    }
    if (users.some((u) => u.username === form.username.trim())) {
      setError("That username is already taken.");
      return;
    }
    const id = "U-" + String(Date.now()).slice(-6);
    setUsers((us) => [...us, { id, ...form }]);
    setShowForm(false);
    setForm({ username: "", password: "", name: "", role: "Librarian" });
    setError("");
  }

  function removeUser(id) {
    setUsers((us) => us.filter((u) => u.id !== id));
  }

  return (
    <div>
      <PageHeader
        title="Staff Accounts"
        subtitle="Manage who can sign in as Admin or Librarian."
        action={
          <button onClick={() => setShowForm(true)} style={{ ...primaryBtn, width: "auto", marginTop: 0, padding: "10px 16px", display: "flex", alignItems: "center", gap: 7 }}>
            <Plus size={15} /> Add staff account
          </button>
        }
      />

      <div style={{ display: "grid", gap: 10 }}>
        {users.map((u) => (
          <div key={u.id} style={{ background: "#fff", border: "1px solid #E3DFCF", borderRadius: 10, padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{u.name}</div>
              <div style={{ fontSize: 12.5, color: "#78745F" }}>@{u.username} · {u.role}</div>
            </div>
            <IconBtn icon={Trash2} title="Remove account" danger onClick={() => removeUser(u.id)} />
          </div>
        ))}
      </div>

      {showForm && (
        <Modal title="Add staff account" onClose={() => setShowForm(false)}>
          <form onSubmit={submit}>
            <Field label="Full name" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} placeholder="Juan Dela Cruz" />
            <Field label="Username" value={form.username} onChange={(v) => setForm((f) => ({ ...f, username: v }))} placeholder="jdelacruz" />
            <Field label="Temporary password" value={form.password} onChange={(v) => setForm((f) => ({ ...f, password: v }))} placeholder="Set an initial password" />
            <div style={{ marginBottom: 12 }}>
              <label style={fieldLabel}>Role</label>
              <select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} style={inputStyle}>
                <option>Librarian</option>
                <option>Admin</option>
              </select>
            </div>
            {error && <div style={{ background: "#FBEAE6", color: "#8A3221", fontSize: 12.5, padding: "9px 11px", borderRadius: 6, marginBottom: 6 }}>{error}</div>}
            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
              <button type="button" onClick={() => setShowForm(false)} style={{ ...secondaryBtn, flex: 1 }}>Cancel</button>
              <button type="submit" style={{ ...primaryBtn, flex: 1, marginTop: 0 }}>Create account</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

/* ---------------------------------------------------------
   ADMIN: POLICY SETTINGS
--------------------------------------------------------- */
function PolicySettings({ policy, setPolicy }) {
  const [form, setForm] = useState(policy);
  const [saved, setSaved] = useState(false);

  function submit(e) {
    e.preventDefault();
    setPolicy({
      loanPeriodDays: Number(form.loanPeriodDays),
      csHoursPerDayLate: Number(form.csHoursPerDayLate),
      maxCsHours: Number(form.maxCsHours),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  }

  return (
    <div>
      <PageHeader title="Policy Settings" subtitle="Configure loan duration and the community service policy applied to late returns." />
      <form onSubmit={submit} style={{ background: "#fff", border: "1px solid #E3DFCF", borderRadius: 10, padding: "22px 24px", maxWidth: 460 }}>
        <Field label="Loan period (days)" type="number" value={form.loanPeriodDays} onChange={(v) => setForm((f) => ({ ...f, loanPeriodDays: v }))} />
        <Field label="Community service hours per day late" type="number" value={form.csHoursPerDayLate} onChange={(v) => setForm((f) => ({ ...f, csHoursPerDayLate: v }))} />
        <Field label="Maximum community service hours per loan" type="number" value={form.maxCsHours} onChange={(v) => setForm((f) => ({ ...f, maxCsHours: v }))} />
        {saved && <div style={{ background: "#EFF6EC", color: "#2F6B3F", fontSize: 12.5, padding: "9px 11px", borderRadius: 6, marginBottom: 6 }}>Policy updated.</div>}
        <button type="submit" style={{ ...primaryBtn, width: "auto", padding: "10px 20px" }}>Save policy</button>
      </form>
    </div>
  );
}
