const margin = {top: 40, right: 40, bottom: 60, left: 60};
const width = 850 - margin.left - margin.right;
const height = 450 - margin.top - margin.bottom;

const tooltip = d3.select("body").append("div").attr("class", "tooltip");

const colorPrimary = "#38bdf8"; 
const colorSecondary = "#c084fc"; 
const colorTertiary = "#f472b6"; 
const categoricalColors = d3.scaleOrdinal(["#38bdf8", "#c084fc", "#f472b6", "#34d399", "#fbbf24"]);

d3.csv("data/Ex6_TVdata_withStar.csv").then(data => {
    data.forEach(d => {
        d.energyConsumption = +d.energyConsumption;
        d.star = +d.star;
        d.screenSize = +d.screenSize;
    });

    if (document.getElementById("barchart_container")) drawBarChart(data);
    if (document.getElementById("histogram_chart")) {
        drawHistogram(data);
        drawScatterplot(data);
        drawLineChart(data);
        drawDonutChart(data);
    }
}).catch(error => {
    console.error("Data Loading Error:", error);
    const errorEl = document.getElementById("error-msg");
    if(errorEl) errorEl.innerHTML = "⚠️ CORS Policy Violation: Local file execution restricted. Please launch this workspace via Live Server (HTTP).";
});

// --- Ex 4.3 - 4.6: Bar Chart ---
function drawBarChart(data) {
    const brandCounts = d3.rollup(data, v => v.length, d => d.brand);
    let barData = Array.from(brandCounts, ([brand, count]) => ({brand, count}))
                       .sort((a, b) => b.count - a.count).slice(0, 15);

    const svg = d3.select("#barchart_container").append("svg")
        .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand().domain(barData.map(d => d.brand)).range([0, width]).padding(0.25);
    const y = d3.scaleLinear().domain([0, d3.max(barData, d => d.count) * 1.1]).range([height, 0]);

    svg.append("g").attr("class", "grid")
        .call(d3.axisLeft(y).tickSize(-width).tickFormat("")).selectAll("line").attr("class", "grid-line");

    svg.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x))
       .selectAll("text").attr("transform", "rotate(-40)").style("text-anchor", "end").style("font-size", "12px");
    svg.append("g").call(d3.axisLeft(y));

    svg.selectAll("rect").data(barData).enter().append("rect")
        .attr("x", d => x(d.brand)).attr("y", height)
        .attr("width", x.bandwidth()).attr("height", 0)
        .attr("fill", colorPrimary)
        .style("filter", `drop-shadow(0 0 6px ${colorPrimary})`)
        .on("mouseover", (event, d) => {
            d3.select(event.currentTarget).style("fill", "#ffffff").style("filter", "drop-shadow(0 0 10px #ffffff)");
            tooltip.transition().duration(200).style("opacity", 1);
            tooltip.html(`<strong>${d.brand.toUpperCase()}</strong><br/>Total Models: ${d.count}`)
                .style("left", (event.pageX + 15) + "px").style("top", (event.pageY - 40) + "px");
        })
        .on("mouseout", (event) => {
            d3.select(event.currentTarget).style("fill", colorPrimary).style("filter", `drop-shadow(0 0 6px ${colorPrimary})`);
            tooltip.transition().duration(500).style("opacity", 0);
        })
        .transition().duration(1000).ease(d3.easeCubicOut)
        .attr("y", d => y(d.count))
        .attr("height", d => height - y(d.count));
}

