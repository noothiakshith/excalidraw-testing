import create from 'zustand';
import { TOOL_ACTION_TYPES, TOOL_ITEMS } from '../../constants';
import { createnewlement } from '../utils/element';
import { isNearPoint } from '../utils/math';
export const useBoardStore = create((set, get) => ({
  activeToolItem: TOOL_ITEMS.BRUSH,
  toolActionType: TOOL_ACTION_TYPES.NONE,
  elements: [],
  history: [[]],
  index: 0,
  canvasId: '',
  isUserLoggedIn: '',

  changeTool: (tool) => set({ activeToolItem: tool }),

  setCanvasId: (canvasId) => set({ canvasId }),

  setUserLoggedIn: (status) => set({ isUserLoggedIn: status }),

  setElements: (elements) => set({ elements }),

  setHistory: (history) => set({ history }),

  boardHandleDown: (clientX, clientY, fill, stroke, size) => {
    const { activeToolItem, elements } = get();
    const newElement = createnewlement(
      id,
      clientX,
      clientY,
      clientX,
      clientY,
      { type: activeToolItem, stroke, fill, size }
    );

    set({
      elements: [...elements, newElement],
      toolActionType:
        activeToolItem === TOOL_ITEMS.BRUSH
          ? TOOL_ACTION_TYPES.DRAWING
          : TOOL_ACTION_TYPES.WRITING,
    });
  },
  boardhandleup:()=>{
    const { history, index, elements, toolActionType } = get();
    if(toolActionType===TOOL_ACTION_TYPES.WRITING) return
    const newhistory = [...history.slice(0,index+1),elements]
    set({
        history:newhistory,
        index:index+1,
        toolActionType:TOOL_ACTION_TYPES.NONE
    })
  },
  eraseatapoint:({clientx,clienty})=>{
    const{history,elements,index,toolActionType} = get()
    const newElements = elements.filter((el)=>!isNearPoint(el,clientx,clienty))
    const newhistory = [...history.slice(0,index+1),newElements]
    set({
        elements:newElements,
        history:newhistory,
        index:index+1
    })
  },
  changeText: (text) => {
    const { elements, history, index } = get();
    const updatedElements = [...elements];
    const lastElement = { ...updatedElements[updatedElements.length - 1], text };
    updatedElements[updatedElements.length - 1] = lastElement;
    const newHistory = [...history.slice(0, index + 1), updatedElements];
    set({
      elements: updatedElements,
      history: newHistory,
      index: index + 1,
      toolActionType: TOOL_ACTION_TYPES.NONE,
    });
  },
  undo:()=>{
    const{history,index} = get()
    set({
        elements:history[index-1],
        index:index-1
    })
  },
  redo:()=>{
    const{history,index} = get()
    set({
        elements:history[index+1],
        index:index+1
    })
  }
}));
