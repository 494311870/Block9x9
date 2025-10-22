/**
 * Generate UI Scene Structure
 * 
 * This script generates the complete UI scene structure as described in
 * docs/ui-setup-guide.md using the SceneUtils module.
 * 
 * This demonstrates how AI can programmatically create complex scene structures.
 */

import {
  SceneBuilder,
  formatSceneJson,
  NodeConfig,
  SceneObjectType,
} from '../assets/scripts/utils/SceneUtils';

console.log('=== Generating UI Scene Structure ===\n');
console.log('Based on: docs/ui-setup-guide.md\n');

// Define the complete UI structure as per the guide
const uiStructure: NodeConfig = {
  name: 'Canvas',
  components: [
    { type: 'cc.Canvas' },
    { type: 'cc.UITransform' },
    { type: 'cc.Widget' },
  ],
  children: [
    // GameRoot with GameController
    {
      name: 'GameRoot',
      children: [
        {
          name: 'GameController',
          components: [
            {
              type: 'GameController',
              properties: {
                // Note: In a real scene, these would be set to reference actual nodes
                // Here we just show the structure
              },
            },
          ],
        },
      ],
    },
    
    // BoardContainer with BoardView
    {
      name: 'BoardContainer',
      position: { __type__: 'cc.Vec3', x: 0, y: 100, z: 0 },
      children: [
        {
          name: 'BoardView',
          components: [
            {
              type: 'BoardView',
              properties: {
                // cellSize: 50,
                // cellGap: 2,
                // emptyCellColor: RGB(240, 240, 240)
                // filledCellColor: RGB(100, 150, 255)
              },
            },
          ],
          children: [
            {
              name: 'CellContainer',
            },
          ],
        },
      ],
    },
    
    // CandidatePanel with three candidates
    {
      name: 'CandidatePanel',
      position: { __type__: 'cc.Vec3', x: 0, y: -250, z: 0 },
      children: [
        {
          name: 'Candidate0',
          position: { __type__: 'cc.Vec3', x: -120, y: 0, z: 0 },
          components: [
            {
              type: 'CandidateView',
              properties: {
                // candidateIndex: 0
              },
            },
          ],
          children: [
            {
              name: 'CellContainer',
            },
          ],
        },
        {
          name: 'Candidate1',
          position: { __type__: 'cc.Vec3', x: 0, y: 0, z: 0 },
          components: [
            {
              type: 'CandidateView',
              properties: {
                // candidateIndex: 1
              },
            },
          ],
          children: [
            {
              name: 'CellContainer',
            },
          ],
        },
        {
          name: 'Candidate2',
          position: { __type__: 'cc.Vec3', x: 120, y: 0, z: 0 },
          components: [
            {
              type: 'CandidateView',
              properties: {
                // candidateIndex: 2
              },
            },
          ],
          children: [
            {
              name: 'CellContainer',
            },
          ],
        },
      ],
    },
    
    // UI Container
    {
      name: 'UI',
      children: [
        // ScoreHUD
        {
          name: 'ScoreHUD',
          position: { __type__: 'cc.Vec3', x: -500, y: 320, z: 0 },
          components: [
            {
              type: 'ScoreHUD',
            },
          ],
          children: [
            {
              name: 'ScoreLabel',
              components: [
                {
                  type: 'cc.Label',
                  properties: {
                    _string: '分数: 0',
                    _fontSize: 24,
                  },
                },
              ],
            },
            {
              name: 'MoveLabel',
              components: [
                {
                  type: 'cc.Label',
                  properties: {
                    _string: '步数: 0',
                    _fontSize: 24,
                  },
                },
              ],
            },
          ],
        },
        
        // ButtonPanel
        {
          name: 'ButtonPanel',
          position: { __type__: 'cc.Vec3', x: 500, y: 320, z: 0 },
          children: [
            {
              name: 'StartButton',
              components: [
                {
                  type: 'cc.Button',
                },
                {
                  type: 'cc.UITransform',
                },
              ],
              children: [
                {
                  name: 'Label',
                  components: [
                    {
                      type: 'cc.Label',
                      properties: {
                        _string: '开始游戏',
                      },
                    },
                  ],
                },
              ],
            },
            {
              name: 'RestartButton',
              position: { __type__: 'cc.Vec3', x: 0, y: -60, z: 0 },
              components: [
                {
                  type: 'cc.Button',
                },
                {
                  type: 'cc.UITransform',
                },
              ],
              children: [
                {
                  name: 'Label',
                  components: [
                    {
                      type: 'cc.Label',
                      properties: {
                        _string: '重新开始',
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    
    // GameOverDialog
    {
      name: 'GameOverDialog',
      position: { __type__: 'cc.Vec3', x: 0, y: 0, z: 0 },
      active: false, // Initially hidden
      components: [
        {
          type: 'GameOverDialog',
        },
      ],
      children: [
        {
          name: 'Background',
          components: [
            {
              type: 'cc.Sprite',
              properties: {
                _color: { __type__: 'cc.Color', r: 0, g: 0, b: 0, a: 180 },
              },
            },
            {
              type: 'cc.UITransform',
            },
          ],
        },
        {
          name: 'Title',
          position: { __type__: 'cc.Vec3', x: 0, y: 100, z: 0 },
          components: [
            {
              type: 'cc.Label',
              properties: {
                _string: '游戏结束',
                _fontSize: 36,
              },
            },
          ],
        },
        {
          name: 'FinalScoreLabel',
          position: { __type__: 'cc.Vec3', x: 0, y: 20, z: 0 },
          components: [
            {
              type: 'cc.Label',
              properties: {
                _string: '最终分数: 0',
                _fontSize: 24,
              },
            },
          ],
        },
        {
          name: 'FinalMovesLabel',
          position: { __type__: 'cc.Vec3', x: 0, y: -20, z: 0 },
          components: [
            {
              type: 'cc.Label',
              properties: {
                _string: '总步数: 0',
                _fontSize: 24,
              },
            },
          ],
        },
        {
          name: 'CloseButton',
          position: { __type__: 'cc.Vec3', x: 0, y: -80, z: 0 },
          components: [
            {
              type: 'cc.Button',
            },
            {
              type: 'cc.UITransform',
            },
          ],
          children: [
            {
              name: 'Label',
              components: [
                {
                  type: 'cc.Label',
                  properties: {
                    _string: '关闭',
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

// Build the scene structure
console.log('Building scene structure...');
const builder = new SceneBuilder();
builder.createNode(uiStructure);

const objects = builder.getObjects();
console.log(`✓ Created ${objects.length} objects\n`);

// Show node hierarchy
console.log('Node Hierarchy:');
const nodes = objects.filter(obj => obj.__type__ === SceneObjectType.Node);
console.log(`Total nodes: ${nodes.length}\n`);

// Print tree structure
function printNodeTree(objects: any[], nodeId: number, indent: string = '') {
  const node = objects[nodeId];
  if (!node || node.__type__ !== SceneObjectType.Node) return;
  
  console.log(`${indent}├─ ${node._name}`);
  
  if (node._children && node._children.length > 0) {
    node._children.forEach((childRef: any, idx: number) => {
      const isLast = idx === node._children.length - 1;
      const newIndent = indent + (isLast ? '   ' : '│  ');
      printNodeTree(objects, childRef.__id__, newIndent);
    });
  }
}

printNodeTree(objects, 0);

console.log('\n=== Generated Structure ===\n');
console.log('This structure includes:');
console.log('✓ Canvas root node');
console.log('✓ GameRoot with GameController');
console.log('✓ BoardContainer with BoardView');
console.log('✓ CandidatePanel with 3 candidate views');
console.log('✓ UI with ScoreHUD and ButtonPanel');
console.log('✓ GameOverDialog (initially hidden)');

console.log('\n=== JSON Output ===\n');
console.log('Compact JSON (for AI generation):');
const compactJson = JSON.stringify(uiStructure);
console.log(compactJson.substring(0, 200) + '...');
console.log(`Total length: ${compactJson.length} characters`);

console.log('\n=== Usage ===\n');
console.log('To save this as a scene file:');
console.log('1. Use this structure with SceneBuilder');
console.log('2. Format the output with formatSceneJson()');
console.log('3. Save to a .scene file');
console.log('4. Add scene-specific metadata (SceneGlobals, etc.)');

console.log('\nNote: This is a simplified structure.');
console.log('A complete Cocos Creator scene also needs:');
console.log('- SceneAsset wrapper');
console.log('- Scene node');
console.log('- Camera node');
console.log('- SceneGlobals configuration');
console.log('- Proper component references and properties');

console.log('\n=== Complete ===');
