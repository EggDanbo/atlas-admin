<script lang="ts" setup>
import type { LocaleType } from '../../../../typings/config'
import { NaIconBtn } from '@/components/IconBtn'
import { localeList } from '@/config/locale'
import { useLocale } from '@/locales/useLocale'
import { useTitle } from '@/router/helper/useTitle.ts'

const { getLocale, changeLocale } = useLocale()
const { updateTitle } = useTitle()

// 语言切换
async function languageSelect(key: LocaleType) {
  await changeLocale(key)
  updateTitle()
}
</script>

<template>
  <n-dropdown v-model:value="getLocale" :options="localeList" class="locale-dropdown" trigger="click" @select="languageSelect">
    <NaIconBtn icon="ant-design:global-outlined" />
  </n-dropdown>
</template>
