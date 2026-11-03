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
  <SpModal ref="modalRef" width="800" :mask="true" :draggable="true" title="软件使用协议">
    <template #default>
      <div class="w-full flex justify-between text-sm">
        <div style="max-height: 600px; padding: 15px; overflow-y: auto">
          <p>更新日期：2022年12月8日</p>
          <p>生效日期：2022年12月8日</p>
          <p class="mb-4 mt-4">
            欢迎您使用本软件。
          </p>
          <p>
            请您仔细阅读以下条款，如果您对本协议的任何条款表示异议，您可以选择不登录。当您登录进入，均意味着您（即“用户”）完全接受本协议项下的全部条款。
          </p>
          <p class="mb-2 mt-4 font-bold">
            使用规则
          </p>
          <dl style="line-height: 2">
            <dd>
              1、您确认，在您开始使用本软件时，已经具备中华人民共和国法律规定的与您行为相适应的民事行为能力。
            </dd>
            <dd>
              2、用户的帐号和密码由用户负责保管，用户不应将账号或密码告知第三方，或者将其帐号、密码转让、出借予他人使用或与第三方共用。如用户发现其帐号遭他人非法使用，应立即通知本软件，因黑客行为或用户的保管疏忽等非本软件原因导致帐号、密码遭他人非法使用或无法正常使用的，本软件不承担任何责任；用户应当对以其用户帐号进行的所有活动和事件负法律责任。
            </dd>
            <dd>
              3、用户须对在本软件中的信息真实性、合法性、有效性承担全部责任，用户不得冒充他人；否则本软件有权立即停止提供服务、禁用其帐号并由用户独自承担由此而产生的一切法律责任。
            </dd>
            <dd>
              4、用户直接或通过各类方式间接使用本软件服务和数据的行为，都将被视作已无条件接受本协议全部内容；若用户对本协议的任何条款存在异议，请停止使用本软件所提供的服务。
            </dd>
            <dd>
              5、用户承诺不得以任何方式利用本软件直接或间接从事违反中国法律以及社会公德的行为，本软件有权对违反上述承诺的内容予以删除。
            </dd>
            <dd>
              6、用户不得利用本软件制作、上载、复制、发布、传播或者转载如下内容：
              <ul style="padding-left: 2em; list-style-position: inside; list-style-type: disc">
                <li>反对宪法所确定的基本原则的；</li>
                <li>危害国家安全，泄露国家秘密，颠覆国家政权，破坏国家统一的；</li>
                <li>损害国家荣誉和利益的；</li>
                <li>煽动民族仇恨、民族歧视，破坏民族团结的；</li>
                <li>破坏国家宗教政策，宣扬邪教和封建迷信的；</li>
                <li>散布谣言，扰乱社会秩序，破坏社会稳定的；</li>
                <li>散布淫秽、色情、赌博、暴力、凶杀、恐怖或者教唆犯罪的；</li>
                <li>侮辱或者诽谤他人，侵害他人合法权益的；</li>
                <li>含有法律、行政法规禁止的其他内容的信息。</li>
              </ul>
            </dd>
          </dl>
          <p class="mb-2 mt-4 font-bold">
            免责申明
          </p>
          <dl style="line-height: 2">
            <dd>
              1、用户在使用本软件时发表的内容仅表明其个人的立场和观点，并不代表本软件的立场或观点。作为内容的发表者，需自行对所发表内容负责，因所发表内容引发的一切纠纷，由该内容的发表者承担全部法律及连带责任。本软件不承担任何法律及连带责任。
            </dd>
            <dd>
              2、对于因不可抗力或本软件不能控制的原因造成的网络服务中断或其它缺陷，本软件不承担任何责任，但将尽力减少因此而给用户造成的损失和影响。
            </dd>
          </dl>
          <p class="mb-2 mt-4 font-bold">
            协议修改
          </p>
          <dl style="line-height: 2">
            <dd>
              1、根据互联网的发展和有关法律、法规及规范性文件的变化，或者因业务发展需要，本软件有权对本协议的条款作出修改或变更，一旦本协议的内容发生变动，本软件将公布修改之后的协议内容，该公布行为视为本软件已经通知用户修改内容。
            </dd>
            <dd>
              2、如果不同意本软件对本协议相关条款所做的修改，用户有权并应当停止使用本软件。如果用户继续使用本软件，则视为用户接受本软件对本协议相关条款所做的修改。
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
          :href="`${getApiBaseUrl()}/template/软件使用协议.pdf`"
          target="_blank"
        >
          下载软件使用协议
        </n-button>
      </n-flex>
    </template>
  </SpModal>
</template>
