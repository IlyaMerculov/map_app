import React from 'react'
import * as ol from 'ol'
import './MakePolygon.css'

import Draw from 'ol/interaction/Draw'
import Overlay from 'ol/Overlay'
import {Polygon} from 'ol/geom'
import {Vector as VectorSource} from 'ol/source'
import {Vector as VectorLayer} from 'ol/layer'
import {getArea, getLength} from 'ol/sphere'
import Select from 'ol/interaction/Select'

import Style from 'ol/style/Style';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import CircleStyle from 'ol/style/Circle'
import Text from 'ol/style/Text'
import {altKeyOnly, click} from 'ol/events/condition'

import { unByKey } from 'ol/Observable';
import {GeoJSON} from 'ol/format'
import {toLonLat} from 'ol/proj'
import {getUid} from 'ol/util'

import Button from '@mui/material/Button'

let sketch: any,
    helpTooltipElement: any,
    helpTooltip: any,
    measureTooltipElement: any,
    measureTooltip: any,
    draw: any,
    text: any,
    select: any = null,
    masOfSourses: any[] = [],
    masOfNameOfSourses: any[] = [],
    source: any,
    polygon: any




const continuePolygonMsg: String = 'Click to continue drawing the polygon'

export type Props = {map: any}

class MakePolygon extends React.Component<Props>{
    olMap: any;
    constructor(props: any){
        super(props)

        this.olMap = this.props.map;

        this.makePolygon = this.makePolygon.bind(this)
        this.saveGeoJSON = this.saveGeoJSON.bind(this)
    }

    formatArea(polygon: any): String {
        const area = getArea(polygon);
        let output: String;
        if (area > 10000) {
          output = Math.round((area / 1000000) * 100) / 100 + ' ' + 'km<sup>2</sup>';
        } else {
          output = Math.round(area * 100) / 100 + ' ' + 'm<sup>2</sup>';
        }
        return output;
      };
      
    createHelpTooltip(): void {
        if (helpTooltipElement) {
          helpTooltipElement.parentNode.removeChild(helpTooltipElement);
        }
        helpTooltipElement = document.createElement('div');
        helpTooltipElement.className = 'ol-tooltip hidden';
        helpTooltip = new Overlay({
          element: helpTooltipElement,
          offset: [15, 0],
          positioning: 'center-left',
        });
        this.olMap.addOverlay(helpTooltip);
      }

    createMeasureTooltip(): void {
        if (measureTooltipElement) {
          measureTooltipElement.parentNode.removeChild(measureTooltipElement);
        }
        measureTooltipElement = document.createElement('div');
        measureTooltipElement.className = 'ol-tooltip ol-tooltip-measure';
        measureTooltip = new Overlay({
          element: measureTooltipElement,
          offset: [0, -15],
          positioning: 'bottom-center',
          stopEvent: false,
          insertFirst: false,
        });
        this.olMap.addOverlay(measureTooltip);
      }

