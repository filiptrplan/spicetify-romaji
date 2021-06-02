const express = require('express');
var bodyParser = require('body-parser');
const dfi = require('d-fi-core');
const cors = require('cors');

const app = express();
const port = 3311;
const arl =
    '6bd1109ffd77500e1a79b614509727c9d440ff56fa72a5252205758ff8a61a34111e8252c88b360151c9871e482fe37c20427ede0cdd77d0a90ad06ff9bd068bf77d1e5baee6e5f53bf01c0d7e9d915c711ab712914a072a0f06184f7cf8e709';
const corsOptions = {
    origin: '*',
};

// Configuring body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors(corsOptions));

app.post('/track', async (req, res) => {
    const reqTitle = req.body.title;
    if (reqTitle == null || reqTitle == undefined) return;
    const songData = await dfi.searchMusic(reqTitle, ['TRACK']);
    let response = {
        title: '',
        album: '',
        artist: '',
    };
    if (songData.TRACK.data.length > 0) {
        response.title = songData.TRACK.data[0].SNG_TITLE;
    } else if (songData.TOP_RESULT.length > 0) {
        response.title = songData.TOP_RESULT[0].SNG_TITLE;
    }
    res.send(response);
});

app.post('/album', async (req, res) => {
    const reqTitle = req.body.title;
    const reqArtist = req.body.artist;
    let reqString = reqTitle;
    if (reqTitle == null || reqTitle == undefined) return;
    if (reqArtist != null && reqArtist != undefined)
        reqString += ` - ${reqArtist}`;
    const songData = await dfi.searchMusic(reqString, ['ALBUM']);
    let response = {
        title: '',
        songs: [],
        artist: '',
    };
    if (songData.ALBUM.data.length > 0) {
        response.title = songData.ALBUM.data[0].ALB_TITLE;
        const tracks = await dfi.getAlbumTracks(songData.ALBUM.data[0].ALB_ID);
        response.songs = tracks.data.map((x) => {
            return {
                title: x.SNG_TITLE,
                index: x.TRACK_NUMBER,
                disc: x.DISK_NUMBER,
                artists: x.ARTISTS.map(y => y.ART_NAME)
            };
        });
        response.artist = songData.ALBUM.data[0].ART_NAME;
    }
    res.send(response);
});

app.post('/artist', async (req, res) => {
    const reqTitle = req.body.title;
    if (reqTitle == null || reqTitle == undefined) return;
    const songData = await dfi.searchMusic(reqTitle, ['ARTIST']);
    let response = {
        title: '',
    };
    if (songData.ARTIST.data.length > 0) {
        response.title = songData.ARTIST.data[0].ART_NAME;
    } else if (songData.TOP_RESULT.length > 0) {
        response.title = songData.TOP_RESULT[0].ART_NAME;
    }
    res.send(response);
});

app.listen(port, async () => {
    console.log(`Hello world app listening on port ${port}!`);
    await dfi.initDeezerApi(arl);
});
