import {
  SceneBuilder,
  SceneObjectType,
  formatSceneJson,
  compactSceneJson,
  findNodeByName,
  getObjectByRef,
  addChildToNode,
  addComponentToNode,
  SceneObject,
  NodeConfig,
} from '../../assets/scripts/utils/SceneUtils';

describe('SceneBuilder', () => {
  describe('Static utility methods', () => {
    test('createVec3 should create a Vec3 object', () => {
      const vec = SceneBuilder.createVec3(1, 2, 3);
      expect(vec).toEqual({
        __type__: 'cc.Vec3',
        x: 1,
        y: 2,
        z: 3,
      });
    });

    test('createVec3 should use default values', () => {
      const vec = SceneBuilder.createVec3();
      expect(vec).toEqual({
        __type__: 'cc.Vec3',
        x: 0,
        y: 0,
        z: 0,
      });
    });

    test('createQuat should create a Quat object', () => {
      const quat = SceneBuilder.createQuat(0, 0, 0, 1);
      expect(quat).toEqual({
        __type__: 'cc.Quat',
        x: 0,
        y: 0,
        z: 0,
        w: 1,
      });
    });

    test('createColor should create a Color object', () => {
      const color = SceneBuilder.createColor(255, 128, 64, 200);
      expect(color).toEqual({
        __type__: 'cc.Color',
        r: 255,
        g: 128,
        b: 64,
        a: 200,
      });
    });

    test('createRef should create an object reference', () => {
      const ref = SceneBuilder.createRef(5);
      expect(ref).toEqual({ __id__: 5 });
    });
  });

  describe('Node creation', () => {
    test('should create a simple node', () => {
      const builder = new SceneBuilder();
      const nodeId = builder.createNode({
        name: 'TestNode',
      });

      expect(nodeId).toBe(0);
      const objects = builder.getObjects();
      expect(objects).toHaveLength(1);
      
      const node = objects[0];
      expect(node.__type__).toBe(SceneObjectType.Node);
      expect(node._name).toBe('TestNode');
      expect(node._active).toBe(true);
    });

    test('should create node with custom position', () => {
      const builder = new SceneBuilder();
      const position = SceneBuilder.createVec3(100, 200, 0);
      const nodeId = builder.createNode({
        name: 'PositionedNode',
        position,
      });

      const node = builder.getObjects()[nodeId];
      expect(node._lpos).toEqual(position);
    });

    test('should create node with children', () => {
      const builder = new SceneBuilder();
      const config: NodeConfig = {
        name: 'Parent',
        children: [
          { name: 'Child1' },
          { name: 'Child2' },
        ],
      };

      const parentId = builder.createNode(config);
      const objects = builder.getObjects();

      expect(objects).toHaveLength(3);
      const parent = objects[parentId];
      expect(parent._children).toHaveLength(2);
      expect(parent._children[0].__id__).toBe(1);
      expect(parent._children[1].__id__).toBe(2);
    });

    test('should create node with components', () => {
      const builder = new SceneBuilder();
      const config: NodeConfig = {
        name: 'NodeWithComponents',
        components: [
          { type: 'cc.UITransform' },
          { type: 'cc.Canvas' },
        ],
      };

      const nodeId = builder.createNode(config);
      const objects = builder.getObjects();

      // Node is created first, then components
      expect(objects).toHaveLength(3);
      const node = objects[nodeId];
      expect(node._components).toHaveLength(2);
      expect(node._components[0].__id__).toBe(1);
      expect(node._components[1].__id__).toBe(2);
    });

    test('should create nested node structure', () => {
      const builder = new SceneBuilder();
      const config: NodeConfig = {
        name: 'Root',
        children: [
          {
            name: 'Level1',
            children: [
              { name: 'Level2A' },
              { name: 'Level2B' },
            ],
          },
        ],
      };

      builder.createNode(config);
      const objects = builder.getObjects();

      expect(objects).toHaveLength(4);
    });
  });

  describe('Component creation', () => {
    test('should create component with properties', () => {
      const builder = new SceneBuilder();
      const compId = builder.createComponent({
        type: 'cc.Sprite',
        properties: {
          _spriteFrame: null,
          _color: SceneBuilder.createColor(255, 255, 255, 255),
        },
      });

      const comp = builder.getObjects()[compId];
      expect(comp.__type__).toBe('cc.Sprite');
      expect(comp._enabled).toBe(true);
      expect(comp._color).toBeDefined();
    });
  });
});

