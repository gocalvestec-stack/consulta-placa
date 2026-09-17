require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());

app.use(express.json());

// ==========================================
// VALIDAR PLACA
// ==========================================

function validarPlaca(placa) {

```
if (!placa) return false;

const placaLimpa = placa
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");

// Modelo antigo: ABC1234
const modeloAntigo = /^[A-Z]{3}[0-9]{4}$/;

// Modelo Mercosul: ABC1D23
const modeloMercosul = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/;

return modeloAntigo.test(placaLimpa) ||
       modeloMercosul.test(placaLimpa);
```

}

// ==========================================
// ROTA PRINCIPAL
// ==========================================

app.get("/", (req, res) => {

```
res.json({
    sistema: "Consulta Placa Seguro",
    status: "online",
    mensagem: "Backend funcionando corretamente"
});
```

});

// ==========================================
// ROTA CONSULTA PLACA
// ==========================================

app.post("/api/consulta", async (req, res) => {

```
try {

    const { placa } = req.body;

    if (!validarPlaca(placa)) {

        return res.status(400).json({
            sucesso: false,
            erro: "Placa inválida. Informe ABC1234 ou ABC1D23."
        });

    }

    const placaLimpa = placa
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "");


    // Verifica se API está configurada
    if (!process.env.API_VEICULAR_KEY) {

        return res.status(500).json({
            sucesso: false,
            erro: "API veicular não configurada no servidor."
        });

    }


    /*
    =====================================================
    CONEXÃO COM API EXTERNA

    Esta parte será adaptada conforme o provedor escolhido.
    =====================================================
    */

    const resposta = await fetch(
        `${process.env.API_VEICULAR_URL}/v1/consultas`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.API_VEICULAR_KEY}`
            },

            body: JSON.stringify({
                servico: "consulta",
                placa: placaLimpa
            })
        }
    );


    const dados = await resposta.json();


    if (!resposta.ok) {

        return res.status(resposta.status).json({
            sucesso: false,
            erro: "Erro retornado pela API veicular.",
            detalhes: dados
        });

    }


    return res.json({
        sucesso: true,
        placa: placaLimpa,
        dados: dados
    });


} catch (erro) {

    console.error("Erro interno:", erro.message);

    return res.status(500).json({
        sucesso: false,
        erro: "Não foi possível realizar a consulta."
    });

}
```

});

// ==========================================
// INICIAR SERVIDOR
// ==========================================

app.listen(PORT, () => {

```
console.log(`Servidor rodando em http://localhost:${PORT}`);
```

});
