const express = require("express");
const app = express();
const { db } = require('./firebase');

app.use(express.json())

//finish login
app.get('/login', async (req, res) => {
    console.log(req.query);
    const username = req.query.username;
    const password = req.query.password;
    const querySnapshot = await db.collection('User').get();
    res.json(await validarUser(querySnapshot.docs, username, password));

})

validarUser = (docs, username, password) => {
    for (const user of docs) {
        if (user.data()["user-name"] === username && user.data()["password"] === password) {
            return {
                "status": "true",
                "message": "authorization"
            };
        } else {
            return {
                "status": "false",
                "message": "No existen esas credenciales"
            };
        }
    }
}

app.post('/add-equipo-medico', async (req, res) => {
    const nombre = req.body.nombre;
    const marca = req.body.marca;
    const piezas = req.body.piezas;
    const referencia = req.body.referencia;
    const querySnapshot = await db.collection("Medicos").add({
        "name": nombre,
        marca,
        piezas,
        referencia
    });
    res.send({
        "status": "true",
        "message": "chidoo"
    })
})

app.get('/equipo-medico', async (req, res) => {
    const querySnapshot = await db.collection('Medicos').get();
    console.log(querySnapshot.docs[0].data());
    let photoList = [];
    for (const photo of querySnapshot.docs) {
        photoList.push(photo.data());
    }
    res.send({
        "data": photoList
    });
})

app.post('/add-consumibles', async (req, res) => {
    const nombre = req.body.nombre;
    const marca = req.body.marca;
    const piezas = req.body.piezas;
    const ref = req.body.ref;
    const ubicacion = req.body.ubicacion;
    const descripcion = req.body.descripcion;
    const compatible = req.body.compatible;

    if (nombre != "" && marca != "" && piezas != "") {
        const response = await db.collection("Consumibles").add({
            "name": nombre,
            marca,
            piezas,
            ubicacion,
            "referencia": ref,
            descripcion,
            "compatible-con": compatible
        });
        console.log(response);
        res.send({
            "status": "si se pudo crear"
        })
    } else {
        res.send({
            "status": "false",
            "message": "ocurrio algo inesperado"
        });
    }
})

app.get('/consumibles', async (req, res) => {
    const querySnapshot = await db.collection('Consumibles').get();
    console.log(querySnapshot.docs[0].data());
    let photoList = [];
    for (const photo of querySnapshot.docs) {
        photoList.push(photo.data());
    }
    res.send({
        "data": photoList
    });
})
app.get('/search-consumible', async (req, res) => {
    const query = req.query.query;

    const querySnapshot = await db.collection('Consumibles').get();
    let consumibles = [];
    for (const consumible of querySnapshot.docs) {
        const nombre = consumible.get("name");
        if (nombre.toLowerCase().startsWith(query.toLowerCase())) {
            consumibles.push(nombre);
        }
    }
    res.json({
        "data": consumibles
    });
})

app.get('/', async (req, res) => {
    res.send({
        "talk": "hello"
    });
})


app.listen('3000', () => {
    console.log("Server inicialized");
});