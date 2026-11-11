/// npm i-> cria o pacote inicial API
// node index.js
const express = require("express")
const app = express()
app.use(express.json())
const port = 3000
const db = require("./db")

app.get("/aula", async (req, res) => {
    try {
        const resultado = await db.pool.query("SELECT * FROM aula")
        res.status(200).json(resultado[0])
    } catch (erro) {
        res.status(500).json({erro: erro.message})
    }
})

app.post("/aula", async (req, res) => {
    try {
        const dados = req.body
        const resultado = await db.pool.query(
            "INSERT INTO aula (serie, turma, componente, professor) VALUES (?, ?, ?, ?)",
            [dados.serie, dados.turma, dados.componente, dados.professor]
        )
        res.status(201).json(
            {resultado: "Aula cadastrada, ID = " + resultado[0].insertId}
        )
    } catch (erro) {
        res.status(500).json({erro: erro.message})
    }
})

app.delete("/aula/:id", async (req, res) => {
    try {
        const { id } = req.params
        const resultado = await db.pool.query(
            "DELETE FROM aula WHERE id = ?",
            [id]
        )

        if (resultado[0].affectedRows === 0) {
            return res.status(404).json({ erro: "Aula não encontrada" })
        }

        res.status(200).json({ resultado: "Aula removida com sucesso" })
    } catch (erro) {
        // aula possui horários vinculados (FK)
        if (erro.code === "ER_ROW_IS_REFERENCED_2") {
            return res.status(400).json({
                erro: "Não é possível excluir: existem horários vinculados a esta aula."
            })
        }
        res.status(500).json({ erro: erro.message })
    }
})

app.post("/horario", async (req, res) => {
    try {
        const { idaula, dia_semana, ordem } = req.body

        if (!idaula || !dia_semana || ordem === undefined) {
            return res.status(400).json({ erro: "Campos obrigatórios: idaula, dia_semana e ordem" })
        }

        const resultado = await db.pool.query(
            "INSERT INTO horario_aula (idaula, dia_semana, ordem) VALUES (?, ?, ?)",
            [idaula, dia_semana, ordem]
        )

        res.status(201).json({
            resultado: "Horário cadastrado, ID = " + resultado[0].insertId
        })
    } catch (erro) {
        // aula informada não existe na tabela aula (FK)
        if (erro.code === "ER_NO_REFERENCED_ROW_2") {
            return res.status(400).json({
                erro: "Aula informada não existe na tabela 'aula' (violação de chave estrangeira)."
            })
        }
        res.status(500).json({ erro: erro.message })
    }
})

app.get("/horario/:dia", async (req, res) => {
    try {
        const dia = req.params.dia

        const resultado = await db.pool.query(
            `SELECT h.id, h.idaula, h.dia_semana, h.ordem,
                    a.serie, a.turma, a.componente, a.professor
             FROM horario_aula h
             INNER JOIN aula a ON h.idaula = a.id
             WHERE LOWER(h.dia_semana) = LOWER(?)
             ORDER BY h.ordem ASC`,
            [dia]
        )

        res.status(200).json(resultado[0])
    } catch (erro) {
        res.status(500).json({ erro: erro.message })
    }
})

app.delete("/horario/:id", async (req, res) => {
    try {
        const { id } = req.params
        const resultado = await db.pool.query(
            "DELETE FROM horario_aula WHERE id = ?",
            [id]
        )

        if (resultado[0].affectedRows === 0) {
            return res.status(404).json({ erro: "Horário não encontrado" })
        }

        res.status(200).json({ resultado: "Horário removido com sucesso" })
    } catch (erro) {
        res.status(500).json({ erro: erro.message })
    }
})

app.listen(port, ()=>{
    console.log("API rodando na porta " + port)
})