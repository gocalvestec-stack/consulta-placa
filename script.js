async function consultarPlaca() {

```
const placaInput = document.getElementById("placa");

const placa = placaInput.value
    .trim()
    .toUpperCase();


const carregando = document.getElementById("carregando");
const resultado = document.getElementById("resultado");


if (placa.length < 7) {

    alert("Digite uma placa válida.");

    return;

}


// Mostra carregamento
resultado.classList.add("oculto");
carregando.classList.remove("oculto");


try {

    const resposta = await fetch("http://localhost:3000/api/consulta", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            placa: placa
        })

    });


    const dados = await resposta.json();


    carregando.classList.add("oculto");


    if (!resposta.ok) {

        alert(dados.erro || "Erro na consulta.");

        return;

    }


    resultado.classList.remove("oculto");


    document.getElementById("placaResultado").innerText = placa;

    document.getElementById("dadosPlaca").innerText = placa;


    /*
    ======================================
    INTERPRETAÇÃO DOS DADOS DA API
    ======================================
    */

    const veiculo = dados.dados?.dados || dados.dados?.data || {};


    document.getElementById("dadosMarca").innerText =
        veiculo.marca ||
        veiculo.marcaModelo ||
        veiculo.marca_modelo ||
        "Não informado";


    document.getElementById("dadosModelo").innerText =
        veiculo.modelo ||
        veiculo.marcaModelo ||
        veiculo.marca_modelo ||
        "Não informado";


    document.getElementById("dadosAno").innerText =
        veiculo.ano ||
        veiculo.anoModelo ||
        veiculo.ano_modelo ||
        "Não informado";


    const status = document.getElementById("statusVeiculo");


    /*
    ======================================
    VERIFICAÇÃO DE ROUBO/FURTO

    O campo exato depende da API contratada.
    ======================================
    */

    const rouboFurto =
        veiculo.roubo_furto ||
        veiculo.rouboFurto ||
        veiculo.roubo_ou_furto ||
        veiculo.restricoes?.rouboOuFurto;


    if (rouboFurto === true ||
        rouboFurto === "CONSTA" ||
        rouboFurto === "SIM") {

        status.innerText = "⚠️ ATENÇÃO: INDÍCIO DE ROUBO OU FURTO";

        status.style.background = "#5c1717";
        status.style.color = "#ff7777";

    } else {

        status.innerText = "Situação consultada na base autorizada";

        status.style.background = "#163d2b";
        status.style.color = "#63e6a0";

    }


} catch (erro) {

    carregando.classList.add("oculto");

    alert(
        "Não foi possível conectar ao servidor. Verifique se o backend está funcionando."
    );

    console.error(erro);

}
```

}
