var margin = { top: 20, right: 200, bottom: 50, left: 55 },
  width = 850 - margin.left - margin.right,
  height = 750 - margin.top - margin.bottom;

var formatPercent = d3.format(".0%");
var x = d3.scaleBand().rangeRound([0, width]).padding(0.1);

function hideAllGraphs() {
  document.getElementById("graph1").style.display = "none";
  document.getElementById("graph2").style.display = "none";
  document.getElementById("graph3").style.display = "none";

  document.getElementById("graph1-text").style.display = "none";
  document.getElementById("graph2-text").style.display = "none";
  document.getElementById("graph3-text").style.display = "none";
}

function showGraph(graphId) {
  hideAllGraphs();

  if (graphId === "graph1") {
    createGraph1();
  } else if (graphId === "graph2") {
    createGraph2();
  } else {
    createGraph3();
  }
  document.getElementById(graphId).style.display = "flex";
  document.getElementById(graphId + "-text").style.display = "block";
}

document.addEventListener("DOMContentLoaded", function () {
  //Header Image
  var imgHeader = document.createElement("img");
  imgHeader.setAttribute("src", "images/logo.png");
  imgHeader.setAttribute("alt", "lego logo");
  imgHeader.setAttribute("width", "100");
  imgHeader.setAttribute("height", "100");
  var headerElement = document.getElementById("logo-header");
  headerElement.appendChild(imgHeader);

  //Footer Image
  var imgFooter = document.createElement("img");
  imgFooter.setAttribute("src", "images/legoborder.png");
  imgFooter.setAttribute("alt", "lego blocks footer");
  imgFooter.setAttribute("width", "800");
  imgFooter.setAttribute("height", "250");
  var footerElement = document.getElementById("lego-footer");
  footerElement.appendChild(imgFooter);

  //Head Image
  var legoHeads = document.querySelectorAll(".lego-head");
  legoHeads.forEach(function (head) {
    var imgHead = document.createElement("img");
    imgHead.setAttribute("src", "images/head.png");
    imgHead.setAttribute("alt", "lego logo");
    imgHead.setAttribute("width", "50");
    imgHead.setAttribute("height", "50");
    head.appendChild(imgHead);
  });

  hideAllGraphs();

  const btn1 = document.getElementById("btn1");
  if (btn1) {
    btn1.addEventListener("click", function () {
      showGraph("graph1");
    });
  }

  const btn2 = document.getElementById("btn2");
  if (btn2) {
    btn2.addEventListener("click", function () {
      showGraph("graph2");
    });
  }

  const btn3 = document.getElementById("btn3");
  if (btn3) {
    btn3.addEventListener("click", function () {
      showGraph("graph3");
    });
  }

  showGraph("graph1");
});

function createGraph1() {
  let svg = d3.select("#graph1").select("svg");
  if (svg.empty()) {
    svg = d3
      .select("#graph1")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr(
        "transform",
        "translate(" + (margin.left + 20) + "," + margin.top + ")"
      );

    d3.csv("data/legosetproyect.csv").then((data) => {
      data.forEach(function (d) {
        d.year_released = +d.year_released;
        d.number_of_parts = +d.number_of_parts;
      });

      let averagesByInterval = groupAndFilterData(data);
      let x = d3
        .scaleBand()
        .range([0, width])
        .padding(0.1)
        .domain(averagesByInterval.map((d) => d.interval));

      let y = d3
        .scaleLinear()
        .range([height, 0])
        .domain([0, d3.max(averagesByInterval, (d) => d.average)]);

      let xAxis = d3.axisBottom(x).tickFormat(d3.format("d"));
      let yAxis = d3.axisLeft(y);

      svg
        .append("text")
        .attr("text-anchor", "middle")
        .attr("x", width / 2 + margin.left)
        .attr("y", height + margin.top + 20)
        .text("Year Released (10-Year Intervals)");

      svg
        .append("text")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 10)
        .attr("x", -margin.top - height / 2 + 20)
        .text("Average Number of Sets Released");

      svg
        .append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

      svg
        .append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Average Number of Sets");

      svg
        .selectAll(".bar")
        .data(averagesByInterval)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", (d) => x(d.interval))
        .attr("width", x.bandwidth())
        .attr("y", (d) => y(d.average))
        .attr("height", (d) => height - y(d.average))
        //Annotation
        .each(function (d) {
          const roundedValue = Math.round(d.average);
          svg
            .append("text")
            .attr("class", "bar-annotation")
            .attr("x", x(d.interval) + x.bandwidth() / 2)
            .attr("y", y(d.average) - 5)
            .attr("text-anchor", "middle")
            .style("font-size", "14px")
            .style("font-weight", "bold")
            .style("fill", "#DA291C")
            .text(`Avg: ${roundedValue}`);
        });
    });
  }
}
function createGraph2() {
  let svg = d3.select("#graph2").select("svg");
  if (svg.empty()) {
    svg = d3
      .select("#graph2")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr(
        "transform",
        "translate(" + (margin.left + 60) + "," + margin.top + ")"
      );

    d3.csv("data/legosetproyect.csv").then((data) => {
      data.forEach(function (d) {
        d.year_released = +d.year_released;
        d.number_of_parts = +d.number_of_parts;
      });

      //Themes not related to Lego Sets
      const excludedThemes = [
        "Books",
        "Key Chain",
        "Supplemental",
        "Service Packs",
        "Stationery and Office Supplies",
        "Video Games and Accessories",
        "Houseware",
        "Role Play Toys and Costumes",
      ];

      let countsByTheme = d3.rollup(
        data,
        (value) => value.length,
        (d) => d.theme_name
      );

      let filteredCountsByTheme = new Map(
        [...countsByTheme].filter(
          ([theme_name, count]) => !excludedThemes.includes(theme_name)
        )
      );

      let countsByThemeArray = Array.from(
        filteredCountsByTheme,
        ([theme_name, count]) => ({ theme_name, count })
      )
        .sort((a, b) => b.count - a.count)
        .slice(0, 15);

      let y = d3
        .scaleBand()
        .range([0, height])
        .padding(0.1)
        .domain(countsByThemeArray.map((d) => d.theme_name));

      let x = d3
        .scaleLinear()
        .range([0, width])
        .domain([0, d3.max(countsByThemeArray, (d) => d.count)]);

      let yAxis = d3.axisLeft(y);
      let xAxis = d3.axisBottom(x).ticks(5);

      svg.append("g").attr("class", "y axis").call(yAxis);

      svg
        .append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

      svg
        .selectAll(".bar")
        .data(countsByThemeArray)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("y", (d) => y(d.theme_name))
        .attr("height", y.bandwidth())
        .attr("x", 0)
        .attr("width", (d) => x(d.count));

      svg
        .selectAll(".bar-annotation")
        .data(countsByThemeArray)
        .enter()
        .append("text")
        .attr("class", "bar-annotation")
        .attr("x", (d) => x(d.count) + 15)
        .attr("y", (d) => y(d.theme_name) + y.bandwidth() / 2 - 5)
        .attr("text-anchor", "middle")
        .attr("dy", ".35em")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .style("fill", "#DA291C")
        .text((d) => d3.format(",")(d.count));
      svg
        .append("text")
        .attr("text-anchor", "end")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 5)
        .text("Number of Sets");

      svg
        .append("text")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left - 40)
        .attr("x", -height / 2)
        .text("Theme Name");
    });
  }
}

