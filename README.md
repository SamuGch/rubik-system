
# RubikBot Control Panel 🤖🎲

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white)
![DigitalOcean](https://img.shields.io/badge/DigitalOcean-0080FF?style=for-the-badge&logo=DigitalOcean&logoColor=white)

Sistema full-stack de control, resolución automatizada y registro analítico para un brazo robótico resolvedor de Cubos Rubik. 

Este proyecto integra un motor matemático basado en el algoritmo de Kociemba (`cubejs`), una interfaz de usuario interactiva para el escaneo manual de caras, una API REST robusta y persistencia de datos histórica. Diseñado con una arquitectura flexible que permite operar tanto con hardware físico local como en entornos 100% virtualizados en la nube mediante Docker.

---

## 📋 Tabla de Contenidos
1. [Características Principales](#-características-principales)
2. [Arquitectura del Sistema](#-arquitectura-del-sistema)
3. [Estructura del Proyecto](#-estructura-del-proyecto)
4. [Requisitos Previos](#-requisitos-previos)
5. [Variables de Entorno](#-variables-de-entorno)
6. [Guía de Despliegue](#-guía-de-despliegue)
   - [Entorno Híbrido (Desarrollo Local + Robot)](#opción-a-entorno-híbrido-desarrollo-local--robot-físico)
   - [Entorno Cloud (DigitalOcean VPS)](#opción-b-entorno-cloud-producción-en-digitalocean)
7. [Referencia de la API](#-referencia-de-la-api)
8. [Autor](#-autor)

---

## ✨ Características Principales

- **Dashboard Interactivo:** Interfaz visual construida con React y Tailwind CSS para ingresar el estado del cubo mediante colores.
- **Validación de Paridad Mágica:** Algoritmo de validación que previene el envío de estados matemáticamente imposibles (ej. aristas o esquinas repetidas, centros modificados).
- **Controlador Serial Inteligente:** Comunicación directa con Arduino vía `serialport`. Incluye un **Modo Simulación** automático si el hardware no está conectado (ideal para despliegues en VPS).
- **Historial de Operaciones:** Registro persistente en MongoDB con tiempos exactos de cálculo, secuencias generadas y timestamps de cada resolución.
- **Arquitectura Cloud-Ready:** Empaquetado en contenedores Docker independientes y configurado con Nginx para un enrutamiento SPA perfecto.

---

## 📊 Arquitectura del Sistema

El ecosistema se divide en tres capas desacopladas:

1. **Frontend (SPA):** Cliente HTTP dinámico que consume variables de entorno inyectadas durante la compilación (`VITE_API_URL`) para conmutar entre `localhost` y la IP pública de producción sin tocar el código fuente.
2. **Backend API Gateway:** Orquestador lógico que expone endpoints RESTful. Traduce el mapa de colores visual a la notación de Kociemba (`U-R-F-D-L-B`), calcula la solución matemática más corta y formatea la trama de bytes (`[U,R2,F,L']`) para el microcontrolador.
3. **Persistencia (Base de Datos):** MongoDB encapsulado en contenedores Docker con volúmenes persistentes para evitar la pérdida de auditorías y logs de los servomotores.

---

## 📁 Estructura del Proyecto

```text
rubik-system/
├── backend/
│   ├── controllers/
│   │   └── arduinoController.js   # Gestión de puertos COM y modo simulación
│   ├── models/
│   │   └── Evento.js              # Esquema de Mongoose para el historial
│   ├── server.js                  # Punto de entrada de Express y API REST
│   ├── Dockerfile                 # Construcción de la imagen Node.js (Slim)
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/            # Vistas (Home, CubeInput, Historial, Config)
│   │   ├── utils/
│   │   │   ├── cubeSolver.js      # Formateo y llamadas al backend
│   │   │   └── cubeValidator.js   # Lógica de paridad de colores
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── nginx.conf                 # Configuración de ruteo estático para Producción
│   ├── Dockerfile                 # Multi-stage build (Vite + Nginx)
│   └── package.json
├── docker-compose.yml             # Orquestador principal de la red y servicios
└── README.md

```

---

## ⚙️ Requisitos Previos

Dependiendo del tipo de despliegue que desees realizar, necesitarás:

* [Node.js](https://nodejs.org/) (v18 o superior)
* [Docker Desktop](https://www.docker.com/) o Docker Engine
* [Docker Compose](https://docs.docker.com/compose/)
* Microcontrolador compatible con Arduino y conexión USB (Solo para despliegue híbrido/local).

---

## 🔐 Variables de Entorno

El sistema utiliza variables de entorno para garantizar la seguridad y portabilidad.

**En el Backend (`/backend/.env`):**

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/rubik_system
PUERTO_COM=COM3
BAUD_RATE=9600

```

**En el Frontend para Producción (`/frontend/.env.production`):**

```env
# Reemplazar con el dominio o IP de DigitalOcean
VITE_API_URL=[http://134.122.24.115:3000](http://134.122.24.115:3000) 

```

*(Nota: En desarrollo local, el frontend usará `http://localhost:3000` por defecto si esta variable no está presente).*

---

## 🚀 Guía de Despliegue

### Opción A: Entorno Híbrido (Desarrollo Local + Robot Físico)

Esta configuración utiliza Docker **solo para la base de datos**, permitiendo que el backend de Node.js acceda nativamente a los puertos USB de tu computadora para mover los servomotores reales.

1. **Levantar MongoDB en segundo plano:**
Asegúrate de que tu `docker-compose.yml` solo tenga activo el servicio de `mongodb` o ejecuta el contenedor manual:

```bash
   docker-compose up -d mongodb

```

2. **Iniciar la API REST:**

```bash
   cd backend
   npm install
   node server.js

```

3. **Iniciar el Dashboard Web:**

```bash
   cd frontend
   npm install
   npm run dev

```

### Opción B: Entorno Cloud (Producción en DigitalOcean)

Esta configuración despliega el 100% de la infraestructura dentro de contenedores en una red virtual. Como el servidor VPS carece de puertos USB físicos, el backend conmutará de manera transparente al `Modo Simulación`.

1. **Clonar el repositorio en el Droplet (VPS).**
2. **Construir y levantar la orquestación de Docker:**
El parámetro `--build` es vital para que Vite lea el archivo `.env.production` e inyecte la IP pública de tu servidor en el cliente de React.

```bash
   docker-compose up -d --build

```

3. **Acceder al sistema:** Abre un navegador y dirígete a `http://TU_IP_PUBLICA`.

---

## 🔌 Referencia de la API

Las solicitudes de red son manejadas por Express. Si estás probando la API de forma externa (ej. Postman), esta es la estructura:

| Método | Endpoint | Descripción | Body (JSON) |
| --- | --- | --- | --- |
| `POST` | `/api/solve` | Resuelve matemáticamente y audita en BD. | `{"estado": "UUU...BBB"}` (54 caracteres) |
| `GET` | `/api/eventos` | Recupera el historial completo de la BD. | *Ninguno* |
| `DELETE` | `/api/eventos` | Borra todos los registros del historial. | *Ninguno* |
| `POST` | `/api/robot/send` | Transmite los bytes generados vía serial. | `{"secuencia": "U R2 F L'"}` |
| `POST` | `/api/robot/config` | Cambia el puerto serial sin reiniciar el servidor. | `{"puerto": "COM5"}` |

---

## 👨‍💻 Autor

**Samuel Estuardo González Chitamul**

**Jorge Armando Maguey Tajin**

*Estudiantes de Ingeniería en Sistemas - Universidad Mariano Gálvez*

Desarrollado como proyecto avanzado combinando robótica, programación asíncrona, y despliegues virtualizados en la nube.

```

```
