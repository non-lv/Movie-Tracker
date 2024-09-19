const ul: HTMLUListElement = document.querySelector('ul')!;

// Add Movie
function addMovie(item: string, year: number, image: string) {
    ul.className = 'collection';
    let yearNode = document.querySelectorAll('.collection .collection-year');

    let yearsList = yearInList(year);

    if (!yearsList) {
        const yearElement = document.createElement('div');
        yearElement.className = 'collection-year';
        const yearText = document.createTextNode(year.toString());
        yearElement.appendChild(yearText);

        let ele;
        if (yearNode.length > 0) {
            for (let i of yearNode)
                if (i.textContent! > year.toString()) { ele = i; break; }
        }

        const yearContainer = document.createElement('div');
        yearContainer.className = 'collection';

        if (ele) {
            ul.insertBefore(yearElement, ele);
            ul.insertBefore(yearContainer, ele);
        }
        else {
            ul.appendChild(yearElement);
            ul.appendChild(yearContainer);
        }
        yearsList = yearContainer;
    }
    const movieElement = document.createElement('div');
    movieElement.className = 'collection-item';
    addRemove(movieElement)

    const movieText = document.createElement('div');
    movieText.appendChild(document.createTextNode(item));
    movieText.className = 'item-title';
    movieElement.appendChild(movieText);

    const movieImage = document.createElement('div');
    movieImage.className = 'item-image';
    movieImage.style.backgroundImage = `url("${image}")`;
    movieElement.appendChild(movieImage);

    let yearsOrder = itemInList(movieElement, yearsList);
    if (yearsOrder == null)
        return;
    else if (yearsOrder)
        yearsList.insertBefore(movieElement, yearsOrder as ChildNode);
    else
        yearsList.appendChild(movieElement);

    document.getElementById("empty")!.hidden = true;
};

function yearInList(year: number) {
    let years = document.querySelectorAll('.collection .collection-year');
    if (years.length !== 0)
        for (let i in years) {
            if (years[i].innerHTML == year.toString())
                return years[i].nextSibling;
        }
    return false;
}

function itemInList(item: HTMLDivElement, yearContainer: ChildNode): ChildNode | Boolean {
    let yc = yearContainer.childNodes;
    yc.forEach(y => {
        if (y.textContent?.localeCompare(item.innerText) == 1)
            return y;
        else if (y.textContent?.localeCompare(item.innerText) == 0)
            return null;
    })

    return false;
}

// // Clear Movies
// ipcRenderer.on('item:clear', function (e) {
//     ul.innerHTML = '';
//     ul.className = '';

//     document.getElementById("empty").hidden = false;
// });

// Remove Movie
function addRemove(section: HTMLDivElement) {
    section.addEventListener('dblclick', () => removeItem(section));
}

async function removeItem(e: HTMLDivElement) {
    let collection = e.parentElement!
    //@ts-expect-error
    await movieAPI.removeMovie(e.textContent, collection.previousElementSibling.textContent);

    if (collection.childElementCount == 1) {
        collection.previousSibling?.remove();
        collection.remove();
    }
    else e.remove();

    if (ul.childElementCount == 0) {
        document.getElementById("empty")!.hidden = false;
        ul.className = '';
    }
}

// Add Movie Button
document.getElementById("add-btn")!.addEventListener('click', searchbar);

function searchbar() {
    document.getElementById("add-btn")!.animate([
        { transform: 'rotate(0deg)' },
        { transform: 'rotate(90deg)' }
    ], 200
    );

    let searchBar = document.getElementById('search-bar')!
    let search = document.getElementById('search')!
    searchBar.hidden = false
    searchBar.animate({ width: '100%', fill: 'forwards' }, 300);
    search.focus();
};

// Search Bar
document.getElementById("search-bar")!.addEventListener('focusout', searchout);

function searchout() {
    document.getElementById("add-btn")!.animate([
        { transform: 'rotate(90deg)' },
        { transform: 'rotate(0deg)' }
    ], 400
    );

    let searchBar = document.getElementById('search-bar')!
    searchBar.animate({ width: '100%', fill: 'forwards' }, 200)
    searchBar.hidden = true
};

// Search
document.getElementById("search-bar")!.addEventListener("submit", async function (e) {
    e.preventDefault();
    let search = document.getElementById("search");
    //@ts-expect-error
    let mov = await movieAPI.searchMovie(search.value)
    addMovie(mov.name, mov.year, mov.image)

    search!.innerText = "";
    search!.blur();
});

// Open searchbar with 'Enter' / close with 'Escape'
document.onkeyup = (e) => {
    switch (e.keyCode) {
        case (13):
            searchbar();
            break;
        case (27):
            let search = document.getElementById("search");
            search!.innerText = "";
            search!.blur();
            break;
        default:
    }
}


async function loadMovies() {
    //@ts-expect-error
    let list = await movieAPI.getList();
    list.forEach((element: { name: string; year: number; image: string; }) => {
        addMovie(element.name, element.year, element.image)
    });
}

// Top Bar Buttons
document.getElementById("min-btn")!.addEventListener('click', function () {
    //@ts-expect-error
    app.minimize();
})

document.getElementById("max-btn")!.addEventListener('click', function () {
    //@ts-expect-error
    app.maximize();
})

document.getElementById("close-btn")!.addEventListener('click', function () {
    //@ts-expect-error
    app.close();
})

loadMovies();