/*====================================================================================================================================*
  DEMO av Avanzas icke-officiella API.
  ====================================================================================================================================

  Hämta aktie- och fond-information från Avanzas icke-officiella API inifrån ett Google Sheets dokument.

  OBS! Endast avsett som en DEMO! Det finns ingen felhantering.

  Version:      1.0.0
  Project Page: https://github.com/proschinger/avanza
  Copyright:    (c) 2021 Thomas Proschinger
  License:      MIT License
                https://github.com/proschinger/avanza/blob/main/LICENSE

  ------------------------------------------------------------------------------------------------------------------------------------
  Ändringslogg:

  1.0.0  Första releasen.
 *====================================================================================================================================*/

function AvanzaStockGet(id, request) {
  let rules = request.split(",").map(x => AvanzaStockRulesGet_()[x.trim()]);
  let url = "https://www.avanza.se/_mobile/market/stock/" + id;
  return AvanzaGet_(url, rules)
}

function AvanzaFundGet(id, request) {
  let rules = request.split(",").map(x => AvanzaFundRulesGet_()[x.trim()]);
  let url = "https://www.avanza.se/_mobile/market/fund/" + id;
  return AvanzaGet_(url, rules)
}

function AvanzaGet_(url, rules) {
  let jsondata = UrlFetchApp.fetch(url, null);
  let object = JSON.parse(jsondata.getContentText());
  let vals = rules.map(r => r(object));
  return [vals];
}

function AvanzaStockRulesGet_() {
  let today = new Date().setHours(0,0,0,0);
  let nextEvent = evs => evs.find(x=>((new Date(x.eventDate))-today)>0).eventDate;
  let msToDays = ms => Math.round(ms/(1000*60*60*24));
  return {
    "Valuta": o => o.currency,
    "Pris": o => o.lastPrice,
    "Utdelning": o => o.dividends[0].amountPerShare,
    "Utdelning-Xdag": o => o.dividends[0].exDate,
    "Utdelning-Xdag-dt": o => msToDays(new Date(o.dividends[0].exDate) - today),
    "PE": o => o.keyRatios.priceEarningsRatio,
    "Direktavkastning": o => o.keyRatios.directYield,
    "Rapport-Nästa": o => nextEvent(o.companyReports),
    "Rapport-Nästa-dt": o => msToDays(new Date(nextEvent(o.companyReports)) - today),
  }
}

function AvanzaFundRulesGet_() {
  return {
    "Valuta": o => o.tradingCurrency,
    "NAV": o => o.NAV
  }
}
