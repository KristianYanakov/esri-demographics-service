import express from 'express';
import axios from 'axios';

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());

app.get('/', (req,res) => {
    res.send('Esri Demographic Data Service is running');
});


//Server Port
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})