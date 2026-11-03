// https://vxetable.cn/v4.7/#/table/start/use

import type { App } from 'vue'

import VxeUIPluginExportXLSX from '@vxe-ui/plugin-export-xlsx'
import ExcelJS from 'exceljs'
import {
  // VxeAnchor,
  // VxeAnchorLink,
  // VxeBreadcrumb,
  // VxeBreadcrumbItem,
  VxeButton,
  VxeButtonGroup,
  // VxeCalendar,
  // VxeCard,
  VxeCheckbox,
  VxeCheckboxGroup,
  // VxeCol,
  // VxeCollapse,
  // VxeCollapsePane,
  // VxeDateInput,
  // VxeDrawer,
  // VxeFlowDesign,
  // VxeFlowView,
  VxeForm,
  // VxeFormDesign,
  // VxeFormGather,
  VxeFormItem,
  // VxeFormView,
  VxeIcon,
  VxeInput,
  // VxeLayoutAside,
  // VxeLayoutBody,
  // VxeLayoutContainer,
  // VxeLayoutFooter,
  // VxeLayoutHeader,
  // VxeLink,
  // VxeListDesign,
  // VxeListView,
  // VxeList,
  VxeLoading,
  // VxeMenu,
  VxeModal,
  // VxeNumberInput,
  // VxeOptgroup,
  // VxeOption,
  VxePager,
  // VxePasswordInput,
  // VxePrint,
  // VxePulldown,
  VxeRadio,
  VxeRadioButton,
  VxeRadioGroup,
  // VxeRow,
  VxeSelect,
  VxeSwitch,
  // VxeTabPane,
  // VxeTabs,
  VxeTextarea,
  // VxeTips,
  VxeTooltip,
  VxeUI,
  // VxeTree,
  // VxeTreeSelect,
  // VxeUpload,
} from 'vxe-pc-ui'
import zhCN from 'vxe-pc-ui/lib/language/zh-CN'
// ...
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
  // app.use(VxeAnchor);
  // app.use(VxeAnchorLink);
  // app.use(VxeBreadcrumb);
  // app.use(VxeBreadcrumbItem);
  app.use(VxeButton)
  app.use(VxeButtonGroup)
  // app.use(VxeCalendar);
  // app.use(VxeCard);
  app.use(VxeCheckbox)
  app.use(VxeCheckboxGroup)
  // app.use(VxeCol);
  // app.use(VxeCollapse);
  // app.use(VxeCollapsePane);
  // app.use(VxeDateInput);
  // app.use(VxeDrawer);
  // app.use(VxeFlowDesign);
  // app.use(VxeFlowView);
  app.use(VxeForm)
  // app.use(VxeFormDesign);
  // app.use(VxeFormGather);
  app.use(VxeFormItem)
  // app.use(VxeFormView);
  app.use(VxeIcon)
  app.use(VxeInput)
  // app.use(VxeLayoutAside);
  // app.use(VxeLayoutBody);
  // app.use(VxeLayoutContainer);
  // app.use(VxeLayoutFooter);
  // app.use(VxeLayoutHeader);
  // app.use(VxeLink);
  // app.use(VxeListDesign);
  // app.use(VxeListView);
  // app.use(VxeList);
  app.use(VxeLoading)
  // app.use(VxeMenu);
  app.use(VxeModal)
  // app.use(VxeNumberInput);
  // app.use(VxeOptgroup);
  // app.use(VxeOption);
  app.use(VxePager)
  // app.use(VxePasswordInput);
  // app.use(VxePrint);
  // app.use(VxePulldown);
  app.use(VxeRadio)
  app.use(VxeRadioButton)
  app.use(VxeRadioGroup)
  // app.use(VxeRow);
  app.use(VxeSelect)
  app.use(VxeSwitch)
  // app.use(VxeTabPane);
  // app.use(VxeTabs);
  app.use(VxeTextarea)
  // app.use(VxeTips);
  app.use(VxeTooltip)
  // app.use(VxeTree);
  // app.use(VxeTreeSelect);
  // app.use(VxeUpload);
}

function useTable(app: App) {
  // 表格功能
  app.use(LazyVxeUI).use(LazyVxeTable)
}

VxeUI.use(VxeUIPluginExportXLSX, {
  ExcelJS,
})

VxeUI.setConfig({
  // size: null, // 全局尺寸
  // zIndex: 5001, // 全局 zIndex 起始值，如果项目的的 z-index 样式值过大时就需要跟随设置更大，避免被遮挡
  // version: 0, // 版本号，对于某些带数据缓存的功能有用到，上升版本号可以用于重置数据
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
      // isCrossDrag: true,
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
