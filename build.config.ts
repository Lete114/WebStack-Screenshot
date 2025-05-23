import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig([
  {
    entries: [
      { input: 'src/index' },
    ],
    declaration: 'node16',
    clean: true,
    rollup: {
      emitCJS: true,
    },
  },
])