function createGraph3() {
  let svg = d3.select("#graph3").select("svg");
  if (svg.empty()) {
    svg = d3
      .select("#graph3")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr(
        "transform",
        "translate(" + (margin.left + 99) + "," + margin.top + ")"
      );

    d3.csv("data/legosetproyect.csv").then((data) => {
      data.forEach(function (d) {
        d.number_of_parts = +d.number_of_parts;
      });

      let topTenSets = data
        .sort((a, b) => b.number_of_parts - a.number_of_parts)
        .slice(0, 10);

      let y = d3
        .scaleBand()
        .range([0, height])
        .padding(0.1)
        .domain(topTenSets.map((d) => d.set_name));

      let x = d3
        .scaleLinear()
        .range([0, width])
        .domain([0, d3.max(topTenSets, (d) => d.number_of_parts)]);

      svg.append("g").attr("class", "y axis").call(d3.axisLeft(y));

      svg
        .append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).ticks(5));

      svg
        .selectAll(".bar")
        .data(topTenSets)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("y", (d) => y(d.set_name))
        .attr("height", y.bandwidth())
        .attr("x", 0)
        .attr("width", (d) => x(d.number_of_parts));

      svg
        .selectAll(".bar-annotation")
        .data(topTenSets)
        .enter()
        .append("text")
        .attr("class", "bar-annotation")
        .attr("x", (d) => x(d.number_of_parts) + 22)
        .attr("y", (d) => y(d.set_name) + y.bandwidth() / 2 - 5)
        .attr("text-anchor", "middle")
        .attr("dy", ".35em")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .style("fill", "#DA291C")
        .text((d) => d3.format(",")(d.number_of_parts));
      svg
        .append("text")
        .attr("text-anchor", "end")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 5)
        .text("Number of Pieces")
        .style("font-size", "20px");

      svg
        .append("text")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left - 75)
        .attr("x", -height / 2)
        .text("Set Name")
        .style("font-size", "20px");
    });
  }
}

function groupAndFilterData(data) {
  let dataByInterval = d3.group(
    data,
    (d) => Math.floor(d.year_released / 10) * 10
  );

  let filteredDataByFiveYearInterval = new Map(
    [...dataByInterval]
      .filter(([interval, sets]) => interval >= 1940)
      .sort((a, b) => a[0] - b[0])
  );

  let averagesByFiveYearInterval = Array.from(
    filteredDataByFiveYearInterval,
    ([interval, sets]) => ({
      interval: interval,
      average: sets.length
        ? sets.reduce((acc, curr) => acc + curr.number_of_parts, 0) /
          sets.length
        : 0,
    })
  );
  return averagesByFiveYearInterval;
}

function toggleTitleVisibility() {
  var slideInfoColumn = document.querySelector(".slide-info-column");
  if (slideInfoColumn.style.display === "none") {
    slideInfoColumn.style.display = "block";
  } else {
    slideInfoColumn.style.display = "none";
  }
}
