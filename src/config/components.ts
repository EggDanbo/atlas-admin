export const componentsConfig = {
  /**
   * 上传配置
   */
  upload: {
    /**
     * 文件返回数据源字段名 { data }
     */
    dataField: 'data',
    /**
     * 文件返回数据源对应名称 { data.photo }
     */
    fileField: 'photo',
    /**
     * 最大上传图片大小
     */
    maxSize: 2,
    /**
     * 图片上传类型
     */
    fileType: ['image/png', 'image/jpg', 'image/jpeg', 'image/gif', 'image/svg+xml'],
  },
  /**
   * 表格组件配置
   */
  table: {
    apiSetting: {
      /**
       * 当前页的字段名
       */
      pageField: 'page',
      /**
       * 每页数量字段名
       */
      sizeField: 'pageSize',
      /**
       * 接口返回的数据字段名
       */
      listField: 'list',
      /**
       * 接口返回总页数字段名
       */
      totalField: 'pageCount',
      /**
       * 总数字段名
       */
      countField: 'total',
    },

    /**
     * 默认分页数量
     */
    defaultPageSize: 10,
    /**
     * 可切换每页数量集合
     */
    pageSizes: [10, 20, 30, 40, 50, 80],
  },
  dataTable: {
    fetchSetting: {
      // 分页对象
      pagedField: null,
      // 请求接口当前页数
      pageField: 'page',
      // 每页显示多少条
      sizeField: 'pagesize',
      // 请求结果列表字段
      dataField: 'list',
      // 接口返回总页数字段名
      pagesField: 'totalpages',
      // 请求结果总数字段
      totalField: 'totalcount',
      // 请求结果总计字段
      sumField: 'sum',
    },
    // 默认分页数量
    defaultPageSize: 30,
    // 可切换每页数量集合
    pageSizes: [30, 60, 90],
  },
}
