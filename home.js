console.log("This is JavaScript")
let currentSong = new Audio();
let songs;
let currfolder;

//This function will fetch songs from the given url
async function getSongs(folder) {
    currfolder = folder;
    let muzik = await fetch(`http://127.0.0.1:3000/${folder}/`);
    let response = await muzik.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }

    let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";
    for (const muzik of songs) {
        const { artist, title } = parseURLEncodedFilename(muzik);
        songUL.innerHTML = songUL.innerHTML + `
        <li class="hover transform border-radius">
                            <svg class="transform" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"
                                fill="white">
                                <path d="M5 3.5
           C5 3.2, 5.4 3.1, 5.6 3.2
           L11 7
           C11.2 7.1, 11.2 7.4, 11 7.5
           L5.6 11.3
           C5.4 11.4, 5 11.3, 5 11
           Z" />
                            </svg>
                            <img src="assets/SongIcon.jpg" alt="Thumbnail">
                            <div class="Sinfo">
                                <div class="hidden">${muzik.replaceAll("%20", " ")}</div>
                                <h4>${title}</h4>
                                <div>${artist}</div>
                            </div></li>`;
    }
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".Sinfo").firstElementChild.innerHTML);
        })
    });
    return songs;
}
//This function will separate the muzik name from its artist and remove other unnecessary encodings
function parseURLEncodedFilename(encodedFilename) {
    // Step 1: Decode
    const decoded = decodeURIComponent(encodedFilename);
    // Step 2: Remove extension
    const cleanName = decoded.replace(/\.[^/.]+$/, "");
    // Step 3: Split into artist and title
    const parts = cleanName.split(" - ");
    if (parts.length >= 2) {
        return {
            artist: parts[0].trim(),
            title: parts.slice(1).join(" - ").trim()
        };
    } else {
        return {
            artist: "Unknown Artist",
            title: cleanName.trim()
        };
    }
}
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

//this function will play music
const playMusic = (track) => {
    currentSong.src = `/${currfolder}/` + track;
    currentSong.play();
    const btnn = document.getElementById("playPause");
    btnn.src = "pause.svg";
    document.querySelector(".songInfo").innerHTML = decodeURIComponent(track.replace(".mp3", ""));
    document.querySelector(".songtime").innerHTML = "00:00/00:00";

}

//fuction to display albums
async function displayAlbums() {
    let an = await fetch(`http://127.0.0.1:3000/songs/`);
    let response = await an.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");
    let arr = Array.from(anchors);
    for (let index = 0; index < arr.length; index++) {
        const e = arr[index];

        if (e.href.includes("/songs")) {
            let folderr = e.href.split("/").slice(-2)[0];
            console.log(folderr)
            let a = await fetch(`http://127.0.0.1:3000/songs/${folderr}/info.json`);
            let response = await a.json();
            cardContainer.innerHTML = cardContainer.innerHTML + `
            <div data-folder="${response.data_folder}" class="card border-radius hover transform">
                        <img src="songs/${folderr}/cover.jpg" alt="Thumbnail">
                        <div class="transform playButton"><img src="playButton.svg" alt="play"></div>
                        <h3>${response.title}</h3>
                        <p>${response.description}</p>
                    </div>
            `
        }
    }

    // getting the list of songs 
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async items => {
            songs = await getSongs(`songs/${items.currentTarget.dataset.folder}`);
            playMusic(songs[0]);
        })
    })
}

//this is the main function here
async function main() {

    await getSongs("songs/punjabi");
    displayAlbums();

    //event listener to play puse and previous next the song
    const btn = document.getElementById("playPause");
    btn.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            btn.src = "pause.svg";
        } else {
            currentSong.pause();
            btn.src = "playButton.svg";
        }
    })

    //listen for time update event of the song
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `
        ${formatTime(currentSong.currentTime)}/${formatTime(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })
    //adding evenet listner to seek bar
    document.querySelector(".seekBar").addEventListener("click", (e) => {
        // console.log(e);
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;

    })
    //Event listner for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
        document.querySelector(".right").style.filter = "blur(10px)";

    })
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-110%";
        document.querySelector(".right").style.filter = "blur(0)";

    })

    //event listeners to previous next
    prev.addEventListener("click", () => {
        // console
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        console.log(songs, index);
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1]);
        }
    })
    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        console.log(songs, index);
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1]);
        }
    })
    document.getElementById("vol").addEventListener("click", () => {
        if (currentSong.volume == 0) {
            currentSong.volume = 1;
            vol.src = "assets/volumefull.svg";

        }
        if (currentSong.volume > 0) {
            currentSong.volume = 0;
            vol.src = "assets/volume-off.svg";
        }

    })
    document.querySelector(".rangeVol").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
        if (currentSong.volume > 0) {
            vol.src = "assets/volumefull.svg";
        }
        if (currentSong.volume == 0) {
            vol.src = "assets/volume-off.svg";

        }

    })





}
main();