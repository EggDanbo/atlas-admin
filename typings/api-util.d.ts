import type { Simplify } from 'type-fest'

declare global {
  export namespace ApiUtil {

    /**
     * 接口返回数据结构
     */
    export interface Response<T> {
      code: number
      result: T
      message: string
    }

    /**
     * 分页接口返回数据结构
     */
    export type PaginationResponse<T> = Simplify<{
      list: T[]
      page: number
      pageSize: number
      pageCount: number
      total: number
    }>

    interface PaginationParams {
      page: number
      pageSize: number
      pageCount: number
    }

    export type WithPaginationParams<T> = Simplify<T & PaginationParams>
    export type WithoutPaginationParams<T> = Simplify<Omit<T, keyof PaginationParams>>
  }
}

export {}
