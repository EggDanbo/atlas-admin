import type { Ref } from 'vue'
import type { ModalInst, ModalProps } from '@/components/SpModal/src/type'
import { shallowRef } from 'vue'

export interface UseModalReturnType {
  /**
   * 注册模态框实例
   * @param modalInstance 模态框实例
   */
  register: (modalInstance: ModalInst) => void
  modalRef: Ref<ModalInst | null>
  /**
   * 打开模态框
   */
  open: () => void
  /**
   * 关闭模态框
   */
  close: () => void
  /**
   * 设置模态框属性
   * @param props 新的属性
   */
  setProps: (props: Partial<ModalProps>) => void
  /**
   * 设置加载状态
   * @param loading 是否加载中
   */
  setLoading: (loading: boolean) => void
}

/**
 * 简化版的模态框 hook，只负责与 NaModal 组件的绑定关联
 * @param props 初始属性
 * @returns [RegisterFn, UseModalReturnType] 数组解构形式的返回值
 */
export function useModal(props?: Partial<ModalProps>): [RegisterFn, UseModalReturnType] {
  // 使用 shallowRef 避免深层响应式带来的性能问题
  const modalRef = shallowRef<ModalInst | null>(null)

  /**
   * 注册模态框实例
   * @param modalInstance 模态框实例
   */
  const register = (modalInstance: ModalInst) => {
    modalRef.value = modalInstance
    modalInstance.setProps(props || {})
  }

  /**
   * 打开模态框
   */
  const open = () => {
    modalRef.value?.open()
  }

  /**
   * 关闭模态框
   */
  const close = () => {
    modalRef.value?.close()
  }

  /**
   * 设置模态框属性
   * @param newProps 新的属性
   */
  const setProps = (newProps: Partial<ModalProps>) => {
    modalRef.value?.setProps(newProps)
  }

  /**
   * 设置加载状态
   * @param loading 是否加载中
   */
  const setLoading = (loading: boolean) => {
    modalRef.value?.setLoading(loading)
  }

  // 构造返回对象
  const methods: UseModalReturnType = {
    register,
    modalRef,
    open,
    close,
    setProps,
    setLoading,
  }

  // 返回 [RegisterFn, UseModalReturnType] 的数组形式
  return [register, methods]
}

// 导出注册函数类型
export type RegisterFn = (modalInstance: ModalInst) => void
