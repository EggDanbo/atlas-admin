import type { ExtractPublicPropTypes } from 'vue'
import type { basicCardProps, cardExtendProps } from '@/components/Card/src/props.ts'

export type BasicCardProps = ExtractPublicPropTypes<typeof basicCardProps>
export type CardExtendProps = ExtractPublicPropTypes<typeof cardExtendProps>
