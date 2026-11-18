# TextilApp · PC3_JS

Aplicación web en **React** para el **registro e inventario de prendas textiles**, desarrollada como práctica integradora (PC3) del curso en la Universidad Tecnológica del Perú (UTP).

Permite registrar prendas (polos, pantalones, casacas…), listarlas, editarlas y eliminarlas contra una API REST simulada con **json-server**.

![CI](https://github.com/KevinDC65/PC3_JS/actions/workflows/ci.yml/badge.svg)

## Stack

| Tecnología | Uso |
|---|---|
| React 19 + Vite | Interfaz y entorno de desarrollo |
| react-router-dom 7 | Rutas: Inicio, Registro, Lista |
| Bootstrap 5 + Bootstrap Icons | Estilos y componentes visuales |
| Axios | Cliente HTTP en `src/services/apiService.js` |
| json-server 0.17 | API REST falsa a partir de `db.json` |
| oxlint + Prettier | Calidad y formato de código |

> **¿Por qué Vite y no `create-react-app`?** La práctica menciona CRA, pero CRA está deprecado oficialmente por el equipo de React y falla con versiones actuales de Node. Vite cumple el mismo objetivo (crear y servir un proyecto React) y es la herramienta recomendada hoy. La estructura de `src/` sigue la propuesta de la práctica.

## Requisitos

- Node.js **20.19 o superior** (`node -v`)
- Git

## Instalación

```bash
git clone https://github.com/KevinDC65/PC3_JS.git
cd PC3_JS
npm install
```

## Ejecutar

```bash
npm run dev:all
```

Levanta a la vez:
- Frontend: http://localhost:5173
- API (json-server): http://localhost:3001/prendas

| Script | Qué hace |
|---|---|
| `npm run dev` | Solo el frontend |
| `npm run server` | Solo la API (`db.json` en el puerto 3001) |
| `npm run dev:all` | Frontend + API |
| `npm run lint` | Revisa el código con oxlint |
| `npm run format` | Formatea `src/` con Prettier |
| `npm run build` | Compila para producción en `dist/` |

## Documentación del proyecto

| Archivo | Para qué sirve |
|---|---|
| [PROYECTO.md](PROYECTO.md) | Objetivo, alcance, modelo de datos, endpoints y trazabilidad de requisitos |
| [ESTRUCTURA.md](ESTRUCTURA.md) | Carpetas, responsabilidades y flujo de datos |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Reglas del equipo: ramas, commits, PR y estilo |
| [SPRINTS.md](SPRINTS.md) | Sprints, issues por desarrollador y seguimiento |
| [AGENTS.md](AGENTS.md) | Guía técnica rápida: todo el contexto del proyecto en un archivo |
| [docs/ENTREGA.md](docs/ENTREGA.md) | Guía para el PDF y las capturas de la entrega |

## Equipo

| Rol | Responsable | Área |
|---|---|---|
| Dev 1 | _por asignar_ | Setup, layout, calidad e integración |
| Dev 2 | _por asignar_ | Navegación, Home, tema y capturas |
| Dev 3 | _por asignar_ | Formulario de registro y validaciones |
| Dev 4 | _por asignar_ | Estado global, hooks y documento PDF |
| Dev 5 | _por asignar_ | Servicios REST y listado |
