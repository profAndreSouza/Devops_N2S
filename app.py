from flask import Flask, render_template, jsonify, request
import json
import os
from datetime import datetime

app = Flask(__name__)

# ─────────────────────────────────────────────
#  DADOS: Alunos e Tarefas de DevOps / Git Flow
# ─────────────────────────────────────────────

ALUNOS = [
    "AMÓS GABRIEL SIMÕES DOS SANTOS",
    "ANA PAULA MAXIMO",
    "CAUÃ FELIPE CARVALHO",
    "DANILO PEREIRA DA SILVA",
    "DIOGO LOPES ANTUNES",
    "FELLIPE OLIVEIRA RASZEJAS",
    "GUILHERME CASTRO DE OLIVEIRA",
    "GUILHERME DE ALMEIDA STECKER",
    "GUSTAVO RIBAS SILESTRINO",
    "JOÃO ALEXANDRE DA SILVA PEREIRA",
    "JOÃO VICTOR PEREIRA DE SOUZA",
    "JOHANN ARRUDA ANDRADE",
    "JÚLIO CÉSAR BOTACCIO",
    "KAIKI SANTOS DA SILVA",
    "KAIQUE SILVA PRIMISSIA",
    "KEVIN PAYÃO REISAUSKAS",
    "LIVIA GHIRARDI DO AMARAL",
    "LUIS FELIPE SANTOS CORREIA",
    "MARCO ANTÔNIO DA COSTA SILVA",
    "MIGUEL CAPUCCI MALHEIROS",
    "NICOLAS RICARDO KOURANI LEÃO SILVA",
    "PEDRO VITOR RIBEIRO SILVA",
    "PIETRO FREIRE REZENDE DOS SANTOS",
    "RAFAELA SILVA DA PAZ",
    "SWELL GOMES NUNES",
    "TUANNY CRISTINA THOMAZELLI",
    "VINICIUS ALMEIDA MELO DE OLIVEIRA",
    "VINÍCIUS CÔRTE DA SILVA",
]

