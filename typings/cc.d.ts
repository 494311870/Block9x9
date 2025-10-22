// Minimal fallback declaration for 'cc' module.
// This is a lightweight shim so editors and TypeScript won't error when
// the full Cocos Creator declarations are not available. Replace or remove
// this file when the engine's declarations are present in the project.
declare module 'cc' {
  const cc: any;
  export = cc;
}
