/** 认证授权 */
declare namespace Auth {

  /** 角色权限模型 */
  interface Permission {
    /** 权限名称 */
    id: string
    /** 权限描述 */
    title: string
    /** 是否禁用（当前登录人无此权限时为 true，置灰不可勾选） */
    disabled?: boolean
    /** 子权限 */
    children: Permission[]
  }

  /** 验证码 */
  interface CaptchaForm {
    /** 验证码标识 */
    key?: string | null | undefined
    /** 验证码 */
    verifycode?: string | null | undefined
  }

  /** 基于账号密码方式获取API授权令牌 */
  interface PasswordTokenCommand {
    /** 用户名 */
    username: string
    /** 用户密码 */
    password: string
    /** 验证码 */
    captcha?: CaptchaForm | null | undefined
    /** 滑块验证凭证 */
    verifyToken?: string | null | undefined
  }

  /** 发送登录验证码,有效期为1分钟 */
  interface SendVerifyCodeCommand {
    /** 手机号码 */
    mobile_number?: string | null | undefined
    /** 验证码 */
    captcha?: CaptchaForm | null | undefined
    /** 滑块验证凭证 */
    verifyToken?: string | null | undefined
  }

  /** 基于短信验证码方式获取API授权令牌 */
  interface VerifyCodeTokenCommand {
    /** 手机号码 */
    mobile_number?: string | null | undefined
    /** 短信验证码 */
    password?: string | null | undefined
  }

  /** 根据授权码获取访问凭证 */
  interface LoginTokenCommand {
    /** 微信授权码 */
    code: string
    /** state */
    state: string
  }

  /** 登录绑定发送验证码,有效期为1分钟 */
  interface SendLoginVerifyCodeCommand {
    /** key */
    key: string
    /** 手机号码 */
    mobile: string
  }

  /** 生成企业号网页授权 URL */
  interface UrlForConnectOAuth2Command {
    /** 授权认证结束后重定向URL地址 */
    redirect_uri: string
  }

  /** 生成企业号扫码授权 URL */
  interface UrlForSSOQrcodeConnectCommand {
    /** 授权认证结束后重定向URL地址 */
    redirect_uri: string
  }

  /** JSSDK签名 */
  interface SignJsSdkCommand {
    /** 当前浏览的完整URL地址(注意urlencode) */
    url: string
  }

  /** 企业微信应用信息 */
  interface WechatWorkAppInfo {
    /** AppID */
    appid?: string | null | undefined
    /** agentid */
    agentid?: string | null | undefined
  }

  /** 获取当前登录用户信息 */
  interface UserCurrent {
    /** 用户ID */
    userid: string
    /** 授权认证角色 */
    authrole?: string[] | null | undefined
    /** 登录账号 */
    code?: string | null | undefined
    /** 人员名称 */
    name?: string | null | undefined
    /** 昵称 */
    nickname?: string | null | undefined
    /** 头像 */
    avatarurl?: string | null | undefined
    /** 人脸 */
    faceurl?: string | null | undefined
    /** 签名 */
    signurl?: string | null | undefined
    /** 手机号码 */
    mobile_number?: string | null | undefined
    /** 工作证号 */
    wkno?: string | null | undefined
    /** 水印开启 */
    watermark: boolean
    /** 人员类型 */
    types?: number | null | undefined
    /** 用户类型;0:内部,1:外部 */
    kind?: number | null | undefined
    /** 能否修改密码 */
    can_modify_pass: boolean
  }

  /** 我的信息 */
  interface UserProfile {
    /** 登录账号 */
    code?: string | null | undefined
    /** 人员名称 */
    name?: string | null | undefined
    /** 单位ID */
    team_id?: string | null | undefined
    /** 身份证号 */
    id_no?: string | null | undefined
    /** 单位名称 */
    team_name?: string | null | undefined
    /** 手机号码 */
    mobile_number?: string | null | undefined
    /** 人员照片Url */
    user_url?: string | null | undefined
    /** 人员照片ID */
    user_pic: string
    /** 人脸照片Url */
    face_url?: string | null | undefined
    /** 人脸照片ID */
    face_pic: string
    /** 签名图片Url */
    sign_url?: string | null | undefined
    /** 签名图片ID */
    sign_pic: string
    /** 是否工作中 */
    working?: boolean | null | undefined
    /** 工作证号 */
    wkno?: string | null | undefined
    /** 用户种类;0:内部人员,1:外部人员 */
    kind?: number | null | undefined
    /** 用户类型 */
    user_type?: number | null | undefined
  }

  /** 系统切换 */
  interface SwitchTokenCommand {
    /** 刷新令牌 */
    key: string
    /** 目标系统 */
    name: string
  }

  /** 创建展示类令牌 */
  interface ScreenTokenCommand {
    /** 目标系统 */
    name: string
  }

  /** 修改密码 */
  interface ChangePassWordCommand {
    /** 旧密码 */
    oldpassword: string
    /** 新密码 */
    newpassword: string
  }

  /** 我的信息修改 */
  interface UpdateProfileCommand {
    /** 登录账号 */
    code?: string | null | undefined
    /** 姓名 */
    name: string
    /** 单位ID */
    team_id: string
    /** 身份证号 */
    id_no?: string | null | undefined
    /** 单位名称 */
    team_name?: string | null | undefined
    /** 手机号码 */
    mobile_number: string
    /** 人员照片ID */
    user_pic?: string | null | undefined
    /** 人脸照片ID */
    face_pic?: string | null | undefined
    /** 签名图片ID */
    sign_pic?: string | null | undefined
    /** 是否工作中 */
    working: boolean
    /** 工作证号 */
    wkno?: string | null | undefined
  }

  /** 修改工作状态 */
  interface UpdateWorkingCommand {
    /** 用户列表 */
    list: string[]
    /** 是否工作中 */
    working: boolean
  }

  /** 人员照片更新 */
  interface UpdateProfilePictureCommand {
    /** 图片;0表示删除，大于0更新 */
    image_pic: string
  }

  /** 人脸照片更新 */
  interface UpdateProfileFaceCommand {
    /** 图片;0表示删除，大于0更新 */
    image_pic: string
  }

  /** 签名图片更新 */
  interface UpdateProfileSignCommand {
    /** 图片;空表示删除 */
    value: string
  }
}
