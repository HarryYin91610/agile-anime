import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import clear from "rollup-plugin-clear";
import { terser } from "rollup-plugin-terser";

export default {
  input: 'src/index.ts',
  output: {
    file: 'dist/bundle.umd.js',
    name: 'bundle',
    format: 'umd'
  },
  plugins: [
    clear({
      targets: ["dist"]
    }),
    resolve(),
    commonjs(),
    typescript(),
    terser()
  ]
}
