import { useState, useEffect } from "react";
import { auth, db } from "../config/firebase";
import { collection, getDocs, addDoc, doc, getDoc, updateDoc, arrayUnion, query, where } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

interface EventItem { id: string; title: string; sport: string; level: string; location: string; date: string; fee: number; status: string; }
interface AthleteProfile { name: string; sport: string; collegeId: string; isVerified: boolean; achievements: string[]; }

export default function AthleteDashboard() {
    const [events, setEvents] = useState<EventItem[]>([]);
    const [selectedLevel, setSelectedLevel] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [profile, setProfile] = useState<AthleteProfile | null>(null);
    const [newAchievement, setNewAchievement] = useState("");
    const [registeredEventIds, setRegisteredEventIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDashboardData = async (uid: string) => {
            try {
                const userDoc = await getDoc(doc(db, "users", uid));
                if (userDoc.exists()) setProfile(userDoc.data() as AthleteProfile);

                const eventSnap = await getDocs(collection(db, "events"));
                const eventList: EventItem[] = eventSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<EventItem, "id">) })).filter((ev) => ev.status === "approved");
                setEvents(eventList);

                const notifQuery = query(collection(db, "notifications"), where("role", "==", "athlete"), where("read", "==", false));
                const notifSnap = await getDocs(notifQuery);
                if (!notifSnap.empty) {
                    setNotification(notifSnap.docs[0].data().message);
                }

                const regSnap = await getDocs(collection(db, "registrations"));
                const myRegs = regSnap.docs.map((d) => d.data()).filter((r) => r.athleteId === uid).map((r) => r.eventId as string);
                setRegisteredEventIds(myRegs);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) fetchDashboardData(user.uid);
            else navigate("/login");
        });
        return () => unsubscribe();
    }, [navigate]);

    const handleRegister = async (event: EventItem) => {
        if (!profile) return;
        const isInstitutional = profile.collegeId && profile.collegeId.trim() !== "" && profile.collegeId !== "Grassroots/Open";
        try {
            await addDoc(collection(db, "registrations"), {
                eventId: event.id, eventTitle: event.title, athleteId: auth.currentUser?.uid, athleteName: profile.name,
                collegeId: profile.collegeId || "Grassroots/Open", tier: isInstitutional ? "Verified Institutional" : "Open Grassroots",
                paymentStatus: event.fee === 0 ? "Free" : "Paid", registeredAt: new Date().toISOString().split("T")[0],
            });
            setRegisteredEventIds([...registeredEventIds, event.id]);
            alert(`Successfully registered for ${event.title}!`);
        } catch (err) { alert("Registration failed."); }
    };

    const handleAddAchievement = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAchievement.trim() || !auth.currentUser) return;
        try {
            await updateDoc(doc(db, "users", auth.currentUser.uid), { achievements: arrayUnion(newAchievement.trim()) });
            setProfile((prev) => prev ? { ...prev, achievements: [...(prev.achievements || []), newAchievement.trim()] } : null);
            setNewAchievement("");
        } catch (err) { alert("Error."); }
    };

    const handleLogout = async () => { await signOut(auth); navigate("/login"); };

    const filteredEvents = events.filter((ev) => {
        const matchesLevel = selectedLevel === "All" || ev.level === selectedLevel;
        const searchLower = searchQuery.toLowerCase();
        return matchesLevel && (ev.title.toLowerCase().includes(searchLower) || ev.sport.toLowerCase().includes(searchLower));
    });

    return (
        <div className="flex h-screen bg-slate-100 font-sans overflow-hidden">
            <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between hidden md:flex">
                <div>
                    <div className="h-20 flex items-center px-8 border-b border-slate-800"><h1 className="text-2xl font-black tracking-tighter">SPORTS<span className="text-blue-500">SYNC</span></h1></div>
                    <nav className="p-4 space-y-2 mt-4"><a href="#" className="flex items-center gap-3 bg-blue-600 text-white px-4 py-3 rounded-xl font-medium"><span className="text-xl">🏠</span> Dashboard</a></nav>
                </div>
                <div className="p-4 border-t border-slate-800"><button onClick={handleLogout} className="w-full bg-slate-800 hover:bg-red-500 text-slate-300 hover:text-white px-4 py-3 rounded-xl font-medium transition">Logout</button></div>
            </aside>

            <main className="flex-1 flex flex-col overflow-y-auto">
                <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
                    <h2 className="text-xl font-bold text-slate-800">Welcome back, {profile?.name?.split(" ")[0] || "Athlete"} 👋</h2>
                    <div className="flex items-center gap-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${profile?.isVerified ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{profile?.isVerified ? "✓ Verified Athlete" : "Pending Verification"}</span>
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">{profile?.name?.charAt(0) || "A"}</div>
                    </div>
                </header>

                {notification && (
                    <div className="mx-8 mt-6 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-xl flex justify-between items-center shadow-sm">
                        <span><strong>New Alert:</strong> {notification}</span>
                        <button onClick={() => setNotification("")} className="text-blue-700 font-bold">&times;</button>
                    </div>
                )}

                <div className="p-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4"><div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center text-2xl">🏆</div><div><p className="text-sm text-slate-500 font-medium">Available Events</p><p className="text-2xl font-bold text-slate-800">{events.length}</p></div></div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4"><div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center text-2xl">✅</div><div><p className="text-sm text-slate-500 font-medium">Registered</p><p className="text-2xl font-bold text-slate-800">{registeredEventIds.length}</p></div></div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4"><div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center text-2xl">🏅</div><div><p className="text-sm text-slate-500 font-medium">Achievements</p><p className="text-2xl font-bold text-slate-800">{profile?.achievements?.length || 0}</p></div></div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-bold text-slate-800">Discover Events</h3>
                                <div className="flex gap-3">
                                    <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                                    <select value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)} className="px-4 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                                        <option value="All">All Levels</option><option value="University">University</option><option value="District">District</option><option value="Nearby">Nearby</option>
                                    </select>
                                </div>
                            </div>

                            {loading ? <div className="flex justify-center p-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div> : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {filteredEvents.map(ev => {
                                        const isReg = registeredEventIds.includes(ev.id);
                                        return (
                                            <div key={ev.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h4 className="font-bold text-slate-800">{ev.title}</h4>
                                                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-md font-bold">{ev.level}</span>
                                                </div>
                                                <p className="text-sm text-slate-500 mb-4">{ev.sport} • {ev.location} • {ev.date}</p>
                                                <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                                                    <span className="font-bold text-slate-700">{ev.fee === 0 ? "Free" : `₹${ev.fee}`}</span>
                                                    <button onClick={() => handleRegister(ev)} disabled={isReg} className={`px-4 py-2 rounded-lg text-sm font-semibold ${isReg ? "bg-slate-100 text-slate-400" : "bg-blue-600 text-white hover:bg-blue-700"}`}>{isReg ? "Registered ✓" : "Register Now"}</button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit">
                            <h3 className="text-lg font-bold text-slate-800 mb-4">My Achievements</h3>
                            {profile?.achievements?.map((ach, i) => (<div key={i} className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg mb-2 text-sm text-slate-700 font-medium">🏅 {ach}</div>))}
                            <form onSubmit={handleAddAchievement} className="mt-4 flex gap-2">
                                <input type="text" placeholder="New achievement..." value={newAchievement} onChange={e => setNewAchievement(e.target.value)} className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                                <button type="submit" className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-700">Add</button>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}