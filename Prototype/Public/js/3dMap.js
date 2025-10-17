
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// Declare the chart dimensions and margins.
const width = 640;
const height = 400;
const marginTop = 20;
const marginRight = 20;
const marginBottom = 30;
const marginLeft = 40;


let mapData;
const mapDataJson = "../data/map/lad.json";
mapData = await d3.json(mapDataJson);

$: console.log(mapData);
let projection;
$: projection = d3.geoEquirectangular().fitSize([width,height], mapData);
let pathGenerator;
$: pathGenerator = d3.geoPath(projection);

// Create the SVG container.
const svg = d3.create("svg")
    .attr("width", width)
    .attr("height", height);
const g = svg.append('g');
// Add the map
 g.selectAll('path.parliment')
  .data(mapData.features)
  .enter()
  .append('path')
  .classed('parliment', 'true')
  .attr('d',pathGenerator);

// Append the SVG element to the document.
document.getElementsByClassName('container')[0].append(svg.node());