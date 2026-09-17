require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

const PORT = process.env.PORT || 3000;

// ==========================================
// CONFIGURAÇÕES DE SEGURANÇA
// ==========================================

app.use(cors({
origin: [
"http://localhost:5500",
"http://127.0.0.1:5500"
]
}));

app.use(express.json({
limit: "10kb"
}));

// ==========================================
// FUNÇÃO VALIDAR PLACA
// ==========================================

function validarPlaca(placa) {

```
if (!placa || typeof placa !== "string") {
    return false;
}

const limpa = placa
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");

const antiga = /^[A-Z]{3}[0-9]{4}$/;
const mercosul = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/;

return antiga.test(limpa) || mercosul.test(limpa);
```

}

// ==========================================
// LIMPAR PLACA
// ==========================================

function limparPlaca(placa) {

```
return placa
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
```

}

// ==========================================
// INTERPRETAR ROUBO E FURTO
// ==========================================

function interpretarRouboFurto(dados) {

```
/*
IMPORTANTE:

Os nomes dos campos variam conforme o fornecedor.

Esta função aceita vários formatos comuns.
*/

const texto = JSON.stringify(dados).toUpperCase();

const palavrasPositivas = [
    "ROUBADO",
    "FURTADO",
    "ROUBO CONFIRMADO",
    "FURTO CONFIRMADO",
    "COM RESTRICAO",
    "COM RESTRIÇÃO",
    "CONSTA ROUBO",
    "CONSTA FURTO"
];

const palavrasNegativas = [
    "SEM RESTRICAO",
    "SEM RESTRIÇÃO",
    "NÃO CONSTA",
    "NAO CONSTA",
    "NENHUM REGISTRO",
    "SEM REGISTRO"
];


// Verifica campos booleanos conhecidos
const possiveisCampos = [
    dados.roubo_furto,
    dados.rouboFurto,
    dados.roubo_ou_furto,
    dados.restricao_roubo_furto,
    dados.restricaoRouboFurto,
    dados.hasTheftRestriction
];


for (const valor of possiveisCampos) {

    if (valor === true) {

        return {
            status: "ROUBADO_FURTADO",
            mensagem: "ROUBADO/FURTADO"
        };

    }

    if (valor === false) {

        return {
            status: "SEM_REGISTRO",
            mensagem: "SEM REGISTRO DE ROUBO/FURTO"
        };

    }

}


// Verifica textos
for (const palavra of palavrasPositivas) {

    if (texto.includes(palavra)) {

        return {
            status: "ROUBADO_FURTADO",
            mensagem: "ROUBADO/FURTADO"
        };

    }

}


for (const palavra of palavrasNegativas) {

    if (texto.includes(palavra)) {

        return {
            status: "SEM_REGISTRO",
            mensagem: "SEM REGISTRO DE ROUBO/FURTO"
        };

    }

}


return {
    status: "INCONCLUSIVO",
    mensagem: "CONSULTA SEM INFORMAÇÃO CONCLUSIVA"
};
```

}

// ==========================================
// EXTRAIR DADOS DO VEÍCULO
// ==========================================

function extrairDadosVeiculo(dados) {

```
return {

    marca:
        dados.marca ||
        dados.marcaModelo ||
        dados.marca_modelo ||
        dados.brand ||
        "Não informado",

    modelo:
        dados.modelo ||
        dados.model ||
        "Não informado",

    ano:
        dados.ano ||
        dados.anoModelo ||
        dados.ano_modelo ||
        dados.modelYear ||
        "Não informado",

    cor:
        dados.cor ||
        dados.color ||
        "Não informado"

};
```

}

// ==========================================
// ROTA STATUS
// ==========================================

app.get("/", (req, res) => {

```
res.json({
    sistema: "Consulta Placa Seguro",
    status: "online",
    versao: "1.0.0"
});
```

});

// ==========================================
// ROTA CONSULTA
// ==========================================

app.post("/api/consulta", async (req, res) => {

```
try {

    const { placa } = req.body;


    // Validação
    if (!validarPlaca(placa)) {

        return res.status(400).json({
            sucesso: false,
            erro: "Placa inválida."
        });

    }


    const placaLimpa = limparPlaca(placa);


    // Verificar credenciais
    if (!process.env.APIBRASIL_BEARER_TOKEN) {

        return res.status(500).json({
            sucesso: false,
            erro: "Token da API não configurado."
        });

    }


    if (!process.env.APIBRASIL_ENDPOINT ||
        process.env.APIBRASIL_ENDPOINT.includes("COLOQUE")) {

        return res.status(500).json({
            sucesso: false,
            erro: "Endpoint da API não configurado."
        });

    }


    const url =
        process.env.APIBRASIL_BASE_URL +
        process.env.APIBRASIL_ENDPOINT;


    // Headers seguros
    const headers = {

        "Content-Type": "application/json",

        "Authorization":
            `Bearer ${process.env.APIBRASIL_BEARER_TOKEN}`

    };


    if (process.env.APIBRASIL_DEVICE_TOKEN) {

        headers["DeviceToken"] =
            process.env.APIBRASIL_DEVICE_TOKEN;

    }


    /*
    ==========================================
    CONSULTA API REAL
    ==========================================

    O formato exato do body deve seguir
    a documentação do endpoint contratado.
    */

    const resposta = await fetch(url, {

        method: "POST",

        headers,

        body: JSON.stringify({
            placa: placaLimpa
        })

    });


    const dadosApi = await resposta.json();


    if (!resposta.ok) {

        console.error("API retornou erro:", resposta.status);

        return res.status(502).json({

            sucesso: false,

            erro: "A API veicular recusou ou não processou a consulta."

        });

    }


    // Extrair dados
    const dadosVeiculo = extrairDadosVeiculo(dadosApi);


    // Interpretar roubo/furto
    const resultadoSeguranca =
        interpretarRouboFurto(dadosApi);


    return res.json({

        sucesso: true,

        placa: placaLimpa,

        seguranca: resultadoSeguranca,

        veiculo: dadosVeiculo,

        fonte: "API veicular autorizada"

    });


} catch (erro) {

    console.error("Erro interno:", erro.message);

    return res.status(500).json({

        sucesso: false,

        erro: "Erro interno ao realizar consulta."

    });

}
```

});

// ==========================================
// INICIAR SERVIDOR
// ==========================================

app.listen(PORT, () => {

```
console.log(`Servidor iniciado em http://localhost:${PORT}`);
```

});
