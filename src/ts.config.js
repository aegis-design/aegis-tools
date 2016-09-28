/**
 * Created by Zhengfeng.Yao on 16/9/27.
 */
export default function getTS() {
  return {
    compilerOptions: {
      target: 'es6',
      jsx: 'preserve',
      moduleResolution: 'node',
      allowSyntheticDefaultImports: true,
      sourceMap: true
    },
    compileOnSave: false,
    exclude: [
      "node_modules"
    ]
  };
}
