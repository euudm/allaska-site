import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
  // HTTPS=1 npm run dev:https -> certificado local, para testar o giroscópio no celular (exige HTTPS)
  plugins: [react(), tailwindcss(), ...(process.env.HTTPS ? [basicSsl()] : [])],
  server: { port: 5187, strictPort: true },
  preview: { port: 5187, strictPort: true },
  build: {
    target: 'es2022',
    rollupOptions: {
      output: {
        manualChunks(id) {
          // React em chunk próprio: senão ele cai dentro do chunk do three e o celular baixa o 3D sem usar
          if (/node_modules[\/](react|react-dom|scheduler)[\/]/.test(id)) return 'react'
          if (id.includes('node_modules/three') || id.includes('@react-three')) return 'three'
          if (id.includes('node_modules/gsap') || id.includes('node_modules/lenis')) return 'motion'
        },
      },
    },
  },
})
