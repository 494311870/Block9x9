/**
 * SceneUtils - Utilities for programmatically modifying Cocos Creator scene files
 * 
 * This module provides helper functions to:
 * 1. Format scene JSON (compact to human-friendly)
 * 2. Build and modify scene node structures
 * 3. Serialize/deserialize scene data
 * 
 * Usage:
 *   - Use SceneBuilder to create scene structures programmatically
 *   - Use formatSceneJson() to convert compact JSON to human-friendly format
 *   - Use compactSceneJson() to convert human-friendly JSON to compact format
 */

import * as fs from 'fs';
import * as path from 'path';

/**
 * Scene object types used in Cocos Creator
 */
export enum SceneObjectType {
  SceneAsset = 'cc.SceneAsset',
  Scene = 'cc.Scene',
  Node = 'cc.Node',
  Canvas = 'cc.Canvas',
  UITransform = 'cc.UITransform',
  Widget = 'cc.Widget',
  Camera = 'cc.Camera',
  Sprite = 'cc.Sprite',
  Label = 'cc.Label',
  Button = 'cc.Button',
  SceneGlobals = 'cc.SceneGlobals',
}

/**
 * Base interface for all scene objects
 */
export interface SceneObject {
  __type__: string;
  [key: string]: any;
}

/**
 * Reference to another object in the scene by ID
 */
export interface ObjectRef {
  __id__: number;
}

/**
 * Vector3 position/scale/euler
 */
export interface Vec3 {
  __type__: 'cc.Vec3';
  x: number;
  y: number;
  z: number;
}

/**
 * Quaternion rotation
 */
export interface Quat {
  __type__: 'cc.Quat';
  x: number;
  y: number;
  z: number;
  w: number;
}

/**
 * Color
 */
export interface Color {
  __type__: 'cc.Color';
  r: number;
  g: number;
  b: number;
  a: number;
}

/**
 * Scene node configuration
 */
export interface NodeConfig {
  name: string;
  position?: Vec3;
  rotation?: Quat;
  scale?: Vec3;
  active?: boolean;
  layer?: number;
  children?: NodeConfig[];
  components?: ComponentConfig[];
}

/**
 * Component configuration
 */
export interface ComponentConfig {
  type: string;
  properties?: Record<string, any>;
}

/**
 * Helper class to build scene structures programmatically
 */
export class SceneBuilder {
  private objects: SceneObject[] = [];
  private idCounter: number = 0;

  /**
   * Create a new Vec3
   */
  static createVec3(x: number = 0, y: number = 0, z: number = 0): Vec3 {
    return {
      __type__: 'cc.Vec3',
      x,
      y,
      z,
    };
  }

  /**
   * Create a new Quat (identity by default)
   */
  static createQuat(x: number = 0, y: number = 0, z: number = 0, w: number = 1): Quat {
    return {
      __type__: 'cc.Quat',
      x,
      y,
      z,
      w,
    };
  }

  /**
   * Create a new Color
   */
  static createColor(r: number = 255, g: number = 255, b: number = 255, a: number = 255): Color {
    return {
      __type__: 'cc.Color',
      r,
      g,
      b,
      a,
    };
  }

  /**
   * Create an object reference
   */
  static createRef(id: number): ObjectRef {
    return { __id__: id };
  }

  /**
   * Get next available ID
   */
  private getNextId(): number {
    return this.idCounter++;
  }

  /**
   * Add an object to the scene
   */
  private addObject(obj: SceneObject): number {
    const id = this.getNextId();
    this.objects.push(obj);
    return id;
  }

  /**
   * Create a node with the given configuration
   */
  createNode(config: NodeConfig): number {
    // Create the node object first to get its ID
    const nodeId = this.objects.length;
    const node: SceneObject = {
      __type__: SceneObjectType.Node,
      _name: config.name,
      _objFlags: 0,
      __editorExtras__: {},
      _parent: null, // Will be set by parent
      _children: [],
      _active: config.active !== undefined ? config.active : true,
      _components: [],
      _prefab: null,
      _lpos: config.position || SceneBuilder.createVec3(),
      _lrot: config.rotation || SceneBuilder.createQuat(),
      _lscale: config.scale || SceneBuilder.createVec3(1, 1, 1),
      _mobility: 0,
      _layer: config.layer || 33554432,
      _euler: SceneBuilder.createVec3(),
      _id: this.generateUUID(),
    };
    this.objects.push(node);
    this.idCounter++;

    // Create components
    const componentRefs: ObjectRef[] = [];
    if (config.components) {
      for (const compConfig of config.components) {
        const compId = this.createComponent(compConfig);
        componentRefs.push(SceneBuilder.createRef(compId));
      }
    }
    node._components = componentRefs;

    // Create child nodes
    const childRefs: ObjectRef[] = [];
    if (config.children) {
      for (const childConfig of config.children) {
        const childId = this.createNode(childConfig);
        childRefs.push(SceneBuilder.createRef(childId));
      }
    }
    node._children = childRefs;

    return nodeId;
  }