    addInteraction() {
        const type = 'Polygon'
        draw = new Draw({
          source: new VectorSource(),
          type: type,
          style: new Style({
            fill: new Fill({
              color: 'rgba(255, 255, 255, 0.2)',
            }),
            stroke: new Stroke({
              color: 'rgba(0, 0, 0, 0.5)',
              lineDash: [10, 10],
              width: 2,
            }),
            image: new CircleStyle({
              radius: 5,
              stroke: new Stroke({
                color: 'rgba(0, 0, 0, 0.7)',
              }),
              fill: new Fill({
                color: 'rgba(0, 10, 255, 0.2)',
              }),
            }),
          }),
        });
  
        this.olMap.addInteraction(draw)
  
        this.createHelpTooltip()
        this.createMeasureTooltip()
  
        let listener: any;
  
        draw.on('drawstart', (evt: any) => {
          sketch = evt.feature;
          let tooltipCoord: any = evt.coordinate;

          listener = sketch.getGeometry().on('change', (evt: any) => {
            const geom: any = evt.target;
            let output: any;
            if (geom instanceof Polygon) {
              output = this.formatArea(geom);
              // console.log(output)
              tooltipCoord = geom.getInteriorPoint().getCoordinates();
            }
            measureTooltipElement.innerHTML = output;
            measureTooltip.setPosition(tooltipCoord);
          });
        });
  
        draw.on('drawend', () => {
          measureTooltipElement.className = 'ol-tooltip ol-tooltip-static';
          measureTooltip.setOffset([0, -7]);
          measureTooltipElement = null;
          this.createMeasureTooltip();
          unByKey(listener);
          text = prompt( 'Enter name', '')
          // console.log(toLonLat(sketch.getGeometry().getCoordinates()))

          source = new VectorSource({
            features: [sketch],
            format: new GeoJSON({
              dataProjection: 'EPSG:4326'
            }),
          })
          // source.getFeatures().setProperties({text: text})
          polygon = new VectorLayer({
            source: source,
            updateWhileInteracting: true,
            style: new Style({
              fill: new Fill({
                color: '#ffcc338f',
              }),
              stroke: new Stroke({
                color: '#ffcc33',
                width: 2,
              }),
              image: new CircleStyle({
                radius: 7,
                fill: new Fill({
                  color: '#ffcc33',
                }),
              }),
              text: new Text({
                  text: text,
                  font: 'bold 15px serif',
                  textAlign: 'start',
              }),
            }),
          })
          // polygon.getFeatures()


          this.olMap.addLayer( polygon )
          masOfNameOfSourses.push(text)
          masOfSourses.push(source)
        });
      }
  
      pointerMoveHandler(evt: any) {
        if (evt.dragging) {
          return;
        }
        let helpMsg: String = 'Click to start drawing';
        if (sketch) {
          const geom = sketch.getGeometry();
          if (geom instanceof Polygon) {
            helpMsg = continuePolygonMsg;
          }
        }  
        helpTooltipElement.innerHTML = helpMsg;
        helpTooltip.setPosition(evt.coordinate);
      
        helpTooltipElement.classList.remove('hidden');
      };

      changeName(){
        console.log(this.olMap)
        if (select !== null) {
          this.olMap.removeInteraction(select);
        }
        select = new Select({
            style: new Style({
                  fill: new Fill({
                    color: '#eeeeee',
                  }),
                  stroke: new Stroke({
                    color: 'rgba(255, 255, 255, 0.7)',
                    width: 2,
                  }),
                 
              }),
            condition: function (mapBrowserEvent) {
              return click(mapBrowserEvent) && altKeyOnly(mapBrowserEvent);
            },
        })
        // console.log(select)
        if (select !== null) {
          this.olMap.addInteraction(select);

          select.on('select', (e: any) => {
              let id: string = e.target.getFeatures().ol_uid
          });
        
        }
      }
  
      makePolygon(){
        console.log('make')
        this.addInteraction()
        this.changeName()
        this.olMap.on('pointermove', this.pointerMoveHandler)
        this.olMap.getViewport().addEventListener('mouseout', function () {
          helpTooltipElement.classList.add('hidden');
        });
      }

      saveGeoJSON(){
        masOfSourses.forEach( (el: any, index) => {
          // console.log(el.getProperties())
          let val: any = JSON.parse(new GeoJSON().writeFeatures(el.getFeatures())),
              lonLatCoordinates: any[] = val.features[0].geometry.coordinates[0].map( (el:any) => {
                return toLonLat(el)
            }) 
          val.features[0].geometry.coordinates[0] = null
          val.features[0].geometry.coordinates[0] = lonLatCoordinates

          val.features[0].properties = {'text': `${masOfNameOfSourses[index]}`}
          console.log(JSON.stringify(val), lonLatCoordinates)
          // console.log(JSON.parse(new GeoJSON().writeFeatures(el.getFeatures())).features[0].properties)
          // new Location().href = 'data:application/octet-stream,' + encodeURIComponent(new GeoJSON().writeFeatures(el.getFeatures()))
        })

      }

      render(){          
          console.log(this.props)
          return (
            <div className="toolbar">
              <Button variant="contained" onClick={this.makePolygon}>Make Polygon</Button>
              <Button variant="contained" onClick={this.saveGeoJSON}>Save GeoJSON</Button>
            </div>
          )
      }
}

export default MakePolygon