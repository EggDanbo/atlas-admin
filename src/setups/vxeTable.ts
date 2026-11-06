// https://vxetable.cn/v4.7/#/table/start/use

import type { App } from 'vue'

import {
  VxeButton,
  VxeButtonGroup,
  VxeCheckbox,
  VxeCheckboxGroup,
  VxeForm,
  VxeFormItem,
  VxeIcon,
  VxeInput,
  VxeLoading,
  VxeModal,
  VxePager,
  VxeRadio,
  VxeRadioButton,
  VxeRadioGroup,
  VxeSelect,
  VxeSwitch,
  VxeTextarea,
  VxeTooltip,
  VxeUI,
} from 'vxe-pc-ui'
import zhCN from 'vxe-pc-ui/lib/language/zh-CN'
import { VxeColgroup, VxeColumn, VxeGrid, VxeTable, VxeToolbar } from 'vxe-table'

// 导入主题变量，也可以重写主题变量
import 'vxe-table/styles/cssvar.scss'
import 'vxe-pc-ui/styles/cssvar.scss'
import '@/styles/vxe-pc-ui.scss'

VxeUI.setI18n('zh-CN', zhCN)
VxeUI.setLanguage('zh-CN')

function LazyVxeTable(app) {
  app.use(VxeTable)
  app.use(VxeColumn)
  app.use(VxeColgroup)
  app.use(VxeGrid)
  app.use(VxeToolbar)
}

function LazyVxeUI(app) {
  app.use(VxeButton)
  app.use(VxeButtonGroup)
  app.use(VxeCheckbox)
  app.use(VxeCheckboxGroup)
  app.use(VxeForm)
  app.use(VxeFormItem)
  app.use(VxeIcon)
  app.use(VxeInput)
  app.use(VxeLoading)
  app.use(VxeModal)
  app.use(VxePager)
  app.use(VxeRadio)
  app.use(VxeRadioButton)
  app.use(VxeRadioGroup)
  app.use(VxeSelect)
  app.use(VxeSwitch)
  app.use(VxeTextarea)
  app.use(VxeTooltip)
}

function useTable(app: App) {
  // 表格功能
  app.use(LazyVxeUI).use(LazyVxeTable)
}

VxeUI.setConfig({
  table: {
    border: true,
    autoResize: false,
    stripe: true,
    headerAlign: 'center',
    showOverflow: true,
    showHeaderOverflow: true,
    showFooterOverflow: true,
    tooltipConfig: {
      enterable: true,
    },
    columnConfig: {
      resizable: true,
      isHover: true,
    },
    columnDragConfig: {
      showGuidesStatus: true,
      showIcon: false,
      trigger: 'cell',
    },
    resizableConfig: {
      minWidth: 40,
    },
    rowConfig: { isCurrent: true, isHover: true },
    sortConfig: { trigger: 'cell' },
    round: true,
    loadingConfig: {
      text: '加载中',
    },
    emptyText: '暂无数据',
    virtualYConfig: {
      enabled: true,
      // 数据变动后滚动条还原到顶
      scrollToTopOnChange: true,
    },
    checkboxConfig: { highlight: true },
  },
})

export function setupVxeTable(app: App<Element>) {
  useTable(app)
}
