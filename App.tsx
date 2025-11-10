import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { AppState, Spell } from './types';
import { generateSpell } from './services/geminiService';
import { getMoonPhase } from './services/moonService';
import { AudioService } from './services/audioService';
import StarryBackground from './components/StarryBackground';
import SpellResult from './components/SpellResult';
import { SparkleIcon, SpeakerOnIcon, SpeakerOffIcon, MoonIcon, LockIcon } from './components/icons';

const zodiacSigns = [
    "Ram", "Stier", "Tweelingen", "Kreeft", "Leeuw", "Maagd",
    "Weegschaal", "Schorpioen", "Boogschutter", "Steenbok", "Waterman", "Vissen"
];

const parseSpell = (text: string): Spell | null => {
    const geestenMatch = text.match(/### De boodschap van de geesten ###\s*([\s\S]*?)\s*### De rituele instructie ###/);
    const instructieMatch = text.match(/### De rituele instructie ###\s*([\s\S]*?)\s*### De energetische tip ###/);
    const tipMatch = text.match(/### De energetische tip ###\s*([\s\S]*)/);

    if (geestenMatch && instructieMatch && tipMatch) {
        return {
            geestenBoodschap: geestenMatch[1].trim(),
            ritueleInstructie: instructieMatch[1].trim(),
            energetischeTip: tipMatch[1].trim(),
        };
    }
    
    // Fallback if the structure is slightly off
    const parts = text.split(/###.*?###/).map(p => p.trim()).filter(Boolean);
    if (parts.length >= 3) {
        return {
            geestenBoodschap: parts[0],
            ritueleInstructie: parts[1],
            energetischeTip: parts[2],
        };
    }

    return null;
};

const App: React.FC = () => {
    const [appState, setAppState] = useState<AppState>(AppState.INPUT_WISH);
    const [name, setName] = useState<string>('');
    const [zodiacSign, setZodiacSign] = useState<string>('');
    const [birthDate, setBirthDate] = useState<string>('');
    const [wish, setWish] = useState<string>('');
    const [spell, setSpell] = useState<Spell | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loadingStep, setLoadingStep] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [moonPhase, setMoonPhase] = useState<ReturnType<typeof getMoonPhase> | null>(null);
    const [focusedField, setFocusedField] = useState<string | null>(null);


    const audioServiceRef = useRef<AudioService>(new AudioService());

    useEffect(() => {
        setMoonPhase(getMoonPhase());
    }, []);

    const currentDateString = useMemo(() => {
        return new Date().toLocaleDateString('nl-NL', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    }, []);

    const personalizedMessages = useMemo(() => {
        const messages = [];
        messages.push(name ? `Nikita verbindt met jouw energie, ${name}...` : 'Nikita verbindt met de kosmos...');
        if (zodiacSign) {
            messages.push(`De unieke energie van ${zodiacSign} wordt gevoeld...`);
        } else {
            messages.push('De energie wordt gebundeld...');
        }
        messages.push(`Je wens resoneert door het universum...`);
        messages.push(`Een persoonlijke boodschap wordt voor jou gekanaliseerd...`);
        return messages;
    }, [name, zodiacSign]);

    const handleGenerateSpell = useCallback(async () => {
        setAppState(AppState.LOADING);
        setError(null);
        try {
            const generatedText = await generateSpell(wish, name, zodiacSign, birthDate);
            const parsedSpell = parseSpell(generatedText);
            if (!parsedSpell) {
                throw new Error("De ontvangen boodschap had een onverwachte vorm. Probeer het alsjeblieft opnieuw.");
            }
            setSpell(parsedSpell);
            setAppState(AppState.SHOWING_SPELL);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Er is een onbekende fout opgetreden.');
            setAppState(AppState.INPUT_WISH); // Go back to wish input on error
        }
    }, [wish, name, zodiacSign, birthDate]);
    
    const handleInputFocus = (fieldName: string) => {
      setFocusedField(fieldName);
      audioServiceRef.current.startInputFocusSound();
    };

    const handleInputBlur = () => {
      setFocusedField(null);
      audioServiceRef.current.stopInputFocusSound();
    };

    const handleWishSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        audioServiceRef.current.init(); // Initialize audio on first user interaction
        
        if (!name.trim() || !zodiacSign.trim() || !birthDate.trim() || !wish.trim()) {
            setError("Vul alsjeblieft alle velden in voor de meest persoonlijke reading.");
            return;
        }

        if (wish.trim().length > 10) {
            setError(null);
            handleGenerateSpell();
        } else {
            setError("Beschrijf je wens iets uitgebreider voor een krachtigere boodschap.");
        }
    };

    const handleReset = () => {
        setName('');
        setZodiacSign('');
        setBirthDate('');
        setWish('');
        setSpell(null);
        setError(null);
        setAppState(AppState.INPUT_WISH);
    };

    const handleToggleMute = () => {
        const muted = audioServiceRef.current.toggleMute();
        setIsMuted(muted);
    };

    useEffect(() => {
        let interval: number;
        if (appState === AppState.LOADING) {
            audioServiceRef.current.startLoadingLoop();
            setLoadingStep(0);
            interval = window.setInterval(() => {
                setLoadingStep(prev => prev + 1);
            }, 2500);
        } else {
            audioServiceRef.current.stopLoadingLoop();
        }
        return () => {
            clearInterval(interval);
            audioServiceRef.current.stopLoadingLoop();
        };
    }, [appState]);

    const renderContent = () => {
        switch (appState) {
            case AppState.INPUT_WISH:
                return (
                    <div className="w-full max-w-lg mx-auto animate-fadeInUp">
                        <form onSubmit={handleWishSubmit} className="bg-brand-deep-blue/95 rounded-2xl p-8 border border-white/10 shadow-lg shadow-brand-purple/10">
                           {moonPhase && (
                               <div className="text-center mb-6 opacity-90">
                                   <MoonIcon iconKey={moonPhase.iconKey} className="w-10 h-10 mx-auto text-white mb-2 filter drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
                                   <p className="font-serif text-lg text-white">{moonPhase.name}</p>
                                   <p className="text-sm text-white/90 [text-shadow:0_1px_3px_rgba(0,0,0,0.7)]">{moonPhase.description}</p>
                                   <p className="text-xs text-white/80 mt-1 [text-shadow:0_1px_3px_rgba(0,0,0,0.7)]">{currentDateString}</p>
                               </div>
                           )}
                            <h1 className="text-3xl md:text-4xl font-serif text-center text-white mb-2">Ontvang jouw kosmische reading van Nikita</h1>
                            <div className="flex justify-center items-center gap-2 mb-4">
                                <SparkleIcon className="w-6 h-6 text-brand-gold" />
                            </div>
                            <p className="text-center text-white/90 text-sm mb-6 [text-shadow:0_1px_3px_rgba(0,0,0,0.7)]">
                                Voor de meest accurate kosmische afstemming, maakt Nikita graag gebruik van je persoonlijke gegevens.
                            </p>
                            
                             <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                onFocus={() => handleInputFocus('name')}
                                onBlur={handleInputBlur}
                                placeholder="Jouw naam"
                                className={`w-full mb-4 p-3 bg-brand-deep-blue border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-brand-light-purple focus:outline-none transition-all duration-300 ${focusedField === 'name' ? 'shadow-glow-purple' : ''}`}
                                required
                            />
                             <input
                                type="date"
                                value={birthDate}
                                onChange={(e) => setBirthDate(e.target.value)}
                                onFocus={() => handleInputFocus('birthDate')}
                                onBlur={handleInputBlur}
                                className={`w-full mb-4 p-3 bg-brand-deep-blue border border-white/20 rounded-lg focus:ring-2 focus:ring-brand-light-purple focus:outline-none transition-all duration-300 ${birthDate ? 'text-white' : 'text-brand-light-purple'} ${focusedField === 'birthDate' ? 'shadow-glow-purple' : ''}`}
                                required
                            />
                            <select
                                value={zodiacSign}
                                onChange={(e) => setZodiacSign(e.target.value)}
                                onFocus={() => handleInputFocus('zodiacSign')}
                                onBlur={handleInputBlur}
                                className={`w-full mb-4 p-3 bg-brand-deep-blue border border-white/20 rounded-lg ${zodiacSign ? 'text-white' : 'text-gray-400'} focus:ring-2 focus:ring-brand-light-purple focus:outline-none transition-all duration-300 ${focusedField === 'zodiacSign' ? 'shadow-glow-purple' : ''}`}
                                required
                            >
                                <option value="">Kies je sterrenbeeld</option>
                                {zodiacSigns.map(sign => <option key={sign} value={sign} className="text-white bg-brand-deep-blue">{sign}</option>)}
                            </select>
                            <textarea
                                value={wish}
                                onChange={(e) => setWish(e.target.value)}
                                onFocus={() => handleInputFocus('wish')}
                                onBlur={handleInputBlur}
                                placeholder="Beschrijf hieronder jouw wens of situatie..."
                                className={`w-full h-32 p-4 bg-brand-deep-blue border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-brand-light-purple focus:outline-none transition-all duration-300 resize-none ${focusedField === 'wish' ? 'shadow-glow-purple' : ''}`}
                                required
                            />
                            {error && <p className="text-red-400 text-sm mt-2 text-center">{error}</p>}
                            <div className="flex items-center justify-center text-center text-xs text-white mt-4 px-4 [text-shadow:0_1px_3px_rgba(0,0,0,0.7)]">
                                <LockIcon className="w-3 h-3 mr-2 inline-block" />
                                Jouw privacy is heilig. Je gegevens worden alleen gebruikt voor deze reading en worden niet opgeslagen.
                            </div>
                            <button
                                type="submit"
                                className="w-full mt-4 bg-brand-gold text-brand-deep-blue font-bold py-3 px-6 rounded-full shadow-lg shadow-yellow-500/30 hover:shadow-yellow-500/50 transition-all duration-300 transform hover:scale-105"
                            >
                                Onthul mijn kosmische boodschap
                            </button>
                        </form>
                    </div>
                );
            case AppState.LOADING:
                const currentLoadingText = personalizedMessages[loadingStep % personalizedMessages.length];
                return (
                     <div className="text-center animate-fadeInUp flex flex-col items-center justify-center">
                        <div className="relative w-40 h-40 flex items-center justify-center">
                            {/* Central glowing orb */}
                            <div className="absolute w-24 h-24 bg-purple-400 rounded-full animate-pulseSlow shadow-glow-purple blur-md"></div>
                            <div className="absolute w-20 h-20 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full animate-pulseSlow shadow-glow-purple"></div>
                            {/* Orbiting particles */}
                            <div className="absolute w-full h-full animate-spin" style={{ animationDuration: '8s' }}>
                                <div className="absolute top-0 left-1/2 -ml-2 w-4 h-4 bg-yellow-300 rounded-full shadow-glow-gold animate-twinkle"></div>
                            </div>
                            <div className="absolute w-full h-full animate-spin" style={{ animationDuration: '10s' }}>
                                <div className="absolute bottom-0 right-1/2 -mr-1 w-3 h-3 bg-white rounded-full animate-twinkle" style={{ animationDelay: '1s' }}></div>
                            </div>
                            <div className="absolute w-full h-full animate-spin" style={{ animationDuration: '12s' }}>
                                <div className="absolute top-1/2 -mt-1 right-0 w-2 h-2 bg-yellow-300 rounded-full shadow-glow-gold animate-twinkle" style={{ animationDelay: '2s' }}></div>
                            </div>
                        </div>
                        <p className="text-white text-xl mt-8 font-serif transition-opacity duration-1000">{currentLoadingText}</p>
                    </div>
                );
            case AppState.SHOWING_SPELL:
                return spell ? <SpellResult spell={spell} name={name} onReset={handleReset} audioService={audioServiceRef.current} /> : null;
            default:
                return null;
        }
    };

    return (
        <main className="min-h-screen w-full flex items-center justify-center p-4 text-white overflow-y-auto">
            <StarryBackground />
            <button
                onClick={handleToggleMute}
                className="fixed top-4 right-4 z-20 p-2 bg-white/10 rounded-full text-brand-light-purple hover:bg-white/20 transition-colors"
                aria-label={isMuted ? "Geluid aanzetten" : "Geluid uitzetten"}
            >
                {isMuted ? <SpeakerOffIcon className="w-6 h-6" /> : <SpeakerOnIcon className="w-6 h-6" />}
            </button>
            <div className="relative z-10 w-full py-8">
                {renderContent()}
            </div>
        </main>
    );
};

export default App;
