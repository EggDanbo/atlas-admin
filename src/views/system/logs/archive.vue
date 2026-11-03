<script lang="ts" setup>
import { NButton } from 'naive-ui'
import { logAccess, logApp } from '@/service/api/system'
import toast from '@/utils/toast'

const props = defineProps({
  active: {
    type: Boolean,
    default: false,
  },
  mark: {
    type: String,
    default: 'access',
  },
})

const emit = defineEmits(['update:active'])

const height = ref(330)

const showActive = ref<boolean>(false)
function showChange(show: boolean) {
  emit('update:active', show)
}
watch(
  () => props,
  () => {
    if (props.active) {
      showActive.value = props.active
      load()
    }
  },
  {
    deep: true,
  },
)

const partColumn = ref([
  {
    title: '分区名',
    key: 'table_name',
  },
  {
    title: '数据大小',
    key: 'table_size',
  },
  {
    title: '索引大小',
    key: 'idx_size',
  },
  {
    title: '操作',
    key: 'actions',
    width: 100,
    render(row) {
      return h(
        NButton,
        {
          strong: true,
          tertiary: true,
          type: 'info',
          loading: row.loading,
          size: 'small',
          onClick: () => handleArchive(row),
        },
        { default: () => '归档' },
      )
    },
  },
])

const archiveColumn = ref([
  {
    title: '归档名称',
    key: 'table_name',
  },
  {
    title: '数据大小',
    key: 'table_size',
  },
])

const partData = ref<any>()
const archiveData = ref<any>()

async function handleArchive(row) {
  toast.infoModal('确定归档吗', {
    positiveText: `确定`,
    negativeText: '取消',
    onPositiveClick: () => {
      row.loading = true
      switch (props.mark) {
        case 'access': {
          logAccess
            .archive({ name: row.table_name })
            .then(({ isSuccess }) => {
              if (!isSuccess)
                return
              toast.success('操作完成')
              load()
            })
            .finally(() => (row.loading = false))
          break
        }
        case 'app': {
          logApp
            .archive({ name: row.table_name })
            .then(({ isSuccess }) => {
              if (!isSuccess)
                return
              toast.success('操作完成')
              load()
            })
            .finally(() => (row.loading = false))
          break
        }
      }
    },
  })
}

async function load() {
  switch (props.mark) {
    case 'access': {
      const partRest = await logAccess.getPartitionList()
      partData.value = partRest.data || []

      const archiveRes = await logAccess.archiveList()
      archiveData.value = archiveRes.data || []
      break
    }
    case 'app': {
      const partRest = await logApp.getPartitionList()
      partData.value = partRest.data || []

      const archiveRes = await logApp.archiveList()
      archiveData.value = archiveRes.data || []
      break
    }
  }
}
</script>

<template>
  <n-drawer v-model:show="showActive" :width="680" @update:show="showChange">
    <n-drawer-content closable>
      <template #header>
        日志归档
      </template>
      <n-alert title="归档提示" type="info">
        数据越大时间执行越长
      </n-alert>
      <n-tabs type="line" animated>
        <n-tab-pane name="part" tab="分区列表">
          <n-data-table
            :bordered="false"
            :single-line="false"
            :virtual-scroll="true"
            style="height: calc(100vh - 230px)"
            flex-height
            :columns="partColumn"
            :data="partData"
          />
        </n-tab-pane>
        <n-tab-pane name="archive" tab="归档列表">
          <n-data-table
            :bordered="false"
            :single-line="false"
            :virtual-scroll="true"
            :style="{ height: `${height}px` }"
            flex-height
            :columns="archiveColumn"
            :data="archiveData"
          />
        </n-tab-pane>
      </n-tabs>
    </n-drawer-content>
  </n-drawer>
</template>
