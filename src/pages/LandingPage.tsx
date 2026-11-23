import { Link } from "react-router-dom";
import { FaRunning, FaBasketballBall, FaFutbol, FaTableTennis, FaTrophy, FaUsers, FaCheckCircle, FaArrowRight } from "react-icons/fa";

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans overflow-hidden relative selection:bg-blue-500/30">

            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/20 rounded-full blur-[120px]"></div>
            </div>

            {/* Navigation Bar */}
            <nav className="flex justify-between items-center px-8 py-6 max-w-7xl mx-auto border-b border-white/5 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-500/30">
                        <FaTrophy className="text-xl text-white" />
                    </div>
                    <h1 className="text-2xl font-black tracking-tight text-white">SportsSync</h1>
                </div>
                <Link
                    to="/login"
                    className="bg-white/10 hover:bg-white/20 border border-white/10 px-6 py-2.5 rounded-full text-sm font-semibold backdrop-blur-md transition-all flex items-center gap-2"
                >
                    Sign In / Register <FaArrowRight className="text-xs" />
                </Link>
            </nav>

            {/* Hero Section */}
            <main className="max-w-7xl mx-auto px-8 pt-24 pb-32 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">

                {/* Left: Text & Call to Action */}
                <div className="space-y-8">
                    <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 px-4 py-1.5 rounded-full text-sm font-medium text-blue-400">
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                        The Ultimate Sports Ecosystem
                    </div>

                    <h1 className="text-5xl lg:text-7xl font-extrabold leading-[1.1]">
                        Discover Your <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                            True Potential.
                        </span>
                    </h1>

                    <p className="text-lg text-slate-400 max-w-lg leading-relaxed">
                        SportsSync bridges the gap between athletes, organizers, and scouts. Find tournaments, manage rosters, and get discovered by top coaches — all in one platform.
                    </p>

                    <div className="flex items-center gap-4 pt-4">
                        <Link
                            to="/login"
                            className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-1"
                        >
                            Get Started Now
                        </Link>
                        <a
                            href="#features"
                            className="text-slate-300 hover:text-white px-6 py-4 font-semibold transition-colors"
                        >
                            Explore Features
                        </a>
                    </div>
                </div>

                {/* Right: Abstract Sports Graphics (No Cards) */}
                <div className="relative h-[500px] hidden lg:flex items-center justify-center">

                    {/* Decorative glowing rings */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-[400px] h-[400px] border border-white/5 rounded-full absolute animate-[spin_20s_linear_infinite]"></div>
                        <div className="w-[300px] h-[300px] border border-blue-500/10 rounded-full absolute animate-[spin_15s_linear_infinite_reverse]"></div>
                        <div className="w-[500px] h-[500px] border border-emerald-500/5 rounded-full absolute animate-[spin_30s_linear_infinite]"></div>
                    </div>

                    {/* Central floating sports icons */}
                    <div className="relative z-10 grid grid-cols-2 gap-6">
                        <div className="bg-slate-900/80 p-6 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-md floating-element-1">
                            <FaRunning className="text-4xl text-blue-400" />
                        </div>
                        <div className="bg-slate-900/80 p-6 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-md floating-element-2">
                            <FaBasketballBall className="text-4xl text-orange-400" />
                        </div>
                        <div className="bg-slate-900/80 p-6 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-md floating-element-3">
                            <FaFutbol className="text-4xl text-emerald-400" />
                        </div>
                        <div className="bg-slate-900/80 p-6 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-md floating-element-4">
                            <FaTableTennis className="text-4xl text-purple-400" />
                        </div>
                    </div>
                </div>
            </main>

            {/* Features Section */}
            <section id="features" className="bg-slate-900/50 py-24 border-t border-white/5 relative z-10">
                <div className="max-w-7xl mx-auto px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4 text-white">Everything You Need to Win</h2>
                        <p className="text-slate-400 max-w-2xl mx-auto">Built for Athletes, Organizers, Coaches, and Admins. Experience a complete digital sports ecosystem.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-slate-800/50 p-8 rounded-2xl border border-white/5 hover:border-blue-500/50 transition group">
                            <div className="bg-blue-600/20 text-blue-400 w-14 h-14 rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition">
                                <FaRunning />
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-white">For Athletes</h3>
                            <p className="text-sm text-slate-400 leading-relaxed">Build a digital sports resume, get notified about local trials, and register for events instantly.</p>
                        </div>

                        <div className="bg-slate-800/50 p-8 rounded-2xl border border-white/5 hover:border-emerald-500/50 transition group">
                            <div className="bg-emerald-600/20 text-emerald-400 w-14 h-14 rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition">
                                <FaBasketballBall />
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-white">For Organizers</h3>
                            <p className="text-sm text-slate-400 leading-relaxed">Host tournaments, manage dual-tier applicant rosters, and export university compliance sheets to Excel.</p>
                        </div>

                        <div className="bg-slate-800/50 p-8 rounded-2xl border border-white/5 hover:border-purple-500/50 transition group">
                            <div className="bg-purple-600/20 text-purple-400 w-14 h-14 rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition">
                                <FaUsers />
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-white">For Coaches & Admins</h3>
                            <p className="text-sm text-slate-400 leading-relaxed">Scout grassroots talent, verify institutional IDs, and maintain the integrity of the platform.</p>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
}