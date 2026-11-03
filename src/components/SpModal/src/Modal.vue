<script  lang="tsx">
import type { SlotsType } from 'vue'
import type { SpModalProps } from './props'
import type { ModalSlots } from './slots'
import type { ModalInst, ModalProps } from './type'
import { NButton, NFlex } from 'naive-ui'
import { VxeModal } from 'vxe-pc-ui'
import { modalExtendProps } from './props'

const name = 'SpModal'
export default defineComponent({
  name,
  props: modalExtendProps,
  emits: ['ok', 'cancel', 'update:show', 'register'],
  slots: Object as SlotsType<ModalSlots>,
  setup(props: SpModalProps, { emit, slots, expose }) {
    const modalRef = ref<any>()
    const show = ref(false)
    const confirmLoading = ref(false)
    const innerPropsRef = ref<null | Partial<ModalProps>>(null)

    function open() {
      show.value = true
    }

    function close() {
      show.value = false
      // 关闭时重置 loading 状态
      confirmLoading.value = false
      onClose()
    }

    function onClose() {
      if (props.beforeClose) {
        props.beforeClose()
      }
    }

    /**
     * 取消事件
     */
    const handleCancel = () => {
      close()
      emit('cancel')
      emit('update:show', false)
    }

    const handleOk = async () => {
      confirmLoading.value = true

      // 创建一个 Promise 来处理外部操作
      const promise = new Promise((resolve, reject) => {
        // 定义完成回调
        const done = (closeModal = true) => {
          confirmLoading.value = false
          if (closeModal) {
            close()
            emit('update:show', false)
          }
          resolve(closeModal)
        }

        // 定义错误回调
        const fail = (reason?: any) => {
          confirmLoading.value = false
          reject(reason)
        }

        emit('ok', {
          done,
          fail,
          resolve: (value?: any) => done(value !== false),
          reject: fail,
        })
      })

      // 添加 catch 保护，确保 loading 一定会被清除
      promise.catch((e) => {
        confirmLoading.value = false
        console.error('[SpModal] ok error:', e)
      })

      return promise
    }

    const mergeProps = computed(() => {
      return {
        ...props,
        ...unref(innerPropsRef),
      }
    })

    const modalProps = computed(() => {
      const { okText, cancelText, enabledOk, showOk, showCancel, enabledPadding, beforeClose, ...rest }
        = mergeProps.value as ModalProps
      return {
        ...rest,
      }
    })

    const CancelBtn = (
      <NButton
        onClick={handleCancel}
      >
        {{
          default: () => props.cancelText || '取消',
        }}
      </NButton>
    )

    const OkBtn = computed(() => (
      <NButton
        type="primary"
        loading={confirmLoading.value}
        disabled={mergeProps.value.enabledOk === false}
        onClick={handleOk}
      >
        {{
          default: () => mergeProps.value.okText || '确定',
        }}
      </NButton>
    ))

    /**
     * 自定义 Footer
     */
    const customFooter = computed(() => (
      <NFlex justify="end">
        {mergeProps.value.showCancel !== false ? CancelBtn : null}
        {mergeProps.value.showOk ? OkBtn.value : null}
      </NFlex>
    ))

    const defaultSlot = computed(() => slots.default ? slots.default() : null)
    const titleSlot = computed(() => slots.title ? slots.title() : null)
    const headerSlot = computed(() => slots.header ? slots.header() : null)
    const footerSlot = computed(() => slots.footer ? slots.footer() : customFooter.value)

    /**
     * 自定义 default
     */
    const wrapDefault = computed(() => (
      <div class={mergeProps.value.enabledPadding === true ? 'modal-padding' : undefined}>
        {defaultSlot.value}
      </div>
    ))

    /**
     * 自定义 foooter
     */
    const wrapFooter = computed(() => (
      <div class={mergeProps.value.enabledPadding === true ? 'modal-padding' : undefined}>
        {footerSlot.value}
      </div>
    ))

    const exposed: ModalInst = {
      loading: confirmLoading,
      open,
      close,
      setProps: (props: Partial<ModalProps>) => {
        // 使用简单展开代替 deepMerge，避免函数被错误合并
        innerPropsRef.value = {
          ...unref(innerPropsRef),
          ...props,
        } as Partial<ModalProps>
      },
      setLoading: (loading: boolean) => {
        confirmLoading.value = loading
      },
    }

    // 在组件挂载后发出 register 事件
    onMounted(() => {
      emit('register', exposed)
    })

    expose(exposed)
    return () => (
      <VxeModal
        ref={modalRef}
        {...modalProps.value}
        padding={false}
        v-model={show.value}
        onClose={onClose}
      >
        {{
          default: () => wrapDefault.value,
          ...(titleSlot.value && { title: () => titleSlot.value }),
          ...(headerSlot.value && { header: () => headerSlot.value }),
          ...(footerSlot.value && { footer: () => wrapFooter.value }),
        }}
      </VxeModal>
    )
  },
})
</script>
