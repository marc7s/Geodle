import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import prettier from 'eslint-config-prettier/flat';

const eslintConfig = [
  ...nextCoreWebVitals,
  prettier,
  {
    // New React Compiler rules from eslint-plugin-react-hooks v6+. The existing code predates them,
    // so they are warnings until the affected components are refactored
    rules: {
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/refs': 'warn',
    },
  },
  {
    ignores: [
      '.next/**',
      'out/**',
      'public/**',
      'next-env.d.ts',
      'src/types/routing/generated/**',
    ],
  },
];

export default eslintConfig;
