export default [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'lib/generated/**',
      'prisma/**/novix.db',
      'prisma/novix.db',
    ],
  },
  {
    files: ['**/*.{js,mjs,cjs}'],
    rules: {},
  },
];
