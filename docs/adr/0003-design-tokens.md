# ADR-0003：设计令牌 + 主题派生的样式方案

- 状态：已采纳
- 日期：2025-11

## 背景

项目用 Naive UI + UnoCSS + Less。视觉要满足三件事：

1. 能换主色（原系统支持用户自选主题色，这个能力要保留）；
2. 明暗两套主题都要成立，不能出现「暗色下露出白块」；
3. 布局骨架（侧栏、顶栏、页签、卡片、表格）的观感要能整体调整，而不是逐个页面改。

## 决策

三层结构，职责不重叠：

```
tokens.less    CSS 变量：品牌色、画布、描边、文本、圆角、阴影、动效
theme.ts       主色 → 派生色（@ant-design/colors）+ Naive UI themeOverrides
skin.less      布局骨架皮肤，只消费上面两层的变量
```

### 令牌层

`--atlas-*` 系列变量，明暗两套值挂在 `html.dark` 与 `html[data-vxe-ui-theme='dark']` 上。
好处是任何组件（包括第三方库）都能直接引用，不需要知道当前主题。

### 主题派生

用户选的品牌色只存一个值（`theme.primaryColor`）。运行时：

- `generate(color)` 得到 10 级色阶，喂给 Naive UI 的 `themeOverrides`（按钮、菜单、输入框…）；
- 同时把 `colors[5]` 与它的 10%/16%/22% 透明版本写进 `--atlas-brand*` 变量，
  供皮肤层使用（菜单选中底色、页签选中态、卡片高光）。

于是换主色时，Naive UI 组件与自定义皮肤**同时**跟随，不存在「按钮变了菜单没变」。

### 皮肤层

只写「外观」不写「结构」：不改 `pro-naive-ui` 的 DOM，只覆盖需要统一表达的类：

- `.pro-menu .n-menu-item-content` —— 菜单胶囊化、选中态竖条
- `.naive-layout-tabbar .tag-item` —— 页签改胶囊
- `.page-container .n-card` —— 页面卡片统一圆角、描边、阴影
- `.vxe-table--header` —— 表头底色与字重

## 后果

正面：

- 换色、换圆角、调密度都是改一处；
- 暗色不是「另做一套」，而是同一套变量换值；
- 新增自定义组件直接引用 `--atlas-*`，天然支持明暗。

负面：

- 覆盖第三方库样式天然脆弱：升级 `pro-naive-ui` / `vxe-table` 后需要回归（已用全量路由巡检兜底）；
- 皮肤层依赖少量内部类名，需要有注释说明它们在覆盖什么。

## 相关

- `src/styles/tokens.less`、`src/styles/skin.less`
- `src/store/modules/theme.ts`
