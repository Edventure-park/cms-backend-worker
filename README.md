# CMS - Backend worker 
<img alt="Status" src="https://img.shields.io/badge/status-under--development-orange" />
<div style="display: flex; justify-content: space-between; align-items: center;">
  <!-- <img alt="Status" src="https://img.shields.io/badge/status-production-brightgreen" /> -->
  <!-- <img alt="Status" src="https://img.shields.io/badge/bug%20fixes-required-orange" /> -->
  <!-- <img alt="Status" src="https://img.shields.io/badge/security%20improvements-needed-red" /> -->
  <!-- <img alt="Status" src="https://img.shields.io/badge/maintenance-off-red" /> -->
  <!-- <img alt="Status" src="https://img.shields.io/badge/status-production--in--progress-yellow" /> -->
</div>

<div align="center">
<img src="./public/logo.png" alt="EVP Logo" width="200"/>


<p style="font-size:18px;color:#F38020;"><strong>A Modern, Scalable Backend worker powering the EVP-CMS</strong></p>


[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![PNPM](https://img.shields.io/badge/PNPM-10.12.1-orange?style=for-the-badge&logo=pnpm)](https://pnpm.io)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare_Workers-4.0-lightgray?style=for-the-badge&logo=cloudflare)](https://developers.cloudflare.com/workers)
[![HonoJS](https://img.shields.io/badge/HonoJS-4.0-blue?style=for-the-badge&logo=honodev)](https://hono.dev)
[![D1 Database](https://img.shields.io/badge/D1_Database-1.0-blue?style=for-the-badge&logo=cloudflare)](https://developers.cloudflare.com/d1)
[![Drizzle](https://img.shields.io/badge/Drizzle-0.1-blue?style=for-the-badge&logo=drizzle)](https://www.drizzle.com)
[![Mailtrap](https://img.shields.io/badge/Mailtrap-1.0-blue?style=for-the-badge&logo=mailtrap)](https://mailtrap.io)
[![Resend](https://img.shields.io/badge/Resend-1.0-green?style=for-the-badge&logo=resend)](https://resend.com)
[![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-enabled-blue?style=for-the-badge&logo=github-actions)](https://github.com/features/actions)




</div>

## 🌟 Overview
The EVP CMS Backend Worker is a lightweight, serverless backend service built on Cloudflare Workers — designed to handle dynamic data operations, API requests, and background tasks for the EVP CMS ecosystem.

This project leverages HonoJS, Drizzle ORM, and Cloudflare D1 to provide a highly scalable, performant, and developer-friendly environment for building modern edge applications.


### Core Principles

- **Security by Design**: Every component is built with security as a priority
- **Scalable Architecture**: Designed to grow with traffic
- **Maintainable Codebase**: Clean, documented, and easy to maintain
- **Cloud Native**: Optimized for modern cloud environments


## 📁 Project Structure
```
cms-backend-worker/
├── .github/
│   └── workflows/
│       └── deploy-workers.yml     # GitHub Actions workflow for automatic Cloudflare Worker deployment
│   └── FUNDING.yml                # GitHub Sponsors configuration file
│
├── public/
│   └── index.html                 # Static frontend file served by the worker (e.g., landing or test page)
│
├── scripts/
│   └── execute-d1.mjs             # Script for executing and migrating updated D1 (SQLite) schemas locally or remotely
│
├── src/
│   ├── controllers/               # Controller functions handling business logic and data processing
│   ├── db/                        # Database schema definitions, Drizzle ORM setup, and connection utilities
│   ├── routes/                    # API route definitions mapping endpoints to controller logic
│   └── index.ts                   # Main entry file that initializes routes and worker setup
│
├── .env                           # Environment variables for local development (not committed to repo)
├── .gitignore                     # Specifies intentionally untracked files to ignore in Git
│
├── drizzle.config.ts              # Configuration file for Drizzle ORM (migrations, schema paths, etc.)
├── package.json                   # Project metadata, dependencies, and npm/pnpm scripts
├── pnpm-lock.yaml                 # Lockfile ensuring consistent dependency versions
│
├── tsconfig.json                  # TypeScript compiler configuration
├── worker-configuration.d.ts      # Type definitions for the Cloudflare Worker environment
├── wrangler.jsonc                 # Cloudflare Wrangler configuration file for deployment and environment settings
│
└── README.md                      # Project documentation (this file)

```

##  Features

- **Edge compute**
- **CI/CD Pipeline Support**
- **Detailed Documentation**
- **In-built caching and security**
- **Low Latency API – Optimized routes and caching mechanisms for minimal response time**
- **TypeScript-First – Strongly typed code for reliability and maintainability**
- **Drizzle ORM – Modern, lightweight ORM with migration support**

## 🚦 Getting Started

1. **Clone the repository**
```bash
git clone https://github.com/Edventure-park/cms-backend-worker.git
cd cms-backend-worker
```

2. **Install pnpm**
pnpm is the package manager used for managing dependencies in this repository. To install pnpm, follow the steps below based on your operating system:

You can install pnpm globally using Homebrew (macOS) or npm (Linux/macOS/Windows) :
```
npm install -g pnpm
```
If you encounter any issues with the installation, refer to the official pnpm documentation.

3. **Install dependencies**
```bash
pnpm install
```

4. **Run the dev server**
```bash
pnpm dev
```

## Deployment to Cloudflare Workers
This codebase is deployed to Cloudflare Workers for seamless, serverless execution.

1. Deployment Flow

- The deployment process is automated through a GitHub Actions Continuous Deployment (CD) pipeline. Here's how it works:
- On every push or pull request to the main branch, the pipeline is triggered.

The pipeline then automatically deploys the latest code to Cloudflare Workers, ensuring that your changes are live in production with minimal manual intervention.

This setup enables continuous delivery and ensures that the latest updates are deployed quickly and reliably.

## ☁️ Deployment to Cloudflare Workers

This project is deployed using **Cloudflare Workers** with a **GitHub Actions CD pipeline**.

### 🔄 Deployment Flow

* On every **push or pull request** to the `main` branch, the workflow runs automatically.
* The pipeline builds and deploys the latest code to Cloudflare Workers.
* Continuous delivery ensures rapid, reliable, and zero-downtime updates.

---

## 🧰 Commands & Custom Scripts

| Command           | Description                                                    |
| ----------------- | -------------------------------------------------------------- |
| `pnpm run dev`    | Starts the local development server                            |
| `pnpm drizzle:up` | Checks Drizzle ORM connection                                  |
| `pnpm generate`   | Generates SQL queries for updated schemas (`src/db/schema.ts`) |
| `pnpm migrate`    | Runs the generated SQL migrations (local or remote)            |

### 💾 Migration Details

* **Remote Migration**
  Managed exclusively by [Adnan](https://github.com/Adnan-The-Coder).
  Contact him for remote database migration tasks.

* **Local Migration**
  Used for development and testing.
  Choose the migration file and type `local` when prompted to apply locally.

---


## 🩺 Troubleshooting

If issues occur, verify the following:

* ✅ **PNPM is installed:**

  ```bash
  pnpm --version
  ```
* ✅ **Cloudflare credentials** are configured in `wrangler.jsonc`
* ✅ **.env file** contains all necessary environment variables

---
## 🤝 Contributing

Contributions are always welcome! Please follow the conventions below 👇

### 🌿 Branching Strategy

Always start from the `dev` branch, and make sure it is updated with the main branch

| Purpose        | Branch Name Format    |
| -------------- | --------------------- |
| New feature    | `feat/<feature-name>` |
| Bug fix        | `fix/<bug-name>`      |
| Update content | `update/<section>`    |
| Documentation  | `docs/<change>`       |
| Refactor code  | `refactor/<module>`   |
| Urgent fix     | `hotfix/<issue>`      |

---

### 🔀 Pull Request Workflow

#### **Step 1: Development**

* Create a PR from your branch → `dev` branch.
* Testing is skipped temporarily during rapid iteration.

#### **Step 2: Production**

* After validation, merge `test` → `main`.
* Requires approval from the **Adnan**.
* On merge, automatic production deployment begins.

---

### 🧾 Commit Message Conventions

Use clear prefixes for structured commit history:

| Prefix      | Meaning                         |
| ----------- | ------------------------------- |
| `feat:`     | New feature                     |
| `fix:`      | Bug fix                         |
| `docs:`     | Documentation update            |
| `refactor:` | Code refactoring                |
| `style:`    | Non-functional style/formatting |
| `test:`     | Test updates                    |
| `chore:`    | Maintenance tasks               |

**Example:**

```bash
feat: add user authentication to login route
```

---

### ⚙️ CI/CD Pipeline Rules

* All code must pass build and lint checks before merging.
* PRs with errors will be blocked until resolved.

---

### 🚨 Conflict & Emergency Protocol

* **Merge Conflicts:** Contact [Adnan](https://github.com/Adnan-The-Coder).
* **Critical Hotfixes:** Adnan initiates the emergency deployment process.

---

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.


Here's a short, concise version of the security section in markdown format:

## Security (Status Working on it !)

### 1. HTTP Security Headers
- **Content Security Policy (CSP)**: Prevents XSS attacks by restricting content sources.
- **Strict-Transport-Security (HSTS)**: Enforces HTTPS for all future requests.
- **X-Content-Type-Options**: Prevents MIME sniffing.
- **X-Frame-Options**: Prevents clickjacking.
- **X-XSS-Protection**: Blocks some XSS attacks.
- **Referrer-Policy**: Controls referrer data sent with requests.

### 2. Use of HTTPS
- HTTPS is enforced in production using HSTS. Ensure your server is configured with SSL/TLS.

### 3. CORS Configuration
- Allows only trusted origins (`http://localhost:3000`, `https://blogs.edventurepark.com`) for cross-origin requests.
- Restricts allowed HTTP methods (GET, POST, PATCH).

### 4. Rate Limiting
- Limits requests to sensitive routes (e.g., `/mail`) to 100 requests per minute to prevent abuse.

### 5. Helmet-like Middleware
- Custom middleware sets security headers to protect against XSS, clickjacking, and other attacks.

```typescript
app.use('*', (c, next) => {
  c.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  c.header('Content-Security-Policy', "default-src 'self'; script-src 'self'; object-src 'none';");
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('X-Frame-Options', 'DENY');
  c.header('X-XSS-Protection', '1; mode=block');
  c.header('Referrer-Policy', 'no-referrer-when-downgrade');
  next();
});
````

### 6. Session Management & CSRF Protection

* Use `HttpOnly`, `SameSite=Strict` cookies and anti-CSRF tokens to prevent attacks.

### 7. Logging & Monitoring

* Implement logging and monitoring for detecting malicious activity in production.

### 8. Content-Type Validation

* Validate incoming content types and file sizes to prevent malicious uploads.

---

<div align="center">
    Built with ❤️ by <a href="https://github.com/Adnan-The-Coder">Adnan</a>
</div>
        