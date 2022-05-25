const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');
const app = express();
const port = 3000;
const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);
const cors = require('cors');


app.use(cors({ origin: '*' }));
app.use(bodyParser.json());


//CONSULTAR TREINOS
app.get('/ConfiguraTreino', async (req, res) => {

    if (req.query.id) {
        for (let i = 0; i < treino.length; i++) {
            if (Number(req.query.id) === treinos[i].id) {
                return res.json({ treinos: treinos[i] });
            }
        }

        return res.json({ msg: 'Treinos inexistentes.' });
    } else {
        try {
            await client.connect();
            const treinos = await client.db('fithubdb').collection('treinos');
            const resultados = await treinos.find();

            if (await resultados.count() > 0) {
                const arrayResultado = [];
                await resultados.forEach((doc) => {
                    arrayResultado.push(doc);
                });

                res.json({ treinos: arrayResultado });
            } else {
                res.status(404).json({ msg: 'Treino não encontrado.' });
            }

            await client.close();
        } catch (e) {
            console.log(e);
            return res.status(500).json({ msg: 'Deu problema. F' });
        }
    }
});


//EXCLUIR TREINOS
app.delete('/ConfiguraTreino/:id', async (req, res) => {
    try {
        await client.connect();
        const treinos = await client.db('fithubdb').collection('treinos');
        const resultado = await treinos.deleteOne({ _id: ObjectId(req.params.id) });

        if (resultado.deletedCount > 0) {
            res.json({ msg: 'Registro deletado' });
        } else {
            res.json({ msg: 'Não encontrado.' });
        }

        await client.close();
    } catch {
        return res.status(500).json({ msg: 'Deu problema. F' });
    }
});

//ALTERAR TREINOS 
app.put('/ConfiguraTreino/:id', async (req, res) => {
    try {
        await client.connect();
        const treinos = await client.db('fithubdb').collection('treinos');
        const resultado = await treinos.replaceOne({ _id: ObjectId(req.params.id) }, { 
            sequencia: req.body.sequencia,
            equipamento : req.body.equipamento,
            exercicio : req.body.exercicio,
            serie : req.body.serie,
            repeticão: req.body.repeticao,
            carga : req.body.carga
         });

        if (resultado.modifiedCount === 1) {
            res.json({ msg: ' Editado com sucesso.' })
        } else {
            res.json({ msg: 'Não editado' });
        }

        await client.close();
    } catch (e) {
        console.log(e);
        return res.status(500).json({ msg: 'Deu problema. F' });
    }
});

//CADASTRAR TREINO
app.post('/ConfiguraTreino', async (req, res) => {
    try {
        await client.connect()
        const treinos = await client.db('fithubdb').collection('treinos');
        await treinos.insertOne(
            {
                sequencia: req.body.sequencia,
                equipamento : req.body.equipamento,
                exercicio : req.body.exercicio,
                serie : req.body.serie,
                repeticão: req.body.repeticao,
                carga : req.body.carga
            }
        );
        await client.close();

        return res.status(201).json({ msg: 'O treino foi criada com sucesso.' });


    } catch (e) {
        if (e.name === "MongoServerError" && e.code === 11000) {
            return res.status(400).json({ msg: 'Os dados não foram enviados corretamente.' });
        }

        console.log(e);
        return res.status(500).json({ msg: 'Deu problema. F' });
    }
});




//=====================================
app.listen(port, async () => {
    try {
        await client.connect();
        await client.db('fithubdb').command({ ping: 1 });
        console.log("Base de dados conectada!");
        await client.close();
    } catch (e) {
        console.log(e);
    }
});