
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_postgres import PGVector
from dotenv import load_dotenv
from langchain_core.prompts import ChatPromptTemplate
from langchain_huggingface.embeddings import HuggingFaceEmbeddings
import os                                

load_dotenv()


import logging

from app.agents.state import ChatState

from app.services.llm_services import openai_search_llm, medical_llm, programmer_llm, writter_llm, reason_llm_a, reason_llm_b, reason_synthesizer_llm


logger = logging.getLogger(__name__)
MAX_HISTORY = 8

async def generate_response(state:ChatState ):

    message = [
        SystemMessage(content=state["system_prompt"]),
        *state["messages"][-MAX_HISTORY:]
    ]

    try:
        res = await openai_search_llm.ainvoke(message)
        ai_msg = AIMessage(content=res.content)
        return {
            "llm_response": res.content,
            "messages": [res]
        }
    except Exception as e:
        logger.exception("LLM invocation failed")
        return {
            "llm_response": "Sorry, I couldn't process your request right now.",
            "messages": []
        }
    # pass
    
async def medical_chat_response(state:ChatState):
    
    # print(state["messages"])
    print("medical_chat_response")
    
    # print("\n\n\n")
    message = [
        SystemMessage(content=state["system_prompt"]),
        *state["messages"][-MAX_HISTORY:]
    ]
    
    print(message)

    try:
        res = await medical_llm.ainvoke(message)
        ai_msg = AIMessage(content=res.content)
        return {
            "llm_response": res.content,
            "messages": [res]
        }
    except Exception as e:
        logger.exception("LLM invocation failed")
        return {
            "llm_response": "Sorry, I couldn't process your request right now.",
            "messages": []
        }
        
        
async def programmer_chat_response(state:ChatState):
    

    print("programmer_chat_response")
    
    message = [
        SystemMessage(content=state["system_prompt"]),
        *state["messages"][-MAX_HISTORY:]
    ]

    try:
        res = await programmer_llm.ainvoke(message)
        ai_msg = AIMessage(content=res.content)
        return {
            "llm_response": res.content,
            "messages": [res]
        }
    except Exception as e:
        logger.exception("LLM invocation failed")
        return {
            "llm_response": "Sorry, I couldn't process your request right now.",
            "messages": []
        }
        
        
async def writer_chat_response(state:ChatState):
    
    print("writer_chat_response")

    message = [
        SystemMessage(content=state["system_prompt"]),
        *state["messages"][-MAX_HISTORY:]
    ]

    try:
        res = await writter_llm.ainvoke(message)
        ai_msg = AIMessage(content=res.content)
        return {
            "llm_response": res.content,
            "messages": [res]
        }
    except Exception as e:
        logger.exception("LLM invocation failed")
        return {
            "llm_response": "Sorry, I couldn't process your request right now.",
            "messages": []
        }
        
        
async def search_chat_response(state:ChatState):
    
    # print(state["messages"])
    
    # print("\n\n\n")
    print("search_chat_response")

    message = [
        SystemMessage(content=state["system_prompt"]),
        *state["messages"][-MAX_HISTORY:]
    ]

    try:
        res = await openai_search_llm.ainvoke(message)
        ai_msg = AIMessage(content=res.content)
        return {
            "llm_response": res.content,
            "messages": [res]
        }
    except Exception as e:
        logger.exception("LLM invocation failed")
        return {
            "llm_response": "Sorry, I couldn't process your request right now.",
            "messages": []
        }

def route_to_mode(state: ChatState) -> str:
    if state["mode"] == "doctor":
        return "medical_node"
    elif state["mode"] == "writer":
        return "writer_node"
    elif state["mode"] == "programmer":
        return "programmer_node"
    elif state["mode"] == "rag":
        return "rag_node"
    elif state["mode"] == "reason":
        return "reason_llm_a_node"
    else:
        return "search_node"
    
async def route_mode(state: ChatState):
    return state


async def rag_chat_response(state:ChatState):
    
    message = [
        SystemMessage(content=state["system_prompt"]),
        *state["messages"][-MAX_HISTORY:]
    ]
    
    user_query = message[-1]
    embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-l6-v2",
        )
    vector_store = PGVector(
        embeddings=embeddings,
        collection_name=state["conversation_id"],
        connection=os.environ.get("POSTGRES_URL")
    )
    print(str(user_query))
    try:
        vector_res = vector_store.similarity_search(str(user_query), k= 4)
        
        prompt = ChatPromptTemplate.from_messages([ ("system", state["system_prompt"]),("human", 
                    """ CONTEXT: {context} 
                    QUESTION:
                    {question}
                    """)])
        rag_message = prompt.format_messages(context=vector_res,question=user_query )
        res = await medical_llm.ainvoke(rag_message)
        print(res)
        ai_msg = AIMessage(content=res.content)
        return {
            "llm_response": res.content,
            "messages": [res]
        }
    except Exception as e:
        logger.exception("LLM invocation failed")
        return {
            "llm_response": "Sorry, I couldn't process your request right now.",
            "messages": []
        }
    pass
    



async def reason_llm_a_node(state: ChatState):
    """First reasoning node: LLM-A answers the user question independently."""
    # print("reason_llm_a_node")

    message = [
        SystemMessage(content=state["system_prompt"]),
        *state["messages"][-MAX_HISTORY:]
    ]

    try:
        res = await reason_llm_a.ainvoke(message)
        return {
            "reason_response_a": res.content,
        }
    except Exception as e:
        logger.exception("Reasoning LLM-A invocation failed")
        return {
            "reason_response_a": "LLM-A could not generate a response.",
        }


async def reason_llm_b_node(state: ChatState):
    """Second reasoning node: LLM-B answers the user question independently."""
    # print("reason_llm_b_node")

    message = [
        SystemMessage(content=state["system_prompt"]),
        *state["messages"][-MAX_HISTORY:]
    ]

    try:
        res = await reason_llm_b.ainvoke(message)
        return {
            "reason_response_b": res.content,
        }
    except Exception as e:
        logger.exception("Reasoning LLM-B invocation failed")
        return {
            "reason_response_b": "LLM-B could not generate a response.",
        }


async def reason_synthesizer_node(state: ChatState):
    """Third reasoning node: synthesizer LLM reads both responses and produces a final answer."""
   
    user_question = ""
    for msg in reversed(state["messages"][-MAX_HISTORY:]):
        if isinstance(msg, HumanMessage):
            user_question = msg.content
            break

    synthesizer_system = "You are a neutral synthesizer. Two AI models have independently answered the same question. Your task is to compare their responses, identify agreements and disagreements, and produce a single comprehensive, balanced final answer."
    
    synthesizer_human = f"""Original Question:
{user_question}

Response from Model A:
{state.get('reason_response_a', 'N/A')}

Response from Model B:
{state.get('reason_response_b', 'N/A')}

Please synthesize the two responses into one clear, well-structured final answer using Markdown formatting."""

    synth_message = [
        SystemMessage(content=synthesizer_system),
        HumanMessage(content=synthesizer_human)
    ]

    try:
        res = await reason_synthesizer_llm.ainvoke(synth_message)
        ai_msg = AIMessage(content=res.content)
        return {
            "llm_response": res.content,
            "messages": [ai_msg],
        }
    except Exception as e:
        logger.exception("Reasoning synthesizer invocation failed")
        return {
            "llm_response": "Sorry, I couldn't synthesize the responses right now.",
            "messages": [],
        }
