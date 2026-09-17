function consultarPlaca() {

```
const placaInput = document.getElementById("placa");
const placa = placaInput.value.trim().toUpperCase();

const carregando = document.getElementById("carregando");
const resultado = document.getElementById("resultado");

if (placa.length < 7) {
    alert("Digite uma placa válida.");
    return;
}

// Mostra carregamento
resultado.classList.add("oculto");
carregando.classList.remove("oculto");

// Simulação temporária
setTimeout(() => {

    carregando.classList.add("oculto");
    resultado.classList.remove("oculto");

    document.getElementById("placaResultado").innerText = placa;
    document.getElementById("dadosPlaca").innerText = placa;

    document.getElementById("dadosMarca").innerText = "Aguardando API";
    document.getElementById("dadosModelo").innerText = "Aguardando API";
    document.getElementById("dadosAno").innerText = "Aguardando API";

    document.getElementById("statusVeiculo").innerText =
        "CONSULTA SIMULADA — API ainda não conectada";

}, 1500);
```

}
