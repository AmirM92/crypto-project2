


$(() => {

    getAndDisplayCurrencies();

    const mainContent = document.getElementById("mainContent");
    const currenciesLink = document.getElementById("currenciesLink");
    const reportsLink = document.getElementById("reportsLink");
    const aboutLink = document.getElementById("aboutLink");
    const logoWebImg = document.getElementById("logoWebImg");
    const searchNavbar = document.getElementById("searchNavbar");
    const moreCoinDataArr = [];

    const selectedCryptoCard = [];
    const selectedCryptoCardModal = document.getElementById("modalCoin");
    const myModalCard = new bootstrap.Modal(selectedCryptoCardModal);
    const checkboxes = document.getElementsByClassName("toggle-one");

    currenciesLink.addEventListener("click", () => {
        getAndDisplayCurrencies();
    });
    reportsLink.addEventListener("click", displayReports);
    aboutLink.addEventListener("click", displayAbout);
    logoWebImg.addEventListener("click", displayCurrencies);

    function displayReports() {
        mainContent.innerHTML = `<h1>Reports... </h1>`;
    }

    function displayAbout() {
        mainContent.innerHTML = `<h1>About... </h1>`;
    }



    //------------------------------------------------------//
    //                      API                             //
    //------------------------------------------------------//

    // Big API for all data//
    async function getCurrenciesApi(url) {
        const data = await fetch(url);
        const json = await data.json();
        return json;
    }

    // The smaller API for converting coins//
    async function getCurrenciesSecondApi(values) {
        const data = await fetch(`https://api.coingecko.com/api/v3/coins/${values}`);
        const json = await data.json();
        return json;
    }

    //--------------------------------------------------//
    //               Dispaly currencies                 //
    //--------------------------------------------------//

    async function getAndDisplayCurrencies(filterString = '') {
        const currencies = await getCurrenciesApi("apiCard.json");
        const filteredCurrencies = currencies.filter(coin => {
            return (
                coin.symbol.toLowerCase().includes(filterString) ||
                coin.name.toLowerCase().includes(filterString)
            );
        });
        displayCurrencies(filteredCurrencies);
    }

    async function displayMoreInfo(coinId) {
        try {
            const container = document.getElementById(coinId);
            const cardBodyInfo = container.querySelector(".card-body-data");


            const sessionData = sessionStorage.getItem(coinId);
            const currentTime = Date.now();
            const twoMinutes = 2 * 60 * 1000;

            if (sessionData) {
                const { data, timestamp } = JSON.parse(sessionData);
                if (currentTime - timestamp <= twoMinutes) {
                    cardBodyInfo.innerHTML = data;
                    return;
                }
            }

            const spinner = document.createElement("div");
            spinner.classList.add("spinner-border", "spinner-border-sm");
            spinner.setAttribute("role", "status");
            const button = container.querySelector(".more-data-btn");
            button.disabled = true;
            button.appendChild(spinner);

            // Fetch data from the API
            const response = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}`);
            const coinInfo = await response.json();

            // Hide spinner and enable button
            button.removeChild(spinner);
            button.disabled = false;

            // Update the card body with the new data
            const htmlData = `
                <ul>
                    <li>USD: ${coinInfo.market_data.current_price.usd} $</li>
                    <li>EUR: ${coinInfo.market_data.current_price.eur} €</li>
                    <li>NIS: ${coinInfo.market_data.current_price.ils} ₪</li>
                </ul>
            `;
            cardBodyInfo.innerHTML = htmlData;

            // Save the data to session storage
            const newData = {
                data: htmlData,
                timestamp: currentTime,
            };
            sessionStorage.setItem(coinId, JSON.stringify(newData));
        } catch (error) {
            console.error("Error fetching more info:", error);
        }
    }



    function displayCurrencies(coins) {
        let html = ``;
        for (const coin of coins) {
            html += `
                <div id="${coin.id}" class="card" style="width: 18rem;">
                    <div class="card-body">
                        <div class="form-check form-switch">
                            <input class="form-check-input toggleBox" type="checkbox" role="switch" id="${coin.id}">
                            <label class="form-check-label" for="flexSwitchCheckDefault${coin.id}"></label>
                        </div>
                        <img src="${coin.image}" height="40" width="40" alt="${coin.name}">
                        <h5 class="card-title">${coin.name}</h5>
                        <h6 class="card-subtitle mb-2 text-body-secondary">${coin.symbol}</h6>
                        <div class="more-info-container">
                            <button id="${coin.id}" class="btn btn-primary more-data-btn" type="button" data-bs-toggle="collapse"
                                data-bs-target="#collapseExample${coin.id}" aria-expanded="false" aria-controls="collapseExample"
                                onclick="displayMoreInfo('${coin.id}')">
                                More Info
                            </button>
                            
                            <div class="collapse" id="collapseExample${coin.id}">
                                <div class="card card-body-data"></div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }



        mainContent.innerHTML = html;

        const moreInfoButtons = document.getElementsByClassName("more-data-btn");
        for (const button of moreInfoButtons) {
            button.addEventListener("click", function () {
                const coinId = button.id;
                displayMoreInfo(coinId);
            });
        }
    }


    $(".toggleBox").on("click", function () {
        if (this.checked === true) {
            selectedCryptoCard.push(this.value);
        }
        if (this.checked === false) {
            let uncheck = this.value;
            const indexUncheck = selectedCryptoCard.findIndex((name) => name === uncheck);
            selectedCryptoCard.splice(indexUncheck, 1);
        }
        if (selectedCryptoCard.length > 5) {
            myModalCard.show();
        }

        const cardInTheModal = document.getElementById("cardInTheModal");
        let htmlMOdal = "";
        for (let i = 0; i < selectedCryptoCard.length - 1; i++) {
            htmlMOdal += `
            <div class="card">
            <div class="card-body cardModal">
              <span class="nameSelectCard">${selectedCryptoCard[i]}</span>
              <span class="btn-toggle selected-toggle">
              <input class="toggle-one ee" data-bs-dismiss="modal" type="checkbox" name="modalCheckBox" value="${selectedCryptoCard[i]}" id="checkModalCard${i}">
              <label class="toggle" for="checkModalCard${i}"></label>
            </span>
            </div>
          </div>`;
        }
        cardInTheModal.innerHTML = htmlMOdal;

        const modalCheckBox = document.getElementsByName("modalCheckBox");
        const checkboxes = document.getElementsByClassName("toggle-one");
        for (const checkModalCard of modalCheckBox) {
            checkModalCard.checked = true;
            checkModalCard.addEventListener("click", function () {
                if (checkModalCard.checked === false) {
                    for (const shutDown of checkboxes) {
                        if (shutDown.value === checkboxes.value) {
                            shutDown.checked = false;
                        }
                    }
                    const indexUncheck = selectedCryptoCard.findIndex((name) => name === checkModalCard.value);
                    selectedCryptoCard.splice(indexUncheck, 1);
                }
            });
        }
    });

    const closeModal = document.getElementById("closeModal");
    closeModal.addEventListener("click", () => {
        const lastCard = selectedCryptoCard[selectedCryptoCard.length - 1];
        for(const crypto of checkboxes) {
            if(crypto.value === lastCard){
                crypto.checked = false;
            }
        }
        const indexCard = selectedCryptoCard.findIndex(crypto => crypto === lastCard);
        selectedCryptoCard.splice(indexCard, 1);
    })


    searchNavbar.addEventListener('keyup', (e) => {
        const searchString = e.target.value.toLowerCase();
        const filteredCoins = moreCoinDataArr.filter(coin => {
            return (
                coin.symbol.toLowerCase().includes(searchString) ||
                coin.name.toLowerCase().includes(searchString)
            );
        })

        getAndDisplayCurrencies(searchString);
    });
});
