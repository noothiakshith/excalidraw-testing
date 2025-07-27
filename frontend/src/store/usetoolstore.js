import { create } from "zustand";
import { TOOL_ITEMS } from "../../constants";

const colors = {
    black: "#000000"
};

const initialtoolstate = {
    [TOOL_ITEMS.BRUSH]: {
        stroke: colors.black
    },
    [TOOL_ITEMS.LINE]: {
        stroke: colors.black,
        size: 1
    },
    [TOOL_ITEMS.RECTANGLE]: {
        stroke: colors.black,
        fill: null,
        size: 1
    },
    [TOOL_ITEMS.CIRCLE]: {
        stroke: colors.black,
        fill: null,
        size: 1
    },
    [TOOL_ITEMS.ARROW]: {
        stroke: colors.black,
        size: 1
    },
    [TOOL_ITEMS.TEXT]: {
        stroke: colors.black,
        size: 32
    }
}
export const usetoolstore = create((set, get) => ({
    toolboxstate: initialtoolstate,

    changestroke: (tool, stroke) => {
        const { toolboxstate } = get();
        const updatedtoolbox = { ...toolboxstate };
        updatedtoolbox[tool] = {
            ...updatedtoolbox[tool],
            stroke: stroke
        }
        set({
            toolboxstate: updatedtoolbox
        })
    },
    changefill:(tool,fill)=>{
        const {toolboxstate} = get()
        const updated = [...toolboxstate]
        updated[tool]={
            ...updated[tool],
            fill: fill
        },
        set({
            toolboxstate:updated
        })
    },
    changesize:(tool, size)=>{
        const {toolboxstate} = get()
        const updated = [...toolboxstate]
        updated[tool]={
            ...updated[tool],
            size: size
        },
        set({
            toolboxstate:updated
        })
    }
}))