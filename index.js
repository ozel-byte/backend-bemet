const express = require("express");
const app = express();
const {db} = require('./firebase');

app.get('/login', (req,res) => {
    res.send('login');
})

app.post('/add-equipo-medico', (req,res) => {
    res.send('equipo-medico');
})
app.post('/add-insumo', (req,res) => {
    res.send('insumo');
})
app.get('/', async (req,res) => {
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

app.listen('3000', () => {
    console.log("Server inicialized");
});