import React, { useState, useEffect } from 'react';
import { Heart, Gift, Stars, X, Sparkles, Cake, Flame, Feather, Wand2, Volume2, Loader } from 'lucide-react';

// --- CONFIGURATION ---
const MRUDULA_PHOTO_URL = "PHOTO-2025-11-30-22-54-38.jpg";
const GEMINI_API_KEY = "AIzaSyAJro-QGb8UFOf8Mp1dNzcRnBPRE_FDj6c"; // Add your API key here if you want Gemini features

const THEME = {
    primary: "from-rose-300 via-purple-300 to-indigo-400",
    secondary: "bg-white/20 backdrop-blur-xl border border-white/30 shadow-xl",
    textMain: "text-gray-800",
    textHighlight: "text-rose-600",
    fontHeading: "font-['Pacifico',_cursive]",
    fontBody: "font-['Lato',_sans-serif]",
};

// --- HELPERS FOR AUDIO ---
const pcmToWav = (pcmData, sampleRate = 24000) => {
    const buffer = new ArrayBuffer(44 + pcmData.byteLength);
    const view = new DataView(buffer);

    // RIFF identifier
    writeString(view, 0, 'RIFF');
    // file length
    view.setUint32(4, 36 + pcmData.byteLength, true);
    // RIFF type
    writeString(view, 8, 'WAVE');
    // format chunk identifier
    writeString(view, 12, 'fmt ');
    // format chunk length
    view.setUint32(16, 16, true);
    // sample format (raw)
    view.setUint16(20, 1, true);
    // channel count
    view.setUint16(22, 1, true);
    // sample rate
    view.setUint32(24, sampleRate, true);
    // byte rate (sample rate * block align)
    view.setUint32(28, sampleRate * 2, true);
    // block align (channel count * bytes per sample)
    view.setUint16(32, 2, true);
    // bits per sample
    view.setUint16(34, 16, true);
    // data chunk identifier
    writeString(view, 36, 'data');
    // data chunk length
    view.setUint32(40, pcmData.byteLength, true);

    // Write PCM data
    const pcmArray = new Uint8Array(pcmData);
    const wavArray = new Uint8Array(buffer);
    wavArray.set(pcmArray, 44);

    return buffer;
};

const writeString = (view, offset, string) => {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
};

// --- CUSTOM HOOKS & COMPONENTS ---

// 1. Magic Dust Cursor Effect
const MagicCursor = () => {
    const [trail, setTrail] = useState([]);

    useEffect(() => {
        const handleMouseMove = (e) => {
            const newSparkle = {
                id: Date.now(),
                x: e.clientX,
                y: e.clientY,
                color: ['#FFC0CB', '#FFD700', '#E0FFFF'][Math.floor(Math.random() * 3)],
                size: Math.random() * 8 + 2
            };
            setTrail((prev) => [...prev.slice(-20), newSparkle]);
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div className="pointer-events-none fixed inset-0 z-50">
            {trail.map((sparkle) => (
                <div
                    key={sparkle.id}
                    className="absolute rounded-full animate-ping-slow opacity-70"
                    style={{
                        left: sparkle.x,
                        top: sparkle.y,
                        width: sparkle.size,
                        height: sparkle.size,
                        backgroundColor: sparkle.color,
                        boxShadow: `0 0 10px ${sparkle.color}`,
                        animation: 'fade-out 1s forwards'
                    }}
                />
            ))}
            <style>{`
        @keyframes fade-out {
          0% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(0); }
        }
      `}</style>
        </div>
    );
};

// 2. Typewriter Text Component
const TypewriterText = ({ text, delay = 50, onComplete }) => {
    const [displayedText, setDisplayedText] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (currentIndex < text.length) {
            const timeout = setTimeout(() => {
                setDisplayedText(prev => prev + text[currentIndex]);
                setCurrentIndex(prev => prev + 1);
            }, delay);
            return () => clearTimeout(timeout);
        } else if (onComplete) {
            onComplete();
        }
    }, [currentIndex, delay, text, onComplete]);

    return <span>{displayedText}</span>;
};

