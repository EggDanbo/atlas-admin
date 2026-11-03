export type StyleMode = 'none' | 'box' | 'panel'
export type HeightMode = 'auto' | 'fill'

export interface LayoutConfig {
  styleMode?: StyleMode
  heightMode?: HeightMode
  showFooter?: boolean
}
