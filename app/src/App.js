import React, { Component } from 'react';
import L from 'leaflet';
import * as RL from 'react-leaflet';
import EventStreamClient from './sse-client';
import renderSVG from './svg';
import { API_URI } from './config';

const tileLayer =
  'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
const attribution =
  '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

const root = {
  position: [48.2916063, 25.9345009],
  zoom: 13
};

class App extends Component {
  state = {
    markers: [],
    routes: []
  };

  componentDidMount() {
    fetch(`${API_URI}/routes`)
      .then(response => response.json())
      .then(routes => this.setState({ routes }))
      .catch(console.error); // eslint-disable-line

    const stream = new EventStreamClient(`${API_URI}/events`);

    stream.receive(markers => {
      if (Array.isArray(markers)) {
        this.setState({ markers });
      }
    });
  }

  render() {
    const { routes, markers } = this.state;

    return (
      <RL.Map
        center={root.position}
        zoom={13}
        maxZoom={20}
        minZoom={12}
        maxBounds={[
          [48.37778737618847, 25.789501368999485],
          [48.1783186753248, 26.095058619976047]
        ]}
        zoomControl={false}
        style={{ height: '100%' }}
      >
        <RL.TileLayer url={tileLayer} attribution={attribution} />
        {markers.map(marker => {
          const routeForMarker = routes.find(
            route => route.id === marker.routeId
          );

          return (
            <RL.Marker
              key={marker.id}
              position={[marker.latitude, marker.longitude]}
              icon={L.icon({
                iconUrl: renderSVG({
                  speed: marker.speed,
                  angle: marker.direction,
                  text: routeForMarker ? routeForMarker.name : 'A',
                  stroke: routeForMarker ? routeForMarker.color : 'gray'
                }),
                iconAnchor: [13, 19]
              })}
            >
              <RL.Popup>{JSON.stringify(marker, null, 2)}</RL.Popup>
            </RL.Marker>
          );
        })}
      </RL.Map>
    );
  }
}

export default App;
