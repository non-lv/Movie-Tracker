window.$ = window.jQuery = require('jquery');

const { ipcRenderer, remote } = require('electron');

const ul = document.querySelector('ul');

// Add Movie
ipcRenderer.on('item:add', function (e, item, year, image) {
    ul.className = 'collection';
    let yearNode = document.querySelectorAll('.collection .collection-year');

    let yearsList = yearInList(year);

    if (!yearsList) {
        const yearElement = document.createElement('div');
        yearElement.className = 'collection-year';
        const yearText = document.createTextNode(year);
        yearElement.appendChild(yearText);

        let ele;
        if (yearNode.length > 0) {
            for (i of yearNode)
                if (i.innerText > year) { ele = i; break; }
        }

        const yearContainer = document.createElement('div');
        yearContainer.className = `collection`;

        if (ele) {
            ul.insertBefore(yearElement, ele);
            ul.insertBefore(yearContainer, ele);
        }
        else {
            ul.appendChild(yearElement);
            ul.appendChild(yearContainer);
        }
        addRemove(yearContainer);
        yearsList = yearContainer;
    }
    const movieElement = document.createElement('div');
    movieElement.className = 'collection-item';

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
        yearsList.insertBefore(movieElement, yearsOrder);
    else
        yearsList.appendChild(movieElement);

    document.getElementById("empty").hidden = true;
});

function yearInList(year) {
    let years = document.querySelectorAll('.collection .collection-year');
    if (years.length !== 0)
        for (i in years) {
            if (years[i].innerHTML == year)
                return years[i].nextSibling;
        }
    return false;
}

function itemInList(item, yearContainer) {
    let yc = yearContainer.children;
    if (yc.length !== 0) {
        for (y of yc) {
            if (y.innerText.localeCompare(item.innerText) == 1)
                return y;
            else if (y.innerText.localeCompare(item.innerText) == 0)
                return null;
        }
    }
    return false;
}

// Clear Movies
ipcRenderer.on('item:clear', function (e) {
    ul.innerHTML = '';
    ul.className = '';

    document.getElementById("empty").hidden = false;
});

// Remove Movie
function addRemove(section) {
    section.addEventListener('dblclick', removeItem);
}

function removeItem(e) {
    let ele = e.target.parentNode.parentNode;
    ipcRenderer.send('item:remove', e.target.innerText, ele.previousSibling.innerText);
    e.target.parentElement.remove();
    if (ele.children.length == 0) {
        ele.previousSibling.remove();
        ele.remove();
    }
    if (ul.children.length == 0) {
        document.getElementById("empty").hidden = false;

        ul.className = '';
    }
}

// Add Movie Button
document.getElementById("add-btn").addEventListener('click', searchbar);

function searchbar() {
    document.getElementById("add-btn").animate([
        { transform: 'rotate(0deg)' },
        { transform: 'rotate(90deg)' }
    ], 200
    );

    $('#search-bar').show();
    $('#search-bar').animate({ width: '100%' }, 300);
    $("#search").focus();
};

// Search Bar
document.getElementById("search-bar").addEventListener('focusout', searchout);

function searchout() {
    document.getElementById("add-btn").animate([
        { transform: 'rotate(90deg)' },
        { transform: 'rotate(0deg)' }
    ], 400
    );

    $('#search-bar').animate(
        { width: '0%' }
        , 200, () => { $(this).hide(); });
};

// Search
document.getElementById("search-bar").addEventListener("submit", function (e) {
    e.preventDefault();
    const name = document.querySelector('#search').value;
    ipcRenderer.send('search:movie', name);

    let search = document.getElementById("search");
    search.value = "";
    search.blur();
});

// Open searchbar with 'Enter' / close with 'Escape'
document.onkeyup = (e) => {
    switch (e.keyCode) {
        case (13):
            searchbar();
            break;
        case (27):
            let search = document.getElementById("search");
            search.value = "";
            search.blur();
            break;
        default:
    }
}

// Top Bar Buttons 
function top_btns() {
    var browWindow = remote.BrowserWindow;

    document.getElementById("min-btn").addEventListener("click", function (e) {
        browWindow.getFocusedWindow().minimize();
    });

    document.getElementById("max-btn").addEventListener("click", function (e) {
        browWindow.getFocusedWindow().maximize();
    });

    document.getElementById("close-btn").addEventListener("click", function (e) {
        browWindow.getFocusedWindow().close();
    });
}

document.onreadystatechange = function () {
    if (document.readyState == "complete")
        top_btns();
};