  /**
   * Create a component
   */
  createComponent(config: ComponentConfig): number {
    const component: SceneObject = {
      __type__: config.type,
      _name: '',
      _objFlags: 0,
      __editorExtras__: {},
      node: null, // Will be set by engine
      _enabled: true,
      ...config.properties,
    };

    return this.addObject(component);
  }

  /**
   * Generate a UUID (simple version for demo)
   */
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  /**
   * Get all objects in the scene
   */
  getObjects(): SceneObject[] {
    return this.objects;
  }

  /**
   * Build complete scene structure
   */
  buildScene(): SceneObject[] {
    // Note: A complete scene needs more objects (SceneGlobals, etc.)
    // This is a simplified version
    return this.objects;
  }
}

/**
 * Format scene JSON from compact to human-friendly format
 * @param jsonString Compact JSON string
 * @returns Formatted JSON string with 2-space indentation
 */
export function formatSceneJson(jsonString: string): string {
  try {
    const data = JSON.parse(jsonString);
    return JSON.stringify(data, null, 2);
  } catch (error) {
    throw new Error(`Failed to format scene JSON: ${error}`);
  }
}

/**
 * Format scene JSON from compact to human-friendly format (from file)
 * @param filePath Path to scene file
 * @returns Formatted JSON string
 */
export function formatSceneFile(filePath: string): string {
  const content = fs.readFileSync(filePath, 'utf-8');
  return formatSceneJson(content);
}

/**
 * Compact scene JSON (remove formatting)
 * @param jsonString Formatted JSON string
 * @returns Compact JSON string (no whitespace)
 */
export function compactSceneJson(jsonString: string): string {
  try {
    const data = JSON.parse(jsonString);
    return JSON.stringify(data);
  } catch (error) {
    throw new Error(`Failed to compact scene JSON: ${error}`);
  }
}

/**
 * Save formatted scene JSON to file
 * @param filePath Path to save the scene file
 * @param jsonString Scene JSON string (will be formatted)
 */
export function saveSceneFile(filePath: string, jsonString: string): void {
  const formatted = formatSceneJson(jsonString);
  fs.writeFileSync(filePath, formatted, 'utf-8');
}

/**
 * Load scene data from file
 * @param filePath Path to scene file
 * @returns Parsed scene data
 */
export function loadSceneFile(filePath: string): SceneObject[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
}

/**
 * Find node by name in scene data
 * @param sceneData Scene object array
 * @param nodeName Name of the node to find
 * @returns Node object and its ID, or null if not found
 */
export function findNodeByName(
  sceneData: SceneObject[],
  nodeName: string
): { node: SceneObject; id: number } | null {
  for (let i = 0; i < sceneData.length; i++) {
    const obj = sceneData[i];
    if (obj.__type__ === SceneObjectType.Node && obj._name === nodeName) {
      return { node: obj, id: i };
    }
  }
  return null;
}

/**
 * Get object by reference ID
 * @param sceneData Scene object array
 * @param ref Object reference
 * @returns Object or null if not found
 */
export function getObjectByRef(sceneData: SceneObject[], ref: ObjectRef): SceneObject | null {
  if (ref.__id__ >= 0 && ref.__id__ < sceneData.length) {
    return sceneData[ref.__id__];
  }
  return null;
}

/**
 * Add a child node to a parent node
 * @param sceneData Scene object array
 * @param parentId Parent node ID
 * @param childId Child node ID
 */
export function addChildToNode(sceneData: SceneObject[], parentId: number, childId: number): void {
  const parent = sceneData[parentId];
  if (!parent || parent.__type__ !== SceneObjectType.Node) {
    throw new Error(`Parent node not found or invalid: ${parentId}`);
  }

  const child = sceneData[childId];
  if (!child || child.__type__ !== SceneObjectType.Node) {
    throw new Error(`Child node not found or invalid: ${childId}`);
  }

  // Add child reference to parent
  if (!parent._children) {
    parent._children = [];
  }
  parent._children.push(SceneBuilder.createRef(childId));

  // Set parent reference in child
  child._parent = SceneBuilder.createRef(parentId);
}

/**
 * Add a component to a node
 * @param sceneData Scene object array
 * @param nodeId Node ID
 * @param componentId Component ID
 */
export function addComponentToNode(sceneData: SceneObject[], nodeId: number, componentId: number): void {
  const node = sceneData[nodeId];
  if (!node || node.__type__ !== SceneObjectType.Node) {
    throw new Error(`Node not found or invalid: ${nodeId}`);
  }

  // Add component reference to node
  if (!node._components) {
    node._components = [];
  }
  node._components.push(SceneBuilder.createRef(componentId));
}
