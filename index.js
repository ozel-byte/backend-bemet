const express = require("express");
const app = express();
const { db } = require('./firebase');
const multer = require('multer');
const cloudinary = require('cloudinary');
const { response } = require("express");
const upload = multer({ dest: 'uploads/' });
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);



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
    res.json(await validarUser(querySnapshot, username, password));

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

validarUser = (querySnapshot, username, password) => {
    for (const user of querySnapshot.docs) {
        if (user.data()["user-name"] === username && user.data()["password"] === password) {
            return {
                "status": "true",
                "message": "authorization",
                "rol": user.data()["rol"],
                "user": {
                    "id": user.id,
                    "rol": user.data()["rol"],
                    "name": user.data()["user-name"]
                }
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
    let medicalList = [];
    for (const medical of querySnapshot.docs) {
        medicalList.push({
            "img": medical.get("img"),
            "marca": medical.get("marca"),
            "name": medical.get("name"),
            "piezas": medical.get("piezas"),
            "referencia": medical.get("referencia"),
            "id": medical.id
        });
    }
    res.send({
        "data": medicalList
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
        const resp = await db.collection("Consumibles").add({
            "name": nombre,
            marca,
            piezas,
            ubicacion,
            "referencia": ref,
            descripcion,
            "compatible-con": compatible,
            "img": response.url
        });
        res.json({
            "status": "true"
        })
    } else {
        res.json({
            "status": "false",
            "message": "ocurrio algo inesperado"
        });
    }
})

app.post("/add-notifi", async (req,res) => {
    const nombre = req.body.nombre;
    const id = req.body.id;
    const producto = req.body.producto;
    const typeProduct = req.body.typeProduct;
    const totalProduct = req.body.total;

    const qury = await db.collection("Notifications").add({
        nombre,
        producto
    });

    if (typeProduct == "medical") {
     await db.collection("Medicos").doc(id).update({"piezas":totalProduct})
    }else{
     await db.collection("Consumibles").doc(id).update({"piezas":totalProduct})
    }

    res.send({
        "data": "true"
    });
})
app.get("/notifiaction", async (req, res) => {
    const querySnapshot = await db.collection('Notifications').get();
    let notificacions = [];
    for (const noti of querySnapshot.docs) {
        notificacions.push({
            "nombre": noti.get("nombre"),
            "id": noti.get("id"),
            "producto": noti.get("producto"),
            "id-noti": noti.id
        });
    }
    res.json({
        "data": notificacions
    })
})

app.post("/accept-noti", async (req,res) => {
    const querey = await db.collection("Notifications").doc(req.body.id).delete();
   res.send({
    "status": "true"
   })

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
    console.log("hollala");
    res.send({
        "talk": "hello"
    });
})



io.on('connection', (socket) => {
    console.log("a user connected");
    socket.on("msg", (msg) => {
        console.log(msg);
    })
})


server.listen('3000', '0.0.0.0', () => {
    console.log("Server inicialized");
});