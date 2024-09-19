import 'dotenv/config'
const { XMLHttpRequest } = require('xmlhttprequest');
export { }
var apikey = process.env.apikey;

async function getMovie(name: string) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.addEventListener("load", () => {
            if (xhr.status == 200) {
                const response = JSON.parse(xhr.responseText);
                resolve(response);
            } else
                reject(new Error(`request failed with ${xhr.status}`));
        });
        xhr.addEventListener("error", reject);

        xhr.open("GET", `http://www.omdbapi.com/?&apikey=${apikey}&s=${name}`);
        xhr.send();
    });
}

exports.getMovie = getMovie;