// --- Ex 6.1 & 6.2: Histogram with Filters ---
function drawHistogram(data) {
    const svg = d3.select("#histogram_chart").append("svg")
        .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear().domain([0, d3.max(data, d => d.energyConsumption)]).range([0, width]);
    svg.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x));

    const y = d3.scaleLinear().range([height, 0]);
    const yAxis = svg.append("g");
    const gridLines = svg.append("g").attr("class", "grid");

    const histogram = d3.histogram().value(d => d.energyConsumption).domain(x.domain()).thresholds(x.ticks(15));

    function update(filteredData) {
        const bins = histogram(filteredData);
        y.domain([0, d3.max(bins, d => d.length) * 1.1]);
        yAxis.transition().duration(500).call(d3.axisLeft(y));
        gridLines.transition().duration(500).call(d3.axisLeft(y).tickSize(-width).tickFormat("")).selectAll("line").attr("class", "grid-line");

        const rects = svg.selectAll("rect").data(bins);
        rects.enter().append("rect").merge(rects)
            .on("mouseover", (event, d) => {
                d3.select(event.currentTarget).style("fill", "#ffffff").style("filter", "drop-shadow(0 0 10px #ffffff)");
                tooltip.transition().duration(200).style("opacity", 1);
                tooltip.html(`<strong>${d.x0} - ${d.x1} kWh</strong><br/>Frequency: ${d.length} TVs`)
                    .style("left", (event.pageX + 15) + "px").style("top", (event.pageY - 40) + "px");
            })
            .on("mouseout", (event) => {
                d3.select(event.currentTarget).style("fill", colorSecondary).style("filter", `drop-shadow(0 0 5px rgba(192, 132, 252, 0.5))`);
                tooltip.transition().duration(500).style("opacity", 0);
            })
            .transition().duration(500)
            .attr("x", d => x(d.x0) + 1).attr("y", d => y(d.length))
            .attr("width", d => Math.max(0, x(d.x1) - x(d.x0) - 2))
            .attr("height", d => height - y(d.length))
            .style("fill", colorSecondary)
            .style("filter", `drop-shadow(0 0 5px rgba(192, 132, 252, 0.5))`);
        rects.exit().remove();
    }
    update(data);

    const screens = ["All Models", ...new Set(data.map(d => d.screenTech))];
    d3.select("#filters_screen").selectAll("button").data(screens).enter().append("button")
        .attr("class", d => d === "All Models" ? "filter-btn active" : "filter-btn")
        .text(d => d)
        .on("click", function(event, screen) {
            d3.select("#filters_screen").selectAll("button").classed("active", false);
            d3.select(this).classed("active", true);
            update(screen === "All Models" ? data : data.filter(d => d.screenTech === screen));
        });
}

// --- Ex 6.3 & 6.4: Scatterplot with Tooltips ---
function drawScatterplot(data) {
    const svg = d3.select("#scatterplot_chart").append("svg")
        .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear().domain([0, d3.max(data, d => d.star) * 1.05]).range([0, width]);
    svg.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x));

    const y = d3.scaleLinear().domain([0, d3.max(data, d => d.energyConsumption) * 1.05]).range([height, 0]);
    svg.append("g").call(d3.axisLeft(y));
    svg.append("g").attr("class", "grid").call(d3.axisLeft(y).tickSize(-width).tickFormat("")).selectAll("line").attr("class", "grid-line");

    svg.selectAll("circle").data(data).enter().append("circle")
        .attr("cx", d => x(d.star)).attr("cy", d => y(d.energyConsumption)).attr("r", 5)
        .style("fill", d => categoricalColors(d.screenTech)).style("opacity", 0.7)
        .on("mouseover", (event, d) => {
            d3.select(event.currentTarget).style("stroke", "#fff").style("stroke-width", 2).attr("r", 8).style("opacity", 1);
            tooltip.transition().duration(200).style("opacity", 1);
            tooltip.html(`<strong>${d.brand}</strong><br/>Model: ${d.model}<br/>Screen: ${d.screenSize}" | ${d.screenTech}<br/>Efficiency: ${d.star} Stars<br/>Energy: ${d.energyConsumption} kWh`)
                .style("left", (event.pageX + 15) + "px").style("top", (event.pageY - 40) + "px");
        })
        .on("mouseout", (event) => {
            d3.select(event.currentTarget).style("stroke", "none").attr("r", 5).style("opacity", 0.7);
            tooltip.transition().duration(500).style("opacity", 0);
        });
}

