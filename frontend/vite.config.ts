import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

const ReactCompilerConfig = {
  compilationMode: 'annotation',
  sources: (filename) => {
    return filename.indexOf('node_modules') === -1;
  }
};

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          ['babel-plugin-react-compiler', ReactCompilerConfig]
        ]
      }
    })
  ],
})
