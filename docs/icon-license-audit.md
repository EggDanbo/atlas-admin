# 图标许可证审查报告

> 审查日期：2026-03-30
> 审查范围：icons.config.json 中所有使用的图标库

## 审查结论

项目中共使用了 **48 个图标库**，其中大部分为开源免费许可。

---

## ✅ 完全免费开源（推荐使用）

| 图标库 | 图标数量 | 许可证 | 备注 |
|--------|----------|--------|------|
| ant-design | 37 | MIT | 推荐，风格统一 |
| ri (Remix Icon) | 9 | Apache 2.0 | 丰富全面 |
| mdi | 23 | Apache 2.0 | Google Material Design |
| tabler | 6 | MIT | 简洁现代 |
| mingcute | 6 | MIT | 精致美观 |
| ic (VS Code Icons) | 5 | Apache 2.0 | Pictogrammers |
| material-symbols | 5 | Apache 2.0 | Google 官方 |
| material-symbols-light | 1 | Apache 2.0 | Google 轻量版 |
| akar-icons | 4 | MIT | 圆角风格 |
| iconamoon | 4 | MIT | 细线条风格 |
| line-md | 7 | MIT | 动态图标 |
| icon-park-outline | 3 | Apache 2.0 | 字节跳动 |
| tdesign | 3 | MIT | 腾讯设计 |
| mynaui | 3 | MIT | 简洁风格 |
| ion | 2 | MIT | Ionic Framework |
| formkit | 2 | MIT | FormKit 官方 |
| gg (css.gg) | 2 | MIT | 纯 CSS 图标 |
| f7 (Framework7) | 2 | MIT | iOS 风格 |
| codicon | 1 | MIT | VS Code 官方 |
| ep (Element Plus) | 1 | MIT | Element Plus |
| eva | 1 | MIT | Eva Icons |
| famicons | 1 | MIT | Fam Icons |
| fluent | 1 | MIT | Microsoft Fluent |
| heroicons-solid | 1 | MIT | Tailwind CSS |
| bi (Bootstrap Icons) | 1 | MIT | Bootstrap |
| carbon | 1 | Apache 2.0 | IBM Carbon |
| ci (Circum Icons) | 2 | MPL 2.0/Apache | Mozilla |
| basil | 1 | MIT | Basil Icons |
| proicons | 1 | MIT | 完全免费 |
| iconoir | 1 | MIT | Iconoir |
| hugeicons | 1 | 免费可商用 | 免费版可用 |
| uil (Unicons) | 2 | MIT | Iconscout |
| uim (Unicons Monochrome) | 1 | MIT | Iconscout |
| vaadin | 1 | Apache 2.0 | Vaadin |
| radix-icons | 1 | MIT | Radix UI |
| pajamas | 1 | MIT | GitLab |
| oi (Open Icon) | 1 | MIT | Open Iconic |
| majesticons | 1 | MIT | Majesticons |
| lsicon | 1 | 待确认 | - |
| circle-flags | 1 | MIT | 国旗图标 |

---

## ⚠️ 需要注意的图标库

### 1. Solar Icons (4 个图标)
- **许可证**: CC BY 4.0
- **限制**: 商用需要署名
- **图标列表**:
  - `solar:alt-arrow-down-outline`
  - `solar:alt-arrow-up-outline`
  - `solar:layers-outline`
  - `solar:settings-outline`
- **处理建议**: 添加署名或替换为 MIT 许可的图标

### 2. Font Awesome 6 Solid (1 个图标)
- **许可证**: Font Awesome Free License
- **限制**: 商用需要署名
- **图标列表**:
  - `fa6-solid:moon`
- **处理建议**: 添加署名或替换

### 3. Gridicons (2 个图标) ⚠️ 高风险
- **许可证**: GPL v2 (WordPress)
- **限制**: GPL 许可有传染性，可能影响整个项目
- **图标列表**:
  - `gridicons:filter`
  - `gridicons:help-outline`
