# DevOps — Conceitos e Boas Práticas

## 📌 O que é DevOps?

DevOps é uma cultura e um conjunto de práticas que aproximam as áreas de **Desenvolvimento (Dev)** e **Operações (Ops)**.

O objetivo é melhorar a colaboração entre equipes e tornar o processo de desenvolvimento, testes, entrega e manutenção de sistemas mais rápido, confiável e automatizado.

## 🔄 Ciclo DevOps

O ciclo DevOps pode ser representado pelas seguintes etapas:

```text
Planejar
   ↓
Desenvolver
   ↓
Build
   ↓
Testar
   ↓
Deploy
   ↓
Monitorar
   ↓
Melhorar
   ↺
```

Esse processo é contínuo, permitindo que melhorias e correções sejam entregues de forma mais rápida.

## ⚙️ Práticas importantes

### Integração Contínua — CI

A Integração Contínua consiste em integrar frequentemente as alterações realizadas no código.

Cada alteração pode passar automaticamente por processos como:

* Verificação do código
* Execução de testes
* Validação do projeto
* Geração do build

### Entrega Contínua — CD

A Entrega Contínua permite preparar automaticamente uma aplicação para ser disponibilizada em produção.

O objetivo é reduzir processos manuais e tornar as entregas mais confiáveis.

```text
Feature
   ↓
Pull Request
   ↓
Code Review
   ↓
Testes
   ↓
Merge
   ↓
Deploy
```

## 🌿 Git Flow e DevOps

O Git Flow organiza o desenvolvimento através de branches com objetivos específicos.

```text
main
 │
 ├── develop
 │     │
 │     ├── feature/*
 │     └── release/*
 │
 └── hotfix/*
```

### Principais branches

| Branch      | Função                                            |
| ----------- | ------------------------------------------------- |
| `main`      | Código estável e pronto para produção             |
| `develop`   | Integração das funcionalidades em desenvolvimento |
| `feature/*` | Desenvolvimento de novas funcionalidades          |
| `release/*` | Preparação de uma nova versão                     |
| `hotfix/*`  | Correções urgentes em produção                    |

## 🔀 Pull Requests

O Pull Request é utilizado para revisar alterações antes de integrá-las ao projeto.

Um fluxo recomendado é:

1. Criar uma branch a partir de `develop`.
2. Desenvolver a funcionalidade.
3. Realizar commits seguindo um padrão.
4. Enviar a branch para o repositório remoto.
5. Criar um Pull Request.
6. Solicitar Code Review.
7. Corrigir possíveis problemas.
8. Realizar o merge.

## ✍️ Conventional Commits

O Conventional Commits é uma convenção para padronizar as mensagens dos commits.

Exemplos:

```bash
feat: adiciona documentação sobre DevOps
fix: corrige cálculo do progresso
docs: atualiza README do projeto
refactor: reorganiza funções do backend
test: adiciona testes da API
chore: atualiza dependências
```

## 🚀 Conclusão

DevOps busca criar um processo de desenvolvimento mais colaborativo, automatizado e confiável.

Ferramentas como **Git**, **GitHub**, **CI/CD**, **Docker** e sistemas de monitoramento ajudam a automatizar etapas e reduzir erros durante o ciclo de desenvolvimento.

Neste projeto, o uso de branches, Pull Requests, Code Review e Conventional Commits representa práticas importantes utilizadas em ambientes DevOps.
