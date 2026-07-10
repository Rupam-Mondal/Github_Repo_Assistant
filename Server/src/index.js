import express from 'express';
import cors from 'cors';
import { UrlController } from './Controllers/UrlController.js';
import { questionController } from './Controllers/questionController.js';



const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cors());

app.post('/cloneRepo' , UrlController);
app.post('/askquestion' , questionController);

app.listen(3000 , () => {
    console.log("Server is running at 3000");
})