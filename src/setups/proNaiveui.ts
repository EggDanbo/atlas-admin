import type { App } from 'vue'
import { create, ProCheckbox, ProCheckboxGroup, ProDate, ProDateTime, ProDigit, ProInput, ProRadioGroup, ProSelect } from 'pro-naive-ui'

export function setupProNaiveui(app: App<Element>) {
  app.use(create({
    components: [
      ProInput,
      ProSelect,
      ProDate,
      ProDateTime,
      ProDigit,
      ProCheckbox,
      ProCheckboxGroup,
      ProRadioGroup,
    ],
  }))
}
