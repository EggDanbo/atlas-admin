<script lang="ts" setup>
import type { ImageProps } from 'naive-ui/lib/image/src/image'
import type { SpaceProps } from 'naive-ui/lib/space/src/Space'
import type { PropType } from 'vue'
import { computed } from 'vue'
import { fullImgUrl } from '..'

const props = defineProps({
  imgList: {
    type: Array as PropType<string[]>,
    default: () => [],
  },
  imageProps: {
    type: Object as PropType<ImageProps>,
    default: () => ({
      width: 50,
    }),
  },
  spaceProps: {
    type: Object as PropType<SpaceProps>,
  },
})

const getImgList = computed(() => props.imgList.map((item: string) => fullImgUrl(item)))
</script>

<template>
  <n-image-group>
    <n-space v-bind="props.spaceProps">
      <n-image
        v-for="(item, index) in getImgList"
        v-bind="props.imageProps"
        :key="index"
        :src="item"
        class="rounded"
      />
    </n-space>
  </n-image-group>
</template>
