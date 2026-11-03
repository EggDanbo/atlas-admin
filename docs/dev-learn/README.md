# 开发规范与问题记录

> 编码前请阅读此目录下的规范记录，避免重复犯错。

## 快速命令

| 命令 | 说明 |
|------|------|
| `/dev-learn` | 查看所有规范 |
| `/dev-learn 记录：[问题]` | 记录新规范 |
| `/dev-learn 整理` | 整理和精简 |
| `/dev-learn stats` | 统计信息 |
| `/dev-learn tag:[标签]` | 按标签筛选 |

## 规范索引

### Vue 相关

| 记录 | 标签 | 严重程度 | 更新时间 |
|------|------|----------|----------|
| [useDetail 不适用弹窗](vue/hooks.md) | `hook`, `modal` | medium | 2025-03-30 |
| [弹窗重置表单验证](vue/modal.md) | `modal`, `form` | medium | 2025-03-30 |
| [SpModal @ok 二次确认问题](vue/spmodal.md) | `modal`, `spmodal` | 🔴 high | 2025-03-31 |
| [弹窗按钮布局规范](vue/spmodal.md#2) | `modal`, `style` | 🟢 low | 2025-03-31 |
| [SpTable 方法选择](vue/sptable.md) | `table`, `sptable` | 🔴 high | 2025-03-31 |
| [SpTable 默认按钮](vue/sptable.md#2) | `table`, `sptable` | 🟢 low | 2025-03-31 |
| [模板必须单根节点](vue/template.md) | `vue`, `template` | 🔴 high | 2025-03-31 |
| [隐藏路由设置 activePath](vue/router.md) | `vue`, `router` | 🟡 medium | 2025-03-31 |
| [QueryGrid 使用规范](vue/querygrid.md) | `vue`, `querygrid`, `layout` | 🟡 medium | 2025-03-31 |
| [模板组件命名与 import 的关系](vue/component-naming.md) | `vue`, `naive-ui`, `eslint` | 🟢 low | 2026-04-01 |

### API 相关

| 记录 | 标签 | 严重程度 | 更新时间 |
|------|------|----------|----------|
| [API 调用规范（解构+别名）](api/request.md) | `api`, `request`, `import` | 🔴 high | 2025-03-31 |

### 样式相关

| 记录 | 标签 | 严重程度 | 更新时间 |
|------|------|----------|----------|
| 待补充 | - | - | - |

## 标签云

`hook` `modal` `form` `vue` `api` `style` `table` `auth` `router` `template` `ts` `type`

## 统计

- **记录总数**：11
- **本月新增**：9
- **高频标签**：vue(8), modal(5), api(3), table(2), ts(2)

---

## 记录格式

```markdown
# [规范标题]

> 一句话总结

---
tags: [vue, hook, modal]
severity: medium
files: [src/views/**/*Modal.vue]
created: YYYY-MM-DD
---

## 场景
[适用场景]

## ❌ 错误做法
[错误代码]

## ✅ 正确做法
[正确代码]

## 关键点
- 要点1
- 要点2
```

## 记录原则

### ✅ 应该记录
- AI 反复犯错（≥2次）
- 项目特有规范
- 需人工介入的差异

### ❌ 不需要记录
- 通用编程知识
- 可从代码推导的信息
- Git 历史已有的信息
