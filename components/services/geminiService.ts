import { GoogleGenAI, Modality } from "@google/genai";
import { getMoonPhase } from './moonService';

// The API key is injected from environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const calculateLifePathNumber = (dateString: string): number => {
    if (!dateString) return 0; // Handle case where date is not provided
    let sum = dateString.replace(/-/g, '')
                        .split('')
                        .reduce((acc, digit) => acc + parseInt(digit, 10), 0);

    while (sum > 9) {
        if (sum === 11 || sum === 22 || sum === 33) { // Master numbers
            return sum;
        }
        sum = sum.toString().split('').reduce((acc, digit) => acc + parseInt(digit, 10), 0);
    }
    return sum;
};


const baseSystemInstruction = `Je bent Nikita, een liefdevolle en wijze spirituele gids van manifestatie365.nl. Je hebt een diepe connectie met de geestenwereld en de kosmos. Je spreekt in een mystieke, geruststellende en krachtige toon. Gebruik spirituele termen zoals 'energie', 'trilling', 'manifestatie', 'goddelijke leiding', 'maanfasen', en 'universum'. Je doel is om gebruikers een persoonlijke, kosmische reading te geven. Deze reading bevat diepgaande leiding en een praktische, rituele instructie die de gebruiker zelf kan uitvoeren om hun wensen te manifesteren. Spreek de gebruiker, wiens naam {NAME} is, direct en persoonlijk aan. Baseer je reading op de volgende gegevens: de wens van de gebruiker, hun sterrenbeeld ({ZODIAC_SIGN}), en hun geboortedatum ({BIRTH_DATE}). {ASTROLOGICAL_GUIDANCE} {ZODIAC_GUIDANCE} {NUMEROLOGY_GUIDANCE} Structureer je antwoord ALTIJD in de volgende drie secties, precies zoals hieronder beschreven, met de titels omringd door '###':

### De boodschap van de geesten ###
(Schrijf hier een korte, intuïtieve en poëtische boodschap die direct van de spirituele wereld lijkt te komen. Spreek de gebruiker aan met hun naam, bijv. "Lieve {NAME}, ...". Geef inzicht in de onderliggende energie van de wens van de gebruiker.)

### De rituele instructie ###
(Geef een duidelijk, praktisch stappenplan voor een eenvoudig ritueel dat de gebruiker thuis kan uitvoeren. Vermeld de benodigde materialen, zoals een specifieke kleur kaars, een kristal, kruiden, of een intentiebrief. Maak de stappen eenvoudig en toegankelijk.)

### De energetische tip ###
(Geef een afsluitend, wijs advies. Dit kan gaan over de juiste mindset, het belang van loslaten, een suggestie voor de beste timing (bijv. tijdens volle maan of nieuwe maan), of een kleine dagelijkse handeling om de intentie te versterken. Verweef hier de astrologische, numerologische en sterrenbeeld-inzichten.)`;

export const generateSpell = async (wish: string, name: string, zodiacSign: string, birthDate: string): Promise<string> => {
    try {
        const currentMoonPhase = getMoonPhase(); // Get the REAL moon phase
        const astrologicalGuidance = `Houd rekening met de huidige kosmische energie: de invloed van de ${currentMoonPhase.fullDescription}. Verwerk deze astrologische invloed op een subtiele en relevante manier in je advies, bijvoorbeeld in de energetische tip of het ritueel.`;
        
        const zodiacGuidance = `De gebruiker identificeert zich met het sterrenbeeld ${zodiacSign}. Verweef op een subtiele manier de kenmerkende energie of eigenschappen van dit teken in je boodschap, vooral in de energetische tip.`;
        
        const lifePathNumber = calculateLifePathNumber(birthDate);
        const numerologyGuidance = `De geboortedatum van de gebruiker (${birthDate}) resulteert in een levenspadgetal van ${lifePathNumber}. Verweef dit numerologische inzicht op een subtiele en krachtige manier in 'De energetische tip', en leg uit hoe dit getal hun benadering van de wens kan beïnvloeden.`;

        const systemInstruction = baseSystemInstruction
            .replace(/{NAME}/g, name)
            .replace('{ZODIAC_SIGN}', zodiacSign)
            .replace('{BIRTH_DATE}', birthDate)
            .replace('{ASTROLOGICAL_GUIDANCE}', astrologicalGuidance)
            .replace('{ZODIAC_GUIDANCE}', zodiacGuidance)
            .replace('{NUMEROLOGY_GUIDANCE}', numerologyGuidance);

        const contents = `Mijn naam is ${name}. Mijn geboortedatum is ${birthDate}. Mijn sterrenbeeld is ${zodiacSign}. Mijn wens is: "${wish}".`;


        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contents,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.8,
                topP: 0.9,
            },
        });
        return response.text;
    } catch (error) {
        console.error("Error generating spell:", error);
        throw new Error("Er was een probleem bij het verbinden met de kosmos. Controleer je verbinding en probeer het opnieuw.");
    }
};

export const generateSpeech = async (text: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: `Spreek op een kalme, mystieke en wijze toon: ${text}` }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) {
            throw new Error("No audio data received from API.");
        }
        return base64Audio;
    } catch (error) {
        console.error("Error generating speech:", error);
        throw new Error("De stem van de kosmos kon niet worden bereikt. Probeer het later opnieuw.");
    }
};

export const generateSigilImage = async (readingText: string): Promise<string> => {
    try {
        const prompt = `Create a unique, abstract, mystical sigil or seal representing the spiritual concepts in this text: "${readingText}". The design should be elegant, powerful, and suitable for meditation. Generate the sigil in a radiant gold color on a plain, dark, near-black background. The sigil should be centered and the main focus. Avoid any text or recognizable figures.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ text: prompt }] },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return part.inlineData.data; // Return the base64 encoded string
            }
        }
        throw new Error("No image data received from API.");
    } catch (error) {
        console.error("Error generating sigil image:", error);
        throw new Error("De kosmos kon de zegel niet vormen. Probeer het later opnieuw.");
    }
};