TAREFAS = [
    {
        "id": 1,
        "titulo": "Configurar Git Flow no repositório",
        "descricao": (
            "Inicialize o Git Flow no repositório local do projeto. "
            "Crie as branches main e develop, configure as branches de feature, "
            "release e hotfix conforme o padrão Git Flow."
        ),
        "categoria": "Git Flow",
        "dificuldade": "Iniciante",
        "passos": [
            "Instale o Git Flow com: choco install gitflow-avh",
            "No repositório, execute: git flow init",
            "Configure: Production branch → main, Development branch → develop",
            "Verifique as branches criadas: git branch -a",
            "Envie ao GitHub: git push -u origin main develop",
        ],
        "comandos": [
            "git flow init",
            "git branch -a",
            "git push -u origin main develop",
        ],
        "prazo": "2 dias",
        "icone": "🌿",
    },
    {
        "id": 2,
        "titulo": "Criar e desenvolver uma Feature Branch",
        "descricao": (
            "Crie uma feature branch para implementar uma nova funcionalidade. "
            "Siga o fluxo completo: criar branch, desenvolver, commitar e abrir um Pull Request para develop."
        ),
        "categoria": "Branches",
        "dificuldade": "Iniciante",
        "passos": [
            "Atualize a branch develop: git switch develop && git pull origin develop",
            "Crie a feature: git switch -c feature/minha-funcionalidade",
            "Implemente a funcionalidade e adicione os arquivos",
            "Commit seguindo Conventional Commits: git commit -m 'feat: descrição'",
            "Envie a branch: git push -u origin feature/minha-funcionalidade",
            "Abra um Pull Request no GitHub: feature → develop",
        ],
        "comandos": [
            "git switch develop && git pull origin develop",
            "git switch -c feature/nome-da-feature",
            "git add . && git commit -m 'feat: descrição'",
            "git push -u origin feature/nome-da-feature",
        ],
        "prazo": "3 dias",
        "icone": "🔀",
    },
    {
        "id": 3,
        "titulo": "Configurar Proteção de Branches no GitHub",
        "descricao": (
            "Configure regras de proteção para as branches main e develop no GitHub. "
            "Exija Pull Request obrigatório, pelo menos 1 aprovação e bloqueie push direto."
        ),
        "categoria": "GitHub",
        "dificuldade": "Intermediário",
        "passos": [
            "Acesse Settings → Branches no repositório",
            "Crie uma regra para a branch main",
            "Habilite: Require a pull request before merging",
            "Configure: Required approving reviews: 1",
            "Habilite: Dismiss stale pull request approvals",
            "Habilite: Require conversation resolution before merging",
            "Bloqueie: Allow force pushes e Allow deletions",
            "Repita o processo para a branch develop",
        ],
        "comandos": [
            "# Feito via interface GitHub",
            "# Settings → Branches → Add branch ruleset",
        ],
        "prazo": "1 dia",
        "icone": "🔒",
    },
    {
        "id": 4,
        "titulo": "Realizar Code Review e aprovar Pull Request",
        "descricao": (
            "Revise o Pull Request de um colega. Analise o código, "
            "deixe comentários construtivos, solicite alterações se necessário "
            "e aprove o PR quando estiver correto."
        ),
        "categoria": "Code Review",
        "dificuldade": "Intermediário",
        "passos": [
            "Acesse o Pull Request do colega no GitHub",
            "Clique em 'Files changed' para ver as alterações",
            "Adicione comentários linha a linha onde necessário",
            "Verifique se os commits seguem Conventional Commits",
            "Verifique se não há conflitos com develop",
            "Se estiver correto, clique em 'Review changes' → 'Approve'",
            "Se precisar de ajustes, selecione 'Request changes'",
        ],
        "comandos": [
            "# Feito via interface GitHub",
            "# Pull Requests → Files changed → Review changes",
        ],
        "prazo": "2 dias",
        "icone": "👀",
    },
    {
        "id": 5,
        "titulo": "Resolver Conflito de Merge",
        "descricao": (
            "Simule e resolva um conflito de merge entre duas branches. "
            "Entenda como identificar, analisar e resolver conflitos de forma segura."
        ),
        "categoria": "Git Avançado",
        "dificuldade": "Avançado",
        "passos": [
            "Crie duas branches a partir de develop: feature/A e feature/B",
            "Edite o mesmo arquivo nas duas branches com conteúdo diferente",
            "Faça merge de feature/A em develop",
            "Tente fazer merge de feature/B em develop",
            "Identifique os conflitos: git status",
            "Edite os arquivos conflitantes, removendo os marcadores <<<, ===, >>>",
            "Finalize: git add . && git commit -m 'fix: resolve conflito de merge'",
        ],
        "comandos": [
            "git merge feature/A",
            "git status",
            "git add . && git commit -m 'fix: resolve conflito'",
            "git log --oneline --graph",
        ],
        "prazo": "3 dias",
        "icone": "⚡",
    },
    {
        "id": 6,
        "titulo": "Criar Release e Tag de Versão",
        "descricao": (
            "Crie uma branch de release a partir de develop, realize os ajustes finais, "
            "faça merge na main e crie uma tag de versão semântica."
        ),
        "categoria": "Git Flow",
        "dificuldade": "Intermediário",
        "passos": [
            "Certifique-se que develop está estável e atualizado",
            "Crie a release: git switch develop && git switch -c release/1.0.0",
            "Atualize a versão no projeto (ex: package.json, setup.py)",
            "Commit: git commit -m 'chore: bump version to 1.0.0'",
            "Abra Pull Request: release/1.0.0 → main",
            "Após aprovação e merge, crie a tag: git tag v1.0.0",
            "Envie a tag: git push origin v1.0.0",
            "Faça também merge da release em develop",
        ],
        "comandos": [
            "git switch -c release/1.0.0",
            "git tag v1.0.0",
            "git push origin v1.0.0",
            "git log --tags --simplify-by-decoration",
        ],
        "prazo": "3 dias",
        "icone": "🚀",
    },
    {
        "id": 7,
        "titulo": "Configurar CODEOWNERS",
        "descricao": (
            "Crie o arquivo .github/CODEOWNERS para definir revisores automáticos "
            "para diferentes partes do projeto. Teste com um Pull Request."
        ),
        "categoria": "GitHub",
        "dificuldade": "Intermediário",
        "passos": [
            "Crie a pasta .github/ na raiz do projeto",
            "Crie o arquivo .github/CODEOWNERS",
            "Defina o professor como owner global: * @professor",
            "Defina owners por área: /backend/ @lider-backend",
            "Commit e push para main",
            "Crie um Pull Request e verifique se os revisores são adicionados automaticamente",
        ],
        "comandos": [
            "mkdir .github",
            "echo '* @professor' > .github/CODEOWNERS",
            "git add .github/CODEOWNERS",
            "git commit -m 'chore: adiciona CODEOWNERS'",
        ],
        "prazo": "1 dia",
        "icone": "👤",
    },
    {
        "id": 8,
        "titulo": "Aplicar Conventional Commits",
        "descricao": (
            "Padronize todos os commits do projeto utilizando a especificação "
            "Conventional Commits. Pratique os tipos: feat, fix, chore, docs, refactor, test."
        ),
        "categoria": "Boas Práticas",
        "dificuldade": "Iniciante",
        "passos": [
            "Estude a especificação em: conventionalcommits.org",
            "Use o formato: <tipo>(<escopo opcional>): <descrição>",
            "feat: nova funcionalidade",
            "fix: correção de bug",
            "docs: alteração na documentação",
            "chore: tarefa de manutenção",
            "refactor: refatoração sem mudança de comportamento",
            "Crie 5 commits diferentes usando os tipos acima",
            "Visualize o histórico: git log --oneline",
        ],
        "comandos": [
            "git commit -m 'feat: adiciona tela de login'",
            "git commit -m 'fix: corrige validação de email'",
            "git commit -m 'docs: atualiza README com instruções'",
            "git log --oneline",
        ],
        "prazo": "2 dias",
        "icone": "✍️",
    },
]

