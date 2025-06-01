import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig([
  {
    entries: [
      { input: 'src/index' },
      { input: 'src/screenshot' },
    ],
    declaration: 'node16',
    clean: true,
    rollup: {
      emitCJS: true,
    },
  },
])
