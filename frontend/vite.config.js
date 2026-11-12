import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        login: resolve(__dirname, 'login.html'),
        registerStudent: resolve(__dirname, 'registerStudent.html'),
        student: resolve(__dirname, 'student.html'),
        account: resolve(__dirname, 'account.html'),
        college: resolve(__dirname, 'college.html'),
        collegeLogin: resolve(__dirname, 'collegeLogin.html'),
        collegeRegister: resolve(__dirname, 'collegeRegister.html'),
        otp: resolve(__dirname, 'otp.html'),
        earthquake: resolve(__dirname, 'earthquake.html'),
        earthVideo: resolve(__dirname, 'earthVideo.html'),
        earthQuiz: resolve(__dirname, 'earthQuiz.html'),
        module: resolve(__dirname, 'module.html'),
        video: resolve(__dirname, 'video.html'),
        quiz: resolve(__dirname, 'quiz.html'),
      },
    },
  },
})
