<div align="center">

# ⚙️ AstushaApp Backend

### Backend-сервис для управления командами, проектами и задачами

![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma&logoColor=white)

</div>

## О проекте

**AstushaApp Backend** — серверная часть приложения **AstushaApp**, входящего в экосистему **Astusha**.

Сервис отвечает за команды, проекты, участников, задачи, workflow, комментарии, файлы и другую прикладную логику приложения.

Авторизация пользователей выполняется через единый сервис **[Astusha ID](https://github.com/upogorelova626/AstushaID)**.  
AstushaApp использует токены авторизованного пользователя для доступа к защищённым API.

### Возможности

- управление командами и участниками;
- создание и настройка проектов;
- управление участниками проектов;
- создание и редактирование задач;
- назначение исполнителей;
- workflow-стадии задач;
- приоритеты, типы задач и дедлайны;
- спринты;
- комментарии;
- загрузка файлов;
- ссылки на репозитории;
- интеграция с Astusha ID;
- документация API через Swagger.

## Стек

- NestJS 11
- TypeScript
- Prisma ORM 7
- PostgreSQL
- JWT
- Cookie-based authentication
- Swagger / OpenAPI
- class-validator
- class-transformer
- AWS S3

Frontend проекта:  
[AstushaApp-V2-frontend](https://github.com/upogorelova626/AstushaApp-V2-frontend)

## Запуск

```bash
npm install
npm run start:dev
```

Backend будет доступен по адресу:

```text
http://localhost:3000
```

Swagger:

```text
http://localhost:3000/api
```

---

<div align="center">

**Backend для управления командами и проектами в экосистеме Astusha.**

</div>
