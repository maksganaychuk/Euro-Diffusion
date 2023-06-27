const fs = require("fs");

let resultOutput = "";

const startCoins = 1000000;
const coinsPart = 1000;

const main = () => {
  const input = fs.readFileSync("./input.txt", "utf8");

  let testCase = 1;
  let countriesAmount = 0;
  let countries = [];
  let motifs = [];
  let cities = [];

  const lines = input.split("\n");

  lines.forEach((line) => {
    if (line === "0") {
      console.log(resultOutput);
      return;
    }
    if (parseInt(line)) {
      resultOutput += `Case Number ${testCase}\n`;
      testCase++;
      motifs = [];
      cities = [];
      countries = [];
      countriesAmount = parseInt(line);
    } else {
      const countryData = line.split(" ");
      motifs.push(countryData[0]);

      for(let i = 1; i < 5; i++) {
        if(parseInt(countryData[1]) < 1 || parseInt(countryData[1]) > 10) {
          throw new Error('Invalid coordinates');
        }
      }

      const countryInfo = {
        name: countryData[0],
        isComplete: false,
        completionDays: 0,
        coordinates: {
          xl: parseInt(countryData[1]),
          yl: parseInt(countryData[2]),
          xh: parseInt(countryData[3]),
          yh: parseInt(countryData[4]),
        },
      };

      countries.push(countryInfo);

      if (countriesAmount === countries.length) {
        countries.forEach((country) => {
            const countryCities = getCountryCities(country);
            cities.push(...countryCities);
          });

        simulateEuroDiffusion(countries, cities, motifs);

        const sortedCountries = countries.sort((country, nextCountry) => {
          if (country.name < nextCountry.name)
            return -1;
          if (country.name > nextCountry.name)
            return 1;
        }).sort((country, nextCountry) => (
          country.completionDays - nextCountry.completionDays
        ));

        logCountries(sortedCountries);
      }
    }
  });
};

const getCountryCities = (country) => {
    const cities = [];

    for (let x = country.coordinates.xl; x <= country.coordinates.xh; x++) {
      for (let y = country.coordinates.yl; y <= country.coordinates.yh; y++) {
        const countryName = country.name;
        const coins = {
          [countryName]: startCoins,
        };

        const city = {
          x,
          y,
          coins,
          country: countryName,
        };

        cities.push(city);
      }
    }

    country.cities = cities;

    return cities;
  }

const simulateEuroDiffusion = (countries, cities, motifs) => {
    let day = 1;

    while (!countries.every((country) => country.isComplete)) {
      simulateDay(countries, cities, motifs, day);

      ++day;
    }
  }

  const simulateDay = (countries, cities, allCountriesNames, day) => {
    setStartDayCoins(cities);
    for (const country of countries) {
      for (let x = country.coordinates.xl; x <= country.coordinates.xh; x++) {
        for (let y = country.coordinates.yl; y <= country.coordinates.yh; y++) {
          const city = cities.find((city) => city.x === x && city.y === y);
          const neighborCities = getNeighborCities(city, cities);

          adjustCoins(city, neighborCities);
        }
      }
    }

    const isContryAlone = countries.length === 1 ? 0 : day;

    handleCountriesBecameCompleted(
      countries,
      allCountriesNames,
      isContryAlone,
    );
  }

  const setStartDayCoins = (cities) => {
    cities.forEach((city) => {
      const startDayCoins = { ...city.coins };

      city.startDayCoins = startDayCoins;
    });
  }

  const handleCountriesBecameCompleted = (countries, allCountriesNames, day) => {
    for (const country of countries) {
      if (shouldCountryBeMarkedAsComplete(country, allCountriesNames)) {
        country.isComplete = true;
        country.completionDays = day;
      }
    }
  }

  const shouldCountryBeMarkedAsComplete = (country, allCountriesNames) => {
    return (
      !country.isComplete &&
      country.cities.every((city) => allCountriesNames.every((motif) => {
        return city.coins[motif];
      }))
    );
  }

  const getNeighborCities = (city, cities) => {
    const { x, y } = city;

    const [
      northCoordinates,
      eastCoordinates,
      southCoordinates,
      westCoordinates,
    ] = [
      { x, y: y - 1 },
      { x: x + 1, y },
      { x, y: y + 1 },
      { x: x - 1, y },
    ];

    return cities.reduce((acc, city) => {
      if((city.x === northCoordinates.x && city.y === northCoordinates.y)
      || (city.x === eastCoordinates.x && city.y === eastCoordinates.y)
      || (city.x === westCoordinates.x && city.y === westCoordinates.y)
      || (city.x === southCoordinates.x && city.y === southCoordinates.y)) {
        acc.push(city);
      }

      return acc;
    }, []);
  }
  
  const adjustCoins = (city, neighborCities) => {
    for (const neighborCity of neighborCities) {
      for (const motif in city.startDayCoins) {
        const coinsToTransport = Math.floor(
          city.startDayCoins[motif] / coinsPart
        );

        if (coinsToTransport > 0) {
          neighborCity.coins[motif] =
            (neighborCity.coins[motif] || 0) + coinsToTransport;
          city.coins[motif] -= coinsToTransport;
        }
      }
    }
  }

  const logCountries = (sortedCountries) => {
    sortedCountries.forEach((country) => {
      resultOutput += `${country.name} ${country.completionDays}\n`;
    });
  }

main();
