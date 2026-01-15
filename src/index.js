import express from 'express';
import axios from 'axios';

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use(express.static("public"));

app.get('/', (req,res) => {
    let context = {"example": "my context value example!"};
    res.render('index.ejs', context);
});


//Server Port
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})