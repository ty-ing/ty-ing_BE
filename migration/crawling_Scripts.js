const Script = require("../models/script");
const { Builder, By, Options } = require("selenium-webdriver");
const gecko = require("geckodriver");
const firefox = require("selenium-webdriver/firefox");

let test = [];

(async function example() {
  let driver = await new Builder()
    .forBrowser("firefox")
    .setFirefoxOptions(
      new firefox.Options()
        .headless()
        .setPreference("javascript.enabled", false)
    )
    .build();
  try {
    await driver.get(
      "https://www.nytimes.com/2022/03/16/us/politics/ketanji-brown-jackson-criminal-defense.html"
    );
    let resultElements = await driver.findElements(
      By.className("css-g5piaz evys1bk0")
    );
    //console.log("[resultElements.length]", resultElements.length);
    for (let i = 0; i < resultElements.length; i++) {
     const a = await resultElements[i].getText()
     test.push(a)
     //console.log(test)
     // console.log(" - " + (await resultElements[i].getText()));
    }
  } finally {
    driver.quit();
    return test;
    console.log(test)
  }
  //test.push(resultElements)
})()