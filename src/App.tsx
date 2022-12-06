import React, {Component} from 'react';
import logo from './logo.svg';
import './App.css';
import 'ol/ol.css'

import Map from 'ol/Map';
import OSM from 'ol/source/OSM';
import TileLayer from 'ol/layer/Tile';
import View from 'ol/View';
import {Vector as VectorSource} from 'ol/source'
import {Vector as VectorLayer} from 'ol/layer'

import Style from 'ol/style/Style';
import Text from 'ol/style/Text';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';

import DragAndDrop from 'ol/interaction/DragAndDrop'
import {GeoJSON} from 'ol/format'

import MakePolygon from './components/MakePolygon'

import Button from '@mui/material/Button'


let dragAndDropInteraction: any;

class App extends React.Component{
    olMap : any
    constructor(props: any){
      super(props)

      this.olMap = new Map({
        target: '',
        layers: [
          new TileLayer({
            source: new OSM()
          }), 
        ],
        view: new View({
          center: [0, 0],
          zoom: 2
        })
      })

    }

    setInteraction() {
      if (dragAndDropInteraction) {
        this.olMap.removeInteraction(dragAndDropInteraction);
      }
      dragAndDropInteraction = new DragAndDrop({
        formatConstructors: [
          new GeoJSON(),
        ],
      });
      dragAndDropInteraction.on('addfeatures', (event: any) => {
        const vectorSource = new VectorSource({
          features: event.features,
        });
        this.olMap.addLayer(
          new VectorLayer({
            source: vectorSource,
            style: new Style({
              fill: new Fill({
                color: '#1786E78f',
              }),
              stroke: new Stroke({
                color: '#2200FF',
                width: 2,
              }),
                text: new Text({
                    text: event.features[0].values_.text,
                    font: 'bold 15px serif',
                    textAlign: 'start',
                }),
            }),
          })
        );
        this.olMap.getView().fit(vectorSource.getExtent());
      });
      this.olMap.addInteraction(dragAndDropInteraction);
    }

    

    componentDidMount(){
      this.olMap.setTarget("map") 
      this.setInteraction()      
    }

    render(){
      return (
        <div id="map" >
            <MakePolygon map={this.olMap}/>
        </div>
      )
    }
}

export default App;
