import { useState, useEffect } from "react";
import { auth, db } from "../config/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

interface AthleteProfile { id: string; name: string; email: string; sport: string; collegeId: string; isVerified: boolean; achievements: string[]; }

export default function CoachDashboard() {
    const [athletes, setAthletes] = useState<AthleteProfile[]>([]);
    const [searchSport, setSearchSport] = useState("");
    const [filterVerified, setFilterVerified] = useState("All");
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAthletes = async () => {
            try {
                const q = query(collection(db, "users"), where("role", "==", "athlete"));
                const snap = await getDocs(q);
                const list: AthleteProfile[] = snap.docs.map((doc) => {
                    const d = doc.data();
                    return { id: doc.id, name: d.name || "Unknown", email: d.email || "", sport: d.sport || "", collegeId: d.collegeId || "", isVerified: d.isVerified || false, achievements: d.achievements || [] };
                });
                setAthletes(list);
            } catch (err) { console.error(err); } finally { setLoading(false); }
        };

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) fetchAthletes();
            else navigate("/login");
        });
        return () => unsubscribe();
    }, [navigate]);

    const handleLogout = async () => { await signOut(auth); navigate("/login"); };

    const filteredAthletes = athletes.filter((a) => {
        const matchSearch = a.sport.toLowerCase().includes(searchSport.toLowerCase()) || a.name.toLowerCase().includes(searchSport.toLowerCase());
        const matchStatus = filterVerified === "All" || (filterVerified === "Verified" && a.isVerified) || (filterVerified === "Grassroots" && !a.isVerified);
        return matchSearch && matchStatus;
    });

    const verifiedAthletes = athletes.filter(a => a.isVerified).slice(0, 5);

    return (
        <div className="flex h-screen bg-slate-100 font-sans overflow-hidden">
            <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between hidden md:flex">
                <div>
                    <div className="h-20 flex items-center px-8 border-b border-slate-800"><h1 className="text-2xl font-black tracking-tighter">SPORTS<span className="text-purple-500">SYNC</span></h1></div>
                    <nav className="p-4 space-y-2 mt-4"><a href="#" className="flex items-center gap-3 bg-purple-600 text-white px-4 py-3 rounded-xl font-medium"><span className="text-xl">🔍</span> Scouting Hub</a></nav>
                </div>
                <div className="p-4 border-t border-slate-800"><button onClick={handleLogout} className="w-full bg-slate-800 hover:bg-red-500 text-slate-300 hover:text-white px-4 py-3 rounded-xl font-medium transition">Logout</button></div>
            </aside>

            <main className="flex-1 flex flex-col overflow-y-auto">
                <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
                    <h2 className="text-xl font-bold text-slate-800">Scout Dashboard</h2>
                    <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">C</div>
                </header>

                <div className="p-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit">
                        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Top Verified Talent</h3>
                        <div className="space-y-3">
                            {verifiedAthletes.length === 0 ? <p className="text-xs text-slate-500">No verified athletes yet.</p> : verifiedAthletes.map(a => (
                                <div key={a.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100"><p className="text-sm font-bold text-slate-800">{a.name}</p><p className="text-xs text-slate-500">{a.sport}</p></div>
                            ))}
                        </div>
                    </div>

                    <div className="lg:col-span-3 space-y-6">
                        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                            <input type="text" placeholder="Search athletes by name or sport..." value={searchSport} onChange={(e) => setSearchSport(e.target.value)} className="w-full md:w-96 px-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
                            <div className="flex gap-2 w-full md:w-auto">
                                {["All", "Verified", "Grassroots"].map((tab) => (
                                    <button key={tab} onClick={() => setFilterVerified(tab)} className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-sm font-bold transition-all ${filterVerified === tab ? "bg-purple-600 text-white" : "bg-slate-100 text-slate-600"}`}>{tab}</button>
                                ))}
                            </div>
                        </div>

                        {loading ? <div className="flex justify-center p-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div></div> : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {filteredAthletes.map((athlete) => (
                                    <div key={athlete.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-slate-800 text-lg">{athlete.name}</h3>
                                            <span className={`text-[10px] px-2 py-1 rounded-md font-bold uppercase ${athlete.isVerified ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{athlete.isVerified ? "Verified" : "Open"}</span>
                                        </div>
                                        <p className="text-sm text-purple-600 font-bold">{athlete.sport}</p>
                                        <div className="mt-4 text-xs text-slate-500 space-y-1"><p>🎓 {athlete.collegeId}</p><p>✉️ {athlete.email}</p></div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}