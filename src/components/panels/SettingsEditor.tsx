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
        <div className="setting-option">
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
        </div>
        <div className="setting-option">
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
              setting.alpha = undefined;

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
                  setting.alpha = false;
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
                case FilterSettingType.ANGLE:
                  setting.defaultValue = 0.0;
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
            <option value={FilterSettingType.ANGLE}>Angle</option>
          </select>
        </div>
        <div className="setting-option">
          Name:{' '}
          <input
            type="text"
            value={setting.name}
            onChange={e => (setting.name = e.target.value)}
          />
        </div>
        <div className="setting-option">
          Description:{' '}
          <input
            type="text"
            value={setting.description}
            onChange={e => (setting.description = e.target.value)}
          />
        </div>
        {setting.type !== FilterSettingType.OFFSET &&
          setting.type !== FilterSettingType.ANGLE && (
            <div className="setting-option">
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
            </div>
          )}
        {setting.type === FilterSettingType.INTEGER && (
          <>
            <div className="setting-option">
              Minimum value:{' '}
              <input
                type="number"
                value={setting.minValue}
                onChange={e => (setting.minValue = parseInt(e.target.value))}
              />
            </div>
            <div className="setting-option">
              Maximum value:{' '}
              <input
                type="number"
                value={setting.maxValue}
                onChange={e => (setting.maxValue = parseInt(e.target.value))}
              />
            </div>
            <div className="setting-option">
              Step:{' '}
              <input
                type="number"
                value={setting.step}
                onChange={e => (setting.step = parseInt(e.target.value))}
              />
            </div>
          </>
        )}
        {setting.type === FilterSettingType.FLOAT && (
          <>
            <div className="setting-option">
              Minimum value:{' '}
              <input
                type="number"
                value={setting.minValue}
                onChange={e => (setting.minValue = parseFloat(e.target.value))}
              />
            </div>
            <div className="setting-option">
              Maximum value:{' '}
              <input
                type="number"
                value={setting.maxValue}
                onChange={e => (setting.maxValue = parseFloat(e.target.value))}
              />
            </div>
            <div className="setting-option">
              Step:{' '}
              <input
                type="number"
                value={setting.step}
                onChange={e => (setting.step = parseFloat(e.target.value))}
              />
            </div>
          </>
        )}
        {setting.type === FilterSettingType.OFFSET && (
          <div className="setting-option">
            Toggle color:{' '}
            <ColorPicker
              value={setting.color}
              onChange={result => (setting.color = result)}
            />
          </div>
        )}
        {setting.type === FilterSettingType.COLOR && (
          <div className="setting-option">
            Show alpha in color picker:{' '}
            <input
              type="checkbox"
              checked={setting.alpha}
              onChange={e => (setting.alpha = e.target.checked)}
            />
          </div>
        )}
        {setting.type === FilterSettingType.SELECT && (
          <div className="setting-option">
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
                  <div className="setting-option">
                    Name:{' '}
                    <input
                      type="text"
                      value={value.name}
                      onChange={e => (value.name = e.target.value)}
                    />
                  </div>
                  <div className="setting-option">
                    Value:{' '}
                    <input
                      type="number"
                      step={1}
                      value={value.value}
                      onChange={e => (value.value = parseInt(e.target.value))}
                    />
                  </div>
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
          </div>
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
    projectStore.updateShader();
    projectStore.requestDebouncedPreviewRender();
  };

  return (
    <div className="editor panel flex editor-settings">
      <div className="section">
        <h2>Filter information</h2>
        <label>
          Filter name:{' '}
          <input
            type="text"
            value={projectStore.name}
            onChange={e => (projectStore.name = e.target.value)}
          />
        </label>
        <label>
          Filter description:{' '}
          <input
            type="text"
            value={projectStore.description}
            onChange={e => (projectStore.description = e.target.value)}
          />
        </label>
      </div>
      <div className="section">
        <h2>Settings</h2>
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
