# AGENTS.md - Global Context & Infrastructure

## Project Overview
* This project is a localized, single-user Personal Finance Dashboard optimized for local deployments.
* The system executes entirely within a local containerized ecosystem via Docker and operates independently of external cloud networks.
* Do not implement multi-tenant user management, session handling, access tokens, or permission matrices, as access is implicitly restricted via host machine boundary security.

## Infrastructure & Orchestration
* The infrastructure is orchestrated using Docker and Docker Compose to guarantee parity across host execution boundaries.
* The `docker-compose.yml` layout maps out two core services: a persistent storage system running PostgreSQL 18.4 and an application backend executing Python 3.13 with FastAPI.
* The PostgreSQL service maps to port `5432:5432` and uses a local volume for persistent data.
* The FastAPI backend maps to port `8000:8000` and depends on the database service being healthy.