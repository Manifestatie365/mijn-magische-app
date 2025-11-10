import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Spell, SigilState } from '../types';
import { AudioService } from '../services/audioService';
import { generateSigilImage } from '../services/geminiService';
import { SpeakerOnIcon, SpeakerOffIcon, SparkleIcon, HeartSparkleIcon, LoadingIcon, ShareIcon, CopyIcon } from './icons';
import html2canvas from 'html2canvas';

interface SpellResultProps {
    spell: Spell;
    name: string;
    onReset: () => void;
    audioService: AudioService;
}

const SpellSection: React.FC<{
    title: string;
    content: string;
    onSpeak: () => void;
    isSpeaking: boolean;
    isLoading: boolean;
}> = ({ title, content, onSpeak, isSpeaking, isLoading }) => {
    return (
        <div className="mb-6 last:mb-0">
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-serif text-brand-gold">{title}</h2>
                <button 
                    onClick={onSpeak} 
                    className="p-1 rounded-full text-brand-light-purple/70 hover:bg-white/10 hover:text-brand-light-purple transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label={isSpeaking ? `Stop met voorlezen: ${title}` : `Lees voor: ${title}`}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <LoadingIcon className="w-5 h-5" />
                    ) : isSpeaking ? (
                        <SpeakerOffIcon className="w-5 h-5" />
                    ) : (
                        <SpeakerOnIcon className="w-5 h-5" />
                    )}
                </button>
            </div>
            <p className="text-white/90 whitespace-pre-wrap leading-relaxed">{content}</p>
        </div>
    );
};

const ShareCard: React.FC<{ spell: Spell, sigilImage: string | null }> = ({ spell, sigilImage }) => {
    return (
        <div className="absolute -left-[9999px] top-0 w-[400px] h-[400px] bg-cover bg-center p-8 flex flex-col justify-center items-center text-center" style={{ backgroundImage: `url('https://images.pexels.com/photos/1169754/pexels-photo-1169754.jpeg')` }}>
            <div className="absolute inset-0 bg-brand-deep-blue/70"></div>
            <div className="relative z-10">
                {sigilImage && <img src={sigilImage} alt="Persoonlijke Zegel" className="w-32 h-32 mx-auto mb-4 rounded-lg" />}
                <p className="text-white font-serif text-lg italic">"{spell.geestenBoodschap.split('. ')[0]}."</p>
                <p className="text-xs text-white/70 mt-4">Gekanaliseerd via Manifestatie365.nl</p>
            </div>
        </div>
    );
};


