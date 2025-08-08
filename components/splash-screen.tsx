'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

interface SplashScreenProps {
  onFinish: () => void
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onFinish, 500) // Wait for exit animation
    }, 2500) // Show splash for 2.5 seconds

    return () => clearTimeout(timer)
  }, [onFinish])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-green-50"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-10 left-10 w-32 h-32 bg-green-400 rounded-full blur-3xl"></div>
            <div className="absolute top-1/3 right-10 w-24 h-24 bg-green-300 rounded-full blur-2xl"></div>
            <div className="absolute bottom-1/4 left-1/4 w-40 h-40 bg-green-500 rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 right-1/3 w-28 h-28 bg-green-400 rounded-full blur-2xl"></div>
          </div>

          <div className="flex flex-col items-center justify-center text-center px-8">
            {/* Logo Animation */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                duration: 0.8, 
                ease: [0.23, 1, 0.32, 1],
                delay: 0.2 
              }}
              className="relative mb-8"
            >
              <div className="relative">
                <Image
                  src="/ervapplog2o.png"
                  alt="ErvApp Logo"
                  width={180}
                  height={180}
                  className="drop-shadow-2xl"
                  priority
                />
                
                {/* Glow Effect */}
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    opacity: [0.3, 0.6, 0.3]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute inset-0 bg-green-400 rounded-full blur-2xl -z-10"
                />
              </div>
            </motion.div>

            {/* App Name */}
            <motion.h1
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ 
                duration: 0.6, 
                delay: 0.6,
                ease: [0.23, 1, 0.32, 1]
              }}
              className="text-4xl font-bold text-gray-900 mb-3 tracking-tight"
            >
              ErvApp
            </motion.h1>

            {/* Tagline */}
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ 
                duration: 0.6, 
                delay: 0.8,
                ease: [0.23, 1, 0.32, 1]
              }}
              className="text-lg text-gray-600 mb-8 max-w-xs leading-relaxed"
            >
              Sistema de Cultivo Inteligente
            </motion.p>

            {/* Loading Animation */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="flex items-center space-x-2"
            >
              <div className="flex space-x-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 1, 0.3]
                    }}
                    transition={{ 
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.2,
                      ease: "easeInOut"
                    }}
                    className="w-2 h-2 bg-green-500 rounded-full"
                  />
                ))}
              </div>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="text-sm text-gray-500 ml-3"
              >
                Carregando...
              </motion.span>
            </motion.div>

            {/* Version Badge */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.8 }}
              className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
            >
              <div className="px-3 py-1 bg-white/80 backdrop-blur-sm rounded-full border border-green-200 shadow-sm">
                <span className="text-xs text-gray-600 font-medium">v1.0.0</span>
              </div>
            </motion.div>
          </div>

          {/* Subtle Animation Lines */}
          <motion.div
            animate={{ 
              rotate: 360,
            }}
            transition={{ 
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute inset-0 pointer-events-none"
          >
            <div className="absolute top-1/4 left-1/4 w-1 h-16 bg-gradient-to-b from-green-300 to-transparent opacity-20 rounded-full"></div>
            <div className="absolute top-3/4 right-1/4 w-1 h-12 bg-gradient-to-t from-green-400 to-transparent opacity-30 rounded-full"></div>
            <div className="absolute top-1/2 left-1/3 w-1 h-8 bg-gradient-to-b from-green-500 to-transparent opacity-25 rounded-full"></div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
