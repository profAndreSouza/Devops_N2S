const texto = `Olá! me chamo Rafaela`;

        const elemento = document.getElementById("texto");

        let i = 0;

        function digitar() {
            if (i < texto.length) {
                elemento.textContent += texto.charAt(i);
                i++;

                setTimeout(digitar, 40);
            }
        }

        digitar();