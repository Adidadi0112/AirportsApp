import Papa from "papaparse";
import React, { useState } from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import {Tooltip} from "react-tooltip";

import Modal from "react-modal";

function DataReader() {
    const [airportsData, setAirportsData] = useState([]);
    const [countriesData, setCountriesData] = useState({});
    const [selectedCountry, setSelectedCountry] = useState("");
    const [isFileUploaded, setIsFileUploaded] = useState(false);
    const [selectedAirport, setSelectedAirport] = useState(null);
    const [tooltipContent, setTooltipContent] = useState("");

    const countryNameMapping = {
        PL: "Poland",
        US: "United States",
        GB: "United Kingdom",
        BR: "Brazil",
        CA: "Canada",
        CN: "China",
        IN: "India",
        JP: "Japan",
        IT: "Italy",
        RU: "Russia",
        TR: "Turkey"
    };


    const handleMarkerMouseEnter = (airport) => {
        setTooltipContent(`${airport.name}, ${airport.municipality}`);
    };

    const handleMarkerMouseLeave = () => {
        setTooltipContent("");
    };

    const handleMarkerClick = (airport) => {
        setSelectedAirport(airport);
    };

    const handleModalClose = () => {
        setSelectedAirport(null);
    };

    const handleFile = (event) => {
        Papa.parse(event.target.files[0], {
            header: true,
            skipEmptyLines: true,
            complete: function (result) {
                const airportsData = result.data.map((row) => ({
                    ident: row.ident,
                    name: row.name,
                    elevation_ft: (parseFloat(row.elevation_ft) * 0.3048).toFixed(2),
                    iso_country: row.iso_country,
                    municipality: row.municipality,
                    longitude: parseFloat(row.longitude),
                    latitude: parseFloat(row.latitude),
                }));
                setAirportsData(airportsData);

                const countries = new Set(airportsData.map((airport) => airport.iso_country));
                const countriesData = {};
                countries.forEach((countryCode) => {
                    countriesData[countryCode] = airportsData.filter((airport) => airport.iso_country === countryCode);
                });
                setCountriesData(countriesData);

                setIsFileUploaded(true);
            },
        });
    };

    const handleCountryClick = (countryCode) => {
        setSelectedCountry(countryCode);
    };

    const selectedAirports = countriesData[selectedCountry] || [];


    const getCountryName = (countryCode) => {
        if (countryNameMapping.hasOwnProperty(countryCode)) {
            return countryNameMapping[countryCode];
        } else {
            return countryCode;
        }
    };

    return (
        <div className="main">
            {!isFileUploaded && (
                <div className="uploadFile">
                    <p>Upload data</p>
                    <input type="file" accept=".csv" onChange={handleFile} />
                    {airportsData.length === 0 && <h4>Waiting, until file is uploaded</h4>}
                </div>
            )}

            {Object.keys(countriesData).length > 0 && (
                <div className="countriesList">
                    {Object.entries(countriesData).map(([countryCode, countryAirports]) => (
                        <button
                            key={countryCode}
                            onClick={() => handleCountryClick(countryCode)}
                            className={`countryButton ${selectedCountry === countryCode ? "selected" : ""}`}
                        >
                            {getCountryName(countryCode)}
                        </button>
                    ))}
                </div>
            )}

            {selectedCountry && airportsData.length > 0 && (
                <div className="mapContainer">
                    <h3>{getCountryName(selectedCountry)}</h3>
                    <ComposableMap
                        projection="geoMercator"
                        projectionConfig={{
                            scale: 100,
                        }}
                        style={{
                            width: "100%",
                        }}
                    >
                        <Geographies geography="/features.json">
                            {({ geographies }) =>
                                geographies.map((geo) => <Geography key={geo.rsmKey} geography={geo} />)
                            }
                        </Geographies>
                        {selectedAirports.map((airport) => (
                            <Marker
                                key={airport.ident}
                                coordinates={[airport.longitude, airport.latitude]}
                                onMouseEnter={() => handleMarkerMouseEnter(airport)}
                                onMouseLeave={handleMarkerMouseLeave}
                                onClick={() => handleMarkerClick(airport)}
                            >
                                {}
                                <circle r={Math.min(airport.elevation_ft * 0.01, 3)} fill="#F00" data-tip={airport.ident} />
                            </Marker>
                        ))}
                        {selectedAirport && (
                            <Marker
                                key={selectedAirport.ident}
                                coordinates={[selectedAirport.longitude, selectedAirport.latitude]}
                                onMouseEnter={() => handleMarkerMouseEnter(selectedAirport)}
                                onMouseLeave={handleMarkerMouseLeave}
                                onClick={() => handleMarkerClick(selectedAirport)}
                            >
                                {}
                                <circle r={Math.min(selectedAirport.elevation_ft * 0.01, 3)} fill="#F00" />
                            </Marker>
                        )}
                    </ComposableMap>
                    {tooltipContent && (<Tooltip>{tooltipContent}</Tooltip>)}
                </div>
            )}

            {selectedAirport && (
                <div className="modal">
                    <Modal isOpen={true} onRequestClose={handleModalClose} className="modal">
                        <h3>{selectedAirport.name}</h3>
                        <p>City: {selectedAirport.municipality}</p>
                        <p>Height above sea level: {selectedAirport.elevation_ft}m</p>
                        <button onClick={handleModalClose}>Close</button>
                    </Modal>
                </div>
            )}
        </div>
    );
};

export default DataReader;
