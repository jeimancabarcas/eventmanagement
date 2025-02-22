module.exports = {
    preset: 'ts-jest', // Usar ts-jest para TypeScript
    testEnvironment: 'node', // Entorno de pruebas para Node.js
    testMatch: ['**/test/**/*.test.ts'], // Patrón para encontrar archivos de prueba
    setupFilesAfterEnv: ['./test/setup.ts'], // Archivo de configuración adicional
    clearMocks: true, // Limpiar mocks después de cada prueba
  };