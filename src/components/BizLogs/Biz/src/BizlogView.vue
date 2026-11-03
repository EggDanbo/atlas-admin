<script lang="ts" setup>
import type { ModalInst, OpenModal } from '@/components/SpModal'
import { useClipboard } from '@vueuse/core'
import { format } from 'date-fns'
import { computed, reactive, ref, watch } from 'vue'
import { buildFileUrl } from '@/components/BizFile/shared/previewUrl'
import { logBizLog as api } from '@/service/api/system'
import { intToIp } from '@/utils'

const modalRef = ref<ModalInst | null>(null)

const formModel = reactive<Recordable>({})
const defaultTab = ref('日志信息')

// 关联记录本地分页
const refPageSize = 15
const refPage = ref(1)
const selectedRefId = ref<number | null>(null)

// 操作类型筛选：all 或 opt 值字符串
const optFilter = ref<string>('all')

// 右栏详情页签：字段变更 / 数据快照
const detailTab = ref('changes')

const optLabels: Record<number, string> = {
  1: '新增',
  2: '修改',
  3: '删除',
}

const optTypes: Record<number, 'success' | 'info' | 'error'> = {
  1: 'success',
  2: 'info',
  3: 'error',
}

const { copy } = useClipboard()
const Message = useMessage()

// 关联记录是否命中操作类型筛选
function matchOpt(refRow: any, opt: string) {
  return opt === 'all' || String(refRow.opt) === opt
}

// 按操作类型筛选后的关联记录
const filteredRefs = computed(() =>
  (formModel.refs ?? []).filter((r: any) => matchOpt(r, optFilter.value)),
)

// 本地分页后的关联记录
const pagedRefs = computed(() =>
  filteredRefs.value.slice((refPage.value - 1) * refPageSize, refPage.value * refPageSize),
)

// 操作类型筛选选项（含数量）
const filterChips = computed(() => {
  const refs = formModel.refs ?? []
  const count = (opt: string) =>
    refs.filter((r: any) => matchOpt(r, opt)).length

  return [
    { key: 'all', label: '全部', count: refs.length },
    { key: '1', label: '新增', count: count('1') },
    { key: '2', label: '修改', count: count('2') },
    { key: '3', label: '删除', count: count('3') },
  ]
})

// 复制全部/筛选ID 的内容与文案（所见即所得）
const copyAllText = computed(() =>
  filteredRefs.value.map((r: any) => r.xid).join(','),
)

const copyAllLabel = computed(() =>
  optFilter.value === 'all' ? `复制全部ID(${filteredRefs.value.length})` : `复制筛选ID(${filteredRefs.value.length})`,
)

// 关联记录按 表名/操作类型 分组
const refGroups = computed<Record<string, Record<number, string[]>>>(
  () => groupRefIds((formModel.refs ?? []) as any[]),
)

// 分组复制下拉选项
const groupOptions = computed(() => {
  return Object.entries(refGroups.value).map(([name, optMap]) => {
    const ids = Object.values(optMap).flat()
    return { label: `${name}（${ids.length}条）`, key: name }
  })
})

function handleGroupSelect(key: string) {
  const optMap: Record<number, string[]> | undefined = refGroups.value[key]
  if (optMap)
    copyText(Object.values(optMap).flat().join(','))
}

function setOptFilter(key: string) {
  optFilter.value = key
  refPage.value = 1
  selectedRefId.value = filteredRefs.value[0]?.id ?? null
}

const changeColumns = [
  {
    title: '字段',
    key: 'describe',
    width: 150,
    ellipsis: { tooltip: true },
    render: (row: any) => row.describe || row.field,
  },
  {
    title: '变更前',
    key: 'old_value',
    ellipsis: { tooltip: true },
    render: (row: any) => h('span', { class: 'text-gray-400' }, row.old_value),
  },
  {
    title: '变更后',
    key: 'new_value',
    ellipsis: { tooltip: true },
    render: (row: any) => h('span', { class: 'font-medium' }, row.new_value),
  },
]

