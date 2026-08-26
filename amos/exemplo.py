"""
Exemplo Simples de Utilitário DevOps para o Aluno Amós.
DevOps N2S - Exemplo prático de script de verificação.
"""

import sys
import os
import json
import subprocess
from datetime import datetime

def exibir_banner():
    print("=" * 55)
    print(" 🚀 DevOps N2S - Módulo do Aluno: Amós Simões")
    print(" 📅 Data:", datetime.now().strftime("%d/%m/%Y %H:%M:%S"))
    print("=" * 55)

def verificar_git():
    print("\n🔍 Checando status do Git no repositório local...")
    try:
        branch = subprocess.check_output(["git", "branch", "--show-current"], text=True).strip()
        user_name = subprocess.check_output(["git", "config", "user.name"], text=True).strip()
        print(f"  ✅ Nome no Git: {user_name or 'Não configurado'}")
        print(f"  ✅ Branch Atual: {branch or 'Nenhuma'}")
    except Exception as e:
        print("  ⚠️ Git não encontrado ou não inicializado neste diretório.")

def carregar_progresso():
    progresso_path = os.path.join(os.path.dirname(__file__), "..", "progresso.json")
    print("\n📊 Checando dados de progresso...")
    if os.path.exists(progresso_path):
        try:
            with open(progresso_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                aluno_info = data.get("alunos", {}).get("01", {})
                if aluno_info:
                    print(f"  👤 Aluno: {aluno_info.get('nome')}")
                    concluidas = sum(1 for status in aluno_info.get("tarefas", {}).values() if status == "concluida")
                    total = len(aluno_info.get("tarefas", {}))
                    print(f"  📈 Tarefas Concluídas: {concluidas}/{total}")
                else:
                    print("  ℹ️ Aluno #01 (Amós) não localizado em progresso.json.")
        except Exception as e:
            print(f"  ⚠️ Erro ao ler progresso.json: {e}")
    else:
        print("  ℹ️ Arquivo progresso.json ainda não gerado.")

def main():
    exibir_banner()
    verificar_git()
    carregar_progresso()
    print("\n🎉 Exemplo executado com sucesso!\n")

if __name__ == "__main__":
    main()
