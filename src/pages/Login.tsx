import { useState } from "react";
import { auth, db } from "../config/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
    const [isRegistering, setIsRegistering] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [role, setRole] = useState("athlete");
    const [sport, setSport] = useState("");
    const [collegeId, setCollegeId] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const redirectUser = (userRole: string) => {
        if (userRole === "athlete") navigate("/athlete");
        else if (userRole === "organizer") navigate("/organizer");
        else if (userRole === "coach") navigate("/coach");
        else if (userRole === "admin") navigate("/admin");
        else navigate("/athlete");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            if (isRegistering) {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                await setDoc(doc(db, "users", user.uid), {
                    uid: user.uid,
                    name: name,
                    email: email,
                    role: role,
                    sport: sport || "General",
                    collegeId: collegeId || "Grassroots/Open",
                    isVerified: role === "admin",
                    achievements: [],
                    createdAt: new Date().toISOString(),
                });

                redirectUser(role);
            } else {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                const docSnap = await getDoc(doc(db, "users", user.uid));
                if (docSnap.exists()) {
                    redirectUser(docSnap.data().role);
                } else {
                    setError("User profile not found in database.");
                }
            }
        } catch (err: any) {
            setError(err.message?.replace("Firebase:", "").trim() || "Authentication failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/20 rounded-full blur-[100px]"></div>
            </div>

            <div className="bg-slate-900 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/10 backdrop-blur-xl">
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-white">SportsSync</h1>
                    <p className="text-slate-400 text-sm mt-1">Unified Sports Management Platform</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 text-red-400 p-3 rounded-lg text-sm mb-4 border border-red-500/20">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {isRegistering && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-slate-300">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter your full name"
                                    className="mt-1 w-full px-3 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300">Select Role</label>
                                <select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="mt-1 w-full px-3 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="athlete">Student-Athlete</option>
                                    <option value="coach">Coach / Scout</option>
                                    <option value="organizer">Tournament Organizer</option>
                                    <option value="admin">Administrator</option>
                                </select>
                            </div>

                            {role === "athlete" && (
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300">Primary Sport</label>
                                        <input
                                            type="text"
                                            value={sport}
                                            onChange={(e) => setSport(e.target.value)}
                                            placeholder="e.g., Athletics"
                                            className="mt-1 w-full px-3 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300">USN / College ID</label>
                                        <input
                                            type="text"
                                            value={collegeId}
                                            onChange={(e) => setCollegeId(e.target.value)}
                                            placeholder="Optional"
                                            className="mt-1 w-full px-3 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-300">Email Address</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@college.edu"
                            className="mt-1 w-full px-3 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="mt-1 w-full px-3 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-lg transition duration-200 disabled:opacity-50 mt-2"
                    >
                        {loading ? "Please wait..." : isRegistering ? "Create Account" : "Sign In"}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-slate-400">
                    {isRegistering ? "Already have an account?" : "New to SportsSync?"}{" "}
                    <button
                        type="button"
                        onClick={() => setIsRegistering(!isRegistering)}
                        className="text-blue-400 font-semibold hover:underline"
                    >
                        {isRegistering ? "Sign In" : "Register Here"}
                    </button>
                </div>

                <div className="mt-4 text-center">
                    <Link to="/" className="text-xs text-slate-500 hover:text-white transition">
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}