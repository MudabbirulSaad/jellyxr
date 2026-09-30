/// <reference types="vitest" />
/// <reference types="vite/client" />
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import './scripts/jellyxr/patchBitmapDependency.mjs';

export default defineConfig({
    assetsInclude: ['**/*.glb'],
    plugins: [ tsconfigPaths() ],
    test: {
        coverage: {
            include: [ 'src' ]
        },
        environment: 'jsdom',
        restoreMocks: true
    }
});
