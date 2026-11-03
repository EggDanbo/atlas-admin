<script lang="tsx">
import { defineComponent } from 'vue'

const props = {
  value: { type: Object },
}
export default defineComponent({
  name: 'SpRender',
  props,
  setup(props) {
    return () => {
      const { value } = props
      return <>{value}</>
    }
  },
})
</script>
