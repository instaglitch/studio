import React from 'react';
import { observer } from 'mobx-react-lite';
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from 'react-beautiful-dnd';
import { BsPlus, BsTrash } from 'react-icons/bs';
import { v4 as uuid } from 'uuid';

import { useProjectStore } from '../../ProjectStore';
import { FilterSetting, FilterSettingType } from '../../types';
import { ColorPicker } from '../common/ColorPicker';

function reorder<T>(list: T[], startIndex: number, endIndex: number) {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
}

const SettingsEditorItem: React.FC<{ setting: FilterSetting }> = observer(
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
            onChange={e => {
              let value = e.target.value;
              value = value.replace(/^\d+/, '');
              value = value.replace(/[^a-zA-Z0-9_]/, '');
              delete projectStore.settingValues[setting.key];
              if (value) {
                projectStore.settingValues[value] = setting.defaultValue;
              }
              setting.key = value;
            }}
          />
        </label>
        <label>
          Type:{' '}
          <select
            onChange={e => {
              delete projectStore.settingValues[setting.name];
              setting.type = e.target.value as FilterSettingType;

              setting.minValue = undefined;
              setting.maxValue = undefined;
              setting.step = undefined;
              setting.color = undefined;
              setting.selectValues = undefined;

              switch (setting.type) {
                case FilterSettingType.INTEGER:
                  setting.minValue = 0;
                  setting.maxValue = 10;
                  setting.step = 1;
                  setting.defaultValue = 1;
                  break;
                case FilterSettingType.FLOAT:
                  setting.minValue = 0;
                  setting.maxValue = 1;
                  setting.step = 0.01;
                  setting.defaultValue = 0.5;
                  break;
                case FilterSettingType.COLOR:
                  setting.defaultValue = '#000000FF';
                  break;
                case FilterSettingType.BOOLEAN:
                  setting.defaultValue = false;
                  break;
                case FilterSettingType.OFFSET:
                  setting.defaultValue = [0, 0];
                  setting.color = '#FFFFFF';
                  break;
                case FilterSettingType.SELECT:
                  setting.defaultValue = undefined;
                  setting.selectValues = [];
                  break;
              }

              projectStore.settingValues[setting.name] = setting.defaultValue;
            }}
            value={setting.type}
          >
            <option value={FilterSettingType.INTEGER}>Integer</option>
            <option value={FilterSettingType.FLOAT}>Float</option>
            <option value={FilterSettingType.OFFSET}>Offset (vec2)</option>
            <option value={FilterSettingType.BOOLEAN}>
              Checkbox (boolean)
            </option>
            <option value={FilterSettingType.SELECT}>Select</option>
            <option value={FilterSettingType.COLOR}>Color</option>
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
        {setting.type !== FilterSettingType.OFFSET && (
          <label>
            Default value:
            {setting.type === FilterSettingType.BOOLEAN && (
              <input
                type="checkbox"
                checked={setting.defaultValue}
                onChange={e => (setting.defaultValue = e.target.checked)}
              />
            )}
            {setting.type === FilterSettingType.FLOAT && (
              <input
                type="number"
                step={setting.step || 0.01}
                value={setting.defaultValue}
                max={setting.maxValue}
                min={setting.minValue}
                onChange={e =>
                  (setting.defaultValue = parseFloat(e.target.value))
                }
              />
            )}
            {setting.type === FilterSettingType.INTEGER && (
              <input
                type="number"
                step={setting.step || 1}
                value={setting.defaultValue}
                max={setting.maxValue}
                min={setting.minValue}
                onChange={e =>
                  (setting.defaultValue = parseInt(e.target.value))
                }
              />
            )}
            {setting.type === FilterSettingType.COLOR && (
              <ColorPicker
                value={setting.defaultValue}
                onChange={result => (setting.defaultValue = result)}
              />
            )}
            {setting.type === FilterSettingType.SELECT &&
              setting.selectValues?.length === 0 && (
                <span>Add some options first.</span>
              )}
            {setting.type === FilterSettingType.SELECT &&
              !!setting.selectValues &&
              setting.selectValues.length > 0 && (
                <select
                  onChange={e => {
                    setting.defaultValue = parseInt(e.target.value);
                  }}
                  value={setting.defaultValue}
                >
                  {setting.selectValues.map(value => (
                    <option key={value.id} value={value.value}>
                      {value.name}
                    </option>
                  ))}
                </select>
              )}
          </label>
        )}
        {setting.type === FilterSettingType.INTEGER && (
          <>
            <label>
              Minimum value:{' '}
              <input
                type="number"
                value={setting.minValue}
                onChange={e => (setting.minValue = parseInt(e.target.value))}
              />
            </label>
            <label>
              Maximum value:{' '}
              <input
                type="number"
                value={setting.maxValue}
                onChange={e => (setting.maxValue = parseInt(e.target.value))}
              />
            </label>
            <label>
              Step:{' '}
              <input
                type="number"
                value={setting.step}
                onChange={e => (setting.step = parseInt(e.target.value))}
              />
            </label>
          </>
        )}
        {setting.type === FilterSettingType.FLOAT && (
          <>
            <label>
              Minimum value:{' '}
              <input
                type="number"
                value={setting.minValue}
                onChange={e => (setting.minValue = parseFloat(e.target.value))}
              />
            </label>
            <label>
              Maximum value:{' '}
              <input
                type="number"
                value={setting.maxValue}
                onChange={e => (setting.maxValue = parseFloat(e.target.value))}
              />
            </label>
            <label>
              Step:{' '}
              <input
                type="number"
                value={setting.step}
                onChange={e => (setting.step = parseFloat(e.target.value))}
              />
            </label>
          </>
        )}
        {setting.type === FilterSettingType.OFFSET && (
          <label>
            Toggle color:{' '}
            <ColorPicker
              value={setting.color}
              onChange={result => (setting.color = result)}
            />
          </label>
        )}
        {setting.type === FilterSettingType.SELECT && (
          <label>
            Options:
            <div>
              {setting.selectValues?.map(value => (
                <div className="select-value" key={value.id}>
                  <button
                    onClick={() =>
                      (setting.selectValues = setting.selectValues?.filter(
                        v => v.id !== value.id
                      ))
                    }
                  >
                    <BsTrash /> Delete
                  </button>
                  <label>
                    Name:{' '}
                    <input
                      type="text"
                      value={value.name}
                      onChange={e => (value.name = e.target.value)}
                    />
                  </label>
                  <label>
                    Value:{' '}
                    <input
                      type="number"
                      step={1}
                      value={value.value}
                      onChange={e => (value.value = parseInt(e.target.value))}
                    />
                  </label>
                </div>
              ))}
              <button
                onClick={() => {
                  setting.selectValues = [
                    ...setting.selectValues!,
                    {
                      id: uuid(),
                      name: '',
                      value: 0,
                    },
                  ];
                }}
              >
                <BsPlus /> Add a new option
              </button>
            </div>
          </label>
        )}
      </div>
    );
  }
);

export const SettingsEditorList: React.FC = observer(() => {
  const projectStore = useProjectStore();

  return (
    <>
      {projectStore.settings.map((setting, index) => (
        <Draggable key={setting.id} draggableId={setting.id} index={index}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
            >
              <SettingsEditorItem setting={setting} />
            </div>
          )}
        </Draggable>
      ))}
    </>
  );
});

export const SettingsEditor: React.FC = observer(() => {
  const projectStore = useProjectStore();

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
                <SettingsEditorList />
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
                defaultValue: 0.5,
                key: '',
                name: '',
                type: FilterSettingType.FLOAT,
                step: 0.01,
                minValue: 0,
                maxValue: 1,
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
