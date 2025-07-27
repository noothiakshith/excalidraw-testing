import { useEffect, useLayoutEffect, useRef, useState } from "react";
import rough from "roughjs";
import { TOOL_ACTION_TYPES, TOOL_ITEMS } from "../../../constants";
import socket from "../../utils/socket";
import axios from "axios";
import { getSvgPathFromStroke } from "../../utils/element";
import getStroke from "perfect-freehand";
import { useBoardStore } from "../../store/useboardstore";
import { usetoolstore } from "../../store/usetoolstore";

function Board({ id }) {
    const canvasRef = useRef();
    const textAreaRef = useRef();
    const isDrawingRef = useRef(false);
    const lastEmitTime = useRef(0);

    const {
        elements,
        toolActionType,
        boardHandleDown,
        boardHandleMove,
        boardhandleup,
        setCanvasId,
        setElements,
        setHistory,
        changeText,
        undo,
        redo
    } = useBoardStore();

    const { toolboxstate } = usetoolstore();

    const [isAuthorized, setIsAuthorized] = useState(true);
    const [isConnected, setIsConnected] = useState(false);

    const token = localStorage.getItem("whiteboard_user_token");

    useEffect(() => {
        // Monitor connection status
        socket.on("connect", () => {
            console.log('Socket connected');
            setIsConnected(true);
        });

        socket.on("disconnect", () => {
            console.log('Socket disconnected');
            setIsConnected(false);
        });

        if (id) {
            console.log('Joining canvas:', id);
            socket.emit("joincanvas", { canvasid: id });

            socket.on("receiveupdate", (updatedElements) => {
                console.log('Received update:', updatedElements);
                setElements(updatedElements);
            });

            socket.on("canvasdata", (initialElements) => {
                console.log('Received canvas data:', initialElements);
                setElements(initialElements);
            });

            socket.on("error", (error) => {
                console.error('Socket error:', error);
                alert(`Error: ${error}`);
            });

            return () => {
                socket.off("receiveupdate");
                socket.off("canvasdata");
                socket.off("error");
            };
        }

        return () => {
            socket.off("connect");
            socket.off("disconnect");
        };
    }, [id]);

    useEffect(() => {
        const fetchCanvasData = async () => {
            if (id && token) {
                try {
                    const response = await axios.get(
                        `/api/canvas/${id}`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        }
                    );
                    setCanvasId(id);
                    setElements(response.data.canvas.elements);
                    setHistory(response.data.canvas.elements);
                } catch (error) {
                    console.error("Error loading canvas:", error);
                }
            }
        };

        fetchCanvasData();
    }, [id, token]);


    useEffect(() => {
        const canvas = canvasRef.current;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }, []);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.ctrlKey && e.key === "z") undo();
            else if (e.ctrlKey && e.key === "y") redo();
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [undo, redo]);

    useLayoutEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        context.save();
        const roughCanvas = rough.canvas(canvas);

        elements.forEach((element) => {
            switch (element.type) {
                case TOOL_ITEMS.LINE:
                case TOOL_ITEMS.RECTANGLE:
                case TOOL_ITEMS.CIRCLE:
                case TOOL_ITEMS.ARROW:
                    roughCanvas.draw(element.roughele);
                    break;
                case TOOL_ITEMS.BRUSH:
                    context.fillStyle = element.stroke;
                    const path = new Path2D(getSvgPathFromStroke(getStroke(element.points)));
                    context.fill(path);
                    context.restore();
                    break;
                case TOOL_ITEMS.TEXT:
                    context.textBaseline = "top";
                    context.font = `${element.size}px Caveat`;
                    context.fillStyle = element.stroke;
                    context.fillText(element.text, element.x1, element.y1);
                    context.restore();
                    break;
            }
        });

        return () => {
            context.clearRect(0, 0, canvas.width, canvas.height);
        };
    }, [elements]);

    useEffect(() => {
        if (toolActionType === TOOL_ACTION_TYPES.WRITING) {
            setTimeout(() => textAreaRef.current?.focus(), 0);
        }
    }, [toolActionType]);

    const handleMouseDown = (e) => {
        if (!isAuthorized) return;
        isDrawingRef.current = true;
        console.log('Mouse down - drawing started');

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const activeTool = useBoardStore.getState().activeToolItem;
        const toolProps = toolboxstate[activeTool];
        boardHandleDown(x, y, toolProps?.fill, toolProps?.stroke, toolProps?.size);
    };

    const handleMouseMove = (e) => {
        if (!isAuthorized || !isDrawingRef.current) return;

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        boardHandleMove({ clientX: x, clientY: y });


        const now = Date.now();
        if (toolActionType === TOOL_ACTION_TYPES.DRAWING && now - lastEmitTime.current > 50) {
            const currentElements = useBoardStore.getState().elements;
            socket.emit("drawingupdate", { canvasid: id, elements: currentElements });
            lastEmitTime.current = now;
        }
    };

    const handleMouseUp = () => {
        if (!isAuthorized) return;
        isDrawingRef.current = false;
        console.log('Mouse up - drawing stopped');

        if (toolActionType !== TOOL_ACTION_TYPES.NONE) {
            boardhandleup();

            // Get the latest elements from the store after the update
            const currentElements = useBoardStore.getState().elements;
            console.log('Emitting drawing update:', { canvasid: id, elements: currentElements });
            socket.emit("drawingupdate", { canvasid: id, elements: currentElements });
        }
    };

    return (
        <>
            {/* Connection Status Indicator */}
            <div className={`fixed top-4 right-4 z-50 px-3 py-1 rounded-full text-sm font-medium ${isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
            </div>

            {toolActionType === TOOL_ACTION_TYPES.WRITING && (
                <textarea
                    ref={textAreaRef}
                    className="absolute z-10 bg-transparent resize-none outline-none overflow-hidden whitespace-pre-wrap"
                    style={{
                        top: elements[elements.length - 1]?.y1,
                        left: elements[elements.length - 1]?.x1,
                        fontSize: `${elements[elements.length - 1]?.size}px`,
                        color: elements[elements.length - 1]?.stroke,
                        fontFamily: "Caveat, cursive"
                    }}
                    onBlur={(e) => changeText(e.target.value)}
                />
            )}
            <canvas
                ref={canvasRef}
                id="canvas"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                className="fixed top-0 left-0 w-full h-full z-0 bg-white"
            />
        </>
    );
}

export default Board;