// 3. Interactive Cake
const CakeWithCandles = ({ onBlow }) => {
    const [candlesBlown, setCandlesBlown] = useState(false);

    const handleBlow = () => {
        if (!candlesBlown) {
            setCandlesBlown(true);
            onBlow();
        }
    };

    return (
        <div className="relative cursor-pointer group scale-125" onClick={handleBlow}>
            <Cake className={`w-32 h-32 text-rose-200 fill-rose-100 transition-transform duration-300 ${candlesBlown ? 'scale-110' : 'group-hover:scale-105'}`} />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 flex gap-3">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="relative">
                        <div className="w-1.5 h-6 bg-yellow-100 mx-auto rounded-full"></div>
                        <Flame className={`w-4 h-4 text-orange-400 fill-yellow-300 absolute -top-4 left-1/2 -translate-x-1/2 ${candlesBlown ? 'animate-blow-out opacity-0' : 'animate-flicker'}`} />
                    </div>
                ))}
            </div>
            {!candlesBlown && (
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-white/90 text-xs font-bold uppercase tracking-widest animate-pulse whitespace-nowrap">
                    Tap candles to blow!
                </div>
            )}
            <style>{`
        @keyframes flicker {
          0%, 100% { transform: translateX(-50%) scale(1); opacity: 1; }
          50% { transform: translateX(-50%) scale(1.1) rotate(2deg); opacity: 0.8; }
        }
        @keyframes blow-out {
          0% { transform: translateX(-50%) scale(1); opacity: 1; }
          100% { transform: translateX(-50%) scale(0.1) translateY(-20px); opacity: 0; }
        }
      `}</style>
        </div>
    );
};

// 4. Confetti
const Confetti = ({ isActive }) => {
    if (!isActive) return null;
    const particles = Array.from({ length: 80 }).map((_, i) => ({
        id: i,
        color: ['#F472B6', '#FCD34D', '#A78BFA', '#34D399'][Math.floor(Math.random() * 4)],
        shape: ['circle', 'rect', 'heart'][Math.floor(Math.random() * 3)],
        left: Math.random() * 100 + '%',
        animationDuration: Math.random() * 3 + 2 + 's',
        animationDelay: Math.random() * 1 + 's',
        scale: Math.random() * 0.6 + 0.4,
    }));

    return (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {particles.map((p) => (
                <div
                    key={p.id}
                    className={`absolute ${p.shape === 'heart' ? '' : 'w-3 h-3'} opacity-80`}
                    style={{
                        backgroundColor: p.shape === 'heart' ? 'transparent' : p.color,
                        borderRadius: p.shape === 'circle' ? '50%' : '0',
                        left: p.left,
                        top: '-20px',
                        transform: `scale(${p.scale})`,
                        animation: `fall ${p.animationDuration} linear ${p.animationDelay} infinite, spin ${p.animationDuration} linear ${p.animationDelay} infinite`
                    }}
                >
                    {p.shape === 'heart' && <Heart className="w-4 h-4" fill={p.color} color={p.color} />}
                </div>
            ))}
            <style>{`
        @keyframes fall {
          0% { transform: translateY(-20px) rotate(0deg) scale(1); opacity: 1; }
          100% { transform: translateY(100vh) rotate(360deg) scale(0.5); opacity: 0; }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(720deg); }
        }
      `}</style>
        </div>
    );
};