describe('JSON formatting functions', () => {
  test('formatSceneJson should format compact JSON', () => {
    const compact = '{"name":"test","value":123}';
    const formatted = formatSceneJson(compact);
    
    expect(formatted).toContain('\n');
    expect(formatted).toContain('  ');
    const parsed = JSON.parse(formatted);
    expect(parsed).toEqual({ name: 'test', value: 123 });
  });

  test('compactSceneJson should remove formatting', () => {
    const formatted = `{
  "name": "test",
  "value": 123
}`;
    const compact = compactSceneJson(formatted);
    
    expect(compact).not.toContain('\n');
    expect(compact).not.toContain('  ');
    expect(compact).toBe('{"name":"test","value":123}');
  });

  test('formatSceneJson should handle complex nested structures', () => {
    const data = {
      __type__: 'cc.Node',
      _children: [{ __id__: 1 }, { __id__: 2 }],
      _components: [],
    };
    const compact = JSON.stringify(data);
    const formatted = formatSceneJson(compact);
    
    const parsed = JSON.parse(formatted);
    expect(parsed).toEqual(data);
  });

  test('formatSceneJson should throw on invalid JSON', () => {
    expect(() => formatSceneJson('invalid json')).toThrow();
  });

  test('compactSceneJson should throw on invalid JSON', () => {
    expect(() => compactSceneJson('invalid json')).toThrow();
  });
});

describe('Scene manipulation functions', () => {
  let sceneData: SceneObject[];

  beforeEach(() => {
    sceneData = [
      {
        __type__: 'cc.Scene',
        _name: 'TestScene',
        _children: [{ __id__: 1 }],
      },
      {
        __type__: 'cc.Node',
        _name: 'Canvas',
        _children: [],
        _components: [],
      },
      {
        __type__: 'cc.Node',
        _name: 'GameRoot',
        _children: [],
        _components: [],
      },
    ];
  });

  describe('findNodeByName', () => {
    test('should find node by name', () => {
      const result = findNodeByName(sceneData, 'Canvas');
      expect(result).not.toBeNull();
      expect(result!.id).toBe(1);
      expect(result!.node._name).toBe('Canvas');
    });

    test('should return null for non-existent node', () => {
      const result = findNodeByName(sceneData, 'NonExistent');
      expect(result).toBeNull();
    });

    test('should find second matching node', () => {
      const result = findNodeByName(sceneData, 'GameRoot');
      expect(result).not.toBeNull();
      expect(result!.id).toBe(2);
    });
  });

  describe('getObjectByRef', () => {
    test('should get object by reference', () => {
      const ref = { __id__: 1 };
      const obj = getObjectByRef(sceneData, ref);
      expect(obj).not.toBeNull();
      expect(obj!._name).toBe('Canvas');
    });

    test('should return null for invalid reference', () => {
      const ref = { __id__: 999 };
      const obj = getObjectByRef(sceneData, ref);
      expect(obj).toBeNull();
    });

    test('should return null for negative reference', () => {
      const ref = { __id__: -1 };
      const obj = getObjectByRef(sceneData, ref);
      expect(obj).toBeNull();
    });
  });

  describe('addChildToNode', () => {
    test('should add child to parent node', () => {
      addChildToNode(sceneData, 1, 2);
      
      const parent = sceneData[1];
      expect(parent._children).toHaveLength(1);
      expect(parent._children[0].__id__).toBe(2);
      
      const child = sceneData[2];
      expect(child._parent.__id__).toBe(1);
    });

    test('should add multiple children to same parent', () => {
      const newNode: SceneObject = {
        __type__: 'cc.Node',
        _name: 'Child2',
        _children: [],
        _components: [],
      };
      sceneData.push(newNode);
      
      addChildToNode(sceneData, 1, 2);
      addChildToNode(sceneData, 1, 3);
      
      const parent = sceneData[1];
      expect(parent._children).toHaveLength(2);
    });

    test('should throw error for invalid parent', () => {
      expect(() => addChildToNode(sceneData, 999, 2)).toThrow();
    });

    test('should throw error for invalid child', () => {
      expect(() => addChildToNode(sceneData, 1, 999)).toThrow();
    });

    test('should throw error when parent is not a node', () => {
      sceneData[1].__type__ = 'cc.Component';
      expect(() => addChildToNode(sceneData, 1, 2)).toThrow();
    });
  });

  describe('addComponentToNode', () => {
    test('should add component to node', () => {
      const component: SceneObject = {
        __type__: 'cc.UITransform',
        _enabled: true,
      };
      sceneData.push(component);
      
      addComponentToNode(sceneData, 1, 3);
      
      const node = sceneData[1];
      expect(node._components).toHaveLength(1);
      expect(node._components[0].__id__).toBe(3);
    });

    test('should add multiple components to same node', () => {
      const comp1: SceneObject = {
        __type__: 'cc.UITransform',
        _enabled: true,
      };
      const comp2: SceneObject = {
        __type__: 'cc.Canvas',
        _enabled: true,
      };
      sceneData.push(comp1, comp2);
      
      addComponentToNode(sceneData, 1, 3);
      addComponentToNode(sceneData, 1, 4);
      
      const node = sceneData[1];
      expect(node._components).toHaveLength(2);
    });

    test('should throw error for invalid node', () => {
      expect(() => addComponentToNode(sceneData, 999, 1)).toThrow();
    });
  });
});