const selectedRef = computed(() => {
  return (formModel.refs ?? []).find((r: any) => r.id === selectedRefId.value) ?? null
})

// 所选关联记录的数据快照（格式化 JSON）
const selectedCont = computed(() => {
  const cont = selectedRef.value?.cont
  if (!cont)
    return ''
  try {
    return JSON.stringify(JSON.parse(cont), null, 4)
  }
  catch {
    return cont
  }
})

// 切换选中后右栏详情默认定位：有变更看变更，否则看快照
watch(selectedRefId, () => {
  detailTab.value = selectedRef.value?.changes?.length ? 'changes' : 'cont'
})

function fmtTime(value) {
  return value ? format(new Date(value), 'yyyy-MM-dd HH:mm:ss') : ''
}

// 复制文本并提示
async function copyText(text: string) {
  await copy(text)
  Message.success('复制成功')
}

// 附件大小显示
function fmtSize(size?: number) {
  if (!size || size <= 0)
    return ''
  const units = ['B', 'KB', 'MB', 'GB']
  let value = size
  let i = 0
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024
    i++
  }
  return `${value.toFixed(value >= 100 || i === 0 ? 0 : 1)} ${units[i]}`
}

// 下载附件
function download(file: any) {
  const url = buildFileUrl({ url: file.url, name: file.name, extension: file.extension })
  window.open(url.includes('?') ? `${url}&down=1` : `${url}?down=1`, '_blank')
}

// refs 按表名分组，表内再按操作类型分组
function groupRefIds(refs: any[]) {
  return (refs ?? []).reduce((acc, cur) => {
    const name = `${cur.title}${(cur.title ? ' / ' : '')}${cur.name}`
    if (!acc[name])
      acc[name] = {}
    if (!acc[name][cur.opt])
      acc[name][cur.opt] = []
    acc[name][cur.opt].push(cur.xid)
    return acc
  }, {} as Record<string, Record<number, string[]>>)
}

// 本地翻页后选中该页首条
function handleRefPageChange(page: number) {
  refPage.value = page
  selectedRefId.value = filteredRefs.value[(page - 1) * refPageSize]?.id ?? null
}

const exposed: OpenModal = {
  open: async (args?: Recordable) => {
    if (!args?.id)
      return

    refPage.value = 1
    optFilter.value = 'all'

    const { isSuccess, data } = await api.detail(args.id)
    if (!isSuccess)
      return

    // 先清空上一条的字段，避免本条缺失的键（如user_mobile为空）沿用旧值
    Object.keys(formModel).forEach(k => delete formModel[k])
    Object.assign(formModel, data)

    selectedRefId.value = filteredRefs.value[0]?.id ?? null
    detailTab.value = selectedRef.value?.changes?.length ? 'changes' : 'cont'

    if (formModel.cont) {
      try {
        const j = JSON.parse(formModel.cont)
        formModel.cont = JSON.stringify(j, null, 4)
      }
      catch {
        // 解析失败则保持原样
      }
    }

    defaultTab.value = '日志信息'
    modalRef.value?.open()
  },
}

defineExpose(exposed)
</script>

<script lang="ts">
export default { name: 'BizlogView' }
</script>

