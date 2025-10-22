# AI Scene Modification Guide

This guide explains how AI assistants can programmatically modify Cocos Creator scene files using the SceneUtils module.

## Overview

Cocos Creator scenes are stored as JSON files with a specific structure. Direct editing of these files can be error-prone, so we provide the `SceneUtils` module to help AI assistants make safe, structured modifications.

## Problem Statement

**Challenge**: Cocos Creator scene files are complex JSON structures with:
- Object references using `__id__` indices
- Nested hierarchies of nodes and components
- Specific type annotations (e.g., `cc.Node`, `cc.Vec3`)
- Editor metadata and UUIDs

**Solution**: Use the `SceneUtils` module which provides:
1. JSON formatting utilities (compact → human-friendly)
2. Type-safe builders for creating nodes and components
3. Helper functions for scene manipulation
4. Validation and error handling

## Workflow for AI Scene Modification

### Step 1: Generate Compact JSON

When you need to create new scene content, first generate **compact JSON** (single line, no formatting):

```json
{"name":"GameRoot","children":[{"name":"BoardView","components":[{"type":"BoardView"}]},{"name":"CandidatePanel","position":{"__type__":"cc.Vec3","x":0,"y":-250,"z":0}}]}
```

**Why compact first?**
- Easier for AI to generate (no formatting concerns)
- Reduces token usage
- Can be validated and formatted later

### Step 2: Use SceneBuilder to Create Nodes

Convert your compact JSON into scene nodes using `SceneBuilder`:

```typescript
import { SceneBuilder, NodeConfig } from '../assets/scripts/utils/SceneUtils';

// Parse your compact JSON
const config: NodeConfig = JSON.parse(compactJson);

// Create nodes
const builder = new SceneBuilder();
const nodeId = builder.createNode(config);

// Get the resulting objects
const objects = builder.getObjects();
```

### Step 3: Format for Human Readability

After building, format the output for human review:

```typescript
import { formatSceneJson } from '../assets/scripts/utils/SceneUtils';

const formatted = formatSceneJson(JSON.stringify(objects));
console.log(formatted); // Pretty-printed for humans
```

### Step 4: Integrate into Existing Scene

If modifying an existing scene, use manipulation functions:

```typescript
import {
  loadSceneFile,
  findNodeByName,
  addChildToNode,
  saveSceneFile,
} from '../assets/scripts/utils/SceneUtils';

// Load existing scene
const sceneData = loadSceneFile('assets/scenes/main.scene');

// Find parent node
const canvas = findNodeByName(sceneData, 'Canvas');

// Add new node as child
if (canvas) {
  addChildToNode(sceneData, canvas.id, newNodeId);
}

// Save with formatting
saveSceneFile('assets/scenes/main.scene', JSON.stringify(sceneData));
```

## Common Scenarios

### Scenario 1: Create a Simple UI Element

**Task**: Add a "Score Label" to the UI

**AI Action**:
```typescript
// 1. Generate compact JSON
const json = '{"name":"ScoreLabel","components":[{"type":"cc.Label","properties":{"_string":"Score: 0"}}]}';

// 2. Build node
const builder = new SceneBuilder();
const config = JSON.parse(json);
builder.createNode(config);

// 3. Output formatted
console.log(formatSceneJson(JSON.stringify(builder.getObjects())));
```

### Scenario 2: Create Complex Node Hierarchy

**Task**: Build the UI structure from `docs/ui-setup-guide.md`

**AI Action**:
```typescript
// Generate compact hierarchy (shown formatted for readability here, but generate as single line)
const hierarchy = {
  "name": "Canvas",
  "components": [{"type": "cc.Canvas"}, {"type": "cc.UITransform"}],
  "children": [
    {
      "name": "BoardContainer",
      "position": {"__type__": "cc.Vec3", "x": 0, "y": 100, "z": 0},
      "children": [
        {
          "name": "BoardView",
          "components": [{"type": "BoardView"}]
        }
      ]
    },
    {
      "name": "CandidatePanel",
      "position": {"__type__": "cc.Vec3", "x": 0, "y": -250, "z": 0},
      "children": [
        {"name": "Candidate0", "components": [{"type": "CandidateView"}]},
        {"name": "Candidate1", "components": [{"type": "CandidateView"}]},
        {"name": "Candidate2", "components": [{"type": "CandidateView"}]}
      ]
    }
  ]
};

// Build and format
const builder = new SceneBuilder();
builder.createNode(hierarchy);
const formatted = formatSceneJson(JSON.stringify(builder.getObjects()));
```

### Scenario 3: Modify Existing Scene

**Task**: Add a new button to an existing ButtonPanel

**AI Action**:
```typescript
// 1. Load scene
const scene = loadSceneFile('assets/scenes/main.scene');

// 2. Find ButtonPanel
const buttonPanel = findNodeByName(scene, 'ButtonPanel');

// 3. Create new button
const builder = new SceneBuilder();
const buttonId = builder.createNode({
  name: 'PauseButton',
  components: [{ type: 'cc.Button' }]
});

// 4. Add to scene
if (buttonPanel) {
  // Merge builder objects into scene
  const newButtonId = scene.length;
  scene.push(...builder.getObjects());
  addChildToNode(scene, buttonPanel.id, newButtonId);
}

// 5. Save
saveSceneFile('assets/scenes/main.scene', JSON.stringify(scene));
```

## Best Practices for AI

### ✅ DO

