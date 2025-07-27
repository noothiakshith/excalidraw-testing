import React from 'react';
import {
  COLORS,
  FILL_TOOL_TYPES,
  SIZE_TOOL_TYPES,
  STROKE_TOOL_TYPES,
  TOOL_ITEMS,
} from '../../../constants';
import { useBoardStore } from '../../store/useboardstore';
import { usetoolstore } from '../../store/usetoolstore';

function ToolBox() {
  const { activeToolItem } = useBoardStore();
  const { toolboxstate, changestroke, changefill, changesize } = usetoolstore();

  const strokeColor = toolboxstate[activeToolItem]?.stroke;
  const fillColor = toolboxstate[activeToolItem]?.fill;
  const size = toolboxstate[activeToolItem]?.size;

  return (
    <div style={{ padding: 8 }}>
      {STROKE_TOOL_TYPES.includes(activeToolItem) && (
        <div>
          <div>Stroke Colors:</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            {Object.keys(COLORS).map((key) => (
              <div
                key={key}
                onClick={() => changestroke(activeToolItem, COLORS[key])}
                style={{
                  width: 24,
                  height: 24,
                  backgroundColor: COLORS[key],
                  border: strokeColor === COLORS[key] ? '3px solid black' : '1px solid #ccc',
                  cursor: 'pointer',
                }}
                title={key}
              />
            ))}
          </div>
        </div>
      )}

      {FILL_TOOL_TYPES.includes(activeToolItem) && (
        <div style={{ marginTop: 16 }}>
          <div>Fill Colors:</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 4, alignItems: 'center' }}>
            <div
              onClick={() => changefill(activeToolItem, null)}
              style={{
                width: 24,
                height: 24,
                border: fillColor === null ? '3px solid black' : '1px solid #ccc',
                background:
                  'repeating-conic-gradient(#999 0% 25%, transparent 0% 50%) 50% / 10px 10px',
                cursor: 'pointer',
              }}
              title="No Fill"
            />
            {Object.keys(COLORS).map((key) => (
              <div
                key={key}
                onClick={() => changefill(activeToolItem, COLORS[key])}
                style={{
                  width: 24,
                  height: 24,
                  backgroundColor: COLORS[key],
                  border: fillColor === COLORS[key] ? '3px solid black' : '1px solid #ccc',
                  cursor: 'pointer',
                }}
                title={key}
              />
            ))}
          </div>
        </div>
      )}


      {SIZE_TOOL_TYPES.includes(activeToolItem) && (
        <div style={{ marginTop: 16 }}>
          <div>{activeToolItem === TOOL_ITEMS.TEXT ? 'Font Size:' : 'Brush Size:'}</div>
          <input
            type="range"
            min={activeToolItem === TOOL_ITEMS.TEXT ? 12 : 1}
            max={activeToolItem === TOOL_ITEMS.TEXT ? 64 : 10}
            step={1}
            value={size}
            onChange={(e) => changesize(activeToolItem, Number(e.target.value))}
            style={{ width: '100%', marginTop: 8 }}
          />
        </div>
      )}
    </div>
  );
}

export default ToolBox;
