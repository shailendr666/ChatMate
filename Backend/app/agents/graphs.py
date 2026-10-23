
from langgraph.graph import START, END, StateGraph
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
from langgraph.prebuilt import ToolNode, tools_condition
from langchain_community.tools import DuckDuckGoSearchRun
from dotenv import load_dotenv
import os
import psycopg

from app.agents.state import ChatState
from app.agents.nodes import generate_response, search_chat_response, medical_chat_response, writer_chat_response, programmer_chat_response, route_mode, route_to_mode, rag_chat_response, reason_llm_a_node, reason_llm_b_node, reason_synthesizer_node

load_dotenv()

_workflow = None
_checkpointer_cm = None
_checkpointer = None

def patch_psycopg():
    """Disable prepared statements to avoid conflicts"""
    original_connect = psycopg.AsyncConnection.connect

    @classmethod
    async def patched_connect(cls, conninfo="", **kwargs):
        kwargs['prepare_threshold'] = None  
        return await original_connect(conninfo, **kwargs)

    psycopg.AsyncConnection.connect = patched_connect

patch_psycopg()


async def build_graph():
    global _workflow, _checkpointer_cm, _checkpointer

    if _workflow is not None:
        return _workflow

    search_tool = DuckDuckGoSearchRun(region="us-en")
    tools = [search_tool]
    
    tool_node = ToolNode(tools)
    graph = StateGraph(ChatState)
    graph.add_node("medical_node", medical_chat_response)
    graph.add_node("programmer_node", programmer_chat_response)
    graph.add_node("writer_node", writer_chat_response)
    graph.add_node("rag_node", rag_chat_response)
    graph.add_node("search_node", search_chat_response)
    graph.add_node("router_node", route_mode)
    graph.add_node("tools", tool_node)
    graph.add_node("reason_llm_a_node", reason_llm_a_node)
    graph.add_node("reason_llm_b_node", reason_llm_b_node)
    graph.add_node("reason_synthesizer_node", reason_synthesizer_node)

    
    graph.add_edge(START, "router_node")
    graph.add_conditional_edges("router_node", route_to_mode)
    graph.add_edge("medical_node", END)
    graph.add_edge("programmer_node", END)
    graph.add_edge("writer_node", END)
    graph.add_edge("rag_node", END)
    graph.add_conditional_edges("search_node", tools_condition)
    graph.add_edge("tools", "search_node")
    graph.add_edge("reason_llm_a_node", "reason_llm_b_node")
    graph.add_edge("reason_llm_b_node", "reason_synthesizer_node")
    graph.add_edge("reason_synthesizer_node", END)

    db_url = os.environ["POSTGRES_URL"]

    _checkpointer_cm = AsyncPostgresSaver.from_conn_string(db_url)
    _checkpointer = await _checkpointer_cm.__aenter__()

    _workflow = graph.compile(checkpointer=_checkpointer)
    return _workflow


async def close_graph():
    global _checkpointer_cm, _checkpointer
    if _checkpointer_cm:
        await _checkpointer_cm.__aexit__(None, None, None)
        _checkpointer_cm = None
        _checkpointer = None