const express = require("express");
const app = express();
const { db } = require('./firebase');
const multer = require('multer');
const cloudinary = require('cloudinary');
const { response } = require("express");
const upload = multer({ dest: 'uploads/' });



app.use(express.json())
app.use(express.urlencoded({ extended: true }))

cloudinary.config({
    cloud_name: 'dv5fwf13g',
    api_key: '296484175841721',
    api_secret: 'DJIqJ_Wi_Qg4jgSKlNVvZGPnQqU',
    secure: true
})

//finish login
app.get('/login', async (req, res) => {

    const username = req.query.username;
    const password = req.query.password;
    const querySnapshot = await db.collection('User').get();
    res.json(await validarUser(querySnapshot.docs, username, password));

})

app.post('/create-account', async (req, res) => {
    const nombre = req.body.name;
    const password = req.body.password;
    const rol = req.body.rol;

    const querySnapshot = await db.collection('User').add({
        "user-name": nombre,
        password,
        rol
    });
    res.json({
        "status": "true"
    });
})

validarUser = (docs, username, password) => {
    for (const user of docs) {
        if (user.data()["user-name"] === username && user.data()["password"] === password) {
            return {
                "status": "true",
                "message": "authorization",
                "rol": user.data()["rol"]
            };
        }
    }
    return {
        "status": "false",
        "message": "No existen esas credenciales"
    };
}

app.post('/add-equipo-medico', upload.array("img"), async (req, res) => {
  const response = await cloudinary.uploader.upload(
    req.files[0]["path"],
  )
  console.log(response.url);
    const nombre = req.body.nombre;
    const marca = req.body.marca;
    const piezas = req.body.piezas;
    const referencia = req.body.referencia;
    const querySnapshot = await db.collection("Medicos").add({
        "name": nombre,
        marca,
        piezas,
        referencia,
        "img": response.url
    });
    res.send({
        "status": "true",
        "message": "correct"
    })
})

app.get('/equipo-medico', async (req, res) => {
    const querySnapshot = await db.collection('Medicos').get();
    let photoList = [];
    for (const photo of querySnapshot.docs) {
        photoList.push(photo.data());
    }
    res.send({
        "data": photoList
    });
})

app.post('/add-consumibles', upload.array("img"), async (req, res) => {
    const nombre = req.body.nombre;
    const marca = req.body.marca;
    const piezas = req.body.piezas;
    const ref = req.body.ref;
    const ubicacion = req.body.ubicacion;
    const descripcion = req.body.descripcion;
    const compatible = req.body.compatible;
    const response = await cloudinary.uploader.upload(
        req.files[0]["path"],
      );

    if (nombre != "" && marca != "" && piezas != "") {
        const res = await db.collection("Consumibles").add({
            "name": nombre,
            marca,
            piezas,
            ubicacion,
            "referencia": ref,
            descripcion,
            "compatible-con": compatible,
            "img": response.url
        });
        console.log(res);
        res.send({
            "status": "true"
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
app.get('/search-medical', async (req, res) => {
    const query = req.query.query;

    if (query == "") {
        res.json({
            "data": []
        })
    } else {
        const querySnapshot = await db.collection('Medicos').get();
        let medicos = [];
        for (const medico of querySnapshot.docs) {
            const nombre = medico.get("name");
            if (nombre.toLowerCase().startsWith(query.toLowerCase())) {
                medicos.push({
                    "img": medico.get("img"),
                    "marca": medico.get("marca"),
                    "name": medico.get("name"),
                    "piezas": medico.get("piezas"),
                    "referencia": medico.get("referencia")
                });
            }
        }
        res.json({
            "data": medicos
        });

    }
})

app.get('/', async (req, res) => {
    res.send({
        "talk": "hello"
    });
})


app.listen('3000', () => {
    console.log("Server inicialized");
});