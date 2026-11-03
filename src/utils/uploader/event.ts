/**
 * 事件处理模块
 */

import type { EventHandler } from './types'
import { each } from './utils'

/** 事件数据存储类型 */
type EventData = Record<string, EventHandler[]>

/**
 * 事件混入类
 * 提供事件订阅、取消订阅和触发功能
 */
export class EventEmitter {
  /** 事件数据存储 */
  protected _eventData: EventData | null = null

  /**
   * 订阅事件
   * @param name - 事件名称
   * @param func - 事件处理函数
   */
  on(name: string, func: EventHandler): void {
    if (!this._eventData)
      this._eventData = {}
    if (!this._eventData[name])
      this._eventData[name] = []

    let listened = false
    each(this._eventData[name], (fuc) => {
      if (fuc === func) {
        listened = true
        return false
      }
    })

    if (!listened) {
      this._eventData[name].push(func)
    }
  }

  /**
   * 取消订阅事件
   * @param name - 事件名称
   * @param func - 可选，指定要移除的处理函数，不传则清空该事件所有处理函数
   */
  off(name: string, func?: EventHandler): void {
    if (!this._eventData)
      this._eventData = {}
    if (!this._eventData[name] || !this._eventData[name].length)
      return

    if (func) {
      const handlers = this._eventData[name]!
      each(handlers, (fuc, i) => {
        if (fuc === func) {
          handlers.splice(i as number, 1)
          return false
        }
      })
    }
    else {
      this._eventData[name] = []
    }
  }

  /**
   * 触发事件
   * @param name - 事件名称
   * @param args - 事件参数
   * @returns 是否未阻止默认行为
   */
  trigger(name: string, ...args: unknown[]): boolean {
    if (!this._eventData)
      this._eventData = {}
    if (!this._eventData[name])
      return true

    let preventDefault = false
    each(this._eventData[name], (fuc) => {
      preventDefault = fuc.apply(this, args) === false || preventDefault
    })
    return !preventDefault
  }
}

/**
 * 事件模块对象（保持向后兼容）
 */
const event = {
  _eventData: null as EventData | null,

  on(this: EventEmitter, name: string, func: EventHandler): void {
    if (!this._eventData)
      this._eventData = {}
    if (!this._eventData[name])
      this._eventData[name] = []

    let listened = false
    each(this._eventData[name], (fuc) => {
      if (fuc === func) {
        listened = true
        return false
      }
    })

    if (!listened) {
      this._eventData[name].push(func)
    }
  },

  off(this: EventEmitter, name: string, func?: EventHandler): void {
    if (!this._eventData)
      this._eventData = {}
    if (!this._eventData[name] || !this._eventData[name].length)
      return

    if (func) {
      const handlers = this._eventData[name]!
      each(handlers, (fuc, i) => {
        if (fuc === func) {
          handlers.splice(i as number, 1)
          return false
        }
      })
    }
    else {
      this._eventData[name] = []
    }
  },

  trigger(this: EventEmitter, name: string, ...args: unknown[]): boolean {
    if (!this._eventData)
      this._eventData = {}
    if (!this._eventData[name])
      return true

    let preventDefault = false
    each(this._eventData[name], (fuc) => {
      preventDefault = fuc.apply(this, args) === false || preventDefault
    })
    return !preventDefault
  },
}

export default event
