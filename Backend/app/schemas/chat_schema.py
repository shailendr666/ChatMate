from pydantic import BaseModel, Field, field_validator

class ChatRequest(BaseModel):
    query: str = Field(..., description="Query send by user", examples=["Who are you?"])
    user_id:str = Field(..., description="User id", examples=["user1"])
    mode: str = Field(..., description="Mode of LLM which user wants", examples=["general"])
    conversation_id : str = Field(..., description="conversation id")
    
    
    @field_validator("mode")
    @classmethod
    def check_mode(cls, value):
        print(value)
        allowed_mode = {"doctor", "programmer", "general", "writer", "rag", "reason"}
        if value not in allowed_mode:
            raise ValueError("Wrong mode")
        return value
    


class ChatResponse(BaseModel):
    response:list [str] = Field(..., description="Response send by server")
    
    
class NewChat(BaseModel):
    user_id: str = Field(..., description="User id", examples=["user1"])
    mode: str = Field(..., description="Mode of LLM which user wants", examples=["general"])
    
    @field_validator("mode")
    @classmethod
    def check_mode(cls, value):
        allowed_mode = {"doctor", "programmer", "general", "writer", "rag", "reason"}
        if value not in allowed_mode:
            raise ValueError("Wrong mode")
        return value
    
