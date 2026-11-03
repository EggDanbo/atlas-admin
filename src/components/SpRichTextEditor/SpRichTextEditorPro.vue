<script setup lang="tsx">
import type { WangEditorProps } from './props'
import type { ProWangEditorSlots } from './slots'
import { ProFormItem, useProField } from 'pro-naive-ui'
import SpRichTextEditor from './index.vue'
import { proWangEditorProps } from './props'

defineOptions({
  name: 'SpRichTextEditorPro',
  inheritAttrs: false,
})

const props = defineProps(proWangEditorProps)
const slots = defineSlots<ProWangEditorSlots>()

const {
  mergedReadonly,
  proFormItemProps,
  mergedFieldProps,
} = useProField<WangEditorProps>(props)

function renderComponent() {
  return (
    <ProFormItem {...proFormItemProps.value}>
      {{
        ...slots,
        default: () => {
          const disabled = mergedReadonly.value || mergedFieldProps.value.disabled
          const dom = (
            <SpRichTextEditor
              {...mergedFieldProps.value}
              disabled={disabled}
            />
          )
          return slots.input
          // eslint-disable-next-line ts/ban-ts-comment
          // @ts-expect-error
            ? slots.input({
                inputDom: dom,
                readonly: mergedReadonly.value,
                inputProps: mergedFieldProps.value,
              })
            : dom
        },
      }}
    </ProFormItem>
  )
}
</script>

<template>
  <component :is="renderComponent()" />
</template>
