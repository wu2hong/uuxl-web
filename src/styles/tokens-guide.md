# 样式 Token 工程规范

本规范用于保证 `uuxl-cn` 在多人协作与长期迭代中保持视觉一致性、可维护性与可扩展性。

## 1. 基本原则

- 单一事实来源：可复用视觉参数统一定义在 `src/styles/common.scss`
- 页面只消费 token：页面/组件不直接写重复的 magic number
- 语义优先：优先使用“语义化 token”（如导航高度、页面间距），避免业务语义混乱
- 先抽象后使用：发现可复用样式时，先补 token，再落地到页面

## 2. 必须复用的基础能力

- 基础容器类：`.page-wrap`、`.page-content`、`.card`、`.row-between`
- 通用文案类：`.card-title`、`.text-subtle`
- 导航和聊天布局统一使用：
  - `$nav-title-*`（页面顶部标题，与系统导航栏风格一致）
  - `$bottom-nav-*`
  - `$chat-composer-*`
  - `$chat-action-btn-*`

## 3. 新增页面/组件流程

1) 先评估是否已有 token 可复用  
2) 若无：在 `common.scss` 新增 token（命名语义化）  
3) 在页面/组件中引用 token，避免硬编码  
4) 检查多端表现（H5/微信小程序）  
5) 补充 README 或本规范中的约束说明（若属于跨页面规则）

## 4. 命名建议

- 布局：`$layout-*`
- 文案：`$text-*`
- 组件：`$bottom-nav-*`、`$chat-*`
- 尺寸优先按语义命名，避免 `small/medium/large` 的歧义命名

## 5. 变更边界

- 不直接修改业务页面中的重复硬编码值作为“临时修复”
- 不在多个页面复制同一组尺寸定义
- 不为单次需求引入过度复杂 token；需可复用才沉淀
