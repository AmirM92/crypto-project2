"use strict";
$(() => {

    getAndDisplayCurrencies();

    const mainContent = document.getElementById("mainContent");
    const currenciesLink = document.getElementById("currenciesLink");
    const reportsLink = document.getElementById("reportsLink");
    const aboutLink = document.getElementById("aboutLink");
    const logoWebImg = document.getElementById("logoWebImg");
    const searchNavbar = document.getElementById("searchNavbar");
    const moreCoinDataArr = [];

    
    const checkBox = document.getElementsByClassName("form-check-input");

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
        mainContent.innerHTML = `<h1>About Me</h1>
        
        <div class="card mb-3" style="max-width: 540px;">
  <div class="row g-0">
    <div class="col-md-4">
      <img src="..." class="img-fluid rounded-start" alt="...">
    </div>
    <div class="col-md-8">
      <div class="card-body">
        <h5 class="card-title">Card title</h5>
        <p class="card-text">This is a wider card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.</p>
        <p class="card-text"><small class="text-body-secondary">Last updated 3 mins ago</small></p>
      </div>
    </div>
  </div>
</div>
        
        `;
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
    //               Display currencies                 //
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

    // const modal = new bootstrap.Modal(`#coinModal`);
    let modalArr = [];
    const MAX_SELECTED_COINS = 5;
    let modal;

    $("#mainContent").on("click", ".form-check-input", function () {
        const cardId = $(this).closest(".card").find(".more-data-btn").attr("id");
        console.log(`card id :${cardId}`);
        const index = modalArr.indexOf(cardId);
        if (index !== -1) {
            modalArr.splice(index, 1);
            $(`#${cardId}_modalSwitch`).prop("checked", false);
        } else {
            // Check if the maximum allowed coins have been selected
            if (modalArr.length >= MAX_SELECTED_COINS) {
                showModal(); // Show the modal when trying to select more than the allowed number of coins
                return;
            }
            modalArr.push(cardId);
            $(`#${cardId}_modalSwitch`).prop("checked", true);
        }
    });
    
    console.log(moreCoinDataArr);
    function showModal() {
        const selectedCardsData = [];
        for (const id of modalArr) {
            const coinData = moreCoinDataArr.find(coin => coin.id === id);
            if (coinData) {
                selectedCardsData.push(coinData);
            }
        }
    
        let modalHtml = "";
        for (const data of selectedCardsData) {
            modalHtml += `
                <div class="card">
                    <h5 class="card-header">${data.symbol}</h5>
                    <div class="logo-title">
                        <!-- logo -->
                        <img src="${data.image}" class="modal-logo" alt="my-logo" width="20%">
                        <br></br>
                        <h5 class="card-title">${data.name}</h5>
                    </div>
                    <!-- Switch box -->
                    <div class="form-check form-switch">
                        <input class="form-check-input-modal" type="checkbox" role="switch" id="${data.id}_modalSwitch">
                    </div>
                </div>
            `;
        }
    
        modal = new bootstrap.Modal(document.getElementById("coinModal"));
        modal.show();
        
        // Now insert the modalHtml into the modal's body
        $(".modal-body").html(modalHtml);
    
        // The click event listener for the checkboxes inside the modal remains the same.
        $(".modal-body .form-check-input-modal").on("click", function () {
            const modalCardId = this.id.replace("_modalSwitch", "");
            modal.hide(); 
        });
    }
    
    

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
