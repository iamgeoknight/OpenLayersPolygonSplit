/*
Create and Render map on div with zoom and center
*/
class OLMap {
    //Constructor accepts html div id, zoom level and center coordinaes
    constructor(map_div, zoom, center) {
        this.map = new ol.Map({
            target: map_div,
            layers: [
                new ol.layer.Tile({
                    source: new ol.source.OSM()
                })
            ],
            view: new ol.View({
                center: ol.proj.fromLonLat(center),
                zoom: zoom
            })
        });
    }
}
  
  
/*
Create Vector Layer
*/
class VectorLayer{
    //Constructor accepts title of vector layer and map object
    constructor(title, map) {
        this.layer = new ol.layer.Vector({
            title: title,      
            source: new ol.source.Vector({
                projection:map.getView().projection
            }),
            style: new ol.style.Style({        
                stroke: new ol.style.Stroke({
                    color: '#0e97fa',
                    width:2
                })
            })
        });
    }
}
  
  
/*
Create overlay
*/
class Overlay {
    //Contrctor accepts map object, overlay html element, overlay offset, overlay positioning and overlay class
    constructor(map, element = document.getElementById("popup"), offset = [0, -15], positioning = 'bottom-center',   className = 'ol-tooltip-measure ol-tooltip .ol-tooltip-static') {
        this.map = map;
        this.overlay = new ol.Overlay({
            element: element,
            offset: offset,
            positioning: positioning,
            className: className
        });
        this.overlay.setPosition([0,0]);
        this.overlay.element.style.display = 'block';      
        this.map.addOverlay(this.overlay);          
    }
}

/* 
Draw Intraction
*/
class Draw {  
    //Constructor accepts geometry type, map object and vector layer
    constructor(type, map, vector_layer) {
        this.vector_layer = vector_layer
        this.map = map;        
        this.interaction = new ol.interaction.Draw({
            type: type,
            stopClick: true
        });        
        this.interaction.on('drawstart', this.onDrawStart);        
        this.map.addInteraction(this.interaction);          
    }

    onDrawStart = (e) => {
        e.feature.getGeometry().on('change', this.onGeomChange); 
    }

    onGeomChange = (e) => {
        let parser = new jsts.io.OL3Parser();
        let linestring = new ol.Feature({    
            geometry: new ol.geom.LineString(e.target.getCoordinates())
        });        
        
        let a = parser.read(polygon.getGeometry())
        let b = parser.read(linestring.getGeometry())               
                
        let union = a.getExteriorRing().union(b);

        let polygonizer = new jsts.operation.polygonize.Polygonizer();
        polygonizer.add(union);

        let polygons = polygonizer.getPolygons();

        if(polygons.array.length == 2) {
            console.log(polygons.array);
            this.vector_layer.getSource().clear()
        }
        
        if (this.vector_layer.getSource().getFeatures().length == 0) {
            this.vector_layer.getSource().addFeature(polygon)
        }
        
    }
} 


/* 
Enable snapping on a vector layer
*/
class Snapping {  
    //Constructor accepts geometry type, map object and vector layer
    constructor(map, vector_source) {
        this.map = map;  
        this.vector_source = vector_source
        this.interaction = new ol.interaction.Snap({
            source: vector_source            
        });        
        this.map.addInteraction(this.interaction);          
    }
}
  
  
//Create map and vector layer
let map = new OLMap('map', 8, [-96.6345990807462, 32.81890764151014]).map;
let vector_layer = new VectorLayer('Temp Layer', map).layer
map.addLayer(vector_layer);

let polygon = new ol.Feature({    
    geometry: new ol.geom.Polygon([[[-10852646.620625805, 3906819.5017894786], [-10797367.365502242, 3950847.234747086], [-10691456.211645748, 3911711.47159973], [-10687298.044771587, 3848605.062913627], [-10777554.891503, 3804332.7398631293], [-10864387.34630427, 3834907.5511772], [-10852646.620625805, 3906819.5017894786]]])
})
  
vector_layer.getSource().addFeature(polygon);

  
  //Add Interaction to map depending on your selection
let draw = null;
let btnClick = (e) => {  
    removeInteractions();
    let geomType = e.srcElement.attributes.geomtype.nodeValue;
    
    //Create interaction
    draw = new Draw(geomType, map, vector_layer);
    if(geomType == "LineString") {
        new Snapping(map, vector_layer.getSource())
    }
}

  
  //Remove map interactions except default interactions
  let removeInteractions = () => {  
    map.getInteractions().getArray().forEach((interaction, i) => {
      if(i > 8) {
        map.removeInteraction(interaction);
      }
    });
  }
  
  
  //Clear vector features and overlays and remove any interaction
  let clear = () => {
    removeInteractions();
    map.getOverlays().clear();
    vector_layer.getSource().clear();
  }
  
  //Bind methods to click events of buttons
  let distanceMeasure = document.getElementById('btn1');
  distanceMeasure.onclick = btnClick;
  
  let areaMeasure = document.getElementById('btn2');
  areaMeasure.onclick = btnClick;
  
  let clearGraphics = document.getElementById('btn3');
  clearGraphics.onclick = clear;


