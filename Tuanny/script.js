// MENU MOBILE

function abrirMenu() {

    const menu = document.getElementById("menu");

    menu.classList.toggle("ativo");

}


// SCROLL PARA OS ARTIGOS

function scrollParaArtigos() {

    const artigos = document.getElementById("artigos");

    artigos.scrollIntoView({
        behavior: "smooth"
    });

}


// FILTRAR ARTIGOS

function filtrar(categoria) {

    const cards = document.querySelectorAll(".card");

    const botoes = document.querySelectorAll(".filtro");


    botoes.forEach(botao => {

        botao.classList.remove("ativo");

    });


    event.target.classList.add("ativo");


    cards.forEach(card => {

        if (
            categoria === "todos" ||
            card.dataset.categoria === categoria
        ) {

            card.style.display = "block";

        } else {

            card.style.display = "none";

        }

    });

}


// ABRIR ARTIGO

function lerArtigo(titulo) {

    alert(
        "Você selecionou o artigo:\n\n" +
        titulo +
        "\n\nEm breve o conteúdo completo estará disponível!"
    );

}


// FORMULÁRIO

const formulario =
    document.getElementById("formContato");


formulario.addEventListener("submit", function(event) {

    event.preventDefault();


    const nome =
        document.getElementById("nome").value;


    alert(
        `Obrigado, ${nome}! Sua mensagem foi enviada.`
    );


    formulario.reset();

});