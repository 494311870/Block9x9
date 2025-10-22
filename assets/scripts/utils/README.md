# Scene Utilities

This directory contains utilities for programmatically modifying Cocos Creator scene files.

## SceneUtils Module

The `SceneUtils.ts` module provides a comprehensive set of tools for working with Cocos Creator scene files programmatically, which is particularly useful for AI-assisted scene modification.

### Key Features

1. **JSON Formatting**: Convert between compact and human-friendly JSON formats
2. **Scene Builder**: Programmatically create scene node structures
3. **Scene Manipulation**: Add/modify nodes and components in existing scenes
4. **Type Safety**: TypeScript interfaces for all scene objects

### Usage Examples

#### 1. Format Scene JSON

```typescript
import { formatSceneJson, compactSceneJson } from './SceneUtils';

// Format compact JSON to human-friendly format
const compactJson = '{"name":"test","value":123}';
const formatted = formatSceneJson(compactJson);
// Result: 
// {
//   "name": "test",
//   "value": 123
// }

// Compact formatted JSON
const compact = compactSceneJson(formatted);
// Result: {"name":"test","value":123}
```

#### 2. Build Scene Structures

```typescript
import { SceneBuilder, NodeConfig } from './SceneUtils';

const builder = new SceneBuilder();

// Create a simple node
const nodeId = builder.createNode({
  name: 'GameRoot',
  position: SceneBuilder.createVec3(0, 0, 0),
});

// Create a node with children
const canvasConfig: NodeConfig = {
  name: 'Canvas',
  children: [
    {
      name: 'BoardContainer',
      position: SceneBuilder.createVec3(0, 100, 0),
    },
    {
      name: 'CandidatePanel',
      position: SceneBuilder.createVec3(0, -250, 0),
    },
  ],
  components: [
    { type: 'cc.Canvas' },
    { type: 'cc.UITransform' },
  ],
};

builder.createNode(canvasConfig);
const sceneObjects = builder.getObjects();
```

#### 3. Manipulate Existing Scenes

```typescript
import {
  loadSceneFile,
  findNodeByName,
  addChildToNode,
  saveSceneFile,
} from './SceneUtils';

// Load an existing scene
const sceneData = loadSceneFile('assets/scenes/main.scene');

// Find a node by name
const canvasNode = findNodeByName(sceneData, 'Canvas');
if (canvasNode) {
  console.log(`Found Canvas at index ${canvasNode.id}`);
}

// Add a child to a node
const parentId = 2; // Canvas node ID
const childId = 10; // Some child node ID
addChildToNode(sceneData, parentId, childId);

// Save the modified scene (will be formatted automatically)
saveSceneFile('assets/scenes/main.scene', JSON.stringify(sceneData));
```

#### 4. Work with Components

```typescript
import { SceneBuilder, addComponentToNode } from './SceneUtils';

const builder = new SceneBuilder();

// Create a component with properties
const spriteCompId = builder.createComponent({
  type: 'cc.Sprite',
  properties: {
    _spriteFrame: null,
    _color: SceneBuilder.createColor(255, 128, 64, 255),
  },
});

// Add component to an existing node
const sceneData = loadSceneFile('assets/scenes/main.scene');
addComponentToNode(sceneData, nodeId, spriteCompId);
```

### API Reference

#### SceneBuilder Class

- `static createVec3(x, y, z)`: Create a Vec3 position/scale vector
- `static createQuat(x, y, z, w)`: Create a Quat rotation quaternion
- `static createColor(r, g, b, a)`: Create a Color object
- `static createRef(id)`: Create an object reference
- `createNode(config)`: Create a node with the given configuration
- `createComponent(config)`: Create a component
- `getObjects()`: Get all objects in the scene

#### Formatting Functions

- `formatSceneJson(jsonString)`: Format compact JSON to human-friendly format
- `formatSceneFile(filePath)`: Format scene file and return formatted string
- `compactSceneJson(jsonString)`: Compact formatted JSON (remove whitespace)
- `saveSceneFile(filePath, jsonString)`: Save formatted scene JSON to file
- `loadSceneFile(filePath)`: Load and parse scene data from file

#### Scene Manipulation Functions

- `findNodeByName(sceneData, nodeName)`: Find a node by its name
- `getObjectByRef(sceneData, ref)`: Get object by reference ID
- `addChildToNode(sceneData, parentId, childId)`: Add a child to a parent node
- `addComponentToNode(sceneData, nodeId, componentId)`: Add a component to a node

### Types

```typescript
interface NodeConfig {
  name: string;
  position?: Vec3;
  rotation?: Quat;
  scale?: Vec3;
  active?: boolean;
  layer?: number;
  children?: NodeConfig[];
  components?: ComponentConfig[];
}

interface ComponentConfig {
  type: string;
  properties?: Record<string, any>;
}

interface Vec3 {
  __type__: 'cc.Vec3';
  x: number;
  y: number;
  z: number;
}

interface Quat {
  __type__: 'cc.Quat';
  x: number;
  y: number;
  z: number;
  w: number;
}

interface Color {
  __type__: 'cc.Color';
  r: number;
  g: number;
  b: number;
  a: number;
}
```

### Workflow for AI-Assisted Scene Modification

The recommended workflow for AI to modify scenes:

1. **Load Scene**: Use `loadSceneFile()` to load the existing scene
2. **Generate Changes**: Create compact JSON for the changes (easier for AI)
3. **Apply Changes**: Use manipulation functions to apply changes
4. **Format & Save**: Use `saveSceneFile()` to save with human-friendly formatting

Example:
```typescript
// 1. Load scene
const scene = loadSceneFile('assets/scenes/main.scene');

// 2. AI generates compact node structure
const newNodeJson = '{"name":"NewUI","children":[{"name":"Button"}]}';
const config = JSON.parse(newNodeJson);

// 3. Build and apply changes
const builder = new SceneBuilder();
const newNodeId = builder.createNode(config);

// 4. Add to scene and save
const canvasNode = findNodeByName(scene, 'Canvas');
if (canvasNode) {
  addChildToNode(scene, canvasNode.id, newNodeId);
}
saveSceneFile('assets/scenes/main.scene', JSON.stringify(scene));
```

### Notes

- Scene files use a reference system where objects reference each other by `__id__`
- IDs are indices in the object array
- All Cocos Creator objects have a `__type__` field (e.g., `cc.Node`, `cc.Component`)
- UUIDs are generated for nodes but are for editor purposes
- Always use `saveSceneFile()` to ensure proper JSON formatting

### Common Scene Object Types

- `cc.SceneAsset`: Root scene asset
- `cc.Scene`: Scene container
- `cc.Node`: Scene node (game object)
- `cc.Canvas`: Canvas component (for UI)
- `cc.UITransform`: UI transform component
- `cc.Widget`: UI widget for anchoring
- `cc.Camera`: Camera component
- `cc.Sprite`: Sprite renderer
- `cc.Label`: Text label
- `cc.Button`: Button component
- `cc.SceneGlobals`: Scene global settings

### See Also

- [Cocos Creator Documentation](https://docs.cocos.com/creator/3.8/manual/en/)
- [UI Setup Guide](../../../docs/ui-setup-guide.md)
- [Scene Format Reference](https://docs.cocos.com/creator/3.8/manual/en/asset/scene.html)
