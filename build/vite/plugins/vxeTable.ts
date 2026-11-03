import { lazyImport, VxeResolver } from 'vite-plugin-lazy-import'

export function configVxeTableStyleImportPlugin() {
  return lazyImport({
    resolvers: [
      VxeResolver({
        libraryName: 'vxe-table',
      }),
      VxeResolver({
        libraryName: 'vxe-pc-ui',
      }),
    ],
  })
}