- **处理建议**: **建议立即替换** 为 MIT 许可的图标

### 4. Streamline (1 个图标)
- **许可证**: 免费版可商用，有项目限制
- **限制**: 每个项目最多 100 个图标
- **图标列表**:
  - `streamline:interface-edit-paint-color-colors-design-paint-painting-palette`
- **处理建议**: 替换为完全开源的图标

### 5. Noto Color Emoji (1 个图标)
- **许可证**: SIL Open Font License
- **图标列表**:
  - `noto-v1:flag-for-flag-china`
- **处理建议**: 确认使用范围

### 6. Stash Icons (1 个图标)
- **许可证**: 待确认
- **图标列表**:
  - `stash:search-solid`
- **处理建议**: 确认许可证或替换

---

## 建议替换方案

### Gridicons 替换

| 原图标 | 替换为 |
|--------|--------|
| `gridicons:filter` | `ant-design:filter-outlined` 或 `mdi:filter-outline` |
| `gridicons:help-outline` | `ant-design:question-circle-outlined` 或 `mdi:help-circle-outline` |

### Streamline 替换

| 原图标 | 替换为 |
|--------|--------|
| `streamline:interface-edit-paint-color-*` | `mdi:palette-outline` 或 `ant-design:bg-colors-outlined` |

### Solar Icons 替换（可选）

| 原图标 | 替换为 |
|--------|--------|
| `solar:alt-arrow-down-outline` | `ant-design:down-outlined` |
| `solar:alt-arrow-up-outline` | `ant-design:up-outlined` |
| `solar:layers-outline` | `ant-design:appstore-outlined` |
| `solar:settings-outline` | `ant-design:setting-outlined` |

---

## 参考链接

- [HugeIcons License](https://hugeicons.com/license-agreement)
- [ProIcons GitHub](https://github.com/ProCode-Software/proicons)
- [Solar Icons NPM](https://www.npmjs.com/package/@solar-icons/react)
- [CC BY 4.0 License](https://creativecommons.org/licenses/by/4.0/deed.en)
- [Font Awesome License](https://fontawesome.com/license/free)
- [Streamline Free License](https://help.streamlinehq.com/en/articles/5354376-streamline-free-license)

---

## 后续行动

- [x] 替换 `gridicons:*` 图标（高风险）→ 已替换为 `ant-design:*`
- [x] 替换 `streamline:*` 图标 → 已替换为 `ant-design:bg-colors-outlined`
- [x] 替换 `stash:*` 图标 → 已替换为 `ant-design:search-outlined`
- [x] 替换 `solar:*` 图标 → 已替换为 `ant-design:*`
- [x] 替换 `fa6-solid:*` 图标 → 已替换为 `ant-design:moon-outlined`
- [ ] 定期审查新增图标库的许可证

## 已完成的替换

| 原图标 | 新图标 | 涉及文件 |
|--------|--------|----------|
| `gridicons:filter` | `ant-design:filter-outlined` | useSearch.ts |
| `gridicons:help-outline` | `ant-design:question-circle-outlined` | 多个组件 |
| `streamline:interface-edit-paint-color-*` | `ant-design:bg-colors-outlined` | CutThemeMenu.vue |
| `solar:alt-arrow-down-outline` | `ant-design:down-outlined` | 多个 views |
| `solar:alt-arrow-up-outline` | `ant-design:up-outlined` | SpQueryGrid.vue |
| `solar:layers-outline` | `ant-design:appstore-outlined` | SpTable/Table.vue |
| `solar:settings-outline` | `ant-design:setting-outlined` | SpTable/Settings.vue |
| `fa6-solid:moon` | `ant-design:moon-outlined` | CutDark.vue, CutThemeMenu.vue |
| `stash:search-solid` | `ant-design:search-outlined` | NaSearchGroup.vue |
