from textwrap import dedent

WELCOME_MESSAGES = {
    "rag": dedent("""
        Hello! I'm your AI assistant with access to verified documentation and knowledge bases.

        I can help you find accurate information by searching through relevant documents and providing detailed, source-based answers.

        What would you like to know?
    """),

    "doctor": dedent("""
        Hello! I'm your medical information assistant.

        I can help answer questions about medical conditions, symptoms, treatments, medications, and general health topics based on verified medical sources.

        Please note: I provide information for educational purposes only and cannot replace professional medical advice. For medical emergencies, please contact emergency services immediately.

        What health topic would you like to learn about?
    """),

    "programmer": dedent("""
        Hey there! I'm your coding assistant.

        I can help you with:
        - Writing and debugging code in various programming languages
        - Explaining programming concepts and best practices
        - Reviewing code and suggesting improvements
        - Solving algorithmic challenges
        - Answering technical questions about frameworks and tools

        What are you working on today?
    """),

    "writer": dedent("""
        Hello! I'm your writing assistant.

        I can help you:
        - Draft, edit, and refine any written content
        - Improve clarity, tone, and structure
        - Rewrite text for different audiences or purposes
        - Proofread for grammar and style
        - Create creative or professional content from scratch

        What would you like to write today?
    """),

    "general": dedent("""
        Hello! I'm Claude, your AI assistant.

        I'm here to help with a wide range of tasks including answering questions, writing, analysis, problem-solving, and creative projects.

        What can I help you with today?
    """),

    "reason": dedent("""
        Hello! Welcome to Reasoning Mode.

        Here's how it works:
        - **Model A** (Llama 3.3 70B) will independently answer your question.
        - **Model B** (Gemma 2 9B) will independently answer the same question.
        - A **Synthesizer** will then compare both responses and produce a single, balanced final answer for you.

        Ask me anything and see how two different AI models approach the same problem!
    """),
}