const SpellResult: React.FC<SpellResultProps> = ({ spell, name, onReset, audioService }) => {
    const [speakingSection, setSpeakingSection] = useState<string | null>(null);
    const [loadingSection, setLoadingSection] = useState<string | null>(null);
    const [sigilState, setSigilState] = useState<SigilState>(SigilState.IDLE);
    const [sigilImage, setSigilImage] = useState<string | null>(null);
    const [sigilError, setSigilError] = useState<string | null>(null);
    const shareCardRef = useRef<HTMLDivElement>(null);
    const [copySuccess, setCopySuccess] = useState('');


    const soulmateCounter = useMemo(() => {
        const today = new Date();
        const dayOfWeek = today.getDay();
        const baseCount = 112; 
        const dailyGrowth = dayOfWeek * 15 + Math.floor(today.getHours() / 3);
        return baseCount + dailyGrowth;
    }, []);

    useEffect(() => {
        const generateSigil = async () => {
            setSigilState(SigilState.GENERATING);
            setSigilError(null);
            try {
                const fullReadingText = `${spell.geestenBoodschap} ${spell.ritueleInstructie} ${spell.energetischeTip}`;
                const base64Image = await generateSigilImage(fullReadingText);
                setSigilImage(`data:image/png;base64,${base64Image}`);
                setSigilState(SigilState.GENERATED);
            } catch (error) {
                setSigilState(SigilState.ERROR);
                setSigilError(error instanceof Error ? error.message : "Er is een onbekende fout opgetreden.");
                console.error("Failed to generate sigil:", error);
            }
        };

        generateSigil();
    }, [spell]);

    useEffect(() => {
        audioService.playActivationComplete();
        return () => {
            audioService.stopCurrentSpeech();
        };
    }, [audioService]);

    const handleSpeak = useCallback(async (section: string, text: string) => {
        if (speakingSection === section) {
            audioService.stopCurrentSpeech();
            setSpeakingSection(null);
            return;
        }
        audioService.stopCurrentSpeech();
        setLoadingSection(section);
        setSpeakingSection(null);
        try {
            const sourceNode = await audioService.speakText(text);
            setLoadingSection(null);
            setSpeakingSection(section);
            sourceNode.onended = () => {
                setSpeakingSection(null);
            };
        } catch (error) {
            console.error(`Could not speak section "${section}":`, error);
            setLoadingSection(null);
            setSpeakingSection(null);
        }
    }, [speakingSection, audioService]);

    const handleShareImage = async () => {
        if (!shareCardRef.current) return;

        try {
            const canvas = await html2canvas(shareCardRef.current, { useCORS: true });
            canvas.toBlob(async (blob) => {
                if (blob && navigator.share) {
                    const file = new File([blob], 'reading-zegel.png', { type: 'image/png' });
                    try {
                        await navigator.share({
                            title: 'Mijn Kosmische Reading',
                            text: 'Ontvangen via Manifestatie365.nl',
                            files: [file],
                        });
                    } catch (err) {
                        console.error('Error sharing:', err);
                    }
                } else {
                     const link = document.createElement('a');
                     link.download = 'reading-zegel.png';
                     link.href = URL.createObjectURL(blob as Blob);
                     link.click();
                }
            }, 'image/png');
        } catch (error) {
            console.error('Error creating share image:', error);
        }
    };

    const handleCopyText = () => {
        const fullText = `Mijn Kosmische Reading van Nikita\n\n### ${spell.geestenBoodschap}\n\n### De rituele instructie\n${spell.ritueleInstructie}\n\n### De energetische tip\n${spell.energetischeTip}\n\nGekanaliseerd via Manifestatie365.nl`;
        navigator.clipboard.writeText(fullText).then(() => {
            setCopySuccess('Gekopieerd!');
            setTimeout(() => setCopySuccess(''), 2000);
        });
    };
    
    return (
        <div className="w-full max-w-2xl mx-auto animate-fadeInUp">
            <div className="bg-brand-deep-blue/95 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-white/10 shadow-lg shadow-brand-purple/20">
                <p className="text-center text-white/90 mb-6 italic text-sm">
                    Lieve {name || 'ziel'}, hier is de leiding die de kosmos voor jou heeft. Gebruik deze inzichten om je eigen magie te creëren:
                </p>
                
                <SpellSection 
                    title="De boodschap van de geesten"
                    content={spell.geestenBoodschap}
                    onSpeak={() => handleSpeak('boodschap', spell.geestenBoodschap)}
                    isSpeaking={speakingSection === 'boodschap'}
                    isLoading={loadingSection === 'boodschap'}
                />
                <div className="my-6 border-t border-white/10"></div>
                <SpellSection 
                    title="De rituele instructie"
                    content={spell.ritueleInstructie} 
                    onSpeak={() => handleSpeak('instructie', spell.ritueleInstructie)}
                    isSpeaking={speakingSection === 'instructie'}
                    isLoading={loadingSection === 'instructie'}
                />
                <div className="my-6 border-t border-white/10"></div>
                <SpellSection 
                    title="De energetische tip"
                    content={spell.energetischeTip} 
                    onSpeak={() => handleSpeak('tip', spell.energetischeTip)}
                    isSpeaking={speakingSection === 'tip'}
                    isLoading={loadingSection === 'tip'}
                />

                 <div className="my-8 border-t border-white/10"></div>

                {/* --- Personal Sigil Section --- */}
                <div className="text-center">
                    {sigilState === SigilState.GENERATING && (
                        <div className="animate-fadeInUp">
                             <LoadingIcon className="w-8 h-8 mx-auto text-brand-gold mb-2"/>
                             <p className="text-brand-gold font-serif">De kosmos creëert jouw persoonlijke zegel...</p>
                        </div>
                    )}
                    {sigilState === SigilState.GENERATED && sigilImage && (
                         <div className="animate-fadeInUp">
                             <h2 className="text-xl font-serif text-brand-gold mb-4">Jouw Persoonlijke Zegel</h2>
                            <img src={sigilImage} alt="Een uniek, abstract en magisch zegel dat de essentie van je reading vertegenwoordigt." className="rounded-lg max-w-xs mx-auto shadow-lg shadow-brand-gold/20 border border-brand-gold/30" />
                        </div>
                    )}
                     {sigilState === SigilState.ERROR && (
                        <p className="text-red-400 text-sm">{sigilError}</p>
                    )}
                </div>

                {/* --- Action Toolbox --- */}
                <div className="mt-8 pt-6 border-t border-white/10 flex justify-center items-center gap-4">
                     <button onClick={handleShareImage} className="flex items-center gap-2 bg-white/10 text-white/90 font-bold text-sm py-2 px-4 rounded-full hover:bg-white/20 transition-colors">
                        <ShareIcon className="w-4 h-4"/> Deel als Afbeelding
                    </button>
                    <button onClick={handleCopyText} className="flex items-center gap-2 bg-white/10 text-white/90 font-bold text-sm py-2 px-4 rounded-full hover:bg-white/20 transition-colors">
                        <CopyIcon className="w-4 h-4" /> {copySuccess || 'Kopieer Tekst'}
                    </button>
                </div>
                
                {/* --- Upsells --- */}
                <div className="mt-8 pt-6 border-t border-white/10">
                    <div className="bg-white/5 rounded-lg p-4 mb-4 border border-white/10 text-center">
                        <SparkleIcon className="w-6 h-6 text-brand-gold mx-auto mb-2" />
                        <h3 className="font-serif text-lg text-white mb-1">Versterk Jouw Manifestatie Kracht</h3>
                        <p className="text-sm text-white/80 mb-3">
                            Voor wensen die diepe, transformerende kracht vereisen, kan ik, Nikita, persoonlijk een krachtig ritueel voor je uitvoeren. Dit is magie die voor jou wordt <strong>gedaan</strong>.
                            <br/><em className="text-xs opacity-80 mt-1 block">✨ Meer dan 50 anderen lieten deze week al een persoonlijk ritueel uitvoeren.</em>
                        </p>
                        <a href="https://manifestatie365.nl/products/krachtige-spreuken" target="_blank" rel="noopener noreferrer" className="inline-block bg-brand-gold text-brand-deep-blue font-bold text-sm py-2 px-5 rounded-full shadow-lg shadow-yellow-500/30 hover:shadow-yellow-500/50 transition-all duration-300 transform hover:scale-105 hover:brightness-110">
                            Laat Nikita mijn Ritueel Uitvoeren
                        </a>
                    </div>

                    <div className="bg-white/5 rounded-lg p-4 mb-6 border border-white/10 text-center">
                        <HeartSparkleIcon className="w-6 h-6 text-brand-gold mx-auto mb-2" />
                        <h3 className="font-serif text-lg text-white mb-1">Een Glimp van je Kosmische Connectie...</h3>
                        <p className="text-sm text-white/80 mb-3">
                            Op basis van de energie van jouw wens kan medium Meester Zen een poort openen om je een visuele manifestatie van je soulmate te tonen.
                             <br/><em className="text-xs opacity-80 mt-1 block">🔮 De huidige planetaire uitlijning is bijzonder krachtig voor het openen van hartenconnecties.</em>
                        </p>
                         <a href="https://manifestatie365.nl/products/soulmate-schets-gratis-reading" target="_blank" rel="noopener noreferrer" className="inline-block bg-brand-gold text-brand-deep-blue font-bold text-sm py-2 px-5 rounded-full shadow-lg shadow-yellow-500/30 hover:shadow-yellow-500/50 transition-all duration-300 transform hover:scale-105 hover:brightness-110">
                            Onthul mijn Soulmate Schets
                        </a>
                        <p className="text-xs text-center text-white/70 italic mt-2">
                           ✨ Sluit je aan bij de {soulmateCounter} zielen die deze week hun connectie hebben onthuld.
                        </p>
                    </div>
                </div>

                 <div ref={shareCardRef}><ShareCard spell={spell} sigilImage={sigilImage} /></div>
                
                 <div className="mt-8 pt-6 border-t border-white/10 text-center">
                     <button
                        onClick={onReset}
                        className="w-full sm:w-auto bg-transparent border border-white/30 text-white font-bold py-3 px-6 rounded-full hover:bg-white/10 transition-all duration-300 transform hover:scale-105"
                    >
                        Nieuwe reading doen
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SpellResult;
