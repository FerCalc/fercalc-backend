// swaggerConfig.js

import swaggerJSDoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'API de Calculadora Nutricional',
    version: '1.0.0',
    description: 'Documentación de la API para la aplicación de seguimiento nutricional para embarazadas.',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Servidor de desarrollo',
    },
  ],
  // Agregamos una sección para definir componentes de seguridad (para JWT)
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

const options = {
  swaggerDefinition,
  // Rutas a los archivos que contienen las anotaciones de la API.
  // Es importante que apunte a tus archivos de rutas.
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

// Usamos la sintaxis de ES Modules para exportar
export default swaggerSpec;