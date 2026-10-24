# COS30045-Demonstration2# COS30045 Data Visualisation - Demonstration 2 Portfolio

**Student Name:** Duong Thoai Nhu  
**Student ID:** 105011463  
**Unit:** COS30045 Data Visualisation (Swinburne Vietnam)  

---

## 📌 Project Overview
This repository serves as the integrated portfolio website for **Demonstration 2 (Weeks 4 to 6)**. The objective is to demonstrate proficiency in web-based data visualization using **HTML5, CSS3, and D3.js (v7)**. 

Rather than separating each exercise into isolated repositories, this project integrates all tasks into a cohesive, professional **Dark Glassmorphism** analytical dashboard with smooth CSS transitions and a centralized navigation system.

## 📊 Dataset Context
The interactive charts utilize the `Ex6_TVdata_withStar.csv` dataset, which contains specifications of televisions available in the Australian market. Key variables analyzed include:
- `brand` & `model`: Categorical data identifying the TV.
- `screenSize`: Quantitative continuous data (inches).
- `screenTech`: Categorical data (LED, OLED, LCD).
- `star`: Quantitative discrete data representing the energy efficiency rating.
- `energyConsumption`: Quantitative continuous data indicating annual kWh usage.

---

## 🛠️ Detailed Breakdown of Exercises

### Exercise 4.1: SVG Primitives & DOM Manipulation
- **File:** `index.html`
- **Technical Implementation:** Created a vector graphic house entirely from scratch using fundamental SVG primitives (`<rect>`, `<circle>`, `<polygon>`, `<line>`).
- **Concepts Demonstrated:** 
  - Custom coordinate mapping within an SVG canvas.
  - Structural grouping using `<g>` tags to apply shared attributes (stroke, fill).
  - Utilizing `transform="translate(x, y)"` for efficient shape duplication (e.g., windows).
  - Applying modern CSS SVG filters (`drop-shadow`) for a neon-glow aesthetic.

### Exercise 4.3 - 4.6: D3.js Data Binding (Bar Chart)
- **File:** `barchart.html`
- **Technical Implementation:** A dynamic vertical bar chart displaying the Top 15 TV brands by market frequency.
- **Concepts Demonstrated:**
  - Asynchronous data loading via `d3.csv().then()`.
  - Data aggregation and sorting using `d3.rollup` and Array mapping.
  - Constructing proportional scales using `d3.scaleBand` (X-axis) and `d3.scaleLinear` (Y-axis).
  - Implementing entrance animations (`transition().duration()`) to smoothly render bars from the x-axis baseline.

### Exercise 5 & 6: Interactive Analytical Dashboard
- **File:** `interactive.html` & `js/main.js`

**1. Energy Distribution (Histogram with Filters - Ex 6.1 & 6.2)**
- Built a frequency histogram using `d3.histogram()` to group continuous energy consumption data into standardized bins.
- **Interactivity:** Implemented categorical filtering buttons based on `screenTech`. Upon triggering a filter, the visualization dynamically calculates new bins, updates the Y-axis domain, and smoothly transitions the `<rect>` elements to their new heights and positions using the `merge()` pattern and `exit().remove()`.

**2. Efficiency Correlation (Scatterplot with Tooltips - Ex 6.3 & 6.4)**
- Visualizes the relationship between Star Rating (X-axis) and Energy Consumption (Y-axis).
- Implemented `d3.scaleOrdinal` with a custom categorical color palette to distinguish screen technologies.
- **Interactivity:** Attached JavaScript event listeners (`mouseover`, `mouseout`) to SVG circles. Hovering over a data point triggers an absolute-positioned HTML tooltip detailing the specific Brand, Model, Screen Size, and Tech, while adding a stroke highlight to the active circle.

**3. Average Energy by Rating (Line Chart - Ex 5.2)**
- Aggregated the dataset to calculate the mean energy consumption per star rating using `d3.mean()`.
- Constructed a continuous path using `d3.line().curve(d3.curveMonotoneX)` to illustrate the downward trend of energy consumption as star ratings increase. 

**4. Market Share by Panel Size (Donut Chart - Ex 5.3)**
- Categorized raw `screenSize` data into three custom groups: Compact (<40"), Standard (40-60"), and Cinematic (>60").
- Utilized `d3.pie()` to calculate angles and `d3.arc()` to draw the donut segments.
- **UI Enhancements:** Implemented an outer `arcHover` transition for a pop-out effect on mouseover. Used `paint-order: stroke` on centroid text labels to ensure readability against bright background slices.

---

## 🚀 How to Run Locally
Due to **CORS (Cross-Origin Resource Sharing) security policies** enforced by modern web browsers, D3.js cannot asynchronously fetch local CSV files when HTML files are opened directly via the `file:///` protocol.

**Instructions:**
1. Open this project folder in **Visual Studio Code**.
2. Install the **"Live Server"** extension by Ritwick Dey.
3. Right-click on `index.html`, `barchart.html`, or `interactive.html` and select **"Open with Live Server"**.
4. The dashboard will launch in your default browser at `http://127.0.0.1:5500`, allowing D3.js to successfully load the dataset.

---
*Created for COS30045 - Demonstration 2 Assessment.*