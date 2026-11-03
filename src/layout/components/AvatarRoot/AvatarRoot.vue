<script lang="ts" setup>
import { Icon } from '@iconify/vue'
import team from '@/service/api/organ/team'
import { useUserStore } from '@/store/modules/user'
import { tenantStorage } from '@/utils/tenant'

const ChangePassword = defineAsyncComponent(
  () => import('./ChangePassword.vue'),
)

const userStore = useUserStore()
const Dialog = useDialog()
const Message = useMessage()

const changePasswordRef = ref()
const tenantList = ref<{ value: string, label: string, select: boolean }[]>([])
const tenantName = ref('请选择组织机构')

// 加载租户列表
async function loadTenantList() {
  const { isSuccess, data } = await team.getTenantList()
  if (isSuccess && data) {
    tenantList.value = data as { value: string, label: string, select: boolean }[]

    const savedId = tenantStorage.get()
    if (savedId) {
      // 恢复上次选择
      const matched = tenantList.value.find(t => t.value === savedId)
      if (matched)
        tenantName.value = matched.label
    }
    else {
      if (tenantList.value.length === 1) {
        // 只有一个租户时，自动选择第一个
        tenantName.value = tenantList.value[0].label
        tenantStorage.set(tenantList.value[0].value)
      }
      else {
        // 默认所属租户
        const matched = tenantList.value.find(t => t.select === true)
        if (matched) {
          tenantName.value = matched.label
          tenantStorage.set(matched.value)
        }
      }
    }
  }
}

// 选择租户
const showPopover = ref(false)
function handleTenantSelect(item: { label: string, key: string }) {
  const savedId = tenantStorage.get()
  if (savedId === item.key) {
    showPopover.value = false
    return
  }

  tenantName.value = item.label
  tenantStorage.set(item.key)
  window.location.reload()
}

onMounted(() => {
  loadTenantList()
})

// 退出登录
function toLogout() {
  Dialog.warning({
    title: '系统提示',
    content: '确定要退出登录吗?',
    positiveText: '确定',
    negativeText: '取消',
    style: 'width: 370px',
    onPositiveClick: async () => {
      await userStore.logout().then(() => {
        Message.success('退出成功')
      })
      userStore.logoutRedirect()
    },
    onNegativeClick: () => {},
  })
}
</script>

<template>
  <n-tag type="primary" round class="avatar-tag">
    <template #default>
      <!-- 主管单位选择 -->
      <n-popover v-if="tenantList.length > 0" v-model:show="showPopover" trigger="hover" placement="bottom-end">
        <template #trigger>
          {{ tenantName }}
        </template>

        <div class="menu-container">
          <div v-for="(item, key) in tenantList.map(t => ({ key: t.value, label: t.label }))" :key="key" class="menu-item" @click="handleTenantSelect(item)">
            <span style="font-size: 16px;">{{ item.label }}</span>
          </div>
        </div>

        <template #footer>
          <n-gradient-text :size="16" type="danger">
            切换前请确认没有未保存的操作
          </n-gradient-text>
        </template>
      </n-popover>
      <span v-if="tenantList.length > 0" style="margin: 0 5px">/</span>
      <!-- 用户菜单 -->
      <n-popover trigger="hover" placement="bottom-end">
        <template #trigger>
          {{ userStore.userInfo?.name }}
        </template>

        <div class="menu-container">
          <!-- 个人中心 -->
          <div
            class="menu-item"
            :class="{ 'is-disabled': userStore.isAdmin }"
            @click="!userStore.isAdmin && $router.push('/user/center')"
          >
            <n-icon size="16">
              <Icon icon="ant-design:user-outlined" />
            </n-icon>
            <span>个人中心</span>
          </div>

          <!-- 修改密码 -->
          <div
            class="menu-item"
            :class="{ 'is-disabled': userStore.isAdmin }"
            @click="!userStore.isAdmin && changePasswordRef.open()"
          >
            <n-icon size="16">
              <Icon icon="ant-design:lock-outlined" />
            </n-icon>
            <span>修改密码</span>
          </div>

          <n-divider class="!my-2" dashed />

          <!-- 退出登录 -->
          <div class="menu-item is-logout" @click="toLogout">
            <n-icon size="16">
              <Icon icon="ant-design:logout-outlined" />
            </n-icon>
            <span>退出登录</span>
          </div>
        </div>
      </n-popover>
    </template>
    <template #avatar>
      <n-icon size="18" style="margin-left: 2px">
        <Icon icon="ant-design:user-outlined" />
      </n-icon>
    </template>
  </n-tag>

  <!-- 修改密码 -->
  <ChangePassword ref="changePasswordRef" />
</template>

<style lang="less" scoped>
.avatar-tag {
  cursor: pointer;

  &:hover {
    box-shadow: 0 0 6px rgba(0, 0, 0, 0.1);
  }
}

.menu-container {
  min-width: 120px;
  padding: 4px 0;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s ease;
  font-size: 14px;

  &:hover:not(.is-disabled) {
    background-color: rgba(0, 0, 100, 0.03);
  }

  &.is-disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  &.is-logout {
    color: var(--n-text-color);
    &:hover {
      background-color: rgba(255, 0, 0, 0.08);
      color: #d03050;
    }
  }
}

html[data-vxe-ui-theme='dark'] {
  .menu-item {
    &:hover:not(.is-disabled) {
      background-color: rgba(255, 255, 255, 0.05);
    }

    &.is-logout {
      color: var(--n-text-color);
      &:hover {
        background-color: rgba(255, 0, 0, 0.08);
        color: #d03050;
      }
    }
  }
}
</style>
