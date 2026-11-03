export function useFormValid(formRef: Ref<any>) {
  async function validForm() {
    const form = unref(formRef)
    if (!form)
      return
    try {
      await form.validate()
      return true
    }
    catch {
      return false
    }
  }

  function resetForm() {
    const form = unref(formRef)
    if (!form)
      return
    form.restoreValidation && form.restoreValidation()
  }

  return { validForm, resetForm }
}