<template>
  <SpModal ref="modalRef" width="80vw" height="90vh" title="操作日志详情" :show-ok="false" :show-cancel="false">
    <n-tabs v-model:value="defaultTab" type="line" class="px-2 pt-1">
      <n-tab-pane name="日志信息" tab="日志信息">
        <n-descriptions label-placement="left" bordered :column="2" size="small" class="mt-2">
          <n-descriptions-item label="操作描述" :span="2">
            {{ formModel.mark }}
          </n-descriptions-item>
          <n-descriptions-item label="操作时间">
            {{ fmtTime(formModel.ctime) }}
          </n-descriptions-item>
          <n-descriptions-item label="操作人">
            {{ formModel.user_name }}（{{ formModel.user_id }}）
          </n-descriptions-item>
          <n-descriptions-item label="联系电话">
            {{ formModel.user_mobile }}
          </n-descriptions-item>
          <n-descriptions-item label="IP地址">
            {{ intToIp(formModel.ip) }}
          </n-descriptions-item>
        </n-descriptions>
      </n-tab-pane>
      <n-tab-pane name="详情内容" tab="详情内容">
        <n-code :code="formModel.cont" language="json" class="mt-2" />
      </n-tab-pane>
      <n-tab-pane v-if="(formModel.refs ?? []).length > 0" name="关联记录" tab="关联记录">
        <n-flex align="center" justify="space-between" class="mt-2 pb-2">
          <n-flex :size="8" align="center">
            <n-button size="small" quaternary type="primary" @click="copyText(copyAllText)">
              {{ copyAllLabel }}
            </n-button>
            <n-dropdown
              v-if="groupOptions.length"
              trigger="click"
              :options="groupOptions"
              @select="handleGroupSelect"
            >
              <n-button size="small" quaternary>
                分组复制
              </n-button>
            </n-dropdown>
          </n-flex>
          <n-flex :size="8" align="center">
            <span class="text-13px text-gray-400">
              第 {{ (refPage - 1) * refPageSize + 1 }}-{{ (refPage - 1) * refPageSize + pagedRefs.length }} 条 / 共 {{ filteredRefs.length }} 条
            </span>
            <n-pagination
              v-if="filteredRefs.length > refPageSize"
              size="small"
              :page="refPage"
              :item-count="filteredRefs.length"
              :page-size="refPageSize"
              @update:page="handleRefPageChange"
            />
          </n-flex>
        </n-flex>
        <div class="bizlog-split">
          <!-- 左栏：关联记录列表 -->
          <div class="bizlog-ref-list">
            <n-flex :size="4" class="pb-2">
              <n-button
                v-for="chip in filterChips"
                :key="chip.key"
                size="tiny"
                :type="optFilter === chip.key ? 'primary' : 'default'"
                :secondary="optFilter === chip.key"
                @click="setOptFilter(chip.key)"
              >
                {{ chip.label }}({{ chip.count }})
              </n-button>
            </n-flex>
            <div
              v-for="refItem in pagedRefs"
              :key="refItem.id"
              class="bizlog-ref-item group"
              :class="{ active: refItem.id === selectedRefId }"
              @click="selectedRefId = refItem.id"
            >
              <n-flex align="center" :size="6">
                <n-tag :type="optTypes[refItem.opt] ?? 'default'" size="small" :bordered="false">
                  {{ optLabels[refItem.opt] ?? '未知' }}
                </n-tag>
                <span class="flex-1 truncate font-medium">{{ refItem.title || refItem.name }}</span>
                <n-button
                  size="tiny"
                  quaternary
                  type="primary"
                  class="opacity-0 group-hover:opacity-100"
                  @click.stop="copyText(String(refItem.xid))"
                >
                  复制
                </n-button>
              </n-flex>
              <n-flex align="center" :size="6" class="mt-1">
                <span class="truncate text-12px text-gray-400">{{ refItem.name }} / {{ refItem.xid }}</span>
                <n-tag v-if="refItem.changes?.length" size="tiny" type="info" :bordered="false">
                  变更{{ refItem.changes.length }}
                </n-tag>
                <n-tag v-if="refItem.cont" size="tiny" type="warning" :bordered="false">
                  快照
                </n-tag>
              </n-flex>
            </div>
            <n-empty
              v-if="filteredRefs.length === 0"
              size="small"
              description="无关联记录"
              class="py-8"
            />
          </div>
          <!-- 右栏：所选记录的字段变更与数据快照（分段页签切换，各自占满高度） -->
          <div class="bizlog-change-panel">
            <template v-if="selectedRef">
              <n-flex align="center" justify="space-between" class="pb-1">
                <span class="truncate text-13px font-medium">
                  {{ selectedRef.title || selectedRef.name }} · {{ selectedRef.name }} / {{ selectedRef.xid }}
                </span>
                <n-button size="tiny" quaternary type="primary" @click="copyText(String(selectedRef.xid))">
                  复制ID
                </n-button>
              </n-flex>
              <n-tabs
                v-if="selectedRef.changes?.length && selectedCont"
                v-model:value="detailTab"
                type="segment"
                size="small"
                class="detail-tabs"
              >
                <n-tab-pane name="changes" :tab="`字段变更(${selectedRef.changes.length})`">
                  <n-data-table
                    :columns="changeColumns"
                    :data="selectedRef.changes"
                    :pagination="false"
                    :bordered="false"
                    size="small"
                    striped
                    flex-height
                    class="h-full"
                  />
                </n-tab-pane>
                <n-tab-pane name="cont" tab="数据快照">
                  <n-code :code="selectedCont" language="json" class="h-full overflow-auto" />
                </n-tab-pane>
              </n-tabs>
              <n-data-table
                v-else-if="selectedRef.changes?.length"
                :columns="changeColumns"
                :data="selectedRef.changes"
                :pagination="false"
                :bordered="false"
                size="small"
                striped
                flex-height
                class="flex-1"
              />
              <div v-else-if="selectedCont" class="flex flex-1 flex-col overflow-hidden">
                <n-flex align="center" justify="space-between" class="pb-1">
                  <span class="text-13px text-gray-400">数据快照</span>
                  <n-button size="tiny" quaternary type="primary" @click="copyText(selectedCont)">
                    复制
                  </n-button>
                </n-flex>
                <n-code :code="selectedCont" language="json" class="flex-1 overflow-auto" />
              </div>
              <n-empty v-else size="small" description="该记录无字段变更与数据快照" class="py-8" />
            </template>
            <n-empty v-else size="small" description="请选择关联记录" class="py-8" />
          </div>
        </div>
      </n-tab-pane>
      <n-tab-pane
        v-if="(formModel.files ?? []).length > 0"
        name="附件"
        :tab="`附件(${formModel.files.length})`"
      >
        <div class="mt-2 flex flex-col gap-2">
          <n-flex
            v-for="file in formModel.files"
            :key="file.file_id"
            align="center"
            justify="space-between"
            class="border border-gray-200/40 rounded-6px px-3 py-2 dark:border-gray-600/40"
          >
            <n-flex align="center" :size="8">
              <span class="font-medium">{{ file.name || `文件${file.file_id}` }}</span>
              <span class="text-12px text-gray-400">{{ fmtSize(file.size) }}</span>
              <n-tag v-if="!file.url" size="small" type="warning" :bordered="false">
                文件已删除
              </n-tag>
            </n-flex>
            <n-button v-if="file.url" size="tiny" quaternary type="primary" @click="download(file)">
              下载
            </n-button>
          </n-flex>
        </div>
      </n-tab-pane>
    </n-tabs>
  </SpModal>
</template>

<style lang="less" scoped>
.bizlog-split {
  display: flex;
  gap: 12px;
  height: calc(90vh - 235px);
  min-height: 360px;
}

.bizlog-ref-list {
  width: 320px;
  flex-shrink: 0;
  overflow-y: auto;
  padding-right: 4px;
}

.bizlog-ref-item {
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px solid transparent;
  cursor: pointer;
  margin-bottom: 6px;

  &:hover {
    background: rgba(128, 128, 128, 0.08);
  }

  &.active {
    background: rgba(128, 128, 128, 0.14);
    border-color: rgba(128, 128, 128, 0.35);
  }
}

.bizlog-change-panel {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.detail-tabs {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;

  :deep(.n-tabs-pane-wrapper),
  :deep(.n-tab-pane) {
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  :deep(.n-tab-pane) {
    display: flex;
    flex-direction: column;
  }
}
</style>
