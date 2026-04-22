/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Music, 
  ChevronRight, 
  ChevronLeft, 
  Copy, 
  Check, 
  RefreshCcw, 
  Sparkles,
  User,
  Quote,
  Mic2
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const ai = GEMINI_API_KEY ? new GoogleGenAI(GEMINI_API_KEY) : null;

type Step = 'intro' | 'recipient' | 'name' | 'details' | 'style' | 'generating' | 'result';

interface FormData {
  recipientType: string;
  recipientName: string;
  details: string;
  genre: string;
  mood: string;
}

export default function App() {
  const [step, setStep] = useState<Step>('intro');
  const [formData, setFormData] = useState<FormData>({
    recipientType: '',
    recipientName: '',
    details: '',
    genre: 'Balada',
    mood: 'Emotivo y agradecido'
  });
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const stepsOrder: Step[] = ['recipient', 'name', 'details', 'style'];
  const currentIndex = stepsOrder.indexOf(step as Step);

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (step === 'intro') setStep('recipient');
    else if (currentIndex < stepsOrder.length - 1) setStep(stepsOrder[currentIndex + 1]);
    else handleGenerate();
  };

  const prevStep = () => {
    if (currentIndex > 0) setStep(stepsOrder[currentIndex - 1]);
    else setStep('intro');
  };

  const handleGenerate = async () => {
    setStep('generating');
    
    const promptInstructions = `
      Actúa como un experto creador de prompts para Suno AI.
      El usuario quiere crear una canción para el Día de la Madre con estos detalles:
      - Destinatario: ${formData.recipientType} (Nombre: ${formData.recipientName})
      - Detalles personales: ${formData.details}
      - Género musical: ${formData.genre}
      - Sentimiento/Mood: ${formData.mood}

      Crea un prompt optimizado para Suno AI (máximo 500 caracteres). 
      El prompt debe estar en INGLÉS pero debe mencionar que las letras sean en ESPAÑOL.
      Estructura sugerida: [Genre], [Mood], [Instruments], lyrics about [Subject].
      Solo devuelve el texto del prompt, nada más.
    `;

    try {
      if (!ai) {
        throw new Error("API Key no configurada");
      }
      const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
      const response = await model.generateContent(promptInstructions);
      const output = await response.response;
      const cleanPrompt = output.text().trim() || "Error generating prompt.";
      setGeneratedPrompt(cleanPrompt.substring(0, 500));
      setStep('result');
    } catch (error) {
      console.error("Error generating prompt:", error);
      setGeneratedPrompt("Error al generar el prompt. Intenta de nuevo.");
      setStep('result');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPrompt);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const reset = () => {
    setStep('intro');
    setFormData({
      recipientType: '',
      recipientName: '',
      details: '',
      genre: 'Balada',
      mood: 'Emotivo y agradecido'
    });
    setGeneratedPrompt('');
  };

  const renderFormContent = () => {
    switch (step) {
      case 'intro':
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col h-full justify-center text-center space-y-8"
          >
            <div className="flex justify-center">
              <div className="w-24 h-24 bg-rose-500/10 rounded-full flex items-center justify-center text-rose-400 border border-rose-500/20 shadow-[0_0_50px_rgba(244,63,94,0.1)]">
                <Heart size={44} className="animate-pulse" />
              </div>
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-serif italic text-rose-100 leading-tight">
                Melodía de un Corazón
              </h1>
              <p className="text-stone-400 text-sm tracking-[0.2em] uppercase">
                Suno Prompt Designer
              </p>
            </div>
            <p className="text-stone-300/80 max-w-sm mx-auto leading-relaxed">
              Crea el regalo perfecto: una obra musical personalizada que capture la esencia de quien más amas.
            </p>
            <button 
              onClick={nextStep}
              className="px-12 py-5 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl font-bold transition-all shadow-xl shadow-rose-900/40 flex items-center gap-3 mx-auto group"
            >
              Comenzar Creación <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        );

      case 'recipient':
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col h-full"
          >
            <div className="mb-10">
              <span className="text-rose-400 text-xs font-bold uppercase tracking-[0.3em] block mb-2">Paso 01</span>
              <h2 className="text-3xl font-serif text-stone-100">¿Para quién es este regalo?</h2>
              <p className="text-stone-500 text-sm mt-3">Personaliza la dedicatoria para esa persona especial.</p>
            </div>
            
            <div className="flex-1 space-y-3">
              {['Mi Madre', 'Mi Abuela', 'Mi Esposa', 'Una Tía', 'Alguien Especial'].map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    updateFormData('recipientType', type);
                    nextStep();
                  }}
                  className={`w-full p-4 rounded-xl text-left border transition-all flex items-center justify-between group ${
                    formData.recipientType === type 
                    ? 'border-rose-500 bg-rose-500/10 text-rose-100' 
                    : 'border-white/5 bg-white/5 hover:bg-white/10 text-stone-400'
                  }`}
                >
                  <span className="flex items-center gap-3">
                   <div className={`w-2 h-2 rounded-full ${formData.recipientType === type ? 'bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.8)]' : 'bg-stone-700'}`} />
                   {type}
                  </span>
                  <ChevronRight size={16} className={`opacity-0 group-hover:opacity-100 transition-opacity ${formData.recipientType === type ? 'text-rose-400' : 'text-stone-600'}`} />
                </button>
              ))}
              <input 
                type="text"
                placeholder="Otro..."
                className="w-full p-4 bg-stone-900/50 border border-white/10 rounded-xl text-stone-200 focus:outline-none focus:border-rose-500/50 transition-colors"
                value={['Mi Madre', 'Mi Abuela', 'Mi Esposa', 'Una Tía', 'Alguien Especial'].includes(formData.recipientType) ? '' : formData.recipientType}
                onChange={(e) => updateFormData('recipientType', e.target.value)}
              />
            </div>

            <div className="pt-8">
              <button onClick={nextStep} disabled={!formData.recipientType} className="w-full py-4 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2">
                Siguiente Paso <ChevronRight size={18} />
              </button>
            </div>
          </motion.div>
        );

      case 'name':
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col h-full"
          >
            <div className="mb-10">
              <span className="text-rose-400 text-xs font-bold uppercase tracking-[0.3em] block mb-2">Paso 02</span>
              <h2 className="text-3xl font-serif text-stone-100">¿Cómo se llama?</h2>
              <p className="text-stone-500 text-sm mt-3">O cómo le dices de cariño (ej. "Mami Rosa").</p>
            </div>
            
            <div className="flex-1 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] text-stone-500 uppercase tracking-widest ml-1">Nombre o Apodo</label>
                <input 
                  type="text"
                  autoFocus
                  placeholder="Introduce su nombre acá..."
                  className="w-full bg-stone-900/50 border border-white/10 rounded-xl px-5 py-4 text-xl text-stone-100 focus:outline-none focus:border-rose-500/50 transition-colors placeholder:text-stone-700"
                  value={formData.recipientName}
                  onChange={(e) => updateFormData('recipientName', e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && formData.recipientName && nextStep()}
                />
              </div>
            </div>

            <div className="pt-8 flex gap-3">
              <button onClick={prevStep} className="p-4 rounded-xl border border-white/10 text-stone-400 hover:bg-white/5 transition-all">
                <ChevronLeft size={24} />
              </button>
              <button 
                disabled={!formData.recipientName}
                onClick={nextStep} 
                className="flex-1 py-4 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
              >
                Continuar <ChevronRight size={18} />
              </button>
            </div>
          </motion.div>
        );

      case 'details':
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col h-full"
          >
            <div className="mb-10">
              <span className="text-rose-400 text-xs font-bold uppercase tracking-[0.3em] block mb-2">Paso 03</span>
              <h2 className="text-3xl font-serif text-stone-100">Buscando Inspiración</h2>
              <p className="text-stone-500 text-sm mt-3">Describe sus pasatiempos, un aroma que le guste o un momento especial.</p>
            </div>
            
            <div className="flex-1 space-y-2">
              <label className="text-[10px] text-stone-500 uppercase tracking-widest ml-1">Detalles únicos</label>
              <textarea 
                autoFocus
                placeholder="Ej: Le encantan las gardenias, siempre tararea canciones antiguas y prepara el mejor café de las mañanas..."
                className="w-full h-48 bg-stone-900/50 border border-white/10 rounded-xl px-5 py-4 text-stone-200 focus:outline-none focus:border-rose-500/50 transition-colors placeholder:text-stone-700 resize-none leading-relaxed"
                value={formData.details}
                onChange={(e) => updateFormData('details', e.target.value)}
              />
            </div>

            <div className="pt-8 flex gap-3">
              <button onClick={prevStep} className="p-4 rounded-xl border border-white/10 text-stone-400 hover:bg-white/5 transition-all">
                <ChevronLeft size={24} />
              </button>
              <button 
                disabled={!formData.details}
                onClick={nextStep} 
                className="flex-1 py-4 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
              >
                Continuar <ChevronRight size={18} />
              </button>
            </div>
          </motion.div>
        );

      case 'style':
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col h-full"
          >
            <div className="mb-8">
              <span className="text-rose-400 text-xs font-bold uppercase tracking-[0.3em] block mb-2">Paso 04</span>
              <h2 className="text-3xl font-serif text-stone-100">Estilo & Ritmo</h2>
              <p className="text-stone-500 text-sm mt-3">Elige la atmósfera musical ideal.</p>
            </div>
            
            <div className="flex-1 space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] text-stone-500 uppercase tracking-widest ml-1">Género musical</label>
                <div className="flex flex-wrap gap-2">
                  {['Balada', 'Acústico', 'Pop', 'Bolero', 'Mariachi', 'Salsa Duo'].map((genre) => (
                    <button
                      key={genre}
                      onClick={() => updateFormData('genre', genre)}
                      className={`px-4 py-2 rounded-full text-xs font-medium transition-all border ${
                        formData.genre === genre 
                        ? 'bg-rose-500/20 border-rose-500/50 text-rose-200' 
                        : 'bg-white/5 border-white/5 text-stone-500 hover:bg-white/10'
                      }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] text-stone-500 uppercase tracking-widest ml-1">Estado de ánimo</label>
                <select 
                  className="w-full p-4 bg-stone-900 border border-white/10 rounded-xl text-stone-100 focus:outline-none focus:border-rose-500/50"
                  value={formData.mood}
                  onChange={(e) => updateFormData('mood', e.target.value)}
                >
                  <option>Emotivo y agradecido</option>
                  <option>Alegre y festivo</option>
                  <option>Nostálgico y dulce</option>
                  <option>Divertido y rítmico</option>
                  <option>Grandioso y épico</option>
                </select>
              </div>
            </div>

            <div className="pt-8 flex gap-3">
              <button onClick={prevStep} className="p-4 rounded-xl border border-white/10 text-stone-400 hover:bg-white/5 transition-all">
                <ChevronLeft size={24} />
              </button>
              <button 
                onClick={nextStep} 
                className="flex-1 py-4 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-rose-900/20 flex items-center justify-center gap-3 group"
              >
                Generar Composición <Sparkles size={20} className="group-hover:rotate-12 transition-transform" />
              </button>
            </div>
          </motion.div>
        );

      case 'generating':
        return (
          <div className="flex flex-col h-full items-center justify-center text-center space-y-8 py-12">
            <motion.div 
              animate={{ 
                rotate: 360,
                scale: [1, 1.05, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ 
                rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                scale: { duration: 2, repeat: Infinity },
                opacity: { duration: 2, repeat: Infinity }
              }}
              className="text-rose-500/50"
            >
              <RefreshCcw size={80} strokeWidth={1} />
            </motion.div>
            <div className="space-y-3">
              <h2 className="text-3xl font-serif text-rose-100 italic">Componiendo...</h2>
              <p className="text-stone-500 text-sm max-w-xs leading-relaxed uppercase tracking-widest">Estamos orquestando tu mensaje hacia un prompt sublime</p>
            </div>
          </div>
        );

      case 'result':
        return (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col h-full"
          >
            <div className="mb-8 text-center">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center text-green-400 border border-green-500/20 mx-auto mb-4">
                <Check size={32} />
              </div>
              <h2 className="text-3xl font-serif text-stone-100">¡Obra Finalizada!</h2>
              <p className="text-stone-500 text-sm mt-3 uppercase tracking-widest leading-loose">Tu prompt está listo para cobrar vida en Suno AI.</p>
            </div>

            <div className="flex-1 bg-black/40 rounded-2xl border border-white/5 p-6 font-mono text-sm text-stone-400 italic leading-relaxed select-all">
              {generatedPrompt}
            </div>

            <div className="pt-8 space-y-3">
              <button 
                onClick={copyToClipboard}
                className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-3 ${
                  isCopied 
                  ? 'bg-green-600 text-white' 
                  : 'bg-rose-600 hover:bg-rose-500 text-white'
                }`}
              >
                {isCopied ? <Check size={20} /> : <Copy size={20} />}
                {isCopied ? '¡Prompt Copiado!' : 'Copiar Composición'}
              </button>
              
              <button 
                onClick={reset}
                className="w-full py-4 text-stone-500 text-xs font-bold uppercase tracking-[0.3em] hover:text-stone-300 transition-colors"
              >
                Reiniciar Proceso
              </button>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#12080a] text-stone-100 font-sans flex items-center justify-center p-4 md:p-8 overflow-hidden relative" 
         style={{ background: 'radial-gradient(circle at 0% 0%, #3d1419 0%, #12080a 50%), radial-gradient(circle at 100% 100%, #1e130c 0%, #12080a 50%)' }}>
      
      {/* Background Decorative Glows */}
      <div className="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] bg-rose-900/20 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="fixed bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-amber-900/10 blur-[120px] rounded-full pointer-events-none"></div>

      {/* Grid Layout */}
      <div className="w-full max-w-6xl h-auto min-h-[650px] lg:grid lg:grid-cols-12 gap-10 relative z-10 items-stretch">
        
        {/* Left Sidebar */}
        <aside className="lg:col-span-3 flex flex-col justify-between py-6 hidden lg:flex">
          <div className="space-y-12">
            <header>
              <h1 className="text-2xl font-serif italic text-rose-200 mb-1">Melodía de un Corazón</h1>
              <p className="text-stone-500 text-[10px] tracking-[0.3em] uppercase">Suno Prompt Designer</p>
            </header>
            
            <nav className="space-y-8">
              {[
                { n: '01', l: 'Destinatario', active: currentIndex >= 0 || step === 'intro' },
                { n: '02', l: 'Nombre & Cariño', active: currentIndex >= 1 },
                { n: '03', l: 'Inspiración', active: currentIndex >= 2 },
                { n: '04', l: 'Estilo & Ritmo', active: currentIndex >= 3 || step === 'generating' || step === 'result' }
              ].map((s, i) => (
                <div key={i} className={`flex items-center gap-4 transition-all duration-500 ${s.active ? 'opacity-100' : 'opacity-20'}`}>
                  <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-[10px] font-bold ${s.active ? 'border-rose-400 text-rose-200 bg-rose-900/30 shadow-[0_0_10px_rgba(244,63,94,0.3)]' : 'border-stone-600 text-stone-600'}`}>
                    {s.n}
                  </div>
                  <span className={`text-xs font-semibold tracking-wider uppercase ${s.active ? 'text-stone-100' : 'text-stone-600'}`}>{s.l}</span>
                </div>
              ))}
            </nav>
          </div>

          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <p className="text-[9px] text-stone-500 uppercase tracking-widest mb-2 font-bold">Consejo de Composición</p>
            <p className="text-xs text-stone-300 italic leading-relaxed">
              "Menciona un detalle táctil, como sus manos cálidas o el aroma de su cocina, para que Suno cree algo verdaderamente íntimo."
            </p>
          </div>
        </aside>

        {/* Center: Main Form Area */}
        <main className="lg:col-span-5 bg-white/5 rounded-[40px] border border-white/10 backdrop-blur-xl p-8 md:p-10 flex flex-col shadow-2xl relative overflow-hidden h-full">
           <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 blur-[50px] rounded-full -mr-16 -mt-16 pointer-events-none"></div>
           
           <AnimatePresence mode="wait">
             <div key={step} className="flex-1 overflow-y-auto">
               {renderFormContent()}
             </div>
           </AnimatePresence>
        </main>

        {/* Right Preview Side */}
        <aside className="lg:col-span-4 flex flex-col gap-6 mt-8 lg:mt-0">
          <div className="flex-1 bg-black/30 rounded-[40px] border border-white/5 p-8 flex flex-col justify-between backdrop-blur-sm">
            <div>
              <div className="flex items-center justify-between mb-8">
                <span className="text-[10px] text-stone-500 uppercase tracking-[0.3em] font-bold">Resumen de Obra</span>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></div>
                  <span className="text-[10px] text-rose-400 font-mono">LIVE_PREVIEW</span>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-1">
                  <span className="text-[9px] text-stone-600 uppercase tracking-widest block">Inspiración Base</span>
                  <div className="text-sm text-stone-300 leading-relaxed font-serif italic">
                    {formData.details 
                      ? `"${formData.details.substring(0, 100)}${formData.details.length > 100 ? '...' : ''}"`
                      : "Esperando inspiración..."}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[9px] text-stone-600 uppercase tracking-widest block">Género</span>
                    <div className="text-xs text-rose-200/80 font-mono tracking-tighter">{formData.genre.toUpperCase()}</div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] text-stone-600 uppercase tracking-widest block">Color Emotivo</span>
                    <div className="text-xs text-rose-200/80 font-mono tracking-tighter">{formData.mood.toUpperCase()}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12">
               <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-[10px] text-stone-500 italic leading-relaxed">
                 Esta herramienta genera el "Style of Music" para Suno AI usando algoritmos de lenguaje natural.
               </div>
            </div>
          </div>

          <div className="h-44 bg-gradient-to-br from-rose-600/40 via-rose-900/40 to-stone-900 rounded-[40px] p-8 relative overflow-hidden flex flex-col justify-end border border-white/10 group">
            <div className="absolute top-[-10%] right-[-5%] opacity-10 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-700">
               <Music size={140} />
            </div>
            <p className="text-stone-200 font-serif text-lg leading-tight relative z-10 italic">
              "La música empieza donde acaban las palabras."
            </p>
            <span className="text-[9px] uppercase tracking-widest text-stone-500 mt-2 block font-bold">— Heinrich Heine</span>
          </div>
        </aside>

      </div>

      {/* Visual Overlay for Immersion */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.04] mix-blend-overlay" 
           style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/microfabrics.png')` }}></div>
    </div>
  );
}