1. **Generate compact JSON first**: Single line, minimal whitespace
2. **Use SceneBuilder**: Let it handle IDs and references
3. **Validate structure**: Ensure all required fields are present
4. **Format before saving**: Use `saveSceneFile()` for human-readable output
5. **Use type annotations**: Always include `__type__` for Vec3, Quat, Color
6. **Test incrementally**: Create small structures, verify, then combine

### ❌ DON'T

1. **Don't manually assign `__id__`**: Let SceneBuilder handle this
2. **Don't forget `__type__` fields**: All Cocos objects need types
3. **Don't edit raw JSON**: Use the provided functions
4. **Don't break references**: Ensure parent-child relationships are valid
5. **Don't skip formatting**: Always format before committing changes

## JSON Structure Reference

### Node Structure
```json
{
  "__type__": "cc.Node",
  "_name": "NodeName",
  "_objFlags": 0,
  "__editorExtras__": {},
  "_parent": null,
  "_children": [],
  "_active": true,
  "_components": [],
  "_prefab": null,
  "_lpos": {"__type__": "cc.Vec3", "x": 0, "y": 0, "z": 0},
  "_lrot": {"__type__": "cc.Quat", "x": 0, "y": 0, "z": 0, "w": 1},
  "_lscale": {"__type__": "cc.Vec3", "x": 1, "y": 1, "z": 1},
  "_mobility": 0,
  "_layer": 33554432,
  "_euler": {"__type__": "cc.Vec3", "x": 0, "y": 0, "z": 0},
  "_id": "uuid-here"
}
```

### Component Structure
```json
{
  "__type__": "cc.ComponentType",
  "_name": "",
  "_objFlags": 0,
  "__editorExtras__": {},
  "node": null,
  "_enabled": true
}
```

### Common Types

- **Position/Scale**: `{"__type__": "cc.Vec3", "x": 0, "y": 0, "z": 0}`
- **Rotation**: `{"__type__": "cc.Quat", "x": 0, "y": 0, "z": 0, "w": 1}`
- **Color**: `{"__type__": "cc.Color", "r": 255, "g": 255, "b": 255, "a": 255}`
- **Reference**: `{"__id__": 5}`

## Quick Reference

### Essential Imports
```typescript
import {
  SceneBuilder,
  formatSceneJson,
  compactSceneJson,
  loadSceneFile,
  saveSceneFile,
  findNodeByName,
  addChildToNode,
  addComponentToNode,
  NodeConfig,
} from '../assets/scripts/utils/SceneUtils';
```

### Create Node
```typescript
const builder = new SceneBuilder();
const nodeId = builder.createNode({
  name: 'MyNode',
  position: SceneBuilder.createVec3(0, 0, 0),
  children: [],
  components: [],
});
```

### Format JSON
```typescript
const formatted = formatSceneJson(compactJson);
const compact = compactSceneJson(formattedJson);
```

### Load/Save Scene
```typescript
const scene = loadSceneFile('path/to/scene.scene');
saveSceneFile('path/to/scene.scene', JSON.stringify(scene));
```

### Find & Modify
```typescript
const node = findNodeByName(scene, 'NodeName');
addChildToNode(scene, parentId, childId);
addComponentToNode(scene, nodeId, componentId);
```

## Error Handling

Always wrap scene operations in try-catch:

```typescript
try {
  const scene = loadSceneFile('assets/scenes/main.scene');
  // ... modifications ...
  saveSceneFile('assets/scenes/main.scene', JSON.stringify(scene));
} catch (error) {
  console.error('Scene modification failed:', error);
  // Handle error appropriately
}
```

## Testing Your Changes

After modifying a scene:

1. **Validate JSON**: Ensure it's valid JSON
2. **Check in Editor**: Open Cocos Creator and verify the scene loads
3. **Test Functionality**: Run the game and test the changes
4. **Review Formatting**: Ensure scene file is human-readable

## Example: Complete Scene Creation

Here's a complete example following the recommended workflow:

```typescript
import {
  SceneBuilder,
  formatSceneJson,
  saveSceneFile,
  NodeConfig,
} from '../assets/scripts/utils/SceneUtils';

// 1. Define structure (can be generated as compact JSON)
const mainGameConfig: NodeConfig = {
  name: 'Canvas',
  components: [
    { type: 'cc.Canvas' },
    { type: 'cc.UITransform' },
  ],
  children: [
    {
      name: 'GameRoot',
      children: [
        {
          name: 'GameController',
          components: [{ type: 'GameController' }],
        },
      ],
    },
    {
      name: 'BoardContainer',
      position: { __type__: 'cc.Vec3', x: 0, y: 100, z: 0 },
      children: [
        {
          name: 'BoardView',
          components: [{ type: 'BoardView' }],
        },
      ],
    },
  ],
};

// 2. Build scene
const builder = new SceneBuilder();
builder.createNode(mainGameConfig);

// 3. Format and save
const sceneJson = JSON.stringify(builder.getObjects());
const formatted = formatSceneJson(sceneJson);
console.log('Created scene structure:\n', formatted);

// 4. Save to file (in real use, not in example)
// saveSceneFile('assets/scenes/MainGame.scene', sceneJson);
```

## Summary

As an AI assistant:
1. Generate compact JSON for scene structures
2. Use `SceneBuilder` to create type-safe nodes
3. Use helper functions for scene manipulation
4. Always format output for human review
5. Test and validate changes

This approach ensures reliable, maintainable scene modifications while being AI-friendly.
