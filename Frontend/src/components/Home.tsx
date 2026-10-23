import  { useState, useEffect } from "react";
import {
  ArrowRight,
  Clock,
  Terminal,
  BrainCircuit,
  MessageCircle,
  Stethoscope,
  Code2,
  Pen,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const ROLES = {
  GENERAL: {
    id: "general",
    name: "General Assistant",
    description: "Everyday tasks and creative thought-partnership.",
    icon: <MessageCircle className="w-4 h-4" />,
    accent: "indigo",
    borderColor: "border-indigo-500/20",
    prompt:
      "You are a professional general assistant. Concise, helpful, and logical.",
  },
  DOCTOR: {
    id: "doctor",
    name: "Medical Assistant",
    description: "Clinical-grade health insights and wellness empathy.",
    icon: <Stethoscope className="w-4 h-4" />,
    accent: "emerald",
    borderColor: "border-emerald-500/20",
  },
  WRITER: {
    id: "writer",
    name: "Writing Assistant",
    description: "Clinical-grade health insights and wellness empathy.",
    icon: <Pen className="w-4 h-4" />,
    accent: "emerald",
    borderColor: "border-emerald-500/20",
  },

  CODER: {
    id: "coder",
    name: "Software Assistant",
    description: "Advanced algorithms and system design patterns.",
    icon: <Code2 className="w-4 h-4" />,
    accent: "violet",
    borderColor: "border-violet-500/20",
  },
};

const Home = ( ) => {
  const [, setScrolled] = useState(false);
  const navigate = useNavigate();


  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto space-y-24">
      
        <section className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-tight">
              Talk to different AI assistant, seamlessly <br />
              <span className="text-zinc-600">without losing context.</span>
            </h1>
            <p className="text-lg text-zinc-400 max-w-xl leading-relaxed">
              ChatMate lets you interact with multiple AI assistants in one conversation. Switch roles anytime while your context and conversation remain preserved.
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => {
                navigate("/chat")
              }}
              className="px-6 py-3 bg-white text-black font-bold rounded hover:bg-zinc-200 transition-all flex items-center gap-2 cursor-pointer"
            >
              Open Workspace <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-px bg-zinc-800 border border-zinc-800 rounded-lg overflow-hidden">
          {Object.values(ROLES).map((role) => (
            <div
              key={role.id}
             
              className="bg-zinc-950 p-8 hover:bg-zinc-900/50 transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="p-2 border border-zinc-800 rounded group-hover:border-zinc-700 transition-colors text-zinc-400">
                  {role.icon}
                </div>
                <div className="text-[10px] font-mono text-zinc-600 tracking-tighter uppercase">
                  ChatMate.00{Object.values(ROLES).indexOf(role) + 1}
                </div>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {role.name}
              </h3>
              <p className="text-sm text-zinc-500 leading-relaxed">
                {role.description}
              </p>
            </div>
          ))}
        </section>

        <section className="grid md:grid-cols-3 gap-12 border-t border-zinc-800 pt-16">
          <div className="space-y-4">
            <div className="text-white font-semibold flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-zinc-500" />
              Dynamic Context
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Conversations are token-tracked to ensure persona-switching
              doesn't purge historical relevance.
            </p>
          </div>
          <div className="space-y-4">
            <div className="text-white font-semibold flex items-center gap-2">
              <Terminal className="w-4 h-4 text-zinc-500" />
              Isolated RAG
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Each role operates within a strictly defined personality sandbox
              for professional accuracy.
            </p>
          </div>
          <div className="space-y-4">
            <div className="text-white font-semibold flex items-center gap-2">
              <Clock className="w-4 h-4 text-zinc-500" />
              State Persistence
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Session state is maintained locally to allow for multi-modal
              problem solving across experts.
            </p>
          </div>
        </section>
      </div>
    </div>
  );

};

export default Home;
