import 'alova'

declare global {
  interface Fn<T = any, R = T> {
    (...arg: T[]): R
  }

  interface PromiseFn<T = any, R = T> {
    (...arg: T[]): Promise<R>
  }

  type RefType<T> = T | null

  type LabelValueOptions = {
    label: string
    value: any
    disabled: boolean
    [key: string]: string | number | boolean
  }[]

  type EmitType = (event: string, ...args: any[]) => void

  type TargetContext = '_self' | '_blank'

  interface ComponentElRef<T extends HTMLElement = HTMLDivElement> {
    $el: T
  }

  type ComponentRef<T extends HTMLElement = HTMLDivElement> = ComponentElRef<T> | null

  type WithFalse<T> = T | false

  type CustomRender = VueNode
}

// declare module 'alova' {
//   export interface AlovaCustomTypes {
//     meta: {
//       /**
//        * 返回原生响应头
//        */
//       isReturnNativeResponse: boolean
//       /**
//        * 是否转换响应数据
//        */
//       isTransformResponse: boolean
//     }
//   }
// }

export {}
