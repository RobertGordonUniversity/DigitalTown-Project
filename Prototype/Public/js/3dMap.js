
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// Declare the chart dimensions and margins.
const width = 640;
const height = 400;
const marginTop = 20;
const marginRight = 20;
const marginBottom = 30;
const marginLeft = 40;
// console.log(mapData);
// $.ajax({
//     url: "../data/map/lad.json",
//     success: function(data){
//         // console.log(data);
//         mapData = data;
//     },
//     async: false
// })
let mapData;
const mapDataJson = "../data/map/lad.json";
mapData = await d3.json(mapDataJson);
// $.when($.getJSON("../data/map/lad.json")).done(function(result){
//     // console.log(result);
//     var data = result.features;
//     console.log(data);
//     mapData = data;
// });
$: console.log(mapData);
let projection;
$: projection = d3.geoEquirectangular().fitSize([width,height], mapData);
let pathGenerator;
$: pathGenerator = d3.geoPath(projection);

let parliments = [];
$: if(mapData) parliments = mapData.features.map(feature => {
    return{
        ...feature,
        path: pathGenerator(feature)
    };
});

$: console.log(parliments)
// // Declare the x (horizontal position) scale.
// const x = d3.scaleUtc()
//     .domain([new Date("2023-01-01"), new Date("2024-01-01")])
//     .range([marginLeft, width - marginRight]);
// d3
// // Declare the y (vertical position) scale.
// const y = d3.scaleLinear()
//     .domain([0, 100])
//     .range([height - marginBottom, marginTop]);

// Create the SVG container.
const svg = d3.create("svg")
    .attr("width", width)
    .attr("height", height);

// Add the x-axis.
for(let index = 0; index < parliments.length; ++index ){
    const element = parliments[index]
    element.path;
}

// svg.append("g")
//     .attr("transform", `translate(0,${height - marginBottom})`)
//     .call(d3.axisBottom(x));

// // Add the y-axis.
// svg.append("g")
//     .attr("transform", `translate(${marginLeft},0)`)
//     .call(d3.axisLeft(y));

// // Append the SVG element.
// document.getElementsByClassName('container')[0].append(svg.node());