import { create } from 'zustand';
import { TOOL_ACTION_TYPES, TOOL_ITEMS } from '../../constants';
import { createnewlement, isPointNearElement } from '../utils/element';
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

    if (activeToolItem === TOOL_ITEMS.ERASER) {
      set({ toolActionType: TOOL_ACTION_TYPES.ERASING });
      return;
    }

    const id = elements.length;
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
          : activeToolItem === TOOL_ITEMS.TEXT
            ? TOOL_ACTION_TYPES.WRITING
            : TOOL_ACTION_TYPES.DRAWING,
    });
  },
  boardHandleMove: ({ clientX, clientY }) => {
    const { elements, activeToolItem } = get();
    const newElements = [...elements];
    const index = elements.length - 1;
    const element = newElements[index];
    if (!element) return;

    switch (element.type) {
      case TOOL_ITEMS.LINE:
      case TOOL_ITEMS.RECTANGLE:
      case TOOL_ITEMS.CIRCLE:
      case TOOL_ITEMS.ARROW: {
        const { id, x1, y1, stroke, fill, size } = element;
        const newElement = createnewlement(id, x1, y1, clientX, clientY, {
          type: activeToolItem,
          stroke,
          fill,
          size,
        });
        newElements[index] = newElement;
        break;
      }
      case TOOL_ITEMS.BRUSH: {
        newElements[index].points = [
          ...newElements[index].points,
          { x: clientX, y: clientY },
        ];
        break;
      }
      default:
        throw new Error("Type not recognized");
    }

    set({ elements: newElements });
  },
  boardhandleup: () => {
    const { history, index, elements, toolActionType } = get();
    if (toolActionType === TOOL_ACTION_TYPES.WRITING) return;

    const newhistory = [...history.slice(0, index + 1), elements];
    set({
      history: newhistory,
      index: index + 1,
      toolActionType: TOOL_ACTION_TYPES.NONE
    });
  },
  eraseatapoint: ({ clientx, clienty }) => {
    const { history, elements, index } = get();
    const newElements = elements.filter((el) => {
      return !isPointNearElement(el, clientx, clienty);
    });

    if (newElements.length !== elements.length) {
      const newhistory = [...history.slice(0, index + 1), newElements];
      set({
        elements: newElements,
        history: newhistory,
        index: index + 1,
        toolActionType: TOOL_ACTION_TYPES.ERASING
      });
    }
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
  undo: () => {
    const { history, index } = get()
    set({
      elements: history[index - 1],
      index: index - 1
    })
  },
  redo: () => {
    const { history, index } = get()
    set({
      elements: history[index + 1],
      index: index + 1
    })
  }
}));
