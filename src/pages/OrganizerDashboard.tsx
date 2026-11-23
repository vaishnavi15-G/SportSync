import { useState, useEffect } from "react";
import { auth, db } from "../config/firebase";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

interface RegistrationItem { id: string; eventTitle: string; athleteName: string; collegeId: string; tier: string; paymentStatus: string; }

export default function OrganizerDashboard() {
    const [title, setTitle] = useState(""); const [sport, setSport] = useState(""); const [level, setLevel] = useState("University"); const [format, setFormat] = useState("Single Event"); const [location, setLocation] = useState(""); const [date, setDate] = useState(""); const [fee, setFee] = useState("0");
    const [registrations, setRegistrations] = useState<RegistrationItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async (uid: string) => {
            try {
                const notifQuery = query(collection(db, "notifications"), where("userId", "==", uid), where("read", "==", false));
                const notifSnap = await getDocs(notifQuery);
                if (!notifSnap.empty) setNotification(notifSnap.docs[0].data().message);

                const regSnap = await getDocs(collection(db, "registrations"));
                const regList: RegistrationItem[] = regSnap.docs.map((doc) => {
                    const d = doc.data();
                    return { id: doc.id, eventTitle: d.eventTitle || "", athleteName: d.athleteName || "", collegeId: d.collegeId || "", tier: d.tier || "", paymentStatus: d.paymentStatus || "" };
                });
                setRegistrations(regList);
            } catch (err) { console.error(err); }
        };

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) fetchData(user.uid);
            else navigate("/login");
        });
        return () => unsubscribe();
    }, [navigate]);

    const handleCreateEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!auth.currentUser) return;
        setLoading(true);
        try {
            await addDoc(collection(db, "events"), { title, sport, level, format, location, date, fee: Number(fee), organizerId: auth.currentUser.uid, status: "pending", createdAt: new Date().toISOString() });
            await addDoc(collection(db, "notifications"), { role: "athlete", message: `New Tournament Alert: ${title} is waiting for Admin approval!`, read: false, createdAt: new Date().toISOString() });
            setTitle(""); setSport(""); setLocation(""); setDate(""); setFee("0");
            alert("Submitted for Admin Approval!");
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    const handleExportExcel = () => {
        if (registrations.length === 0) return alert("No athletes registered.");
        const formattedRows = registrations.map((r) => ({ "Tournament": r.eventTitle, "Athlete": r.athleteName, "USN": r.collegeId, "Tier": r.tier }));
        const worksheet = XLSX.utils.json_to_sheet(formattedRows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Roster");
        XLSX.writeFile(workbook, "SportsSync_Roster.xlsx");
    };

    const handleLogout = async () => { await signOut(auth); navigate("/login"); };

    return (
        <div className="flex h-screen bg-slate-100 font-sans overflow-hidden">
            <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between hidden md:flex">
                <div>
                    <div className="h-20 flex items-center px-8 border-b border-slate-800"><h1 className="text-2xl font-black tracking-tighter">SPORTS<span className="text-emerald-500">SYNC</span></h1></div>
                    <nav className="p-4 space-y-2 mt-4"><a href="#" className="flex items-center gap-3 bg-emerald-600 text-white px-4 py-3 rounded-xl font-medium"><span className="text-xl">📊</span> Organizer Panel</a></nav>
                </div>
                <div className="p-4 border-t border-slate-800"><button onClick={handleLogout} className="w-full bg-slate-800 hover:bg-red-500 text-slate-300 hover:text-white px-4 py-3 rounded-xl font-medium transition">Logout</button></div>
            </aside>

            <main className="flex-1 flex flex-col overflow-y-auto">
                <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
                    <h2 className="text-xl font-bold text-slate-800">Organizer Dashboard</h2>
                    <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold">O</div>
                </header>

                <div className="p-8 space-y-8 max-w-6xl">
                    {notification && (
                        <div className="bg-emerald-50 border-l-4 border-emerald-500 text-emerald-700 p-4 rounded-r-xl flex justify-between items-center shadow-sm">
                            <span><strong>Admin:</strong> {notification}</span>
                            <button onClick={() => setNotification("")} className="text-emerald-700 font-bold">&times;</button>
                        </div>
                    )}

                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                        <h3 className="text-lg font-bold text-slate-800 mb-6">Create New Tournament</h3>
                        <form onSubmit={handleCreateEvent} className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">Name</label><input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-emerald-500 outline-none" /></div>
                            <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">Sport</label><input type="text" required value={sport} onChange={(e) => setSport(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-emerald-500 outline-none" /></div>
                            <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">Level</label><select value={level} onChange={(e) => setLevel(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-emerald-500 outline-none"><option value="University">University</option><option value="District">District</option><option value="Nearby">Nearby</option></select></div>
                            <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">Format</label><select value={format} onChange={(e) => setFormat(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-emerald-500 outline-none"><option value="Single Event">Single</option><option value="Group Event">Group</option></select></div>
                            <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">Venue</label><input type="text" required value={location} onChange={(e) => setLocation(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-emerald-500 outline-none" /></div>
                            <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">Date</label><input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-emerald-500 outline-none" /></div>
                            <div className="md:col-span-3 flex gap-4 items-end mt-2">
                                <div className="flex-1"><label className="block text-xs font-bold text-slate-500 uppercase mb-2">Fee (₹)</label><input type="number" required value={fee} onChange={(e) => setFee(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-emerald-500 outline-none" /></div>
                                <button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-8 rounded-xl transition-all shadow-lg shadow-emerald-500/30 h-[42px]">{loading ? "..." : "Publish Event"}</button>
                            </div>
                        </form>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                            <h3 className="text-lg font-bold text-slate-800">Participant Roster</h3>
                            <button onClick={handleExportExcel} className="bg-slate-800 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-700 transition">Export Excel</button>
                        </div>
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-white text-xs uppercase text-slate-400 border-b border-slate-200">
                                <tr><th className="px-6 py-4">Athlete</th><th className="px-6 py-4">Event</th><th className="px-6 py-4">USN</th><th className="px-6 py-4">Tier</th></tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {registrations.length === 0 ? (
                                    <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">No registrations yet.</td></tr>
                                ) : (
                                    registrations.map((reg) => (
                                        <tr key={reg.id} className="hover:bg-slate-50 transition">
                                            <td className="px-6 py-4 font-bold text-slate-800">{reg.athleteName}</td>
                                            <td className="px-6 py-4">{reg.eventTitle}</td>
                                            <td className="px-6 py-4">{reg.collegeId}</td>
                                            <td className="px-6 py-4"><span className={`px-2 py-1 rounded-md text-xs font-bold ${reg.tier.includes("Verified") ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>{reg.tier}</span></td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}