"use strict";
$(() => {

    const mainContent = document.getElementById("mainContent");
    const currenciesLink = document.getElementById("currenciesLink");
    const reportsLink = document.getElementById("reportsLink");
    const aboutLink = document.getElementById("aboutLink");
    const logoWebImg = document.getElementById("logoWebImg");
    const searchNavbar = document.getElementById("searchNavbar");
    const msgError = "Unfortunately there is currently an error"
    const coinsSelected = [];
    const checkboxes = document.getElementsByClassName("toggle-one");
    const mainTitle = document.getElementById("mainTitle")
    const selectedCardsModal = document.getElementById("staticBackdrop");
    const myModal = new bootstrap.Modal(selectedCardsModal);
    const loadingModal = document.getElementById("loadingModal");
    const modalLoad = new bootstrap.Modal(loadingModal);


    reportsLink.addEventListener("click", displayReports);
    aboutLink.addEventListener("click", displayAbout);
    logoWebImg.addEventListener("click", display);

    function displayReports() {
        mainContent.innerHTML = `
        <div class="coming-soon-web">
        <h2 class="coming-soon-h2">Coming Soon...</h2>
        <h2 class="coming-soon-h2">We're working on it</h2>
        <i class="fa-regular fa-person-digging"></i>
        <br>
        
        </div>
        `;
    }

    function displayAbout() {
        mainContent.innerHTML = `
        <div class="about-me-card"
     <div class="card mb-3" ">
     <div class="row g-0">
         <div class="col-md-3">
         <img src="assets/image/amir-photo.jpeg" class="img-amir" alt="...">
         </div>
       <div class="col-md-8">
          <div class="card-body">
           <h4 class="card-title">Hello everyone and welcome to my crypto website</h4>
           <br>
           <h6>A little about me</h6>
           <p class="card-text">I built a website of virtual currencies
           The site gives you the option to search for any currency you want from a list of 100 currencies and see additional information for the currency you choose
           You can see what the value of the currency is today in dollars, euros and even in shekels
           As soon as you click on the button, the site will send a message to you for information, after that it will already be stored on our site for your convenience. There is an option to mark which currency you want so that in the future
           You will see what its value is in real time every few seconds
           I hope you enjoy my site :)</p>
           <h6>A little about the site</h6>
           <p class="card-text">
           Hello, my name is Amir Mizrahi, 31 years old, living in Tel Aviv
           I study at John Bryce College
           Cross software
           Full Stack web and languages like HTML CSS & JS
           </small></p>
           <br>
           <a href="https://www.facebook.com/amir.mizrahi.5"><img src="assets/image/facebook-logo.avif" class="img-face" alt=""></a>
           <a href="https://github.com/AmirM92"><img src="assets/image/github-logo.png" class="img-git" alt=""></a>
           <a href="https://www.linkedin.com/?original_referer=https%3A%2F%2Fwww.google.com%2F"><img src="assets/image/linkedin-logo.png" class="img-linke" alt=""></a>
          </div>
       </div>
    </div>
</div>
</div>
        
        `;
    }

    async function saveToSessionStorage() {
        const data = await getJson(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1`);
        const str = JSON.stringify(data);
        sessionStorage.setItem("coinArr", str);
    }
    async function getJson(url) {
        try {
            const response = await fetch(url);
            const json = await response.json();
            return json;
        } catch (err) {
            console.error(err);
            mainContent.innerHTML = `<h1 class="msgError">${msgError}</h1>`;
        }
    }
    async function getFromSessionStorageOrApi() {
        const getData = sessionStorage.getItem("coinArr");
        if (getData) {
            const dataSession = JSON.parse(getData);
            display(dataSession);
            // console.log("Get From Session");
            return dataSession;
        } else {
            modalLoad.show();
            try {
                const dataJson = await getJson(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1`);
                saveToSessionStorage(dataJson);
                display(dataJson);
                return dataJson;
            } catch (error) {
                console.error(error);
                mainContent.innerHTML = `<h1>${msgError}</h1>`;
            } finally {
                modalLoad.hide();
            }
        }
    }

    searchNavbar.addEventListener('input', async () => {
        const arr = await getFromSessionStorageOrApi();
        const data = searchNavbar.value.toLowerCase();
        if (!data || data.length === 0) {
            display(arr);
        } else {
            const dataSearch = arr.filter(
                (item) =>
                    item.id.toLowerCase().indexOf(data) > -1 ||
                    item.symbol.toLowerCase().indexOf(data) > -1
            );

            if (dataSearch.length === 0) {
                mainContent.innerHTML = `<h1 class="msg-coin-not-found">Coin Not Found</h1>`;
            } else {
                display(dataSearch);
            }
        }
    });

    function display(data) {
        const mainContent = document.getElementById("mainContent");
        let html = "";
        for (let i = 0; i < data.length; i++) {
            html += `
          <div class="card">
            <div class="card-head" style="width: 18rem;>
              <h5 class="card-title">${data[i].symbol}</h5>
              <span class="btn-toggle">
                <input class="toggle-one toggle-check" type="checkbox" role="switch" value="${data[i].symbol}" id="check${i}">
                <label class="toggle" for="check${i}"></label>
              </span>
            </div>
            <div class="card-body">
              <img src="${data[i].image}" height="40" width="40" alt="${data[i].name} image">
              <span class="card-text"><h5>${data[i].id}</h5></span>
            </div>
            <button id="${data[i].id}" class="moreInfo btn btn-primary" type="button" data-bs-toggle="collapse"
              data-bs-target="#collapseExample${i}" aria-expanded="false" aria-controls="collapseExample${i}">
              More Info
              <div name="spinner" class="spinner-border spinner-border-sm" role="status" style="display: none";></div>
            </button>
            <div>
              <div class="collapse" id="collapseExample${i}">
                <div id="infoCoin${i}" class="card card-body collapse-body"></div>
              </div>
            </div>
          </div>`;
        }
        mainContent.innerHTML = html;


        $(".toggle-check").on("click", function () {
            if (this.checked === true) {
                coinsSelected.push(this.value);
            }
            if (this.checked === false) {
                let uncheck = this.value;
                const indexUncheck = coinsSelected.findIndex((name) => name === uncheck);
                coinsSelected.splice(indexUncheck, 1);
            }
            if (coinsSelected.length > 5) {
                myModal.show();
            }

            const inModal = document.getElementById("inModal");
            let htmlCard = "";
            for (let i = 0; i < coinsSelected.length - 1; i++) {
                htmlCard += `
          <div class="card">
              <div class="card-body cardModal">
                <span class="nameSelectCard">${coinsSelected[i]}</span>
                <span class="btn-toggle selected-toggle">
                <input class="toggle-one ee" data-bs-dismiss="modal" type="checkbox" name="modalCheck" value="${coinsSelected[i]}" id="checkModal${i}">
                <label class="toggle" for="checkModal${i}"></label>
              </span>
              </div>
            </div>`;
            }
            inModal.innerHTML = htmlCard;


            const checkboxesModal = document.getElementsByName("modalCheck");
            const checkboxes = document.getElementsByClassName("toggle-one");
            for (const checkModal of checkboxesModal) {
                checkModal.checked = true;
                checkModal.addEventListener("click", function () {
                    if (checkModal.checked === false) {
                        for (const toDown of checkboxes) {
                            if (toDown.value === checkModal.value) {
                                toDown.checked = false;
                            }
                        }
                        const indexUncheck = coinsSelected.findIndex((name) => name === checkModal.value);
                        coinsSelected.splice(indexUncheck, 1);
                    }
                });
            }
        });

        const moreInfo = document.getElementsByClassName("moreInfo");
        for (let i = 0; i < moreInfo.length; i++) {
            moreInfo[i].addEventListener("click", async function () {
                if (this.getAttribute("aria-expanded") === "true") {
                    const moreInfoCoin = await getMoreInfoFromSessionOrApi(this);
                    const collapse = document.getElementById(`infoCoin${i}`);
                    let htmlCol = "";
                    for (const item of moreInfoCoin) {
                        if (item.name === this.id) {
                            htmlCol += `
                    USD : ${item.usd} $<br>
                    EUR : ${item.eur} €<br>
                    ILS : ${item.ils} ₪<br>`;
                            collapse.innerHTML = htmlCol;
                        }
                    }
                }
            });
        }
    }

    const modalClose = document.getElementById('modalClose');
    modalClose.addEventListener('click', () => {
        const lastItem = coinsSelected[coinsSelected.length - 1];
        for (const x of checkboxes) {
            if (x.value === lastItem) {
                x.checked = false;
            }
        }
        const index = coinsSelected.findIndex(x => x === lastItem);
        coinsSelected.splice(index, 1);
    });


    async function getMoreInfoFromSessionOrApi(element) {
        try {
            const symbol = element.id;
            const spi = element.querySelector('[name="spinner"]');
            const getData = sessionStorage.getItem("CoinInfo");
            const currentTime = Date.now();
            let moreInfoCoin = getData ? JSON.parse(getData) : [];

            const lastUpdatedData = moreInfoCoin.find((item) => item.name === symbol && currentTime - item.timeClick <= 120000);
            if (lastUpdatedData) {
                return moreInfoCoin;
            }

            spi.style.display = "inline-block";
            const dataSymbol = await getJson(`https://api.coingecko.com/api/v3/coins/${symbol}`);
            const info = dataSymbol.market_data.current_price;

            const object = {
                name: element.id,
                usd: info.usd,
                eur: info.eur,
                ils: info.ils,
                timeClick: Date.now(),
                lastUpdated: currentTime,
            };
           
            moreInfoCoin = moreInfoCoin.filter((item) => item.name !== symbol);
            moreInfoCoin.push(object);
            sessionStorage.setItem("CoinInfo", JSON.stringify(moreInfoCoin));

            spi.style.display = "none";

            return moreInfoCoin;
        } catch (error) {
            console.error("Error fetching data:", error);
            mainContent.innerHTML = `<h1>${msgError}</h1>`;
            return [];
        }
    }

    currenciesLink.addEventListener('click', async () => {
        try {
            const dataCoins = await getFromSessionStorageOrApi();
            mainTitle.innerHTML = "Crypto Currencies";
            display(dataCoins);
            savaTheSelectedCards();
        } catch (error) {
            console.error("Error fetching currency data:", error);
            mainContent.innerHTML = `<h1>${msgError}}</h1>`;
        }
    });

    function savaTheSelectedCards() {
        for (const item of coinsSelected) {
            for (const card of checkboxes) {
                if (item === card.value) {
                    card.checked = true
                }
            }
        }
    }

    window.addEventListener("load", () => { getFromSessionStorageOrApi(), mainTitle.innerHTML = "Crypto Currencies" })

});
