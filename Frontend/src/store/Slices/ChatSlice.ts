import { createSlice } from "@reduxjs/toolkit";


interface Message{
  role:string,
  content:string
}
interface ChatState {
  // currentConvoChats: Array<>,
  activeChatId: string;
  activeChats: Array<Message>
}

const initialState: ChatState = {
  activeChatId: "1",
  activeChats:[]
};
export const ChatSlice = createSlice({
  name: "chat",

  initialState,
  reducers: {
    setActiveChatId: (state, action) => {
      state.activeChatId = action.payload;
    },
    setActiveChats: (state, action)=>{
      state.activeChats = [...state.activeChats, action.payload]
    },
    startActiveChat: (state, action)=>{
      state.activeChats = action.payload
    }
  },
});

export const { setActiveChatId, setActiveChats,startActiveChat  } = ChatSlice.actions;

export default ChatSlice.reducer