# ─────────────────────────────────────────────
#  Arquivo de progresso (persistência simples)
# ─────────────────────────────────────────────

PROGRESSO_FILE = os.path.join(os.path.dirname(__file__), "progresso.json")


def carregar_progresso():
    if os.path.exists(PROGRESSO_FILE):
        with open(PROGRESSO_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    progresso = {}
    for aluno in ALUNOS:
        progresso[aluno] = {}
        for tarefa in TAREFAS:
            progresso[aluno][str(tarefa["id"])] = "pendente"
    return progresso


def salvar_progresso(progresso):
    with open(PROGRESSO_FILE, "w", encoding="utf-8") as f:
        json.dump(progresso, f, ensure_ascii=False, indent=2)


@app.route("/")
def index():
    progresso = carregar_progresso()
    total_tarefas = len(TAREFAS)
    total_alunos = len(ALUNOS)
    total_concluidas = sum(
        1 for a in progresso.values() for s in a.values() if s == "concluida"
    )
    total_possivel = total_alunos * total_tarefas
    pct_geral = round((total_concluidas / total_possivel) * 100) if total_possivel else 0

    return render_template(
        "index.html",
        alunos=ALUNOS,
        tarefas=TAREFAS,
        progresso=progresso,
        total_tarefas=total_tarefas,
        total_alunos=total_alunos,
        total_concluidas=total_concluidas,
        pct_geral=pct_geral,
        ano=datetime.now().year,
    )


@app.route("/tarefa/<int:tarefa_id>")
def detalhe_tarefa(tarefa_id):
    tarefa = next((t for t in TAREFAS if t["id"] == tarefa_id), None)
    if not tarefa:
        return "Tarefa não encontrada", 404
    progresso = carregar_progresso()
    return render_template(
        "tarefa.html",
        tarefa=tarefa,
        alunos=ALUNOS,
        progresso=progresso,
        ano=datetime.now().year,
    )


@app.route("/aluno/<path:nome_aluno>")
def detalhe_aluno(nome_aluno):
    if nome_aluno not in ALUNOS:
        return "Aluno não encontrado", 404
    progresso = carregar_progresso()
    status_aluno = progresso.get(nome_aluno, {})
    concluidas = sum(1 for s in status_aluno.values() if s == "concluida")
    pct_aluno = round((concluidas / len(TAREFAS)) * 100) if TAREFAS else 0
    return render_template(
        "aluno.html",
        aluno=nome_aluno,
        tarefas=TAREFAS,
        status_aluno=status_aluno,
        concluidas=concluidas,
        pct_aluno=pct_aluno,
        ano=datetime.now().year,
    )


@app.route("/api/status", methods=["POST"])
def atualizar_status():
    data = request.get_json()
    aluno = data.get("aluno")
    tarefa_id = str(data.get("tarefa_id"))
    novo_status = data.get("status")

    if aluno not in ALUNOS:
        return jsonify({"erro": "Aluno não encontrado"}), 404
    if novo_status not in ("pendente", "em_andamento", "concluida"):
        return jsonify({"erro": "Status inválido"}), 400

    progresso = carregar_progresso()
    if aluno not in progresso:
        progresso[aluno] = {}
    progresso[aluno][tarefa_id] = novo_status
    salvar_progresso(progresso)

    total_tarefas = len(TAREFAS)
    total_alunos = len(ALUNOS)
    total_concluidas = sum(
        1 for a in progresso.values() for s in a.values() if s == "concluida"
    )
    total_possivel = total_alunos * total_tarefas
    pct_geral = round((total_concluidas / total_possivel) * 100) if total_possivel else 0

    aluno_concluidas = sum(
        1 for s in progresso.get(aluno, {}).values() if s == "concluida"
    )
    pct_aluno = round((aluno_concluidas / total_tarefas) * 100) if total_tarefas else 0

    return jsonify({
        "ok": True,
        "pct_geral": pct_geral,
        "total_concluidas": total_concluidas,
        "pct_aluno": pct_aluno,
        "aluno_concluidas": aluno_concluidas,
    })


@app.route("/api/progresso")
def api_progresso():
    return jsonify(carregar_progresso())


if __name__ == "__main__":
    app.run(debug=True, port=5000)
