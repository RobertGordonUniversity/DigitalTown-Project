import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import * as three from "imports/three/src/Three.js";
//Could be used to make interactible map
import * as orbitControls from 'https://cdn.jsdelivr.net/npm/three@0.162.0/examples/jsm/controls/OrbitControls.js';
// const three = threeLib();
// Declare the chart dimensions and margins.
const width = 640;
const height = 400;
const marginTop = 20;
const marginRight = 20;
const marginBottom = 30;
const marginLeft = 40;

//D3 
let mapData;
const mapDataJson = "../data/map/lad.json";
mapData = await d3.json(mapDataJson);

$: console.log(mapData);
let projection;
$: projection = d3.geoEquirectangular().fitSize([width,height], mapData);
let pathGenerator;
$: pathGenerator = d3.geoPath(projection);
function getTexture(){
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
  const texture = new three.Texture("g");
  return texture
}

//three.js
// function initScene(){

//Create basic three js objects
//Scene
scene = new three.Scene();
//Camera Attributes
let viewAngle = 45;
let aspect = width / height;
let near = 0.1;
let far = 100000;
camera = new three.PerspectiveCamera(viewAngle, aspect, near, far);
camera.position.set(0,0,4);
//renderer
renderer = new three.WebGLRenderer();
renderer.setSize(width,height);
renderer.setClearColor(0x000);

//Where we want our model
$('#footer').append(renderer.domElement);

//Make model and add to scene
const geometry = new three.PlaneGeomtry(1,1);
mapPlane = new three.Mesh(
  geometry,
  new three.MeshBasicMaterial({map:getTexture()})
)

scene.add(mapPlane);

// Init camera controls
controls = new three.TrackballControls(camera, renderer.domElement);

// Append the SVG element to the document.
document.getElementsByClassName('container')[1].append(svg.node());

render();
function render(){
  //update
  controls.update();

  requestAnimationFrame(render);
  renderer.render(scene,camera);
}