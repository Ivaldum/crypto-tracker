# Crypto Tracker

Crypto Tracker es una aplicación que permite a los usuarios hacer un seguimiento en tiempo real de las criptomonedas, mostrando detalles, historial de precios y alertas de tendencias.

## Características

- **Seguimiento de criptomonedas** con datos en tiempo real.
- **Historial de precios** para análisis de tendencias.
- **Alertas personalizadas** cuando una moneda supera un umbral de cambio.
- **Autenticación de usuarios** para gestionar listas de seguimiento.
- **Interfaz intuitiva** con ordenamiento y paginación de datos.

## Tecnologías Utilizadas

### Frontend
- React con TypeScript
- Tailwind CSS

### Backend
- Node.js con Express
- Prisma ORM
- JWT para autenticación
- Winston para logging

### Base de Datos
- PostgreSQL

## Instalación y Ejecución

### Clonar el Repositorio
```bash
git clone https://github.com/Ivaldum/crypto-tracker.git
cd crypto-tracker
```

### Configurar el Backend
1. Instalar dependencias:
   ```bash
   cd crypto-backend
   npm install
   ```
2. Configurar variables de entorno:
   - Crear un archivo `.env` basado en `.env.example`.
3. Ejecutar la base de datos (opcional con Docker):
   ```bash
   docker-compose up -d
   ```
4. Ejecutar el servidor:
   ```bash
   npm run dev
   ```

### Configurar el Frontend
1. Instalar dependencias:
   ```bash
   cd crypto-frontend
   npm install
   ```
2. Ejecutar la aplicación:
   ```bash
   npm run dev
   ```

## API

El backend expone una API REST para la gestión de criptomonedas. Documentación pendiente de agregar.

## Contribución

1. Haz un fork del repositorio
2. Crea una nueva rama (`git checkout -b feature-nueva`)
3. Realiza tus cambios y haz un commit (`git commit -m 'Agrega nueva funcionalidad'`)
4. Sube los cambios (`git push origin feature-nueva`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la licencia MIT.


_Contribuye y ayúdanos a mejorar Crypto Tracker._

