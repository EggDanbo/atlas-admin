export const projectConfig = {
  /**
   * 项目配置
   */
  app: {
    /**
     * 应用标题
     */
    title: '一体化管理系统',
    /**
     * 应用描述
     */
    description: '一体化管理系统',
    /**
     * 关键词
     */
    keywords: '管理系统',
    /**
     * 宣传语
     */
    tagline: '',
    /**
     * token 名称
     */
    tokenField: 'TOKEN',
    /**
     * UI组件库 内部所有组件的类的前缀
     */
    clsPrefix: 'n',
  },
  /**
   * 系统配置
   */
  system: {
    /**
     * 菜单权限模式 FIXED 前端固定路由  BACK 动态获取
     */
    permissionMode: 'FIXED',
    /**
     * 路由动画类型 zoom-fade 渐变 zoom-out 闪现 fade-slide 滑动 fade 消退 fade-bottom 底部消退 fade-scale 缩放消退
     */
    pageAnimateType: 'fade',
    /**
     * 是否开启页面切换动画
     */
    pageAnimate: true,
    /**
     * 侧边栏宽度
     */
    sidebarWidth: 224,
    /**
     * 导航栏高度
     */
    navHeight: 56,
    /**
     * 标签栏高度
     */
    tabbarHeight: 47,
    /**
     * 布局模式
     * vertical 垂直布局 horizontal 水平布局 two-column 双栏布局
     * mixed-two-column 混合双栏布局 sidebar 侧边栏布局 mixed-sidebar 混合侧边栏布局
     */
    mode: 'vertical',
    /**
     * 页脚高度
     */
    footerHeight: 70,
    /**
     * 折叠侧边栏
     */
    collapsed: false,
    /**
     * 显示侧边栏
     */
    showSidebar: true,
    /**
     * 侧边栏菜单开启手风琴模式
     */
    sidebarMenuAccordion: true,
    /**
     * 显示顶栏
     */
    showNav: true,
    /**
     * 顶栏是否固定
     */
    navFixed: true,
    /**
     * 显示页签
     */
    showTabbar: true,
    /**
     * 显示页签图标
     */
    showTabbarIcon: false,
    /**
     * 页签风格 card 卡片 google 谷歌 simple 简约
     */
    tabbarStyle: 'simple',
    /**
     * 显示全屏
     */
    showFullScreen: false,
    /**
     * 显示主题切换
     */
    showThemeToggle: true,
    /**
     * 显示侧边栏折叠
     */
    showSidebarCollapsed: true,
    /**
     * 显示刷新按钮
     */
    showFlushed: true,
    /**
     * 显示页脚
     */
    showFooter: false,
    /**
     * 偏好设置位置  fixed 固定悬浮，nav 顶栏 none 隐藏
     */
    preferencesLocation: 'none',
    /**
     * 页脚是否固定
     */
    footerFixed: false,
    /**
     * 显示 logo
     */
    showLogo: true,
    /**
     * 是否为移动端
     */
    isMobile: false,
    /**
     * 放大Logo显示
     */
    logoLarge: false,
    /**
     * 间隙布局
     */
    intervalLayout: true,
    /**
     * 菜单分组
     */
    sidebarMenuGroup: false,
    /**
     * 菜单分割线
     */
    sidebarMenuDivider: false,
    /**
     * 侧边栏折叠后的宽度
     */
    sidebarCollapsedWidth: 64,
    /**
     * 侧边栏折叠后是否显示菜单名
     */
    sidebarCollapsedShowMenuTitle: true,
    /**
     * 当展示菜单标题时，侧边栏折叠后的宽度
     */
    sidebarCollapsedWidthWhenShowMenuTitle: 90,
    /**
     * 隐藏布局边框
     */
    hideLayoutBorder: false,
    /**
     * 圆角
     * --border-radius 默认 0.5rem
     */
    borderRadius: 0.25,
    /**
     * 动态标题
     * 显示格式为：当前路由标题 - 网站名称，关闭：显示网站名称
     */
    dynamicTitle: false,
    /**
     * 开启水印
     */
    openWatermark: false,
    /**
     * 显示面包屑
     */
    showBreadcrumb: true,
    /**
     * 显示面包屑图标
     */
    showBreadcrumbIcon: false,
    /**
     * 显示多语言
     */
    showLanguage: false,
    /**
     * 切换页面显示 loading
     */
    pageLoading: true,
    /**
     * 切换页面显示 进度条
     */
    pageProgress: true,
    /**
     * 显示消息通知
     */
    showInformation: true,
  },
  /**
   * 主题配置
   */
  theme: {
    /**
     * 主题模式 light 浅色 dark（需关闭主题皮肤） 深色 auto 自动
     */
    mode: 'auto',
    /**
     * 主题主色（品牌橙）
     */
    primaryColor: '#F97316',
    /**
     * 是否为灰色模式
     */
    grayscale: false,
    /**
     * 是否为色弱模式
     */
    colorWeakness: false,
    /**
     * 侧边栏主题 light 浅色 dark 深色 primary 主题色
     */
    sidebarTheme: 'light',
    /**
     * 顶栏主题 light 浅色 dark 深色 primary 主题色
     */
    navTheme: 'light',
    /** 主题风格 类型 'pure' | 'skin'  */
    themeType: 'pure',
    /** 主题皮肤 类型 参考 src\layout\components\Preferences\components\Skin.vue */
    themeSkin: 'blue-sky',
    /** 顶栏透明 */
    headerLucency: false,
    /** 侧边栏透明 */
    sidebarLucency: false,
    /** 内容透明 */
    containerLucency: false,
  },
  /**
   * 登录页配置
   */
  login: {
    /**
     * 是否开启鼠标视差倾斜效果（触屏设备自动禁用）
     */
    parallax: true,
    /**
     * 视差倾斜强度（度），推荐 10
     */
    parallaxStrength: 10,
    /**
     * 是否开启粒子发光背景
     */
    particles: true,
  },
  /**
   * http 请求状态码
   */
  httpStatus: {
    /**
     * 请求成功
     */
    success: 0,
    /**
     * 请求成功 需要弹出错误提示
     */
    error: 400,
    /**
     * 参数错误
     */
    paramError: 730,
    /**
     * 请求失败
     */
    requesteError: 701,
    /**
     * 需要权限
     */
    unauthorized: 900,
    /**
     * 缺少Token
     */
    lackToken: 901,
    /**
     * Token校验失败
     */
    verifyTokenError: 902,
    /**
     * 需要二次验证
     */
    twVerify: 913,
  },
}

/**
 * 默认主题色
 */
export const defaultThemeColor = [
  '#F97316',
  '#0960bd',
  '#0084f4',
  '#009688',
  '#536dfe',
  '#ff5c93',
  '#ee4f12',
  '#0096c7',
  '#9c27b0',
  '#ff9800',
  '#FF3D68',
  '#00C1D4',
  '#71EFA3',
  '#171010',
  '#78DEC7',
  '#1768AC',
  '#FB9300',
  '#FC5404',
  '#FF4848',
  '#2C2E43',
  '#66DE93',
  '#0A1D37',
  '#39A6A3',
  '#FF8474',
]
