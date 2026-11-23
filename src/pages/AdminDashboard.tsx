import { useState, useEffect } from "react";
import { auth, db } from "../config/firebase";
import { collection, getDocs, doc, updateDoc, addDoc } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

interface UserRecord { id: string; name: string; email: string; role: string; collegeId: string; isVerified: boolean; }
interface EventRecord { id: string; title: string; sport: string; level: string; status: string; organizerId: string; }

export default function AdminDashboard() {
    const [users, setUsers] = useState<UserRecord[]>([]);
    const [events, setEvents] = useState<EventRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userSnap = await getDocs(collection(db, "users"));
                const uList: UserRecord[] = userSnap.docs.map((d) => {
                    const data = d.data();
                    return { id: d.id, name: data.name || "", email: data.email || "", role: data.role || "", collegeId: data.collegeId || "", isVerified: data.isVerified || false };
                });
                setUsers(uList);

                const eventSnap = await getDocs(collection(db, "events"));
                const eList: EventRecord[] = eventSnap.docs.map((d) => {
                    const data = d.data();
                    return { id: d.id, title: data.title || "", sport: data.sport || "", level: data.level || "", status: data.status || "pending", organizerId: data.organizerId || "" };
                });
                setEvents(eList);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) fetchData();
            else navigate("/login");
        });
        return () => unsubscribe();
    }, [navigate]);

    const handleToggleVerifyUser = async (userId: string, currentStatus: boolean) => {
        try {
            await updateDoc(doc(db, "users", userId), { isVerified: !currentStatus });
            setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, isVerified: !currentStatus } : u)));
        } catch (err) {
            console.error(err);
        }
    };

    const handleToggleEventStatus = async (eventId: string, currentStatus: string, organizerId: string, eventTitle: string) => {
        const nextStatus = currentStatus === "approved" ? "pending" : "approved";
        try {
            await updateDoc(doc(db, "events", eventId), { status: nextStatus });
            if (nextStatus === "approved") {
                await addDoc(collection(db, "notifications"), {
                    userId: organizerId,
                    message: `Your event "${eventTitle}" has been approved!`,
                    read: false,
                    createdAt: new Date().toISOString()
                });
            }
            setEvents((prev) => prev.map((ev) => (ev.id === eventId ? { ...ev, status: nextStatus } : ev)));
        } catch (err) {
            console.error(err);
        }
    };

    const handleLogout = async () => { await signOut(auth); navigate("/login"); };

    return (
        <div className="flex h-screen bg-slate-100 font-sans overflow-hidden">
            <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between hidden md:flex">
                <div>
                    <div className="h-20 flex items-center px-8 border-b border-slate-800">
                        <h1 className="text-2xl font-black tracking-tighter">SPORTS<span className="text-red-500">SYNC</span></h1>
                    </div>
                    <nav className="p-4 space-y-2 mt-4">
                        <a href="#" className="flex items-center gap-3 bg-red-600 text-white px-4 py-3 rounded-xl font-medium"><span className="text-xl">🛡️</span> Admin Control</a>
                    </nav>
                </div>
                <div className="p-4 border-t border-slate-800">
                    <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-red-500 text-slate-300 hover:text-white px-4 py-3 rounded-xl font-medium transition">Logout</button>
                </div>
            </aside>

            <main className="flex-1 flex flex-col overflow-y-auto">
                <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
                    <h2 className="text-xl font-bold text-slate-800">Admin Oversight</h2>
                    <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-bold">A</div>
                </header>

                <div className="p-8 space-y-8">
                    {loading ? (
                        <div className="flex justify-center p-10"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div></div>
                    ) : (
                        <>
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="p-6 border-b border-slate-200 bg-slate-50">
                                    <h3 className="text-lg font-bold text-slate-800">User Verification</h3>
                                </div>
                                <table className="w-full text-left text-sm text-slate-600">
                                    <thead className="bg-white text-xs uppercase text-slate-400 border-b border-slate-200">
                                        <tr><th className="px-6 py-4">Name</th><th className="px-6 py-4">Role</th><th className="px-6 py-4">USN / ID</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">Action</th></tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {users.map((u) => (
                                            <tr key={u.id} className="hover:bg-slate-50 transition">
                                                <td className="px-6 py-4 font-bold text-slate-800">{u.name}</td>
                                                <td className="px-6 py-4 capitalize">{u.role}</td>
                                                <td className="px-6 py-4">{u.collegeId || "-"}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${u.isVerified ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{u.isVerified ? "Verified" : "Unverified"}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button onClick={() => handleToggleVerifyUser(u.id, u.isVerified)} className="bg-slate-800 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-700 transition">{u.isVerified ? "Revoke" : "Verify"}</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="p-6 border-b border-slate-200 bg-slate-50">
                                    <h3 className="text-lg font-bold text-slate-800">Tournament Moderation</h3>
                                </div>
                                <table className="w-full text-left text-sm text-slate-600">
                                    <thead className="bg-white text-xs uppercase text-slate-400 border-b border-slate-200">
                                        <tr><th className="px-6 py-4">Event Title</th><th className="px-6 py-4">Sport</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">Action</th></tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {events.map((ev) => (
                                            <tr key={ev.id} className="hover:bg-slate-50 transition">
                                                <td className="px-6 py-4 font-bold text-slate-800">{ev.title}</td>
                                                <td className="px-6 py-4">{ev.sport} ({ev.level})</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${ev.status === "approved" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{ev.status}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button onClick={() => handleToggleEventStatus(ev.id, ev.status, ev.organizerId, ev.title)} className="bg-slate-800 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-700 transition">{ev.status === "approved" ? "Set Pending" : "Approve"}</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}