async function consultarPlaca() {

```
const input = document.getElementById("placa");

const placa = input.value
    .trim()
    .toUpperCase();


const carregando = document.getElementById("carregando");
const resultado = document.getElementById("resultado");


if (placa.length < 7) {

    alert("Digite uma placa válida.");

    return;

}


resultado.classList.add("oculto");
carregando.classList.remove("oculto");


try {

    const resposta = await fetch(
        "http://localhost:3000/api/consulta",
        {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                placa: placa
            })

        }
    );


    const dados = await resposta.json();


    carregando.classList.add("oculto");


    if (!resposta.ok) {

        alert(dados.erro || "Erro na consulta.");

        return;

    }


    resultado.classList.remove("oculto");


    // Placa
    document.getElementById("placaResultado").innerText =
        dados.placa;

    document.getElementById("dadosPlaca").innerText =
        dados.placa;


    // Dados do veículo
    document.getElementById("dadosMarca").innerText =
        dados.veiculo?.marca || "Não informado";

    document.getElementById("dadosModelo").innerText =
        dados.veiculo?.modelo || "Não informado";

    document.getElementById("dadosAno").innerText =
        dados.veiculo?.ano || "Não informado";


    // Status de segurança
    const status = document.getElementById("statusVeiculo");


    if (dados.seguranca.status === "ROUBADO_FURTADO") {

        status.innerText = "⚠️ ROUBADO/FURTADO";

        status.style.background = "#5c1717";
        status.style.color = "#ff7777";


    } else if (dados.seguranca.status === "SEM_REGISTRO") {

        status.innerText =
            "✓ SEM REGISTRO DE ROUBO/FURTO";

        status.style.background = "#163d2b";
        status.style.color = "#63e6a0";


    } else {

        status.innerText =
            "⚠️ INFORMAÇÃO INCONCLUSIVA";

        status.style.background = "#493b12";
        status.style.color = "#ffd166";

    }


} catch (erro) {

    carregando.classList.add("oculto");

    alert(
        "Não foi possível conectar ao servidor."
    );

    console.error(erro);

}
```

}
