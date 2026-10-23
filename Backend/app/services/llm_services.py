from langchain_openai import ChatOpenAI
from dotenv import load_dotenv
from langchain_community.tools import DuckDuckGoSearchRun
import os
load_dotenv()

search_tool = DuckDuckGoSearchRun(region="us-en")


medical_llm = ChatOpenAI(
    # model="groq/compound",
    model="groq/compound-mini",
    api_key=os.environ.get("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1",
)
writter_llm = ChatOpenAI(
    # model="groq/compound",
    model="groq/compound-mini",
    api_key=os.environ.get("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1",
)
programmer_llm = ChatOpenAI(
    # model="groq/compound",
    model="groq/compound-mini",
    api_key=os.environ.get("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1",
)
search_llm = ChatOpenAI(
    # model="groq/compound",
    model="groq/compound-mini",
    api_key=os.environ.get("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1",
)

tools = [search_tool]
openai_search_llm= search_llm.bind_tools(tools)


reason_llm_a = ChatOpenAI(
    model="llama-3.3-70b-versatile",
    api_key=os.environ.get("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1",
)

reason_llm_b = ChatOpenAI(
    model="llama-3.1-8b-instant",
    api_key=os.environ.get("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1",
)

reason_synthesizer_llm = ChatOpenAI(
    model="groq/compound-mini",
    api_key=os.environ.get("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1",
)