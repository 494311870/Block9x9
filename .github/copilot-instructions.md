# Copilot Instructions for Block9x9

## Project Overview

This is a **Cocos Creator 3.8.7** game project called "Block9x9" - a TypeScript-based 2D/3D game using the Cocos Creator engine. The project is currently in early development with basic engine scaffolding in place.

## Key Architecture

- **Engine**: Cocos Creator 3.8.7 with TypeScript support
- **Asset System**: UUID-based asset management in `library/` with compiled/optimized versions
- **Source Code**: Game scripts should be placed in `assets/` directory (currently empty)
- **Configuration**: `tsconfig.json` extends engine config with relaxed strict mode

## Critical Directory Structure

```
assets/          # Source assets (scenes, scripts, textures) - your main workspace
library/         # Compiled/cached assets (auto-generated, don't edit)
temp/            # Temporary build files and engine declarations
profiles/        # Editor profiles and package configurations
settings/        # Project settings and package configurations
```

## Development Workflow

### Asset Creation
- All game content goes in `assets/` directory (scenes, scripts, prefabs, textures)
- Scripts should use TypeScript with Cocos Creator component decorators
- Use `@ccclass` and `@property` decorators for component classes

### TypeScript Configuration
- Base config is in `temp/tsconfig.cocos.json` (auto-generated)
- Custom overrides in root `tsconfig.json` - currently disables strict mode
- Engine types available via declarations in `temp/declarations/`

### Build System
- Assets are automatically compiled to `library/` with UUID naming
- Use Cocos Creator Editor for building, not direct command line
- Build outputs typically go to `build/` (currently gitignored)

## Cocos Creator Specific Patterns

### Component Structure
```typescript
import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('YourComponent')
export class YourComponent extends Component {
    @property(Node)
    targetNode: Node = null;
}
```

### Scene Management
- Scenes are typically `.scene` files in `assets/`
- Use `director.loadScene()` for scene transitions
- Scene data is serialized to library as JSON

### Asset References
- Use `@property` decorators for editor-assignable references
- Assets loaded via `resources.load()` or direct scene references
- UUID system handles asset dependencies automatically

## File Naming Conventions

- TypeScript components: PascalCase (e.g., `GameManager.ts`)
- Scenes: descriptive names (e.g., `MainMenu.scene`, `GamePlay.scene`)
- Prefabs: noun-based (e.g., `Player.prefab`, `Enemy.prefab`)

## Important Notes

- Never edit files in `library/`, `temp/`, `profiles/`, or `settings/` manually
- All actual development happens in `assets/` directory
- Project uses UUID-based asset system - references are maintained automatically
- Engine version 3.8.7 has specific API patterns - refer to Cocos Creator docs for this version

## Current State

The project is essentially empty - only basic scaffolding exists. When adding game content:
1. Create scenes in `assets/scenes/`
2. Add scripts in `assets/scripts/`
3. Import game assets (images, audio) to `assets/resources/`
4. Build component hierarchy using Cocos Creator Editor

## 提交日志规范

为保证历史清晰与自动化（例如生成变更日志、触发 CI 分支规则），本项目遵循基于 "Conventional Commits" 的简化规范：

- 格式：

    <type>(<scope>): <short summary>

    - type（必需）：feat | fix | docs | style | refactor | perf | test | chore | build | ci | revert
    - scope（可选）：受影响模块或目录，例如 `assets`, `scripts`, `scenes`, `ui`。
    - short summary（必需）：总长不超过 72 个字符，首字母小写，不以句号结束。

- 主体（可选）：空行后写更详细的变更说明。行宽建议 100 字以内。

- 页脚（可选）：用于引用 issue 或标注 BREAKING CHANGE。例如：


        BREAKING CHANGE: 描述破坏性变更的简要说明

        或者引用 issue：

            `Fixes Issue-123`, `See Issue-45`

- 示例：

- 示例（type 保持英文，日志内容请使用中文）：

    feat(scripts): 添加 TileSpawner 组件以生成方格

    fix(ui): 修复小屏幕下按钮布局溢出问题

    docs: 更新 README，补充 Cocos Creator 3.8.7 的构建步骤说明

- 项目特定规则：

    - 在 scope 中优先使用 `assets`, `scripts`, `scenes`, `build`, `ci` 等目录名。
    - 对于仅修改 `library/`, `temp/`, `profiles/`, `settings/` 中的文件（自动生成或编辑器配置），请使用 `chore`，并在摘要中注明 "generated" 或 "editor"，例如：

        chore(library): update generated asset metadata

    - BREAKING CHANGE 只有在 API 或资源格式发生不兼容变更时使用（例如删除或重命名 scene / prefab UUID）。请在页脚中写明迁移步骤。
    - 合并大型功能时，建议使用 feature 分支并在合并 PR 时把多个相关提交 squash 成一个 `feat(scope): ...` 提交，便于 CHANGELOG 自动化。

- 可选自动化（建议）：

        - 可使用 `husky` 强制执行本地钩子（如需示例配置可请求）。