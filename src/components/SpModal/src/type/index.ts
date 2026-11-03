import type { SpModalProps } from '../props'

/**
 * @description: 弹窗对外暴露的方法
 */
export interface ModalInst {
  loading: Ref<boolean>
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
   * @param status 是否加载中
   */
  setLoading: (status: boolean) => void
}

export interface OpenModal {
  /**
   * 打开模态框
   */
  open: (params?: Recordable) => void
}

export type ModalProps = SpModalProps

export type RegisterFn = (ModalInstance: ModalInst) => void

export type UseModalReturnType = [RegisterFn, ModalInst]