// --- Ex 5.2: Line Chart ---
function drawLineChart(data) {
    const avgData = d3.rollup(data, v => d3.mean(v, d => d.energyConsumption), d => d.star);
    const lineData = Array.from(avgData, ([star, avg]) => ({star, avg})).sort((a, b) => a.star - b.star);

    const svg = d3.select("#line_chart").append("svg")
        .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear().domain(d3.extent(lineData, d => d.star)).range([0, width]);
    svg.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x));

    const y = d3.scaleLinear().domain([0, d3.max(lineData, d => d.avg) * 1.1]).range([height, 0]);
    svg.append("g").call(d3.axisLeft(y));
    svg.append("g").attr("class", "grid").call(d3.axisLeft(y).tickSize(-width).tickFormat("")).selectAll("line").attr("class", "grid-line");

    const line = d3.line().x(d => x(d.star)).y(d => y(d.avg)).curve(d3.curveMonotoneX);

    svg.append("path").datum(lineData).attr("fill", "none")
       .attr("stroke", colorTertiary).attr("stroke-width", 4)
       .style("filter", `drop-shadow(0 0 8px ${colorTertiary})`)
       .attr("d", line);
    
    svg.selectAll("circle").data(lineData).enter().append("circle")
       .attr("cx", d => x(d.star)).attr("cy", d => y(d.avg)).attr("r", 6).attr("fill", "#fff")
       .style("filter", `drop-shadow(0 0 5px #fff)`)
       .on("mouseover", (event, d) => {
            d3.select(event.currentTarget).attr("r", 9).style("fill", colorTertiary);
            tooltip.transition().duration(200).style("opacity", 1);
            tooltip.html(`<strong>${d.star} Stars</strong><br/>Avg Energy: ${d.avg.toFixed(1)} kWh`)
                .style("left", (event.pageX + 15) + "px").style("top", (event.pageY - 40) + "px");
        })
        .on("mouseout", (event) => {
            d3.select(event.currentTarget).attr("r", 6).style("fill", "#fff");
            tooltip.transition().duration(500).style("opacity", 0);
        });
}

// --- Ex 5.3: Donut Chart ---
function drawDonutChart(data) {
    const sizeCounts = { "Compact (<40\")": 0, "Standard (40-60\")": 0, "Cinematic (>60\")": 0 };
    data.forEach(d => {
        if (d.screenSize < 40) sizeCounts["Compact (<40\")"]++;
        else if (d.screenSize <= 60) sizeCounts["Standard (40-60\")"]++;
        else sizeCounts["Cinematic (>60\")"]++;
    });
    const pieData = Object.entries(sizeCounts).map(([key, value]) => ({key, value}));

    const r = Math.min(width, height) / 2;
    const svg = d3.select("#donut_chart").append("svg")
        .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .append("g").attr("transform", `translate(${(width+margin.left+margin.right)/2},${(height+margin.top+margin.bottom)/2})`);

    const pie = d3.pie().value(d => d.value).padAngle(0.03);
    const arc = d3.arc().innerRadius(r * 0.55).outerRadius(r * 0.85);
    const arcHover = d3.arc().innerRadius(r * 0.55).outerRadius(r * 0.95);
    const arcLabel = d3.arc().innerRadius(r * 0.9).outerRadius(r * 1.1);

    const paths = svg.selectAll("path").data(pie(pieData)).enter().append("path")
        .attr("d", arc).attr("fill", (d, i) => categoricalColors(i))
        .attr("stroke", "var(--bg-dark)").style("stroke-width", "4px")
        .style("cursor", "pointer")
        .on("mouseover", function(event, d) {
            d3.select(this).transition().duration(200).attr("d", arcHover).style("filter", "drop-shadow(0 0 10px rgba(255,255,255,0.4))");
            tooltip.transition().duration(200).style("opacity", 1);
            tooltip.html(`<strong>${d.data.key}</strong><br/>Total: ${d.data.value} TVs`)
                .style("left", (event.pageX + 15) + "px").style("top", (event.pageY - 40) + "px");
        })
        .on("mouseout", function() {
            d3.select(this).transition().duration(400).attr("d", arc).style("filter", "none");
            tooltip.transition().duration(500).style("opacity", 0);
        });
        
    svg.selectAll("text").data(pie(pieData)).enter().append("text")
        .attr("transform", d => `translate(${arcLabel.centroid(d)})`)
        .attr("text-anchor", "middle").style("font-size", "14px").style("font-weight", "800")
        .style("fill", "#ffffff").style("paint-order", "stroke").style("stroke", "#0f172a").style("stroke-width", "5px")
        .text(d => d.data.key);
}