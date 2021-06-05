import React from 'react';
import { observer } from 'mobx-react-lite';
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from 'react-beautiful-dnd';
import { BsPlus, BsTrash } from 'react-icons/bs';

import { useProjectStore, FilterSettingWithId } from '../../ProjectStore';
import { v4 as uuid } from 'uuid';
import { FilterSettingType } from '../../types';

function reorder<T>(list: T[], startIndex: number, endIndex: number) {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
}

const Setting: React.FC<{ setting: FilterSettingWithId }> = observer(
  ({ setting }) => {
    const projectStore = useProjectStore();

    return (
      <div className="setting">
        <button
          onClick={() =>
            (projectStore.settings = projectStore.settings.filter(
              s => s.id !== setting.id
            ))
          }
        >
          <BsTrash /> Delete
        </button>
        <label>
          Uniform name:{' '}
          <input
            type="text"
            value={setting.key}
            onChange={e => (setting.key = e.target.value)}
          />
        </label>
        <label>
          Type:{' '}
          <select>
            <option>Integer</option>
            <option>Float</option>
            <option>Offset (vec2)</option>
            <option>Checkbox (boolean)</option>
            <option>Select</option>
            <option>Color</option>
          </select>
        </label>
        <label>
          Name:{' '}
          <input
            type="text"
            value={setting.name}
            onChange={e => (setting.name = e.target.value)}
          />
        </label>
        <label>
          Description:{' '}
          <input
            type="text"
            value={setting.description}
            onChange={e => (setting.description = e.target.value)}
          />
        </label>
        {/* <label>Default value: <input type="text" value={setting.defaultValue} onChange={e => setting.defaultValue = e.target.value} /></label>
      <label>Minimum value: <input type="text" value={setting.defaultValue} onChange={e => setting.defaultValue = e.target.value} /></label>
      <label>Maximum value: <input type="text" value={setting.defaultValue} onChange={e => setting.defaultValue = e.target.value} /></label>
      <label>Step: <input type="text" value={setting.defaultValue} onChange={e => setting.defaultValue = e.target.value} /></label>
      <label>Toggle color: <input type="text" value={setting.defaultValue} onChange={e => setting.defaultValue = e.target.value} /></label> */}
      </div>
    );
  }
);

export const Settings: React.FC = observer(() => {
  const projectStore = useProjectStore();

  const settings = projectStore.settings;

  const onDragEnd = (result: DropResult) => {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    const settings = reorder(
      projectStore.settings,
      result.source.index,
      result.destination.index
    );

    projectStore.settings = settings;
    projectStore.requestPreviewRender();
  };

  return (
    <div className="editor panel flex">
      <div className="section">
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="droppable">
            {(provided, snapshot) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="settings"
              >
                {projectStore.settings.map((setting, index) => (
                  <Draggable
                    key={setting.id}
                    draggableId={setting.id}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <Setting setting={setting} />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
        <button
          onClick={() => {
            projectStore.settings = [
              ...projectStore.settings,
              {
                id: uuid(),
                defaultValue: 0,
                key: '',
                name: '',
                type: FilterSettingType.FLOAT,
              },
            ];
          }}
        >
          <BsPlus /> Add a new setting
        </button>
      </div>
    </div>
  );
});
