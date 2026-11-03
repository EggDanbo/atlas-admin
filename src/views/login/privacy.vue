<script setup lang="ts">
import type { ModalInst, OpenModal } from '@/components/SpModal'
import { getApiBaseUrl } from '@/hooks/setting'

const modalRef = ref<ModalInst>()

const exposed: OpenModal = {
  open: () => {
    modalRef.value?.open()
  },
}

defineExpose(exposed)
</script>

<template>
  <SpModal ref="modalRef" width="800" :mask="true" :draggable="true" title="用户隐私政策">
    <template #default>
      <div class="w-full flex justify-between text-sm">
        <div style="max-height: 600px; padding: 15px; overflow-y: auto">
          <p>更新日期：2022年12月8日</p>
          <p>生效日期：2022年12月8日</p>
          <p class="mb-4 mt-4">
            欢迎您使用本软件。
          </p>
          <p>
            我们深知个人信息对您的重要性，同时我们也非常重视您的隐私保护和个人信息保护。您在使用本软件时，我们可能会收集和使用您的相关个人信息，请您在使用本软件前，仔细阅读并充分理解本隐私政策。
          </p>
          <p class="mt-2">
            本隐私政策适用于提供本演示系统的示例运营方（以下简称“我们”）。
          </p>
          <p class="mt-2">
            本隐私政策将帮助您了解以下内容：
          </p>
          <dl class="mt-2" style="line-height: 2">
            <dd>一、我们如何收集和使用个人信息</dd>
            <dd>二、我们如何保存及保护您的个人信息</dd>
            <dd>三、管理您的个人信息</dd>
            <dd>四、隐私政策的修订和通知</dd>
            <dd>五、联系我们</dd>
          </dl>
          <p class="mb-2 mt-4 font-bold">
            一、我们如何收集和使用个人信息
          </p>
          <dl style="line-height: 2">
            <dd>在您使用我们的软件时，我们将基于以下基本功能收集您的相关必要个人信息。</dd>
            <dd>
              在您使用软件前，由贵单位提供您的手机号、姓名、性别、所在部门等个人信息并导入软件，收集这些信息是为了帮助您完成账号的登记。
            </dd>
            <dd>
              若您在企业微信中使用我们的服务，我们会根据您的授权获取采集您的手机、姓名、性别、所在部门。
            </dd>
            <dd>
              为了确保账号安全和落实网络实名制，在您使用其他方式关联登录、使用我们的软件时，您仍然需要绑定有效的手机号码。收集这些信息是为了对您进行实名验证，如果您拒绝提供这些信息，将影响您使用我们的软件。
            </dd>
          </dl>
          <p class="mb-2 mt-4 font-bold">
            二、我们如何保存及保护您的个人信息
          </p>
          <dl style="line-height: 2">
            <dd>
              <p class="mb-2 font-bold">
                （一）个人信息的存储
              </p>
              我们依照法律法规的规定，将您的个人信息存储于中华人民共和国境内，我们不会跨境传输或存储您的个人信息。我们仅在本隐私政策所述目的所必需的期间内保留您的个人信息，超出必要期限后，我们会将您的个人信息删除或做匿名化处理。
            </dd>
            <dd>
              <p class="mb-2 mt-2 font-bold">
                （二）个人信息的保护措施
              </p>
              我们已采取符合业界标准、合理可行的安全防护措施保护您的信息，防止个人信息遭到未经授权访问、公开披露、使用、修改、损坏或丢失。例如，我们的网络服务采取了传输层安全协议等加密技术，通过https等方式提供浏览服务，确保用户个人信息在传输过程中的安全；通过采取加密技术对用户个人信息进行加密保存；设立严格的数据使用和访问制度，确保只有授权人员才可访问您的个人信息。<br>
              尽管已经采取了上述合理有效措施，并已经遵守了相关法律规定要求的标准，但请您理解，由于技术的限制以及可能存在的各种恶意手段，即便竭尽所能加强安全措施，也不可能始终保证信息百分之百的安全，我们将尽力确保您提供给我们的个人信息的安全性。<br>
              您需要了解，您接入我们的服务所用的系统和通讯网络，有可能因我们可控范围外的因素而出现问题。因此，我们强烈建议您采取积极措施保证个人信息的安全，例如定期修改账号密码，不将自己的账号密码等个人信息透露给他人。<br>
              若不幸发生个人信息安全事件，我们将按照法律法规的要求，及时向您告知：安全事件的基本情况和可能的影响、我们已经采取或将要采取的处置措施、您可自主防范和降低风险的建议、对您的补救措施。<br>
              我们提供的个人信息保护措施仅适用于我们的服务。您一旦离开我们服务，我们将没有能力及义务保护您在我们服务以外的任何个人信息。
            </dd>
          </dl>
          <p class="mb-2 mt-4 font-bold">
            三、管理您的个人信息
          </p>
          <dl style="line-height: 2">
            <dd>
              我们非常重视您对个人信息的管理，并尽全力保障您对于个人信息的访问、更正、删除以及注销帐号的相关权利，使您拥有充分的能力维护您的隐私和个人信息安全。
            </dd>
            <dd>
              <p class="mb-2 mt-2 font-bold">
                （一）访问和修改您的个人信息
              </p>
              您在登录软件后，可以通过我们【个人设置】查看、修改您提交给我们的个人信息。您也可以通过【个人设置】完善或修改其他个人信息。
            </dd>
            <dd>
              <p class="mb-2 mt-2 font-bold">
                （二）删除您的个人信息
              </p>
              您可以通过本隐私政策公布的联系方式与我们联系，向我们提出删除您的个人信息的请求。
            </dd>
          </dl>
          <p class="mb-2 mt-4 font-bold">
            四、隐私政策的修订和通知
          </p>
          <dl style="line-height: 2">
            <dd>
              为给您提供更好的服务以及随着我们业务的发展，本隐私政策也会随之更新。未经您明确同意，我们不会削减您依据当前生效的本隐私政策所应享受的权利。对于重大变更，我们还会提供更为显著的通知。
            </dd>
          </dl>
          <p class="mb-2 mt-4 font-bold">
            五、联系我们
          </p>
          <dl style="line-height: 2">
            <dd>
              如您对本隐私政策或相关事宜有任何疑问、意见或建议，您可随时通过登录页面的技术支持电话进行反馈。一般情况下，我们将在收到问题、意见或建议，并验证您的身份后，于15个工作日内进行回复。
            </dd>
          </dl>
        </div>
      </div>
    </template>

    <template #footer>
      <n-flex justify="end">
        <n-button @click="modalRef?.close">
          关闭
        </n-button>
        <n-button
          type="primary"
          tag="a"
          :href="`${getApiBaseUrl()}/template/用户隐私政策.pdf`"
          target="_blank"
        >
          下载用户隐私政策
        </n-button>
      </n-flex>
    </template>
  </SpModal>
</template>
