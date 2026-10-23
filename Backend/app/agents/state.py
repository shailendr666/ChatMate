from typing_extensions import Annotated, TypedDict
from typing import List, Optional
from langchain_core.messages import HumanMessage, BaseMessage
from langgraph.graph.message import add_messages
import operator

class QueryState(TypedDict):
    messages: Annotated[List[str], operator.add]
    
    
class ChatState(TypedDict):
    user_id: str
    mode: str 
    messages: Annotated[list[BaseMessage], add_messages]
    system_prompt: str
    llm_response: Optional[str]
    conversation_id: Optional[str]
    reason_response_a: Optional[str]
    reason_response_b: Optional[str]
    
    
    