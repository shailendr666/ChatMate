from fastapi import APIRouter, HTTPException, status, UploadFile, Depends
from fastapi.responses import JSONResponse
from langchain_core.messages import HumanMessage, AIMessage
from dotenv import load_dotenv
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_postgres import PGVector
from uuid import UUID

from app.agents.graphs import build_graph
from app.schemas.chat_schema import ChatRequest, NewChat
from app.utils.prompts import PROMPTS
from app.utils.welcome_message import WELCOME_MESSAGES
from app.db.supabase import get_supabase
from app.core.deps import get_current_user

import logging
import uuid
import time
import tempfile
import os


load_dotenv()

chat_router = APIRouter()
logger = logging.getLogger(__name__)


@chat_router.get("/chat/test")
def chat_test(current_user: dict = Depends(get_current_user)):
    return {"message": "Chat endpoint working!", "user": current_user.get("sub")}


@chat_router.post("/chat/generate")
async def generate_response(
    req: ChatRequest,
    current_user: dict = Depends(get_current_user),
):
    
    if req.user_id != current_user.get("sub"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorised to send messages as another user",
        )

    supabase = get_supabase()
    try:
        user_with_convo = (
            supabase.table("conversations")
            .select("user_id", "conversation_id", "mode")
            .eq("user_id", req.user_id)
            .eq("conversation_id", req.conversation_id)
            .execute()
        )

        if len(user_with_convo.data) == 0:
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={"data": "wrong conversation id"},
            )

        initial_state = {
            "mode": req.mode,
            "user_id": req.user_id,
            "messages": [HumanMessage(content=req.query)],
            "system_prompt": PROMPTS[req.mode],
            "llm_response": None,
            "conversation_id": req.conversation_id,
        }

        config1 = {"configurable": {"thread_id": req.conversation_id}}
        workflow = await build_graph()
        res = await workflow.ainvoke(initial_state, config=config1)
        llm_res = res.get("llm_response", "")

        return JSONResponse(status_code=200, content={"messages": llm_res})
    except Exception as e:
        logger.exception(e)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"error": str(e)},
        )


@chat_router.get("/conversations/{conversation_id}")
async def get_conversation(
    conversation_id: str,
    current_user: dict = Depends(get_current_user),
):
    try:
        config = {"configurable": {"thread_id": conversation_id}}
        workflow = await build_graph()
        state = await workflow.aget_state(config)
        messages = state.values.get("messages", [])

        result = []
        for msg in messages:
            role = (
                "user"
                if isinstance(msg, HumanMessage)
                else "assistant"
                if isinstance(msg, AIMessage)
                else "system"
            )
            result.append({"role": role, "content": msg.content})
        return JSONResponse(status_code=200, content={"messages": result})

    except Exception as e:
        logger.exception(e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch conversation",
        )


@chat_router.delete("/conversations/{conversation_id}")
async def delete_conversation(
    conversation_id: str,
    current_user: dict = Depends(get_current_user),
):
    try:
        supabase = get_supabase()
        res = (
            supabase.table("conversations")
            .delete()
            .eq("conversation_id", conversation_id)
            .execute()
        )

        if len(res.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No conversation exist with given conversation id",
            )

        if res.data[0]["mode"] == "rag":
            from langchain_huggingface.embeddings import HuggingFaceEmbeddings
            embeddings = HuggingFaceEmbeddings(
                model_name="sentence-transformers/all-MiniLM-l6-v2",
            )
            vector_store = PGVector(
                embeddings=embeddings,
                collection_name=str(conversation_id),
                connection=os.environ.get("POSTGRES_URL"),
            )
            vector_store.delete_collection()

        return JSONResponse(status_code=200, content={"data": res.data})
    except Exception as e:
        logger.exception(e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )


@chat_router.post("/chat/start")
async def create_new_chat(
    newchat: NewChat,
    current_user: dict = Depends(get_current_user),
):
    
    if newchat.user_id != current_user.get("sub"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorised to create a chat for another user",
        )

    conversation_id = str(uuid.uuid4())
    supabase = get_supabase()
    if not supabase:
        raise HTTPException(status_code=503, detail="Database not connected")
    data = {
        "conversation_id": conversation_id,
        "user_id": newchat.user_id,
        "mode": newchat.mode,
    }
    try:
        supabase.table("conversations").insert(data).execute()
        welcome_message = WELCOME_MESSAGES.get(
            newchat.mode,
            "Hello! How can I help you today?",
        )
        data["messages"] = [
            {
                "role": "assistant",
                "content": welcome_message,
            }
        ]
        return JSONResponse(status_code=200, content={"data": data})
    except Exception as e:
        logger.exception(e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to start conversation",
        )


@chat_router.get("/chat/{user_id}")
def fetch_all_conversations(
    user_id: str,
    current_user: dict = Depends(get_current_user),
):
   
    if user_id != current_user.get("sub"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorised to access another user's conversations",
        )

    supabase = get_supabase()
    if not supabase:
        return None
    try:
        res = (
            supabase.table("conversations")
            .select("conversation_id, mode, created_at")
            .eq("user_id", user_id)
            .execute()
        )
        return JSONResponse(status_code=200, content={"data": res.data})
    except Exception as e:
        logger.exception(e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get conversations",
        )


@chat_router.post("/chat/upload/{conversation_id}")
async def create_upload_file(
    conversation_id: UUID,
    file: UploadFile,
    current_user: dict = Depends(get_current_user),
):
    supabase = get_supabase()
    user_with_convo = (
        supabase.table("conversations")
        .select("user_id", "conversation_id", "mode")
        .eq("conversation_id", conversation_id)
        .execute()
    )
    if len(user_with_convo.data) == 0:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"detail": "Wrong conversation id"},
        )

    
    convo_owner = user_with_convo.data[0].get("user_id")
    if convo_owner != current_user.get("sub"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorised to upload to this conversation",
        )

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            tmp.write(await file.read())
            path = tmp.name

        file_size = os.stat(path=path)
        file_size_mb = file_size.st_size / (1024 * 1024)
        if file_size_mb > 100:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File size greater than 100 MB not allowed",
            )

        loader = PyPDFLoader(path)
        docs = loader.load()

        splitter = RecursiveCharacterTextSplitter(
            chunk_size=800,
            chunk_overlap=200,
            separators=["\n\n", "\n", " ", ""],
        )
        doc_chunks = splitter.split_documents(docs)

        from langchain_huggingface.embeddings import HuggingFaceEmbeddings
        embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-l6-v2",
        )
        vector_store = PGVector(
            embeddings=embeddings,
            collection_name=str(conversation_id),
            connection=os.environ.get("POSTGRES_URL"),
        )
        vector_store.add_documents(documents=doc_chunks)

        return JSONResponse(
            status_code=200,
            content={"message": "File ingested successfully"},
        )
    except Exception as e:
        logger.exception("Problem in ingesting File")
        logger.exception(e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Problem in ingesting File",
        )
