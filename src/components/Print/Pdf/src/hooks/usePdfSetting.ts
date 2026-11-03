import printJS from 'print-js'
import { reactive, ref } from 'vue'
import { print } from '@/service/api/misc'

import token from '@/utils/token'

export function usePdfSetting() {
  const defModel = () =>
    ({
      name: '',
      printer: '',
      paper_direction: false,
      paper_type: 'A4',
      paper_width: 0,
      paper_height: 0,
      double_printed: false,
      double_printed_left: 28,
      group_seq: true,
      page_start: 1,
      columns: 0,
    }) as Print.Setting

  const formModel = reactive(defModel())

  const pagesModel = ref<Print.PdfPageSize[]>([])

  function preview(url: string) {
    const accessToken = token.get()?.access_token
    if (!accessToken)
      return

    const separator = url.includes('?') ? '&' : '?'
    const finalUrl = `${url}${separator}access_token=${accessToken}`
    printJS({
      printable: finalUrl,
      type: 'pdf',
      showModal: true,
      modalMessage: '文档下载中...',
    })
  }

  async function bind(name: string) {
    const { isSuccess, data } = await print.getSetting(name)
    if (isSuccess) {
      Object.assign(formModel, defModel(), data)
    }
    else {
      Object.assign(formModel, defModel())
    }
    formModel.name = name
  }

  async function save() {
    await print.saveSetting(formModel)
  }

  async function loadPages() {
    const { isSuccess, data } = await print.getPages()
    if (isSuccess) {
      pagesModel.value = data
    }
  }

  return { formModel, pagesModel, save, bind, preview, loadPages }
}
