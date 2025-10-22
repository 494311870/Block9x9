/**
 * Example: Using SceneUtils to modify Cocos Creator scenes programmatically
 * 
 * This example demonstrates:
 * 1. Loading and formatting scene files
 * 2. Creating scene nodes programmatically
 * 3. Building complex node hierarchies
 * 4. Manipulating existing scenes
 */

import {
  SceneBuilder,
  formatSceneJson,
  compactSceneJson,
  loadSceneFile,
  findNodeByName,
  NodeConfig,
  SceneObjectType,
} from '../assets/scripts/utils/SceneUtils';

console.log('=== Scene Utils Usage Examples ===\n');

// Example 1: JSON Formatting
console.log('Example 1: JSON Formatting');
console.log('--------------------------------');
const compactJson = '{"name":"test","value":123,"nested":{"a":1,"b":2}}';
console.log('Compact JSON:', compactJson);
const formatted = formatSceneJson(compactJson);
console.log('Formatted JSON:\n', formatted);
const recompacted = compactSceneJson(formatted);
console.log('Recompacted:', recompacted);
console.log();

// Example 2: Creating Simple Nodes
console.log('Example 2: Creating Simple Nodes');
console.log('--------------------------------');
const builder1 = new SceneBuilder();
const simpleNodeId = builder1.createNode({
  name: 'SimpleNode',
  position: SceneBuilder.createVec3(100, 200, 0),
});
console.log(`Created node with ID: ${simpleNodeId}`);
console.log('Node structure:', JSON.stringify(builder1.getObjects()[simpleNodeId], null, 2));
console.log();

// Example 3: Creating Node with Components
console.log('Example 3: Creating Node with Components');
console.log('--------------------------------');
const builder2 = new SceneBuilder();
const nodeWithComponents: NodeConfig = {
  name: 'SpriteNode',
  components: [
    {
      type: 'cc.UITransform',
      properties: {
        _contentSize: { __type__: 'cc.Size', width: 100, height: 100 },
      },
    },
    {
      type: 'cc.Sprite',
      properties: {
        _color: SceneBuilder.createColor(255, 128, 64, 255),
      },
    },
  ],
};
builder2.createNode(nodeWithComponents);
console.log(`Created ${builder2.getObjects().length} objects (1 node + components)`);
console.log();

// Example 4: Creating Node Hierarchy (like UI structure from ui-setup-guide.md)
console.log('Example 4: Creating Complex UI Hierarchy');
console.log('--------------------------------');
const builder3 = new SceneBuilder();

// Create a Canvas with UI structure similar to the guide
const canvasConfig: NodeConfig = {
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
          components: [
            { type: 'GameController' },
          ],
        },
      ],
    },
    {
      name: 'BoardContainer',
      position: SceneBuilder.createVec3(0, 100, 0),
      children: [
        {
          name: 'BoardView',
          components: [
            { type: 'BoardView' },
          ],
          children: [
            {
              name: 'CellContainer',
            },
          ],
        },
      ],
    },
    {
      name: 'CandidatePanel',
      position: SceneBuilder.createVec3(0, -250, 0),
      children: [
        {
          name: 'Candidate0',
          components: [{ type: 'CandidateView' }],
          children: [{ name: 'CellContainer' }],
        },
        {
          name: 'Candidate1',
          components: [{ type: 'CandidateView' }],
          children: [{ name: 'CellContainer' }],
        },
        {
          name: 'Candidate2',
          components: [{ type: 'CandidateView' }],
          children: [{ name: 'CellContainer' }],
        },
      ],
    },
    {
      name: 'UI',
      children: [
        {
          name: 'ScoreHUD',
          components: [{ type: 'ScoreHUD' }],
          children: [
            {
              name: 'ScoreLabel',
              components: [{ type: 'cc.Label' }],
            },
            {
              name: 'MoveLabel',
              components: [{ type: 'cc.Label' }],
            },
          ],
        },
        {
          name: 'ButtonPanel',
          children: [
            {
              name: 'StartButton',
              components: [{ type: 'cc.Button' }],
            },
            {
              name: 'RestartButton',
              components: [{ type: 'cc.Button' }],
            },
          ],
        },
      ],
    },
    {
      name: 'GameOverDialog',
      components: [{ type: 'GameOverDialog' }],
      children: [
        {
          name: 'Background',
          components: [{ type: 'cc.Sprite' }],
        },
        {
          name: 'Title',
          components: [{ type: 'cc.Label' }],
        },
        {
          name: 'FinalScoreLabel',
          components: [{ type: 'cc.Label' }],
        },
        {
          name: 'FinalMovesLabel',
          components: [{ type: 'cc.Label' }],
        },
        {
          name: 'CloseButton',
          components: [{ type: 'cc.Button' }],
        },
      ],
    },
  ],
};

builder3.createNode(canvasConfig);
const objects = builder3.getObjects();
console.log(`Created ${objects.length} total objects`);
console.log('Node names:');
objects.forEach((obj, idx) => {
  if (obj.__type__ === SceneObjectType.Node) {
    console.log(`  [${idx}] ${obj._name}`);
  }
});
console.log();

// Example 5: Working with Existing Scene File
console.log('Example 5: Loading and Analyzing Existing Scene');
console.log('--------------------------------');
try {
  const scenePath = 'assets/scenes/main.scene';
  const sceneData = loadSceneFile(scenePath);
  console.log(`Loaded scene with ${sceneData.length} objects`);
  
  // Find Canvas node
  const canvasNode = findNodeByName(sceneData, 'Canvas');
  if (canvasNode) {
    console.log(`Found Canvas node at index ${canvasNode.id}`);
    console.log(`Canvas has ${canvasNode.node._children?.length || 0} children`);
    console.log(`Canvas has ${canvasNode.node._components?.length || 0} components`);
  } else {
    console.log('Canvas node not found');
  }
  
  // List all nodes in the scene
  console.log('\nAll nodes in scene:');
  sceneData.forEach((obj, idx) => {
    if (obj.__type__ === SceneObjectType.Node) {
      console.log(`  [${idx}] ${obj._name}`);
    }
  });
} catch (error) {
  console.log('Error loading scene:', error);
}
console.log();

// Example 6: Compact JSON Generation for AI
console.log('Example 6: Compact JSON for AI Generation');
console.log('--------------------------------');
console.log('AI can generate compact JSON like this:');
const aiGeneratedCompact = '{"name":"NewUI","position":{"__type__":"cc.Vec3","x":0,"y":0,"z":0},"children":[{"name":"Label","components":[{"type":"cc.Label"}]}]}';
console.log(aiGeneratedCompact);
console.log('\nThen format it for human readability:');
const aiFormatted = formatSceneJson(aiGeneratedCompact);
console.log(aiFormatted);
console.log('\nAnd use it to build scene nodes:');
const aiConfig = JSON.parse(aiGeneratedCompact);
const builderAI = new SceneBuilder();
builderAI.createNode(aiConfig);
console.log(`Created ${builderAI.getObjects().length} objects from AI-generated JSON`);
console.log();

console.log('=== Examples Complete ===');
console.log('\nKey Takeaways:');
console.log('1. Use formatSceneJson() to make JSON human-readable');
console.log('2. Use SceneBuilder for programmatic node creation');
console.log('3. Use loadSceneFile() and manipulation functions for existing scenes');
console.log('4. AI can generate compact JSON first, then format later');
console.log('5. Scene structure follows Cocos Creator conventions with __id__ references');
