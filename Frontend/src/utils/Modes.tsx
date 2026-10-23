import { Code, Sparkles, Stethoscope, TextSearch, ClipboardPenLine, Scale } from "lucide-react";


export const MODES = [
  {
    id: 'rag',
    title: 'Chat with PDF',
    icon: TextSearch,
    color: 'text-neutral-400',
    bgColor: 'bg-neutral-400/10',
    description: 'Ask Question about PDFs'
  },
  {
    id: 'doctor',
    title: 'Medical Assitant',
    icon: Stethoscope,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    description: 'Health inquiries and wellness advice.'
  },
  {
    id: 'programmer',
    title: 'Programming Assitant',
    icon: Code,
    color: 'text-orange-400',
    bgColor: 'bg-orange-400/10',
    description: 'Code, refactoring, and Debugging.'
  },

  {
    id: 'writer',
    title: 'Writting Assitant',
    icon: ClipboardPenLine,
    color: 'text-sky-400',
    bgColor: 'bg-sky-500/10',
    description: 'Turn thoughts into words.'
  },


  {
    id: 'general',
    title: 'General Assitant',
    icon: Sparkles,
    color: 'text-zinc-400',
    bgColor: 'bg-zinc-500/10',
    description: 'Casual conversation and daily tasks.'
  },

  {
    id: 'reason',
    title: 'Reasoning Mode',
    icon: Scale,
    color: 'text-violet-400',
    bgColor: 'bg-violet-500/10',
    description: 'Two LLMs answer, one synthesizer decides.'
  },
];
