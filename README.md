# DevOps N2S — Painel de Tarefas

> Aplicação web para gerenciamento de tarefas de **Git Flow, Branches e Pull Requests** da turma N2S.

---

## 🚀 Como executar

### Pré-requisitos

- Python 3.8+
- Flask instalado

```bash
pip install flask
```

### Iniciar o servidor

```bash
python app.py
```

Acesse em: **http://127.0.0.1:5000**

---

## 📁 Estrutura do projeto

```
Devops_N2S/
├── app.py              ← Backend Flask (rotas, dados, API)
├── progresso.json      ← Progresso dos alunos (gerado automaticamente)
├── static/
│   └── style.css       ← Design premium dark theme
├── templates/
│   ├── index.html      ← Painel principal (turma completa)
│   ├── tarefa.html     ← Detalhe de cada tarefa
│   └── aluno.html      ← Progresso individual do aluno
├── GitFlow.md          ← Guia de instalação do Git Flow
└── README.md           ← Este arquivo
```

---

## 👥 Turma N2S

| # | Aluno |
|---|-------|
| 01 | Amós Gabriel Simões dos Santos |
| 02 | Ana Paula Maximo |
| 03 | Cauã Felipe Carvalho |
| 04 | Danilo Pereira da Silva |
| 05 | Diogo Lopes Antunes |
| 06 | Fellipe Oliveira Raszejas |
| 07 | Guilherme Castro de Oliveira |
| 08 | Guilherme de Almeida Stecker |
| 09 | Gustavo Ribas Silestrino |
| 10 | João Alexandre da Silva Pereira |
| 11 | João Victor Pereira de Souza |
| 12 | Johann Arruda Andrade |
| 13 | Júlio César Botaccio |
| 14 | Kaiki Santos da Silva |
| 15 | Kaique Silva Primissia |
| 16 | Kevin Payão Reisauskas |
| 17 | Livia Ghirardi do Amaral |
| 18 | Luis Felipe Santos Correia |
| 19 | Marco Antônio da Costa Silva |
| 20 | Miguel Capucci Malheiros |
| 21 | Nicolas Ricardo Kourani Leão Silva |
| 22 | Pedro Vitor Ribeiro Silva |
| 23 | Pietro Freire Rezende dos Santos |
| 24 | Rafaela Silva da Paz |
| 25 | Swell Gomes Nunes |
| 26 | Tuanny Cristina Thomazelli |
| 27 | Vinicius Almeida Melo de Oliveira |
| 28 | Vinícius Côrte da Silva |

---

## 📋 Tarefas

| # | Tarefa | Categoria | Nível | Prazo |
|---|--------|-----------|-------|-------|
| 1 | 🌿 Configurar Git Flow no repositório | Git Flow | Iniciante | 2 dias |
| 2 | 🔀 Criar e desenvolver uma Feature Branch | Branches | Iniciante | 3 dias |
| 3 | 🔒 Configurar Proteção de Branches no GitHub | GitHub | Intermediário | 1 dia |
| 4 | 👀 Realizar Code Review e aprovar Pull Request | Code Review | Intermediário | 2 dias |
| 5 | ⚡ Resolver Conflito de Merge | Git Avançado | Avançado | 3 dias |
| 6 | 🚀 Criar Release e Tag de Versão | Git Flow | Intermediário | 3 dias |
| 7 | 👤 Configurar CODEOWNERS | GitHub | Intermediário | 1 dia |
| 8 | ✍️ Aplicar Conventional Commits | Boas Práticas | Iniciante | 2 dias |

---

## ✨ Funcionalidades da aplicação

- **Painel geral** com estatísticas da turma (concluídas, progresso %)
- **Status por tarefa e por aluno** — Pendente / Em andamento / Concluída
- **Barra de progresso** individual e coletiva em tempo real
- **Busca e filtro** de alunos
- **Progresso salvo** automaticamente em `progresso.json`
- **API REST** para atualização de status (`POST /api/status`)

---

## 🔗 Rotas disponíveis

| Rota | Descrição |
|------|-----------|
| `GET /` | Painel principal com todas as tarefas e alunos |
| `GET /tarefa/<id>` | Detalhes de uma tarefa com status de todos os alunos |
| `GET /aluno/<nome>` | Progresso individual do aluno |
| `POST /api/status` | Atualiza o status de uma tarefa para um aluno |
| `GET /api/progresso` | Retorna o JSON completo de progresso |

---

## 📖 Git Flow — Referência Rápida

```
main
 │  → versão estável / produção
 │
 └── develop
      │  → integração do desenvolvimento
      │
      ├── feature/*    → novas funcionalidades
      ├── release/*    → preparação para produção
      └── hotfix/*     → correções urgentes em produção
```

### Fluxo do aluno

```
1. git switch develop && git pull origin develop
2. git switch -c feature/minha-funcionalidade
3. (desenvolve e commita)
4. git push -u origin feature/minha-funcionalidade
5. Abre Pull Request: feature → develop
6. Colega revisa e aprova
7. Merge em develop
```

### Conventional Commits

```
feat:     nova funcionalidade
fix:      correção de bug
docs:     alteração na documentação
chore:    tarefa de manutenção
refactor: refatoração sem mudança de comportamento
test:     adição ou correção de testes
```

---

## ⚠️ Regras da turma

```
NUNCA trabalhar diretamente na main.
NUNCA fazer push direto na main.
NUNCA fazer merge sem Pull Request.
Cada funcionalidade deve ter sua própria feature branch.
Todo Pull Request deve ser revisado por outra pessoa.
```