// --- GEMINI MAGIC COMPONENT ---
const GeminiOracle = () => {
    const [fortune, setFortune] = useState("");
    const [loading, setLoading] = useState(false);
    const [audioLoading, setAudioLoading] = useState(false);

    const generateFortune = async () => {
        setLoading(true);
        setFortune("");
        try {
            const apiKey = GEMINI_API_KEY;
            if (!apiKey) {
                setFortune("🌟 May your birthday sparkle with endless joy, love, and magical moments! ✨💖");
                setLoading(false);
                return;
            }
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: "Write a short, whimsical, and heartwarming birthday fortune for a girl named Mrudula. Focus on happiness, success, and beauty. Use metaphors of the ocean, stars, or flowers. Keep it under 30 words. Use cute emojis." }] }]
                    })
                }
            );
            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) setFortune(text);
        } catch (e) {
            console.error(e);
            setFortune("The stars align to wish you a year of pure magic and joy! ✨🌟");
        } finally {
            setLoading(false);
        }
    };

    const playFortune = async () => {
        if (!fortune) return;

        setAudioLoading(true);

        // Use browser's built-in Text-to-Speech (more reliable!)
        try {
            const utterance = new SpeechSynthesisUtterance(fortune);
            utterance.rate = 0.9; // Slightly slower for better clarity
            utterance.pitch = 1.1; // Slightly higher pitch for feminine voice
            utterance.volume = 1;

            // Try to use a female voice if available
            const voices = speechSynthesis.getVoices();
            const femaleVoice = voices.find(voice =>
                voice.name.includes('Female') ||
                voice.name.includes('Samantha') ||
                voice.name.includes('Victoria') ||
                voice.name.includes('Karen')
            );

            if (femaleVoice) {
                utterance.voice = femaleVoice;
            }

            utterance.onend = () => {
                setAudioLoading(false);
            };

            utterance.onerror = (e) => {
                console.error('Speech error:', e);
                setAudioLoading(false);
                alert('Speech failed, but enjoy reading the fortune!');
            };

            speechSynthesis.speak(utterance);

        } catch (e) {
            console.error("Speech failed", e);
            setAudioLoading(false);
            alert('Text-to-speech unavailable on this device');
        }
    };

    return (
        <div className="mt-8 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 w-full max-w-md mx-auto transform transition-all hover:scale-[1.02]">
            <div className="flex items-center justify-between mb-4">
                <h4 className="text-white font-bold flex items-center gap-2">
                    <Sparkles className="text-yellow-300 w-5 h-5" />
                    The Birthday Oracle
                </h4>
            </div>

            {fortune ? (
                <div className="space-y-4">
                    <p className="text-pink-100 text-lg font-light leading-relaxed animate-in fade-in italic">
                        "{fortune}"
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={generateFortune}
                            className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg transition-colors flex items-center gap-2"
                        >
                            <Wand2 size={14} /> New Fortune
                        </button>
                        {GEMINI_API_KEY && (
                            <button
                                onClick={playFortune}
                                disabled={audioLoading}
                                className="text-xs bg-rose-500/80 hover:bg-rose-500 text-white px-3 py-2 rounded-lg transition-colors flex items-center gap-2"
                            >
                                {audioLoading ? <Loader size={14} className="animate-spin" /> : <Volume2 size={14} />}
                                Listen
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                <div className="text-center py-4">
                    {loading ? (
                        <div className="flex flex-col items-center gap-3">
                            <Loader className="text-pink-300 animate-spin" />
                            <span className="text-white/60 text-sm">Consulting the stars...</span>
                        </div>
                    ) : (
                        <button
                            onClick={generateFortune}
                            className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 group"
                        >
                            <Wand2 className="group-hover:rotate-12 transition-transform" />
                            Reveal Your Magic Prediction
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};


// --- MAIN APP COMPONENT ---

export default function App() {
    const [showConfetti, setShowConfetti] = useState(false);
    const [activeSection, setActiveSection] = useState('intro');
    const [isMusicPlaying, setIsMusicPlaying] = useState(false);
    const audioRef = React.useRef(null);

    useEffect(() => {
        // Load fonts
        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&family=Pacifico&display=swap';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
        return () => document.head.removeChild(link);
    }, []);

    // Initialize and handle audio
    useEffect(() => {
        audioRef.current = new Audio('/happy-birthday-314197.mp3');
        audioRef.current.loop = true;
        audioRef.current.volume = 0.3;

        const playAudio = () => {
            if (audioRef.current.paused) {
                audioRef.current.play()
                    .then(() => {
                        setIsMusicPlaying(true);
                    })
                    .catch(e => console.log("Audio play failed (likely autoplay policy):", e));
            }
        };

        // Try to play immediately
        playAudio();

        // Also try to play on first user interaction
        const handleInteraction = () => {
            playAudio();
            window.removeEventListener('click', handleInteraction);
            window.removeEventListener('keydown', handleInteraction);
        };

        window.addEventListener('click', handleInteraction);
        window.addEventListener('keydown', handleInteraction);

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
            window.removeEventListener('click', handleInteraction);
            window.removeEventListener('keydown', handleInteraction);
        };
    }, []);

    const handleOpenGift = () => {
        if (audioRef.current) {
            audioRef.current.play()
                .catch(e => console.error("Audio play failed:", e));
        }
        setShowConfetti(true);
        setActiveSection('wish');
        setTimeout(() => setShowConfetti(false), 4000);
    };

    const handleCandlesBlown = () => {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
    }

    return (
        <div className={`min-h-screen w-full overflow-x-hidden bg-gradient-to-br ${THEME.primary} relative ${THEME.fontBody} selection:bg-rose-300 selection:text-rose-900 cursor-none md:cursor-auto`}>

            <MagicCursor />
            <Confetti isActive={showConfetti} />

            {/* Floating Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-10 left-10 w-32 h-32 bg-purple-400/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-20 right-20 w-48 h-48 bg-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000" />
                <Heart className="absolute top-1/4 left-10 text-white/10 w-24 h-24 animate-float" />
                <Stars className="absolute bottom-1/3 right-10 text-yellow-100/20 w-16 h-16 animate-float delay-700" />
            </div>

            {/* Navigation */}
            <nav className="fixed top-0 w-full p-6 flex justify-between items-center z-40">
                <div className={`text-white font-bold text-2xl tracking-wider flex items-center gap-2 ${THEME.fontHeading}`}>
                    <Sparkles className="w-6 h-6 text-yellow-200 animate-spin-slow" />
                    For Mrudula
                </div>
            </nav>

            <main className="relative z-10 container mx-auto px-4 min-h-screen flex flex-col items-center justify-center py-20">

                {/* --- SECTION 1: INTRO --- */}
                {activeSection === 'intro' && (
                    <div className="text-center space-y-12 animate-in fade-in zoom-in duration-700 flex flex-col items-center">

                        <div className="space-y-4">
                            <h1 className={`relative text-7xl md:text-9xl ${THEME.fontHeading} text-transparent bg-clip-text bg-gradient-to-r from-white via-rose-100 to-white drop-shadow-md pb-4`}>
                                Hey Birthday Girl!
                            </h1>
                            <p className={`text-rose-50 text-2xl md:text-3xl font-light ${THEME.fontHeading}`}>
                                Someone special is thinking of you...
                            </p>
                        </div>

                        {/* Direct Open Button (No Scratch Card) */}
                        <div className="mt-8">
                            <button
                                onClick={handleOpenGift}
                                className="group relative inline-flex items-center justify-center gap-3 px-10 py-5 bg-gradient-to-r from-rose-400 to-rose-500 text-white font-bold text-xl rounded-full shadow-2xl hover:shadow-rose-400/50 hover:-translate-y-1 transition-all duration-300"
                            >
                                <Gift className="w-6 h-6 animate-bounce" />
                                <span className="tracking-wide">Open Your Surprise</span>
                            </button>
                        </div>

                    </div>
                )}

                {/* --- SECTION 2: WISH, PHOTO, CAKE --- */}
                {activeSection === 'wish' && (
                    <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-16 items-center animate-in slide-in-from-bottom duration-1000 p-6">

                        {/* 3D Tilt Polaroid Effect */}
                        <div className="order-2 lg:order-1 relative group perspective-1000 mx-auto w-full max-w-md">
                            <div className="absolute -inset-4 bg-gradient-to-r from-yellow-200 via-rose-300 to-purple-300 rounded-[2rem] blur-xl opacity-60 group-hover:opacity-90 transition duration-1000 group-hover:duration-200 animate-tilt"></div>

                            <div
                                className="relative bg-white p-5 pb-16 rounded-[4px] shadow-2xl transform transition-transform duration-500 hover:rotate-2 hover:scale-[1.02]"
                                style={{ borderRadius: '4px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)' }}
                            >
                                {/* Tape effect */}
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-32 h-8 bg-white/40 backdrop-blur-sm transform -rotate-2 shadow-sm border border-white/50 z-20"></div>

                                <div className="relative aspect-[4/5] w-full overflow-hidden bg-gray-100 shadow-inner">
                                    <img
                                        src={MRUDULA_PHOTO_URL}
                                        alt="Mrudula"
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 ring-1 ring-black/5"></div>
                                </div>

                                <div className="absolute bottom-4 w-full text-center">
                                    <p className={`${THEME.fontHeading} text-3xl text-gray-800 -rotate-1`}>The Birthday Queen 👑</p>
                                </div>

                                <div className="absolute -bottom-6 -right-6 text-yellow-300 drop-shadow-lg transform rotate-12">
                                    <Sparkles size={48} fill="currentColor" />
                                </div>
                            </div>
                        </div>

                        {/* Interactive Content */}
                        <div className="order-1 lg:order-2 space-y-12 text-center lg:text-left text-white">

                            <div className="space-y-4">
                                <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-medium tracking-wider uppercase">
                                    <Stars className="w-4 h-4 text-yellow-300" /> Special Day
                                </div>
                                <h2 className={`text-6xl lg:text-8xl ${THEME.fontHeading} leading-none drop-shadow-xl`}>
                                    Happy <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-pink-200 to-white">
                                        Birthday!
                                    </span>
                                </h2>
                                <h3 className="text-4xl font-light tracking-wide opacity-90">Mrudula</h3>
                            </div>

                            <div className="flex flex-col lg:flex-row items-center gap-10">
                                <div className="flex-1">
                                    <p className="text-xl text-pink-50/90 leading-relaxed font-light">
                                        Wishing you a day as vibrant, beautiful, and full of life as you are. May this year bring you endless laughter, peace, and everything your heart desires.
                                    </p>

                                    {/* --- GEMINI MAGIC COMPONENT --- */}
                                    <GeminiOracle />

                                </div>
                                <div className="flex-shrink-0">
                                    <CakeWithCandles onBlow={handleCandlesBlown} />
                                </div>
                            </div>

                            <div className="pt-8 flex justify-center lg:justify-start">
                                <button
                                    onClick={() => setActiveSection('letter')}
                                    className="bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 px-10 py-4 rounded-full transition-all flex items-center gap-3 group shadow-lg hover:shadow-pink-400/50 hover:-translate-y-1 text-white"
                                >
                                    <Feather className="w-5 h-5" />
                                    <span className="font-semibold tracking-wide">Read My Letter</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- SECTION 3: APOLOGY LETTER (Typewriter & Paper) --- */}
                {activeSection === 'letter' && (
                    <div className="w-full max-w-3xl animate-in zoom-in-95 duration-500 px-4">
                        <div className="bg-[#fdfbf7] rounded-sm p-8 md:p-16 shadow-2xl relative text-gray-800 transform rotate-1 transition-transform hover:rotate-0">
                            {/* Paper texture overlay (simulated with CSS) */}
                            <div className="absolute inset-0 opacity-20 pointer-events-none bg-noise"></div>
                            <div className="absolute inset-0 border-t-8 border-b-8 border-transparent bg-gradient-to-b from-gray-100/20 to-gray-100/20 pointer-events-none"></div>

                            {/* Wax Seal */}
                            <button
                                onClick={() => setActiveSection('wish')}
                                className="absolute -top-6 -right-6 w-16 h-16 bg-rose-800 rounded-full flex items-center justify-center text-rose-200 shadow-lg border-4 border-rose-900/30 group z-30"
                            >
                                <X size={24} className="group-hover:rotate-90 transition-transform" />
                            </button>

                            {/* Letter Content */}
                            <div className="relative z-10 font-serif">
                                <div className="text-center mb-12">
                                    <span className="text-gray-400 text-sm uppercase tracking-[0.3em] block mb-2">A Personal Note</span>
                                    <h3 className={`text-4xl ${THEME.fontHeading} text-gray-800`}>Dear Mrudula,</h3>
                                </div>

                                <div className="space-y-6 text-gray-700 leading-loose text-lg md:text-xl font-light">
                                    <p>
                                        <TypewriterText text="First of all, I hope you are having the most amazing birthday. Seeing you happy and smiling is genuinely all I wish for you." delay={20} />
                                    </p>
                                    <p>
                                        <TypewriterText text="I also wanted to take this moment to genuinely apologize. I know things were rough two years ago, and I regret making you feel bad or uncomfortable. It was never my intention to hurt you, but I know my actions did, and for that, I am truly sorry." delay={20} />
                                    </p>
                                    <p>
                                        <TypewriterText text="Thank you for unblocking me and giving me this small window to wish you. It means a lot. I respect your space and your happiness above everything else." delay={20} />
                                    </p>

                                    <div className="pt-12 text-right">
                                        <p className={`${THEME.fontHeading} text-3xl text-rose-600 -rotate-2 inline-block`}>
                                            Happy Birthday!
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </main>

            {/* Footer */}
            <footer className="absolute bottom-4 w-full text-center text-white/40 text-xs font-light tracking-widest uppercase">
                Made with <Heart className="inline-block w-3 h-3 text-rose-300 mx-1" fill="currentColor" /> & Apology
            </footer>

            {/* CSS Utility for Noise & Animations */}
            <style>{`
        /* Volume Slider Styling */
        input[type="range"].slider {
          -webkit-appearance: none;
          appearance: none;
        }

        input[type="range"].slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          background: white;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        input[type="range"].slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          background: white;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          border: none;
        }

        .bg-noise {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.5'/%3E%3C/svg%3E");
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-spin-slow { animation: spin 8s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
        </div>
    );
}