# Devops_N2S

**Git Flow, colaboradores, branches e Pull Requests**.

# 1. Criar o repositório no GitHub

1. Acesse o [GitHub](https://github.com/?utm_source=chatgpt.com) e faça login.
2. No canto superior direito, clique em **+**.
3. Selecione **New repository**.
4. Preencha:

   * **Repository name:** nome do projeto.
   * **Description:** descrição do projeto.
   * Escolha **Private** ou **Public**.
5. Marque:

   * **Add a README file**
   * Opcionalmente, escolha um `.gitignore` adequado à linguagem.
6. Clique em **Create repository**.

Exemplo:

```text
nome: sistema-academico
visibilidade: Private
```

---

# 2. Adicionar outros usuários ao repositório

Dentro do repositório:

1. Acesse **Settings**.
2. No menu lateral, procure **Collaborators** ou **Collaborators and teams**.
3. Clique em **Add people**.
4. Informe o usuário ou e-mail do GitHub.
5. Selecione o usuário.
6. Defina a permissão apropriada.

Para um projeto de equipe, uma configuração comum é:

| Usuário               | Função                  | Permissão   |
| --------------------- | ----------------------- | ----------- |
| Professor/Coordenador | Responsável             | Admin       |
| Líder técnico         | Desenvolvedor principal | Maintain    |
| Desenvolvedores       | Desenvolvimento         | Write       |
| Alunos/Colaboradores  | Desenvolvimento         | Write       |
| Avaliadores           | Revisão                 | Triage/Read |

Para trabalhos acadêmicos, normalmente **Write** é suficiente para quem irá desenvolver.

---

# 3. Clonar o repositório

Cada integrante deverá clonar o projeto.

No GitHub:

**Code → HTTPS → copiar endereço**

Depois, no terminal:

```bash
git clone https://github.com/USUARIO/sistema-academico.git
```

Entrar na pasta:

```bash
cd sistema-academico
```

Verificar:

```bash
git status
```

---

# 4. Configurar o usuário do Git

Cada integrante deve configurar seu nome e e-mail:

```bash
git config --global user.name "Nome do Aluno"
git config --global user.email "email@exemplo.com"
```

Verificar:

```bash
git config --global --list
```

---

# 5. Criar a estrutura do Git Flow

Uma estrutura simples será:

```text
main
  |
  +---- develop
           |
           +---- feature/login
           |
           +---- feature/cadastro
           |
           +---- feature/relatorio
```

A ideia é:

```text
main
  ↑
release
  ↑
develop
  ↑
feature/*
```

## Branch `main`

É a versão **estável/produção**.

Não deve ser utilizada diretamente pelos desenvolvedores para implementar funcionalidades.

## Branch `develop`

É a branch de **integração do desenvolvimento**.

As funcionalidades são incorporadas nela antes de chegar à `main`.

## Branch `feature/*`

Cada funcionalidade deve possuir sua própria branch.

Exemplo:

```text
feature/login
feature/cadastro-aluno
feature/relatorio
feature/api-usuarios
```

---

# 6. Criar a branch `develop`

Se o repositório acabou de ser criado:

```bash
git checkout -b develop
```

Enviar para o GitHub:

```bash
git push -u origin develop
```

A estrutura agora será:

```text
main
develop
```

---

# 7. Definir `develop` como branch de desenvolvimento

No GitHub:

1. Acesse **Settings**.
2. Entre em **Branches**.
3. Localize **Default branch**.
4. Se o projeto estiver em desenvolvimento, você pode definir:

```text
develop
```

como branch padrão.

Outra possibilidade, bastante utilizada, é manter `main` como padrão e obrigar os desenvolvedores a criarem suas branches a partir de `develop`.

Para um projeto acadêmico, recomendo:

```text
main    → versão final
develop → desenvolvimento
```

---

# 8. Criar uma feature

O desenvolvedor deve primeiro atualizar as branches:

```bash
git checkout develop
git pull origin develop
```

Depois criar sua feature:

```bash
git checkout -b feature/login
```

ou:

```bash
git switch develop
git pull origin develop
git switch -c feature/login
```

Agora o desenvolvedor trabalha somente nessa branch.

---

# 9. Fazer alterações

Depois de implementar a funcionalidade:

```bash
git status
```

Adicionar os arquivos:

```bash
git add .
```

Criar o commit:

```bash
git commit -m "feat: implementa tela de login"
```

Enviar a branch:

```bash
git push -u origin feature/login
```

---

# 10. Criar o Pull Request

No GitHub aparecerá a opção:

**Compare & pull request**

Criar o Pull Request:

```text
base: develop
compare: feature/login
```

Ou seja:

```text
feature/login
       ↓
    develop
```

O desenvolvedor **não deve fazer merge diretamente**.

Ele solicita a revisão através do Pull Request.

---

# 11. Configurar Pull Request obrigatório

Essa é uma das partes mais importantes.

No GitHub:

**Settings → Branches → Add branch ruleset**

ou, dependendo da interface:

**Settings → Rules → Rulesets**

Crie uma regra para:

```text
main
```

Configure:

* **Require a pull request before merging**
* Exigir pelo menos **1 aprovação**
* **Dismiss stale pull request approvals** opcional
* **Require conversation resolution**
* **Require status checks to pass**
* Bloquear force push
* Bloquear exclusão da branch

Para `main`, uma configuração recomendada é:

```text
Pull Request obrigatório: SIM
Aprovação obrigatória: 1
Conversas resolvidas: SIM
Force push: NÃO
Delete branch: NÃO
```

---

# 12. Proteger também a branch `develop`

Crie outra regra para:

```text
develop
```

Sugestão:

```text
Pull Request obrigatório: SIM
Aprovação obrigatória: 1
Conversas resolvidas: SIM
Force push: NÃO
```

Assim:

```text
feature/login
      |
      | Pull Request
      v
   develop
      |
      | Pull Request
      v
     main
```

---

# 13. Definir quem pode aprovar

Se o projeto for de uma equipe, é interessante definir **Code Owners**.

Crie:

```text
.github/CODEOWNERS
```

Exemplo:

```text
* @professor
```

Ou:

```text
* @lider-projeto
```

Para determinadas áreas:

```text
/backend/ @lider-backend
/frontend/ @lider-frontend
```

Assim, alterações em determinadas partes do projeto podem exigir a revisão de pessoas específicas.

---

# 14. Fluxo de trabalho completo

O fluxo recomendado para os alunos será:

```text
1. Atualizar develop
        ↓
2. Criar feature
        ↓
3. Desenvolver
        ↓
4. Commit
        ↓
5. Push
        ↓
6. Criar Pull Request
        ↓
7. Outro integrante revisa
        ↓
8. Aprovação
        ↓
9. Merge em develop
```

Quando uma versão estiver pronta:

```text
develop
   ↓
Pull Request
   ↓
main
```

---

# 15. Exemplo prático

Aluno João precisa implementar o login.

Primeiro:

```bash
git switch develop
git pull origin develop
```

Cria a branch:

```bash
git switch -c feature/login
```

Desenvolve e depois:

```bash
git add .
git commit -m "feat: adiciona autenticação de usuários"
git push -u origin feature/login
```

No GitHub:

```text
feature/login
      ↓
Pull Request
      ↓
develop
```

O professor ou outro aluno revisa.

Se estiver correto:

```text
Approve
```

Depois:

```text
Merge pull request
```

A funcionalidade passa para:

```text
develop
```

---

# 16. Quando publicar uma versão

Quando `develop` estiver estável, pode-se criar:

```text
release/1.0.0
```

Exemplo:

```bash
git switch develop
git pull origin develop
git switch -c release/1.0.0
git push -u origin release/1.0.0
```

Após os testes:

```text
release/1.0.0
       ↓
    main
```

E criar uma tag:

```bash
git tag v1.0.0
git push origin v1.0.0
```

---

# 17. Estrutura final recomendada

Para um projeto de alunos, eu utilizaria:

```text
main
│
│  somente versões estáveis
│
└── develop
    │
    ├── feature/login
    ├── feature/cadastro
    ├── feature/dashboard
    ├── feature/relatorios
    └── feature/api
```

Com as seguintes regras:

| Branch      |  Alteração direta | Pull Request | Aprovação |
| ----------- | ----------------: | -----------: | --------: |
| `main`      |               Não |          Sim |         1 |
| `develop`   |               Não |          Sim |         1 |
| `feature/*` |               Sim |          Não |       Não |
| `release/*` | Conforme processo |          Sim |         1 |

## Regra principal para ensinar aos alunos

A regra pode ser resumida assim:

```text
NUNCA trabalhar diretamente na main.

NUNCA fazer push diretamente na main.

NUNCA fazer merge sem Pull Request.

Cada funcionalidade deve possuir sua própria feature.

Todo Pull Request deve ser revisado por outra pessoa.
