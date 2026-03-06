import express from 'express';

const app = express();
const port = process.env.PORT || 3001;

app.get('/', (req, res) => {
    res.send('Dravya Server');
});

app.listen(port, () => {
    console.log(`Listening on ${port}`);
});
